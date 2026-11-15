import type { Subscription } from "../data";
import { daysLeft, dateLabel } from "../data";

import Icon from "../components/ui/Icon";
import Badge from "../components/ui/Badge";
import { ServiceCell, OwnerCell } from "../components/ui/RecordCells";

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
    .filter((subscription) => daysLeft(subscription.renewal) <= Number(period))
    .sort((a, b) => a.renewal.localeCompare(b.renewal));

  return (
    <>
      <div className="info-strip">
        <Icon name="bell" />
        <div>
          <strong>Запланированные напоминания</strong>
          <span>
            Точки контроля: 30 / 15 / 7 / 1 день.
            Email и Telegram не отправляются.
            Демо-дата: 18 июня 2025.
          </span>
        </div>
      </div>

      <section className="panel">
        <div className="toolbar">
          <h2>Очередь продлений</h2>

          <select
            aria-label="Период продлений"
            value={period}
            onChange={(event) => onPeriodChange(event.target.value)}
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
              {visibleSubscriptions.map((subscription) => {
                const remainingDays = daysLeft(subscription.renewal);

                return (
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
                          tone={remainingDays <= 7 ? "amber" : "neutral"}
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
                      {decisions[subscription.id] || "Принять решение"}
                    </td>

                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => onOpenRenewal(subscription.id)}
                      >
                        Рассмотреть
                        <Icon name="arrow" size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
