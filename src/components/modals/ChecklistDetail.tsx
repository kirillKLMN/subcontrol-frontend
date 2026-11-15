import type { Checklist } from "../../data";

import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import ServiceLogo from "../ui/ServiceLogo";

type ChecklistField = "revoked" | "returned";

type ChecklistDetailProps = {
  checklist: Checklist;
  onItemChange: (
    index: number,
    field: ChecklistField,
    checked: boolean,
  ) => void;
  onComplete: () => void;
};

export default function ChecklistDetail({
  checklist,
  onItemChange,
  onComplete,
}: ChecklistDetailProps) {
  const completedCount = checklist.items.filter(
    (item) => item.revoked && item.returned,
  ).length;

  const allCompleted = checklist.items.every(
    (item) => item.revoked && item.returned,
  );

  return (
    <>
      <div className="employee-heading">
        <Avatar
          name={checklist.employee}
          size="large"
        />

        <div>
          <h2>{checklist.employee}</h2>
          <p>{checklist.role}</p>
        </div>

        {checklist.closed && (
          <Badge tone="green">Закрыт</Badge>
        )}
      </div>

      <div className="inline-note">
        Демо-сценарий. Сервисы указаны вручную;
        автоматического отключения нет.
      </div>

      <table className="checklist-table">
        <thead>
          <tr>
            <th>Сервис</th>
            <th>Доступ отозван</th>
            <th>Лицензия возвращена</th>
          </tr>
        </thead>

        <tbody>
          {checklist.items.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="service-cell">
                  <ServiceLogo
                    name={item.name}
                    small
                  />

                  <strong>{item.name}</strong>
                </div>
              </td>

              {(["revoked", "returned"] as const).map(
                (field) => (
                  <td key={field}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        disabled={checklist.closed}
                        checked={item[field]}
                        aria-label={`${item.name}: ${
                          field === "revoked"
                            ? "доступ отозван"
                            : "лицензия возвращена"
                        }`}
                        onChange={(event) =>
                          onItemChange(
                            index,
                            field,
                            event.target.checked,
                          )
                        }
                      />

                      {item[field] ? "Да" : "Нет"}
                    </label>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal-actions">
        <p className="muted">
          {completedCount} из {checklist.items.length}{" "}
          сервисов проверено
        </p>

        <button
          className="btn primary"
          disabled={checklist.closed || !allCompleted}
          onClick={onComplete}
        >
          {checklist.closed
            ? "Чек-лист закрыт"
            : "Закрыть чек-лист"}

          <Icon name="check" size={17} />
        </button>
      </div>

      {!checklist.closed && (
        <p className="form-hint">
          Закрытие доступно, когда обе отметки
          проставлены для каждого сервиса.
        </p>
      )}
    </>
  );
}
