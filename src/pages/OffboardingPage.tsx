import type { Checklist } from "../data";

import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Empty from "../components/ui/Empty";
import Icon from "../components/ui/Icon";

type OffboardingPageProps = {
  checklists: Checklist[];
  onOpenChecklist: (id: number) => void;
};

export default function OffboardingPage({
  checklists,
  onOpenChecklist,
}: OffboardingPageProps) {
  return (
    <>
      <div className="info-strip">
        <Icon name="info" />

        <div>
          <strong>
            Доступы отключает ответственный, не SubControl
          </strong>

          <span>
            Сервисы добавляются в чек-лист вручную.
            Отметки не изменяют назначения лицензий
            и не связаны с HR-системами.
          </span>
        </div>
      </div>

      {checklists.length === 0 ? (
        <section className="panel">
          <Empty
            title="Чек-листов пока нет"
            text="Создайте первый чек-лист, чтобы начать проверку доступов сотрудника."
          />
        </section>
      ) : (
        <div className="checklist-grid">
          {checklists.map((checklist) => {
            const total = checklist.items.length;

            const done = checklist.items.filter(
              (item) => item.revoked && item.returned,
            ).length;

            const progress =
              total > 0 ? (done / total) * 100 : 0;

            return (
              <button
                type="button"
                className="panel checklist-card"
                key={checklist.id}
                onClick={() => onOpenChecklist(checklist.id)}
              >
                <div className="checklist-top">
                  <Avatar
                    name={checklist.employee}
                    size="large"
                  />

                  <Badge
                    tone={
                      checklist.closed ? "green" : "amber"
                    }
                  >
                    {checklist.closed
                      ? "Закрыт"
                      : "В процессе"}
                  </Badge>
                </div>

                <h2>{checklist.employee}</h2>

                <p>
                  Сервисов в чек-листе: {total}
                </p>

                <div className="progress-track">
                  <div
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="checklist-bottom">
                  <span>
                    Проверено {done} из {total} сервисов
                  </span>

                  <Icon name="arrow" size={18} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}