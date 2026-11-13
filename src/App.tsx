import Icon from "./components/ui/Icon";
import Badge from "./components/ui/Badge";
import Avatar from "./components/ui/Avatar";
import ServiceLogo from "./components/ui/ServiceLogo";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { Navigate, useLocation, useNavigate } from "react-router";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  initialSubscriptions,
  initialApprovals,
  initialChecklists,
  daysLeft,
  dateLabel,
  money,
  approvalLabel,
  type Subscription,
  type Approval,
  type Checklist,
} from "./data";


const navigation = [
  { title: "Обзор", icon: "grid", path: "/" },
  {
    title: "Реестр подписок",
    icon: "layers",
    path: "/subscriptions",
  },
  {
    title: "Аудит лицензий",
    icon: "people",
    path: "/licenses",
  },
  {
    title: "Продления",
    icon: "calendar",
    path: "/reminders",
  },
  {
    title: "Заявки",
    icon: "approvals",
    path: "/approvals",
  },
  {
    title: "Офбординг",
    icon: "exit",
    path: "/offboarding",
  },
];

const descriptions = [
  "Всё, что важно для ваших подписок, — в одном месте.",
  "Сервисы, условия и ответственные в едином рабочем списке.",
  "Проверьте назначения и уточните, кому действительно нужен доступ.",
  "Начните подготовку заранее — без спешки в последний день.",
  "От потребности до решения ответственного.",
  "Ручная проверка доступов и возврата лицензий.",
];
type Modal = { type: string; id?: number };

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const page = navigation.findIndex(
    (item) => item.path === location.pathname
  );
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [checklists, setChecklists] = useState(initialChecklists);
  const [modal, setModal] = useState<Modal | null>(null);
  const closeModal = useCallback(() => {
  setModal(null);
}, []);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все статусы");
  const [ownerFilter, setOwnerFilter] = useState("Все ответственные");
  const [registryPeriod, setRegistryPeriod] = useState("all");
  const [period, setPeriod] = useState("30");
  const [taskTab, setTaskTab] = useState("Все действия");
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [checkedLicenses, setCheckedLicenses] = useState<Record<string, string>>({});
  const [licenseService, setLicenseService] = useState("Все сервисы");
  const notify = (text: string) => {
    setToast(text);
  };
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  
  const go = (index: number) => {
    const destination = navigation[index];

    if (!destination) return;

    navigate(destination.path);

    setSearch("");
    setStatusFilter("Все статусы");
    setOwnerFilter("Все ответственные");
  };

  const activeSubs = subscriptions.filter((s) => s.status !== "Отменена");
  const renewals = activeSubs
    .filter((s) => daysLeft(s.renewal) <= 30)
    .sort((a, b) => a.renewal.localeCompare(b.renewal));
  const pending = approvals.filter((a) => a.status === "sent" || a.status === "needs_info");
  const openChecklists = checklists.filter((c) => !c.closed);
  const reviewCount = ["Figma", "Notion", "Slack"]
    .flatMap((name) =>
      [0, 1, 2].map(
        (i) =>
          checkedLicenses[`${name}-${i}`] ||
          (i === 0 || (i === 1 && name !== "Slack") ? "Требует проверки" : "Подтверждено"),
      ),
    )
    .filter((status) => status !== "Подтверждено").length;
  const filteredSubs = subscriptions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "Все статусы" || s.status === statusFilter) &&
      (ownerFilter === "Все ответственные" || s.owner === ownerFilter) &&
      (registryPeriod === "all" ||
        (daysLeft(s.renewal) >= 0 && daysLeft(s.renewal) <= Number(registryPeriod))),
  );
  const rowService = (s: { name: string; tariff: string }) => (
    <div className="service-cell">
      <ServiceLogo name={s.name} />
      <div>
        <strong>{s.name}</strong>
        <span>{s.tariff}</span>
      </div>
    </div>
  );
  const owner = (name: string) => (
    <div className="person">
      <Avatar name={name} />
      <span>{name}</span>
    </div>
  );
  const statusBadge = (status: string) => (
    <Badge
      tone={
        status === "Активна" || status === "approved"
          ? "green"
          : status === "Trial" || status === "needs_info"
            ? "amber"
            : status === "rejected" || status === "Отменена"
              ? "neutral"
              : "purple"
      }
    >
      {approvalLabel[status] || status}
    </Badge>
  );
  const subscriptionTable = (list: Subscription[], compact = false) => (
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
          {list.map((s) => (
            <tr key={s.id} onClick={() => setModal({ type: "service", id: s.id })}>
              <td>{rowService(s)}</td>
              {!compact && (
                <td>
                  <strong className="price">{money(s.price, s.currency)}</strong>
                </td>
              )}
              <td>
                <div className="date-cell">
                  {dateLabel(s.renewal)} {new Date(s.renewal).getFullYear()}
                  {daysLeft(s.renewal) <= 7 && s.status !== "Отменена" && (
                    <span className="date-hint">
                      {daysLeft(s.renewal) < 0 ? "Просрочено" : `Через ${daysLeft(s.renewal)} дн.`}
                    </span>
                  )}
                </div>
              </td>
              <td>{owner(s.owner)}</td>
              <td>{statusBadge(s.status)}</td>
              <td>
                <button className="icon-btn" aria-label={`Открыть ${s.name}`}>
                  <Icon name="chevron" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && (
        <Empty
          title="Подписки не найдены"
          text="Измените поиск или фильтры либо добавьте новый сервис."
        />
      )}
    </div>
  );

  if (page === -1) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="app">
      <Sidebar
        items={navigation}
        activePage={page}
        pendingCount={pending.length}
        openChecklistCount={openChecklists.length}
        onNavigate={go}
        onOpenModal={(type) => setModal({ type })}
      />
      <div className="main-shell">
        <Header
          pageTitle={navigation[page].title}
          onOpenReminders={() => go(3)}
        />
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === 0 ? "ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО" : "УПРАВЛЕНИЕ ПОДПИСКАМИ"}
              </div>
              <h1>
                {page === 0 ? "Всё под контролем" : navigation[page].title}
                <span className="heading-dot">.</span>
              </h1>
              <p>{descriptions[page]}</p>
            </div>
            <div className="heading-actions">
              {(page === 0 || page === 1) && (
                <>
                  <button className="btn" onClick={() => setModal({ type: "import" })}>
                    <Icon name="upload" size={17} />
                    Импорт CSV
                  </button>
                  <button className="btn primary" onClick={() => setModal({ type: "add" })}>
                    <Icon name="plus" size={18} />
                    Добавить подписку
                  </button>
                </>
              )}
              {page === 4 && (
                <button className="btn primary" onClick={() => setModal({ type: "request" })}>
                  <Icon name="plus" size={18} />
                  Создать заявку
                </button>
              )}
              {page === 5 && (
                <button className="btn primary" onClick={() => setModal({ type: "new-checklist" })}>
                  <Icon name="plus" size={18} />
                  Создать чек-лист
                </button>
              )}
            </div>
          </div>
          {page === 0 && (
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
                    onClick={() => go(s.target)}
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
                      onClick={() => setModal({ type: "help" })}
                    >
                      <Icon name="more" />
                    </button>
                  </div>
                  <div className="tabs">
                    {["Все действия", "Продления", "Заявки", "Офбординг"].map((t) => (
                      <button
                        className={taskTab === t ? "active" : ""}
                        onClick={() => setTaskTab(t)}
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
                            onClick={() => setModal({ type: "renewal", id: s.id })}
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
                          onClick={() => setModal({ type: "approval", id: a.id })}
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
                            onClick={() => setModal({ type: "checklist", id: c.id })}
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
                        onClick={() => setModal({ type: "renewal", id: s.id })}
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
                  <button className="text-link renewals-link" onClick={() => go(3)}>
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
                  <button className="text-link" onClick={() => go(1)}>
                    Весь реестр <Icon name="arrow" size={16} />
                  </button>
                </div>
                {subscriptionTable(subscriptions.slice(0, 3), true)}
              </section>
              <div className="bottom-note">
                <Icon name="check" size={15} />
                Вы управляете процессом. Оплата и отключение доступов — на стороне вашей компании.
                <span>SubControl MVP</span>
              </div>
            </>
          )}
          {page === 1 && (
            <section className="panel">
              <div className="toolbar">
                <Search value={search} onChange={setSearch} />
                <select
                  aria-label="Фильтр статуса"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {["Все статусы", "Активна", "Trial", "Отменена"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Фильтр ответственного"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                >
                  <option>Все ответственные</option>
                  {[...new Set(subscriptions.map((s) => s.owner))].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Срок продления"
                  value={registryPeriod}
                  onChange={(e) => setRegistryPeriod(e.target.value)}
                >
                  <option value="all">Любой срок</option>
                  <option value="7">В ближайшие 7 дней</option>
                  <option value="30">В ближайшие 30 дней</option>
                </select>
                <span className="toolbar-count">{filteredSubs.length} записей</span>
              </div>
              {subscriptionTable(filteredSubs)}
              <div className="panel-footer">
                <Icon name="info" size={16} />
                Источник оплаты — справочное поле, не платёжная интеграция.
              </div>
            </section>
          )}
          {page === 2 && (
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
                    value={licenseService}
                    onChange={(e) => setLicenseService(e.target.value)}
                  >
                    {[...new Set(["Все сервисы", "Figma", "Notion", "Slack", licenseService])].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </div>
                <LicenseTable
                  search={search}
                  filter={licenseService}
                  checked={checkedLicenses}
                  onChange={(key, value) => {
                    setCheckedLicenses((p) => ({ ...p, [key]: value }));
                    notify("Статус проверки обновлён в демо");
                  }}
                />
              </section>
            </>
          )}
          {page === 3 && (
            <>
              <div className="info-strip">
                <Icon name="bell" />
                <div>
                  <strong>Запланированные напоминания</strong>
                  <span>
                    Точки контроля: 30 / 15 / 7 / 1 день. Email и Telegram не отправляются.
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
                    onChange={(e) => setPeriod(e.target.value)}
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
                      {activeSubs
                        .filter((s) => daysLeft(s.renewal) <= Number(period))
                        .sort((a, b) => a.renewal.localeCompare(b.renewal))
                        .map((s) => (
                          <tr key={s.id}>
                            <td>{rowService(s)}</td>
                            <td>
                              <div className="date-cell">
                                {dateLabel(s.renewal)}
                                <Badge tone={daysLeft(s.renewal) <= 7 ? "amber" : "neutral"}>
                                  {daysLeft(s.renewal) < 0
                                    ? "Просрочено"
                                    : daysLeft(s.renewal) === 0
                                      ? "Сегодня"
                                      : `${daysLeft(s.renewal)} дн.`}
                                </Badge>
                              </div>
                            </td>
                            <td>{owner(s.owner)}</td>
                            <td>{decisions[s.id] || "Принять решение"}</td>
                            <td>
                              <button
                                className="btn btn-small"
                                onClick={() => setModal({ type: "renewal", id: s.id })}
                              >
                                Рассмотреть
                                <Icon name="arrow" size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          {page === 4 && (
            <section className="panel">
              <div className="toolbar">
                <Search value={search} onChange={setSearch} placeholder="Найти заявку" />
                <select
                  aria-label="Статус заявки"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>Все статусы</option>
                  {Object.entries(approvalLabel).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Сервис</th>
                      <th>Инициатор</th>
                      <th>Стоимость / мес.</th>
                      <th>Статус</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {approvals
                      .filter(
                        (a) =>
                          a.name.toLowerCase().includes(search.toLowerCase()) &&
                          (statusFilter === "Все статусы" || a.status === statusFilter),
                      )
                      .map((a) => (
                        <tr key={a.id} onClick={() => setModal({ type: "approval", id: a.id })}>
                          <td>{rowService(a)}</td>
                          <td>{owner(a.author)}</td>
                          <td>{money(a.price)}</td>
                          <td>{statusBadge(a.status)}</td>
                          <td>
                            <Icon name="chevron" size={17} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!approvals.some(
                  (a) =>
                    a.name.toLowerCase().includes(search.toLowerCase()) &&
                    (statusFilter === "Все статусы" || a.status === statusFilter),
                ) && (
                  <Empty
                    title="Заявок не найдено"
                    text="Измените фильтр или создайте заявку на новый сервис."
                  />
                )}
              </div>
            </section>
          )}
          {page === 5 && (
            <>
              <div className="info-strip">
                <Icon name="info" />
                <div>
                  <strong>Доступы отключает ответственный, не SubControl</strong>
                  <span>
                    Сервисы добавляются в чек-лист вручную. Отметки не изменяют назначения лицензий
                    и не связаны с HR-системами.
                  </span>
                </div>
              </div>
              <div className="checklist-grid">
                {checklists.map((c) => {
                  const done = c.items.filter((i) => i.revoked && i.returned).length;
                  return (
                    <button
                      className="panel checklist-card"
                      key={c.id}
                      onClick={() => setModal({ type: "checklist", id: c.id })}
                    >
                      <div className="checklist-top">
                        <Avatar name={c.employee} size="large" />
                        <Badge tone={c.closed ? "green" : "amber"}>
                          {c.closed ? "Закрыт" : "В процессе"}
                        </Badge>
                      </div>
                      <h2>{c.employee}</h2>
                      <p>{c.role}</p>
                      <div className="progress-track">
                        <div style={{ width: `${(done / c.items.length) * 100}%` }} />
                      </div>
                      <div className="checklist-bottom">
                        <span>
                          Проверено {done} из {c.items.length} сервисов
                        </span>
                        <Icon name="arrow" size={18} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={18} />
          </span>
          {toast}
          <button className="icon-btn" aria-label="Скрыть уведомление" onClick={() => setToast("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {modal && (
        <ModalShell
          title={
            {
              add: "Новая подписка",
              edit: "Редактирование подписки",
              service: "Карточка подписки",
              import: "Импорт подписок из CSV",
              request: "Новая заявка",
              approval: "Рассмотрение заявки",
              renewal: "Решение о продлении",
              checklist: "Проверка доступов",
              "new-checklist": "Новый чек-лист увольнения",
              help: "О прототипе SubControl",
              workspace: "Рабочее пространство",
            }[modal.type] || ""
          }
          onClose={closeModal}
          wide={modal.type === "import" || modal.type === "service"}
        >
          {(modal.type === "add" || modal.type === "edit") && (
            <SubscriptionForm
              existing={modal.id ? subscriptions.find((s) => s.id === modal.id) : undefined}
              subscriptions={subscriptions}
              onSave={(s) => {
                setSubscriptions((p) =>
                  modal.type === "edit" ? p.map((x) => (x.id === s.id ? s : x)) : [...p, s],
                );
                setModal(null);
                notify("Подписка сохранена в демо-реестре");
              }}
            />
          )}
          {modal.type === "service" &&
            (() => {
              const s = subscriptions.find((x) => x.id === modal.id)!;
              return (
                <>
                  <div className="detail-hero">
                    {rowService(s)}
                    {statusBadge(s.status)}
                  </div>
                  <div className="detail-grid">
                    {[
                      ["Поставщик", s.vendor],
                      ["Стоимость в месяц", money(s.price, s.currency)],
                      [
                        "Дата продления",
                        dateLabel(s.renewal) + " " + new Date(s.renewal).getFullYear(),
                      ],
                      ["Ответственный", s.owner],
                      ["Источник оплаты", s.paySource],
                      ["Купленные места", "Нет подтверждённых данных"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="modal-actions">
                    <button className="btn" onClick={() => setModal({ type: "edit", id: s.id })}>
                      Редактировать
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => {
                        go(2);
                        setLicenseService(s.name);
                        setModal(null);
                      }}
                    >
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
            })()}
          {modal.type === "import" && (
            <ImportFlow
              existing={subscriptions}
              onImport={(rows) => {
                setSubscriptions((p) => [...p, ...rows]);
                notify(`В демо-реестр добавлено записей: ${rows.length}`);
              }}
            />
          )}
          {modal.type === "request" && (
            <RequestForm
              subscriptions={subscriptions}
              onSave={(a) => {
                setApprovals((p) => [...p, a]);
                setModal(null);
                notify("Заявка отправлена в демо-очередь");
              }}
            />
          )}
          {modal.type === "approval" &&
            (() => {
              const a = approvals.find((x) => x.id === modal.id)!;
              return (
                <ApprovalDetail
                  approval={a}
                  subscriptions={subscriptions}
                  onDecision={(status, comment) => {
                    if (a.status === "approved" || a.status === "rejected") return;
                    setApprovals((p) =>
                      p.map((x) => (x.id === a.id ? { ...x, status, comment } : x)),
                    );
                    if (status === "approved")
                      setSubscriptions((p) => [
                        ...p,
                        {
                          id: Date.now(),
                          name: a.name,
                          tariff: a.tariff,
                          vendor: a.name,
                          price: a.price,
                          currency: "RUB",
                          renewal: "2025-07-18",
                          owner: "Анна Смирнова",
                          status: "Активна",
                          paySource: "Не указан",
                        },
                      ]);
                    notify(
                      status === "approved"
                        ? "Заявка одобрена. Демо-запись добавлена в реестр; уточните условия."
                        : "Решение по заявке сохранено в демо",
                    );
                    setModal(null);
                  }}
                />
              );
            })()}
          {modal.type === "renewal" &&
            (() => {
              const s = subscriptions.find((x) => x.id === modal.id)!;
              return (
                <RenewalDetail
                  subscription={s}
                  decision={decisions[s.id]}
                  onDecision={(d) => {
                    setDecisions((p) => ({ ...p, [s.id]: d }));
                    notify(
                      "Решение зафиксировано в демо. Продление и оплата выполняются вне SubControl.",
                    );
                    setModal(null);
                  }}
                />
              );
            })()}
          {modal.type === "checklist" &&
            (() => {
              const c = checklists.find((x) => x.id === modal.id)!;
              return (
                <>
                  <div className="employee-heading">
                    <Avatar name={c.employee} size="large" />
                    <div>
                      <h2>{c.employee}</h2>
                      <p>{c.role}</p>
                    </div>
                    {c.closed && <Badge tone="green">Закрыт</Badge>}
                  </div>
                  <div className="inline-note">
                    Демо-сценарий. Сервисы указаны вручную; автоматического отключения нет.
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
                      {c.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="service-cell">
                              <ServiceLogo name={item.name} small />
                              <strong>{item.name}</strong>
                            </div>
                          </td>
                          {(["revoked", "returned"] as const).map((key) => (
                            <td key={key}>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  disabled={c.closed}
                                  checked={item[key]}
                                  aria-label={`${item.name}: ${key === "revoked" ? "доступ отозван" : "лицензия возвращена"}`}
                                  onChange={(e) =>
                                    setChecklists((p) =>
                                      p.map((x) =>
                                        x.id === c.id
                                          ? {
                                              ...x,
                                              items: x.items.map((i, j) =>
                                                j === index ? { ...i, [key]: e.target.checked } : i,
                                              ),
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                                {item[key] ? "Да" : "Нет"}
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="modal-actions">
                    <p className="muted">
                      {c.items.filter((i) => i.revoked && i.returned).length} из {c.items.length}{" "}
                      сервисов проверено
                    </p>
                    <button
                      className="btn primary"
                      disabled={c.closed || !c.items.every((i) => i.revoked && i.returned)}
                      onClick={() => {
                        setChecklists((p) =>
                          p.map((x) => (x.id === c.id ? { ...x, closed: true } : x)),
                        );
                        notify("Чек-лист закрыт");
                        setModal(null);
                      }}
                    >
                      {c.closed ? "Чек-лист закрыт" : "Закрыть чек-лист"}
                      <Icon name="check" size={17} />
                    </button>
                  </div>
                  {!c.closed && (
                    <p className="form-hint">
                      Закрытие доступно, когда обе отметки проставлены для каждого сервиса.
                    </p>
                  )}
                </>
              );
            })()}
          {modal.type === "new-checklist" && (
            <NewChecklist
              onSave={(c) => {
                setChecklists((p) => [...p, c]);
                setModal({ type: "checklist", id: c.id });
                notify("Ручной чек-лист создан");
              }}
            />
          )}
          {modal.type === "help" && (
            <div className="help-content">
              <span className="modal-demo-tag">ИНТЕРАКТИВНЫЙ ПРОТОТИП</span>
              <h2>Процесс виден. Решение — за вами.</h2>
              <p>
                Все записи и действия в этом интерфейсе — демонстрационные. Изменения хранятся
                только до перезагрузки страницы. Подключения к API репозитория пока нет.
              </p>
              <h3>Сценарии из API</h3>
              <p>
                Реестр, ручное добавление и редактирование, проверка лицензий, решения по заявкам и
                ручные чек-листы представлены как локальные демо-сценарии.
              </p>
              <h3>Концепты, требующие доработки backend</h3>
              <p>
                Предпросмотр и подтверждение CSV. Надёжный учёт купленных мест. Отправка и доставка
                напоминаний.
              </p>
              <div className="inline-note">
                <Icon name="info" size={18} />
                SubControl не проводит платежи и не отключает доступы автоматически.
              </div>
              <a
                className="text-link"
                href="https://github.com/like-Ocean/SUBcontrol"
                target="_blank"
                rel="noreferrer"
              >
                Репозиторий проекта
                <Icon name="arrow" size={16} />
              </a>
            </div>
          )}
          {modal.type === "workspace" && (
            <div className="help-content">
              <div className="employee-heading">
                <span className="workspace-symbol">П</span>
                <div>
                  <h2>Демо-компания</h2>
                  <p>Пространство команды</p>
                </div>
              </div>
              <p>
                Вы находитесь в демонстрационном пространстве. Данные условные, роли показаны только
                для контекста, реального разграничения прав нет.
              </p>
              <button className="btn primary" onClick={() => setModal(null)}>
                Продолжить работу
              </button>
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}

function Search({
  value,
  onChange,
  placeholder = "Найти сервис",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-field">
      <Icon name="search" size={18} />
      <input
        aria-label={placeholder}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="icon-btn" onClick={() => onChange("")} aria-label="Очистить поиск">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <Icon name="search" size={26} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]",
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Закрыть">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
function SubscriptionForm({
  existing,
  subscriptions,
  onSave,
}: {
  existing?: Subscription;
  subscriptions: Subscription[];
  onSave: (s: Subscription) => void;
}) {
  const [name, setName] = useState(existing?.name || "");
  const similar = subscriptions.filter(
    (s) =>
      s.id !== existing?.id &&
      name.trim().length > 1 &&
      s.name.toLowerCase().includes(name.trim().toLowerCase()),
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        onSave({
          id: existing?.id || Date.now(),
          name: name.trim(),
          vendor: String(d.get("vendor")).trim(),
          tariff: String(d.get("tariff")).trim(),
          price: Number(d.get("price")),
          currency: String(d.get("currency")),
          renewal: String(d.get("renewal")),
          paySource: String(d.get("paySource")),
          owner: String(d.get("owner")).trim(),
          status: String(d.get("status")),
        });
      }}
    >
      <p className="form-intro">Укажите условия подписки. Оплата выполняется вне SubControl.</p>
      <div className="form-grid">
        <label className="full">
          Название сервиса *
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Figma"
          />
        </label>
        {similar.length > 0 && (
          <div className="warning-box full">
            <Icon name="warning" size={18} />
            <span>
              Похожее название: {similar.map((s) => s.name).join(", ")}. Проверьте вручную — это не
              подтверждённый дубль.
            </span>
          </div>
        )}
        <label>
          Поставщик *
          <input
            name="vendor"
            required
            defaultValue={existing?.vendor}
            placeholder="Название компании"
          />
        </label>
        <label>
          Тариф *
          <input
            name="tariff"
            required
            defaultValue={existing?.tariff}
            placeholder="Professional"
          />
        </label>
        <label>
          Стоимость в месяц *
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={existing?.price}
            placeholder="0"
          />
        </label>
        <label>
          Валюта
          <select name="currency" defaultValue={existing?.currency || "RUB"}>
            <option value="RUB">RUB — Российский рубль</option>
            <option value="USD">USD — Доллар США</option>
            <option value="EUR">EUR — Евро</option>
          </select>
        </label>
        <label>
          Дата продления *
          <input name="renewal" required type="date" defaultValue={existing?.renewal} />
        </label>
        <label>
          Статус
          <select name="status" defaultValue={existing?.status || "Активна"}>
            <option>Активна</option>
            <option>Trial</option>
            <option>Отменена</option>
          </select>
        </label>
        <label>
          Ответственный *
          <input
            name="owner"
            required
            defaultValue={existing?.owner || "Анна Смирнова"}
            placeholder="Имя и фамилия"
          />
        </label>
        <label>
          Источник оплаты
          <input
            name="paySource"
            defaultValue={existing?.paySource}
            placeholder="По счёту, карта…"
          />
        </label>
      </div>
      <div className="modal-actions">
        <span className="form-hint">* Обязательные поля · демо</span>
        <button className="btn primary" type="submit">
          Сохранить подписку
          <Icon name="check" size={17} />
        </button>
      </div>
    </form>
  );
}
function RequestForm({
  subscriptions,
  onSave,
}: {
  subscriptions: Subscription[];
  onSave: (a: Approval) => void;
}) {
  const [name, setName] = useState("");
  const similar = subscriptions.filter(
    (s) => name.length > 1 && s.name.toLowerCase().includes(name.toLowerCase()),
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave({
          id: Date.now(),
          name: name.trim(),
          tariff: String(f.get("tariff")),
          price: Number(f.get("price")),
          goal: String(f.get("goal")),
          url: String(f.get("url")),
          status: "sent",
          comment: "",
          author: "Анна Смирнова",
        });
      }}
    >
      <p className="form-intro">
        Новый сервис сначала проходит согласование. Отправка заявки не оформляет покупку.
      </p>
      <div className="form-grid">
        <label className="full">
          Сервис *
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название сервиса"
          />
        </label>
        {similar.length > 0 && (
          <div className="warning-box full">
            <Icon name="info" size={18} />
            <span>
              Похожее название в реестре: {similar.map((s) => s.name).join(", ")}. Проверьте
              вручную; функциональная эквивалентность не установлена.
            </span>
          </div>
        )}
        <label>
          Тариф *<input required name="tariff" placeholder="Тариф и количество мест" />
        </label>
        <label>
          Стоимость в месяц, ₽ *<input type="number" min="0" step="0.01" required name="price" />
        </label>
        <label className="full">
          Ссылка на сервис *<input required type="url" name="url" placeholder="https://" />
        </label>
        <label className="full">
          Для чего нужен сервис? *
          <textarea required name="goal" rows={3} placeholder="Опишите потребность команды" />
        </label>
      </div>
      <div className="modal-actions">
        <span className="form-hint">Демо-заявка</span>
        <button className="btn primary" type="submit">
          Отправить на согласование
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  );
}
function ApprovalDetail({
  approval: a,
  subscriptions,
  onDecision,
}: {
  approval: Approval;
  subscriptions: Subscription[];
  onDecision: (status: string, comment: string) => void;
}) {
  const [comment, setComment] = useState(a.comment);
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState("");
  const finished = a.status === "approved" || a.status === "rejected";
  return (
    <>
      <div className="detail-hero">
        <div className="service-cell">
          <ServiceLogo name={a.name} />
          <div>
            <h2>{a.name}</h2>
            <p>{a.tariff}</p>
          </div>
        </div>
        <Badge tone={a.status === "approved" ? "green" : "purple"}>{approvalLabel[a.status]}</Badge>
      </div>
      <div className="detail-grid">
        <div>
          <small>Инициатор</small>
          <strong>{a.author}</strong>
        </div>
        <div>
          <small>Стоимость в месяц</small>
          <strong>{money(a.price)}</strong>
        </div>
      </div>
      <h3 className="detail-label">Обоснование</h3>
      <p className="detail-text">{a.goal}</p>
      <a className="text-link" href={a.url} target="_blank" rel="noreferrer">
        Сайт сервиса
        <Icon name="arrow" size={15} />
      </a>
      {subscriptions.some((s) => s.name.toLowerCase().includes(a.name.toLowerCase())) && (
        <div className="warning-box">
          <Icon name="info" size={19} />
          <span>
            В реестре есть похожее название: {a.name}. Проверьте вручную. Это не автоматическое
            определение дублирующего сервиса.
          </span>
        </div>
      )}
      <label className="standalone-label">
        Комментарий ответственного
        <textarea
          disabled={finished}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError("");
          }}
          placeholder="Обязателен для отказа или запроса уточнения"
          rows={3}
        />
      </label>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {!finished && (
        <>
          <div className="inline-note">
            Одобрение создаст демо-запись в реестре с примером даты продления. Условия нужно
            проверить вручную.
          </div>
          <div className="modal-actions wrap">
            <button
              className="btn danger"
              onClick={() => {
                if (!comment.trim()) {
                  setError("Укажите причину отказа");
                  return;
                }
                setConfirmReject(true);
              }}
            >
              Отклонить
            </button>
            <button
              className="btn"
              onClick={() => {
                if (!comment.trim()) {
                  setError("Укажите, что нужно уточнить");
                  return;
                }
                onDecision("needs_info", comment);
              }}
            >
              Запросить уточнение
            </button>
            <button className="btn primary" onClick={() => onDecision("approved", comment)}>
              Одобрить
              <Icon name="check" size={16} />
            </button>
          </div>
          {confirmReject && (
            <div className="warning-box confirm-box">
              <p>Отклонить заявку на {a.name}?</p>
              <button className="btn danger" onClick={() => onDecision("rejected", comment)}>
                Да, отклонить
              </button>
              <button className="btn" onClick={() => setConfirmReject(false)}>
                Назад
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
function RenewalDetail({
  subscription: s,
  decision,
  onDecision,
}: {
  subscription: Subscription;
  decision?: string;
  onDecision: (d: string) => void;
}) {
  const [choice, setChoice] = useState(
    decision === "Подготовить отмену"
      ? "Отменить"
      : decision === "Запрошено уточнение"
        ? "Запросить уточнение"
        : "Продлить",
  );
  const [comment, setComment] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <div className="detail-hero">
        <div className="service-cell">
          <ServiceLogo name={s.name} />
          <div>
            <h2>{s.name}</h2>
            <p>{s.tariff}</p>
          </div>
        </div>
        <Badge tone="amber">{daysLeft(s.renewal)} дн. до срока</Badge>
      </div>
      <div className="detail-grid">
        <div>
          <small>Ответственный</small>
          <strong>{s.owner}</strong>
        </div>
        <div>
          <small>Стоимость / мес.</small>
          <strong>{money(s.price, s.currency)}</strong>
        </div>
        <div>
          <small>Дата продления</small>
          <strong>
            {dateLabel(s.renewal)} {new Date(s.renewal).getFullYear()}
          </strong>
        </div>
        <div>
          <small>Текущий шаг</small>
          <strong>{decision || "Решение не принято"}</strong>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (choice === "Отменить" && !confirm) {
            setConfirm(true);
            return;
          }
          onDecision(
            choice === "Продлить"
              ? "Подготовить продление"
              : choice === "Отменить"
                ? "Подготовить отмену"
                : "Запрошено уточнение",
          );
        }}
      >
        <label className="standalone-label">
          Решение
          <select
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value);
              setConfirm(false);
            }}
          >
            {["Продлить", "Запросить уточнение", "Отменить"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="standalone-label">
          Комментарий {choice !== "Продлить" ? "*" : ""}
          <textarea
            required={choice !== "Продлить"}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        <div className="inline-note">
          Это фиксация следующего шага в прототипе, не платёж, не продление и не отмена у
          поставщика. Комментарий не отправляется и не сохраняется в API.
        </div>
        {confirm && (
          <div className="warning-box">
            Подтвердите подготовку отмены. Доступ у поставщика останется без изменений.
          </div>
        )}
        <div className="modal-actions">
          <button className={`btn ${confirm ? "danger" : "primary"}`} type="submit">
            {confirm ? "Подтвердить решение" : "Зафиксировать решение"}
            <Icon name="check" size={16} />
          </button>
        </div>
      </form>
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
function NewChecklist({ onSave }: { onSave: (c: Checklist) => void }) {
  const [services, setServices] = useState<string[]>([]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (!services.length) return;
        onSave({
          id: Date.now(),
          employee: String(f.get("employee")),
          role: String(f.get("role")),
          closed: false,
          items: services.map((name) => ({ name, revoked: false, returned: false })),
        });
      }}
    >
      <p className="form-intro">
        Укажите сотрудника и вручную выберите сервисы, которые необходимо проверить. Список не
        синхронизируется с назначениями.
      </p>
      <div className="form-grid">
        <label className="full">
          Сотрудник *<input name="employee" required placeholder="Имя и фамилия" />
        </label>
        <label className="full">
          Должность / подразделение
          <input name="role" placeholder="Например, дизайнер" />
        </label>
      </div>
      <h3 className="detail-label">Сервисы для ручной проверки *</h3>
      <div className="service-choices">
        {["Figma", "Notion", "Slack", "Miro", "OnlyOffice", "Zoom", "Linear", "Dropbox"].map(
          (s) => (
            <label key={s}>
              <input
                type="checkbox"
                checked={services.includes(s)}
                onChange={(e) =>
                  setServices((p) => (e.target.checked ? [...p, s] : p.filter((x) => x !== s)))
                }
              />
              <ServiceLogo name={s} small />
              {s}
            </label>
          ),
        )}
      </div>
      <div className="modal-actions">
        <span className="form-hint">Выбрано: {services.length}</span>
        <button className="btn primary" type="submit" disabled={!services.length}>
          Создать чек-лист
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  );
}

type ImportRow = {
  name: string;
  tariff: string;
  price: string;
  renewal: string;
  selected: boolean;
  state: string;
};
function parseCSV(text: string): string[][] {
  const delimiter = text.split(/\r?\n/)[0].includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  if (quoted) throw new Error("Незакрытая кавычка в CSV");
  return rows;
}
function ImportFlow({
  existing,
  onImport,
}: {
  existing: Subscription[];
  onImport: (s: Subscription[]) => void;
}) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [count, setCount] = useState(0);
  const readFile = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Выберите файл в формате CSV");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Максимальный размер файла — 1 МБ");
      return;
    }
    try {
      const parsed = parseCSV((await file.text()).replace(/^\uFEFF/, ""));
      const header = parsed.shift()?.map((x) => x.trim().toLowerCase()) || [];
      const ni = header.findIndex((x) => ["name", "название", "сервис"].includes(x));
      if (ni < 0) throw new Error("Не найдена колонка name или «Сервис»");
      const get = (r: string[], names: string[]) =>
        r[header.findIndex((x) => names.includes(x))]?.trim() || "";
      if (!parsed.length) throw new Error("В файле нет строк для импорта");
      setRows(
        parsed.slice(0, 100).map((r) => {
          const name = r[ni]?.trim() || "";
          const match = existing.some((s) => s.name.toLowerCase() === name.toLowerCase());
          const similar = existing.some((s) => s.name.toLowerCase().includes(name.toLowerCase()));
          return {
            name,
            tariff: get(r, ["tariff", "тариф"]),
            price: get(r, ["price_month", "price", "цена"]),
            renewal: get(r, ["renewal_date", "дата"]),
            selected: !!name && !match,
            state: match
              ? "Уже в реестре"
              : similar
                ? "Возможное совпадение"
                : [
                      "figma",
                      "notion",
                      "slack",
                      "miro",
                      "zoom",
                      "linear",
                      "dropbox",
                      "onlyoffice",
                    ].includes(name.toLowerCase())
                  ? "Распознан"
                  : "Неизвестный сервис",
          };
        }),
      );
      setFilename(file.name);
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось прочитать файл");
    }
  };
  return (
    <>
      <div className="concept-label">
        <Icon name="info" size={17} />
        <span>
          <strong>Концепт · требует доработки backend</strong>
          <small>
            Предпросмотр, исправление и подтверждение показаны только в прототипе. Текущий API не
            поддерживает этот процесс.
          </small>
        </span>
      </div>
      <div className="import-steps">
        {["Загрузка файла", "Проверка строк", "Результат"].map((s, i) => (
          <span className={i <= step ? "active" : ""} key={s}>
            <b>{i < step ? <Icon name="check" size={12} /> : i + 1}</b>
            {s}
            {i < 2 && <Icon name="chevron" size={13} />}
          </span>
        ))}
      </div>
      {step === 0 && (
        <>
          <label
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void readFile(e.dataTransfer.files[0]);
            }}
          >
            <span className="upload-symbol">
              <Icon name="upload" size={27} />
            </span>
            <strong>Выберите CSV или перетащите его сюда</strong>
            <span>До 1 МБ · первые 100 строк</span>
            <input type="file" accept=".csv" onChange={(e) => void readFile(e.target.files?.[0])} />
            <span className="btn">Выбрать файл</span>
          </label>
          <p className="form-hint">
            Колонки: name (обязательно), tariff, price_month, renewal_date (ГГГГ-ММ-ДД). Остальные
            условия уточняются после импорта.
          </p>
          <button
            className="text-link"
            onClick={() => {
              const blob = new Blob(
                [
                  "name,tariff,price_month,renewal_date\nFigma,Professional,12000,2025-07-20\nLoom,Business,2400,2025-07-25\nAcme,Team,5000,2025-08-01",
                ],
                { type: "text/csv;charset=utf-8" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "subcontrol-example.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Скачать пример CSV
            <Icon name="arrow" size={15} />
          </button>
        </>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {step === 1 && (
        <>
          <p className="form-intro">
            {filename} · {rows.length} строк. Выберите нужные записи и проверьте значения.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const selected = rows.filter((r) => r.selected);
              if (!selected.length) return;
              onImport(
                selected.map((r, i) => ({
                  id: Date.now() + i,
                  name: r.name,
                  tariff: r.tariff || "Уточнить",
                  vendor: r.name,
                  price: Number(r.price || 0),
                  currency: "RUB",
                  renewal: r.renewal,
                  owner: "Анна Смирнова",
                  status: "Активна",
                  paySource: "Не указан",
                })),
              );
              setCount(selected.length);
              setStep(2);
            }}
          >
            <div className="table-scroll import-table">
              <table>
                <thead>
                  <tr>
                    <th />
                    <th>Сервис / распознавание</th>
                    <th>Тариф</th>
                    <th>Цена / мес., ₽</th>
                    <th>Продление *</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="checkbox"
                          checked={r.selected}
                          aria-label={`Импортировать строку ${i + 1}`}
                          onChange={(e) =>
                            setRows((p) =>
                              p.map((x, n) => (n === i ? { ...x, selected: e.target.checked } : x)),
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          required={r.selected}
                          aria-label={`Название ${i + 1}`}
                          value={r.name}
                          onChange={(e) =>
                            setRows((p) =>
                              p.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)),
                            )
                          }
                        />
                        <span
                          className={`import-state ${r.state === "Распознан" ? "green-text" : ""}`}
                        >
                          {r.state}
                        </span>
                      </td>
                      <td>
                        <input
                          aria-label={`Тариф ${i + 1}`}
                          value={r.tariff}
                          onChange={(e) =>
                            setRows((p) =>
                              p.map((x, n) => (n === i ? { ...x, tariff: e.target.value } : x)),
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          aria-label={`Цена ${i + 1}`}
                          value={r.price}
                          required={r.selected}
                          onChange={(e) =>
                            setRows((p) =>
                              p.map((x, n) => (n === i ? { ...x, price: e.target.value } : x)),
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          required={r.selected}
                          aria-label={`Продление ${i + 1}`}
                          value={r.renewal}
                          onChange={(e) =>
                            setRows((p) =>
                              p.map((x, n) => (n === i ? { ...x, renewal: e.target.value } : x)),
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="inline-note">
              Совпадения определены по названиям. Неизвестные строки проверьте вручную. Источник
              оплаты и ответственного уточните в карточке.
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setStep(0)}>
                Другой файл
              </button>
              <button
                className="btn primary"
                disabled={!rows.some((r) => r.selected)}
                type="submit"
              >
                Подтвердить импорт ({rows.filter((r) => r.selected).length})
              </button>
            </div>
          </form>
        </>
      )}
      {step === 2 && (
        <div className="import-success">
          <span>
            <Icon name="check" size={32} />
          </span>
          <h2>Импорт подтверждён</h2>
          <p>
            Добавлено в демо-реестр: {count}.<br />
            Проверьте условия в карточках подписок.
          </p>
          <div className="inline-note">Это локальный концепт импорта. API не вызывался.</div>
        </div>
      )}
    </>
  );
}
