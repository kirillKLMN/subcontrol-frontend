import { useState } from "react";
import Search from "../components/ui/Search";
import Icon from "../components/ui/Icon";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import ServiceLogo from "../components/ui/ServiceLogo";
import Empty from "../components/ui/Empty";

type LicensesPageProps = {
  selectedService: string;
  onSelectService: (service: string) => void;
  checked: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export default function LicensesPage({
  selectedService,
  onSelectService,
  checked,
  onChange,
}: LicensesPageProps) {
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="info-strip">
        <Icon name="info" />
        <div>
          <strong>Сигнал к проверке — не команда отключить доступ</strong>
          <span>
            Данные об активности указаны вручную. Количество купленных мест не подтверждено;
            расчёт потерь недоступен.
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
            onChange={(e) => onSelectService(e.target.value)}
          >
            {[...new Set(["Все сервисы", "Figma", "Notion", "Slack", selectedService])].map(
              (service) => (
                <option key={service}>{service}</option>
              ),
            )}
          </select>
        </div>
        <LicenseTable
          search={search}
          filter={selectedService}
          checked={checked}
          onChange={onChange}
        />
      </section>
    </>
  );
}

const licenseNames = ["Александр Морозов", "Дарья Соколова", "Анна Смирнова", "Михаил Козлов"];
function LicenseTable({
  search,
  filter,
  checked,
  onChange,
}: {
  search: string;
  filter: string;
  checked: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const rows = ["Figma", "Notion", "Slack"]
    .flatMap((name) =>
      licenseNames.slice(0, 3).map((employee, i) => ({ name, employee, i, key: `${name}-${i}` })),
    )
    .filter(
      (r) =>
        (filter === "Все сервисы" || filter === r.name) &&
        `${r.name} ${r.employee}`.toLowerCase().includes(search.toLowerCase()),
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Сервис</th>
            <th>Сотрудник</th>
            <th>Последняя активность</th>
            <th>Пользуетесь?</th>
            <th>Статус проверки</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const review = r.i === 0 || (r.i === 1 && r.name !== "Slack");
            return (
              <tr key={r.key}>
                <td>
                  <div className="service-cell">
                    <ServiceLogo name={r.name} small />
                    <strong>{r.name}</strong>
                  </div>
                </td>
                <td>
                  <div className="person">
                    <Avatar name={r.employee} />
                    {r.employee}
                  </div>
                </td>
                <td>{r.i === 0 ? "Не указана" : "16 июня 2025"}</td>
                <td>
                  <Badge tone={r.i === 0 ? "amber" : "neutral"}>
                    {r.i === 0 ? "Не пользуюсь" : r.i === 1 ? "Нет ответа" : "Пользуюсь"}
                  </Badge>
                </td>
                <td>
                  <select
                    aria-label={`Проверка ${r.name}, ${r.employee}`}
                    value={checked[r.key] || (review ? "Требует проверки" : "Подтверждено")}
                    onChange={(e) => onChange(r.key, e.target.value)}
                    className={
                      checked[r.key] === "Подтверждено" || !review ? "select-green" : "select-amber"
                    }
                  >
                    <option>Требует проверки</option>
                    <option>Запросить подтверждение</option>
                    <option>Подтверждено</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length && (
        <Empty title="Назначения не найдены" text="Попробуйте другое имя или сервис." />
      )}
    </div>
  );
}
