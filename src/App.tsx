import ChecklistDetail from "./components/modals/ChecklistDetail";
import RenewalDetail from "./components/modals/RenewalDetail";
import ApprovalDetail from "./components/modals/ApprovalDetail";
import RequestForm from "./components/modals/RequestForm";
import SubscriptionForm from "./components/modals/SubscriptionForm";
import ServiceDetail from "./components/modals/ServiceDetail";
import ApprovalsPage from "./pages/ApprovalsPage";
import OffboardingPage from "./pages/OffboardingPage";
import RemindersPage from "./pages/RemindersPage";
import LicensesPage from "./pages/LicensesPage";
import DashboardPage from "./pages/DashboardPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import Icon from "./components/ui/Icon";
import ServiceLogo from "./components/ui/ServiceLogo";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { initialSubscriptions, initialApprovals, initialChecklists, daysLeft, type Subscription, type Checklist } from "./data";


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
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  subscriptions={subscriptions}
                  activeSubs={activeSubs}
                  renewals={renewals}
                  pending={pending}
                  openChecklists={openChecklists}
                  reviewCount={reviewCount}
                  decisions={decisions}
                  taskTab={taskTab}
                  onTaskTabChange={setTaskTab}
                  onNavigate={go}
                  onOpenModal={setModal}
                  onOpenSubscription={(id) =>
                    setModal({ type: "service", id })
                  }
                />
              }
            />
            <Route
              path="/subscriptions"
              element={
                <SubscriptionsPage
                  subscriptions={subscriptions}
                  onOpenSubscription={(id) =>
                    setModal({ type: "service", id })
                  }
                />
              }
            />
            <Route
              path="/licenses"
              element={
                <LicensesPage
                  selectedService={licenseService}
                  onSelectService={setLicenseService}
                  checked={checkedLicenses}
                  onChange={(key, value) => {
                    setCheckedLicenses((previous) => ({
                      ...previous,
                      [key]: value,
                    }));
                    notify("Статус проверки обновлён в демо");
                  }}
                />
              }
            />
            <Route
              path="/reminders"
              element={
                <RemindersPage
                  subscriptions={subscriptions}
                  decisions={decisions}
                  period={period}
                  onPeriodChange={setPeriod}
                  onOpenRenewal={(id) =>
                    setModal({ type: "renewal", id })
                  }
                />
              }
            />
            <Route
              path="/approvals"
              element={
                <ApprovalsPage
                  approvals={approvals}
                  onOpenApproval={(id) =>
                    setModal({ type: "approval", id })
                  }
                />
              }
            />
            <Route
              path="/offboarding"
              element={
                <OffboardingPage
                  checklists={checklists}
                  onOpenChecklist={(id) =>
                    setModal({ type: "checklist", id })
                  }
                />
              }
            />
          </Routes>
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
            subscriptions
              .filter((subscription) => subscription.id === modal.id)
              .map((subscription) => (
                <ServiceDetail
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={() => {
                    setModal({
                      type: "edit",
                      id: subscription.id,
                    });
                  }}
                  onCheckUsage={() => {
                    setLicenseService(subscription.name);
                    go(2);
                    setModal(null);
                  }}
                />
              ))}
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
              checklists
                .filter((checklist) => checklist.id === modal.id)
                .map((checklist) => (
                  <ChecklistDetail
                    key={checklist.id}
                    checklist={checklist}
                    onItemChange={(index, field, checked) => {
                      setChecklists((previous) =>
                        previous.map((current) =>
                          current.id === checklist.id && !current.closed
                            ? {
                                ...current,
                                items: current.items.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, [field]: checked }
                                    : item,
                                ),
                              }
                            : current,
                        ),
                      );
                    }}
                    onComplete={() => {
                      if (
                        checklist.closed ||
                        !checklist.items.every(
                          (item) => item.revoked && item.returned,
                        )
                      ) {
                        return;
                      }

                      setChecklists((previous) =>
                        previous.map((current) =>
                          current.id === checklist.id
                            ? { ...current, closed: true }
                            : current,
                        ),
                      );

                      notify("Чек-лист закрыт");
                      setModal(null);
                    }}
                  />
                ))}
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
