import { useEffect, useState } from "react";

import { checkInLicense, getLicenses } from "../api/licenses";
import type { Subscription } from "../data";
import type { ApiLicense } from "../types/api";

import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Empty from "../components/ui/Empty";
import Icon from "../components/ui/Icon";
import Search from "../components/ui/Search";
import ServiceLogo from "../components/ui/ServiceLogo";

type LicensesPageProps = {
  subscriptions: Subscription[];
  selectedService: string;
  onSelectService: (service: string) => void;
};

function formatActivity(date: string | null): string {
  if (!date) return "Не указана";

  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Не указана";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function getUsage(license: ApiLicense): {
  label: string;
  tone: "amber" | "neutral";
} {
  if (!license.is_active) {
    return {
      label: "Неактивна",
      tone: "amber",
    };
  }

  return {
    label: "Активна",
    tone: "neutral",
  };
}

export default function LicensesPage({
  subscriptions,
  selectedService,
  onSelectService,
}: LicensesPageProps) {
  const [licenses, setLicenses] = useState<ApiLicense[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLicenses() {
      try {
        const data = await getLicenses();

        if (!active) return;

        setLicenses(data);
        setLoadError(null);
      } catch (error) {
        if (!active) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить лицензии",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadLicenses();

    return () => {
      active = false;
    };
  }, []);

async function handleUsageChange(
  license: ApiLicense,
  inUse: boolean,
) {
  if (savingId !== null) return;

  setSavingId(license.id);
  setSaveError(null);

  try {
    const updated = await checkInLicense(
      license.id,
      inUse,
    );

    setLicenses((previous) =>
      previous.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    );
  } catch (error) {
    setSaveError(
      error instanceof Error
        ? error.message
        : "Не удалось сохранить результат проверки",
    );
  } finally {
    setSavingId(null);
  }
}


  const serviceById = new Map(
    subscriptions.map((subscription) => [
      subscription.id,
      subscription.name,
    ]),
  );

  const rows = licenses.map((license) => ({
    license,
    service:
      serviceById.get(license.subscription_id) ??
      `Подписка #${license.subscription_id}`,
  }));

  const serviceNames = [...new Set(rows.map((row) => row.service))];

  const availableServices = [
    ...new Set(["Все сервисы", ...serviceNames, selectedService]),
  ];

  const normalizedSearch = search.trim().toLowerCase();

  const filteredRows = rows.filter(({ license, service }) => {
    const matchesService =
      selectedService === "Все сервисы" ||
      service === selectedService;

    const matchesSearch =
      `${service} ${license.employee}`
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesService && matchesSearch;
  });

  return (
    <>
      <div className="info-strip">
        <Icon name="info" />

        <div>
          <strong>
            Сигнал к проверке — не команда отключить доступ
          </strong>

          <span>
            Данные об активности загружаются из реестра лицензий.
            Отметка об активности не заменяет подтверждение
            сотрудника.
          </span>
        </div>
      </div>

      <section className="panel">
        <div className="toolbar">
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Найти сотрудника или сервис"
          />

          <select
            aria-label="Сервис"
            value={selectedService}
            onChange={(event) =>
              onSelectService(event.target.value)
            }
          >
            {availableServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {saveError && (
          <p
            className="field-error"
            role="alert"
            style={{ padding: "0 20px" }}
          >
            Не удалось сохранить проверку: {saveError}
          </p>
        )}

        {isLoading ? (
          <div className="inline-note" role="status">
            Загружаем лицензии...
          </div>
        ) : loadError ? (
          <div className="inline-note" role="alert">
            Ошибка загрузки лицензий: {loadError}
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Сервис</th>
                    <th>Сотрудник</th>
                    <th>Последняя активность</th>
                    <th>Активность</th>
                    <th>Статус проверки</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map(({ license, service }) => {
                    const usage = getUsage(license);

                    const status = license.needs_check
                      ? "review"
                      : "clear";
                    return (
                      <tr key={license.id}>
                        <td>
                          <div className="service-cell">
                            <ServiceLogo
                              name={service}
                              small
                            />
                            <strong>{service}</strong>
                          </div>
                        </td>

                        <td>
                          <div className="person">
                            <Avatar name={license.employee} />
                            {license.employee}
                          </div>
                        </td>

                        <td>
                          {formatActivity(
                            license.last_activity,
                          )}
                        </td>

                        <td>
                          <Badge tone={usage.tone}>
                            {usage.label}
                          </Badge>
                        </td>

                        <td>
                        <select
                          aria-label={`Статус проверки: ${service}, ${license.employee}`}
                          value={status}
                          className={
                            status === "review"
                              ? "select-amber"
                              : "select-green"
                          }
                          disabled={savingId !== null}
                          onChange={(event) => {
                            const action = event.target.value;

                            if (action === "uses") {
                              void handleUsageChange(license, true);
                            }

                            if (action === "not_uses") {
                              void handleUsageChange(license, false);
                            }
                          }}
                        >
                          <option value="review" disabled>
                            Требует проверки
                          </option>

                          <option value="clear" disabled>
                            Проверка не требуется
                          </option>

                          <option value="request" disabled>
                            Запросить подтверждение — недоступно
                          </option>

                          <option value="uses">
                            Зафиксировать: пользуется
                          </option>

                          <option value="not_uses">
                            Зафиксировать: не пользуется
                          </option>
                        </select>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredRows.length === 0 && (
              <Empty
                title="Назначения не найдены"
                text={
                  licenses.length === 0
                    ? "В базе пока нет назначенных лицензий."
                    : "Попробуйте изменить поиск или фильтр."
                }
              />
            )}
          </>
        )}
      </section>
    </>
  );
}
