import type { Approval, Checklist, Subscription } from "../data";
import { dateLabel, daysLeft, money } from "../data";
import Icon from "../components/ui/Icon";
import Badge from "../components/ui/Badge";
import ServiceLogo from "../components/ui/ServiceLogo";
import Empty from "../components/ui/Empty";
import SubscriptionTable from "../components/subscriptions/SubscriptionTable";

type ModalRequest = { type: string; id?: number };

type DashboardPageProps = {
  subscriptions: Subscription[];
  activeSubs: Subscription[];
  renewals: Subscription[];
  pending: Approval[];
  openChecklists: Checklist[];
  reviewCount: number;
  decisions: Record<number, string>;
  taskTab: string;
  onTaskTabChange: (tab: string) => void;
  onNavigate: (page: number) => void;
  onOpenModal: (modal: ModalRequest) => void;
  onOpenSubscription: (id: number) => void;
};

export default function DashboardPage({
  subscriptions,
  activeSubs,
  renewals,
  pending,
  openChecklists,
  reviewCount,
  decisions,
  taskTab,
  onTaskTabChange,
  onNavigate,
  onOpenModal,
  onOpenSubscription,
}: DashboardPageProps) {
  return (
    <>
      <div className="overview-meta">
        <span>
          <span className="live-dot" />
          Обзор на 18 июня 2025
        </span>
        <span>
          Демонстрационные данные <Icon name="info" size={14} />
        </span>
      </div>
      <div className="stats-grid">
        {[
          {
            label: "Подписок в реестре",
            value: subscriptions.length,
            sub: `${activeSubs.length} активных и trial`,
            icon: "layers",
            color: "purple",
            target: 1,
          },
          {
            label: "Продления за 30 дней",
            value: renewals.length,
            sub: `${renewals.filter((s) => daysLeft(s.renewal) >= 0 && daysLeft(s.renewal) <= 7).length} — в ближайшие 7 дней`,
            icon: "calendar",
            color: "orange",
            target: 3,
          },
          {
            label: "Ожидают решения",
            value: pending.length,
            sub: "Заявки на подписки",
            icon: "approvals",
            color: "blue",
            target: 4,
          },
          {
            label: "Лицензии к проверке",
            value: reviewCount,
            sub: "Требуют вашего внимания",
            icon: "people",
            color: "pink",
            target: 2,
          },
        ].map((s) => (
          <button
            className={`stat-card ${s.color}`}
            key={s.label}
            onClick={() => onNavigate(s.target)}
          >
            <div className="stat-label">
              {s.label}
              <span className="stat-icon">
                <Icon name={s.icon} size={19} />
              </span>
            </div>
            <div className="stat-value">
              {s.value}
              <Icon name="arrow" size={19} />
            </div>
            <div className="stat-sub">
              {s.target === 3 && <span className="tiny-orange-dot" />}
              {s.sub}
            </div>
          </button>
        ))}
      </div>
      <div className="overview-columns">
        <section className="panel actions-panel">
          <div className="section-title">
            <div>
              <h2>
                Требуют внимания{" "}
                <span className="count-bubble">
                  {renewals.filter((s) => !decisions[s.id]).length +
                    pending.length +
                    openChecklists.length}
                </span>
              </h2>
              <p>Следующие шаги, которые важно не упустить</p>
            </div>
            <button
              className="icon-btn"
              aria-label="О возможностях очереди"
              onClick={() => onOpenModal({ type: "help" })}
            >
              <Icon name="more" />
            </button>
          </div>
          <div className="tabs">
            {["Все действия", "Продления", "Заявки", "Офбординг"].map((t) => (
              <button
                className={taskTab === t ? "active" : ""}
                onClick={() => onTaskTabChange(t)}
                key={t}
              >
                {t}
                {t === "Заявки" && <span>{pending.length}</span>}
              </button>
            ))}
          </div>
          <div className="task-list">
            {(taskTab === "Все действия" || taskTab === "Продления") &&
              renewals
                .filter((s) => !decisions[s.id])
                .slice(0, taskTab === "Все действия" ? 2 : undefined)
                .map((s) => (
                  <button
                    className="task-row"
                    key={s.id}
                    onClick={() => onOpenModal({ type: "renewal", id: s.id })}
                  >
                    <ServiceLogo name={s.name} />
                    <div className="task-content">
                      <strong>
                        {s.status === "Trial"
                          ? "Решить, что делать после trial"
                          : "Принять решение о продлении"}
                      </strong>
                      <span>
                        {s.name}
                        <i /> {s.owner}
                      </span>
                    </div>
                    <div className="task-trailing">
                      <Badge
                        tone={daysLeft(s.renewal) <= 7 ? "amber" : "neutral"}
                      >{`Через ${daysLeft(s.renewal)} дн.`}</Badge>
                      <span>{dateLabel(s.renewal)}</span>
                    </div>
                    <Icon name="chevron" size={16} />
                  </button>
                ))}
            {(taskTab === "Все действия" || taskTab === "Заявки") &&
              pending.slice(0, taskTab === "Все действия" ? 1 : undefined).map((a) => (
                <button
                  className="task-row"
                  key={`a${a.id}`}
                  onClick={() => onOpenModal({ type: "approval", id: a.id })}
                >
                  <span className="task-symbol purple">
                    <Icon name="approvals" />
                  </span>
                  <div className="task-content">
                    <strong>Согласовать заявку на {a.name}</strong>
                    <span>
                      {a.author}
                      <i />
                      {a.tariff}
                    </span>
                  </div>
                  <div className="task-trailing">
                    <Badge tone="purple">На согласовании</Badge>
                    <span>{money(a.price)} / мес.</span>
                  </div>
                  <Icon name="chevron" size={16} />
                </button>
              ))}
            {(taskTab === "Все действия" || taskTab === "Офбординг") &&
              openChecklists
                .slice(0, taskTab === "Все действия" ? 1 : undefined)
                .map((c) => (
                  <button
                    className="task-row"
                    key={`c${c.id}`}
                    onClick={() => onOpenModal({ type: "checklist", id: c.id })}
                  >
                    <span className="task-symbol blue">
                      <Icon name="exit" />
                    </span>
                    <div className="task-content">
                      <strong>Завершить проверку доступов</strong>
                      <span>
                        {c.employee}
                        <i />
                        {c.items.length} сервиса
                      </span>
                    </div>
                    <div className="task-trailing">
                      <Badge tone="neutral">В процессе</Badge>
                      <span>Ручной чек-лист</span>
                    </div>
                    <Icon name="chevron" size={16} />
                  </button>
                ))}
            {((taskTab === "Продления" && renewals.every((s) => decisions[s.id])) ||
              (taskTab === "Заявки" && !pending.length) ||
              (taskTab === "Офбординг" && !openChecklists.length)) && (
              <Empty title="Всё готово" text="В этой очереди нет незавершённых действий." />
            )}
          </div>
          <div className="panel-footer">
            <Icon name="info" size={15} />
            <span>SubControl подсказывает следующий шаг. Решение остаётся за вами.</span>
          </div>
        </section>
        <section className="panel renewals-panel">
          <div className="section-title">
            <div>
              <h2>Ближайшие продления</h2>
              <p>Время начать подготовку</p>
            </div>
            <span className="calendar-box">
              <Icon name="calendar" size={19} />
            </span>
          </div>
          <div className="timeline">
            {renewals.slice(0, 4).map((s, i) => (
              <button
                className="timeline-row"
                key={s.id}
                onClick={() => onOpenModal({ type: "renewal", id: s.id })}
              >
                <div className={`timeline-dot ${i === 0 ? "urgent" : ""}`} />
                <div className="timeline-date">
                  {dateLabel(s.renewal)}
                  <span>
                    {daysLeft(s.renewal) === 0
                      ? "Сегодня"
                      : `через ${daysLeft(s.renewal)} дн.`}
                  </span>
                </div>
                <div className="timeline-service">
                  <strong>
                    {s.name}
                    {s.status === "Trial" && <span className="mini-trial">trial</span>}
                  </strong>
                  <span>
                    {decisions[s.id] ||
                      (s.status === "Trial"
                        ? "Завершается пробный период"
                        : "Решение не принято")}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <button className="text-link renewals-link" onClick={() => onNavigate(3)}>
            Все продления <Icon name="arrow" size={16} />
          </button>
          <div className="reminder-note">
            <Icon name="bell" size={17} />
            <span>
              Планируйте заранее: за 30, 15, 7 и 1 день.
              <small>Очередь напоминаний, без отправки сообщений.</small>
            </span>
          </div>
        </section>
      </div>
      <section className="panel registry-preview">
        <div className="section-title">
          <div>
            <h2>
              Ваши подписки <span className="count-bubble">{subscriptions.length}</span>
            </h2>
            <p>Единый реестр сервисов и ответственных</p>
          </div>
          <button className="text-link" onClick={() => onNavigate(1)}>
            Весь реестр <Icon name="arrow" size={16} />
          </button>
        </div>
        <SubscriptionTable
          subscriptions={subscriptions.slice(0, 3)}
          compact
          onOpenSubscription={onOpenSubscription}
        />
      </section>
      <div className="bottom-note">
        <Icon name="check" size={15} />
        Вы управляете процессом. Оплата и отключение доступов — на стороне вашей компании.
        <span>SubControl MVP</span>
      </div>
    </>
  );
}
