import type { Subscription } from "../../data";
import { dateLabel, money } from "../../data";

import { ServiceCell, StatusBadge } from "../ui/RecordCells";
import Icon from "../ui/Icon";

type ServiceDetailProps = {
  subscription: Subscription;
  onEdit: () => void;
  onCheckUsage: () => void;
};

export default function ServiceDetail({
  subscription,
  onEdit,
  onCheckUsage,
}: ServiceDetailProps) {
  const s = subscription;

  const details = [
    ["Поставщик", s.vendor],
    ["Стоимость в месяц", money(s.price, s.currency)],
    [
      "Дата продления",
      dateLabel(s.renewal) + " " + new Date(s.renewal).getFullYear(),
    ],
    ["Ответственный", s.owner],
    ["Источник оплаты", s.paySource],
    ["Купленные места", "Нет подтверждённых данных"],
  ];

  return (
    <>
      <div className="detail-hero">
        <ServiceCell name={s.name} tariff={s.tariff} />
        <StatusBadge status={s.status} />
      </div>

      <div className="detail-grid">
        {details.map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button className="btn" onClick={onEdit}>
          Редактировать
        </button>

        <button className="btn primary" onClick={onCheckUsage}>
          Проверить использование
          <Icon name="arrow" size={16} />
        </button>
      </div>

      <div className="inline-note">
        <Icon name="info" size={16} />
        Стоимость указана на уровне подписки, не одного места.
      </div>
    </>
  );
}
