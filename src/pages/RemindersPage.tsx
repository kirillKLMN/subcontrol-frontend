import { dateLabel, daysLeft, type Subscription } from "../data";

import Badge from "../components/ui/Badge";
import Empty from "../components/ui/Empty";
import Icon from "../components/ui/Icon";
import { OwnerCell, ServiceCell } from "../components/ui/RecordCells";

type RemindersPageProps = {
  subscriptions: Subscription[];
  decisions: Record<number, string>;
  period: string;
  onPeriodChange: (value: string) => void;
  onOpenRenewal: (id: number) => void;
};

export default function RemindersPage({
  subscriptions,
  decisions,
  period,
  onPeriodChange,
  onOpenRenewal,
}: RemindersPageProps) {
  const visibleSubscriptions = subscriptions
    .filter((subscription) => subscription.status !== "Отменена")
    .map((subscription) => ({
      subscription,
      remainingDays: daysLeft(subscription.renewal),
    }))
    .filter(({ remainingDays }) => {
      if (!Number.isFinite(remainingDays)) return false;

      if (period === "365") return true;

      return remainingDays >= 0 && remainingDays <= Number(period);
    })
    .sort((first, second) =>
      first.subscription.renewal.localeCompare(
        second.subscription.renewal,
      ),
    );

  return (
    <>
      <div className="info-strip">
        <Icon name="bell" />

        <div>
          <strong>Запланированные напоминания</strong>

          <span>
            Точки контроля: 30 / 15 / 7 / 1 день.
            Даты продления загружаются из реестра.
            Email и Telegram не отправляются.
          </span>
        </div>
      </div>

      <section className="panel">
        <div className="toolbar">
          <h2>Очередь продлений</h2>

          <select
            aria-label="Период продлений"
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value)
            }
          >
            <option value="7">Ближайшие 7 дней</option>
            <option value="15">Ближайшие 15 дней</option>
            <option value="30">Ближайшие 30 дней</option>
            <option value="365">Все продления</option>
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Сервис</th>
                <th>Срок</th>
                <th>Ответственный</th>
                <th>Следующий шаг</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {visibleSubscriptions.map(
                ({ subscription, remainingDays }) => (
                  <tr key={subscription.id}>
                    <td>
                      <ServiceCell
                        name={subscription.name}
                        tariff={subscription.tariff}
                      />
                    </td>

                    <td>
                      <div className="date-cell">
                        {dateLabel(subscription.renewal)}

                        <Badge
                          tone={
                            remainingDays <= 7
                              ? "amber"
                              : "neutral"
                          }
                        >
                          {remainingDays < 0
                            ? "Просрочено"
                            : remainingDays === 0
                              ? "Сегодня"
                              : `${remainingDays} дн.`}
                        </Badge>
                      </div>
                    </td>

                    <td>
                      <OwnerCell name={subscription.owner} />
                    </td>

                    <td>
                      {decisions[subscription.id] ||
                        "Принять решение"}
                    </td>

                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() =>
                          onOpenRenewal(subscription.id)
                        }
                      >
                        Рассмотреть
                        <Icon name="arrow" size={14} />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          {visibleSubscriptions.length === 0 && (
            <Empty
              title="Продлений не найдено"
              text="Измените период или укажите дату продления у подписки."
            />
          )}
        </div>
      </section>
    </>
  );
}
