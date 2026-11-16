import type { Subscription } from "../../data";
import { daysLeft, dateLabel, money } from "../../data";
import Empty from "../ui/Empty";
import Icon from "../ui/Icon";
import { OwnerCell, ServiceCell, StatusBadge } from "../ui/RecordCells";

type SubscriptionTableProps = {
  subscriptions: Subscription[];
  compact?: boolean;
  onOpenSubscription: (id: number) => void;
};

export default function SubscriptionTable({
  subscriptions,
  compact = false,
  onOpenSubscription,
}: SubscriptionTableProps) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Сервис</th>
            {!compact && <th>Стоимость / мес.</th>}
            <th>Продление</th>
            <th>Ответственный</th>
            <th>Статус</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((s) => (
            <tr key={s.id} onClick={() => onOpenSubscription(s.id)}>
              <td><ServiceCell name={s.name} tariff={s.tariff} /></td>
              {!compact && (
                <td>
                  <strong className="price">{money(s.price, s.currency)}</strong>
                </td>
              )}
              <td>
                <div className="date-cell">  
                  {dateLabel(s.renewal)}
                  {s.renewal && !Number.isNaN(new Date(s.renewal).getTime())
                    ? ` ${new Date(s.renewal).getFullYear()}`
                    : null}
                  {daysLeft(s.renewal) <= 7 && s.status !== "Отменена" && (
                    <span className="date-hint">
                      {daysLeft(s.renewal) < 0 ? "Просрочено" : `Через ${daysLeft(s.renewal)} дн.`}
                    </span>
                  )}
                </div>
              </td>
              <td><OwnerCell name={s.owner} /></td>
              <td><StatusBadge status={s.status} /></td>
              <td>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Открыть ${s.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSubscription(s.id);
                  }}
                >
                  <Icon name="chevron" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!subscriptions.length && (
        <Empty
          title="Подписки не найдены"
          text="Измените поиск или фильтры либо добавьте новый сервис."
        />
      )}
    </div>
  );
}
