import { createSubscription, updateSubscription } from "./api/subscriptions";

import {
  toSubscription,
  toApiSubscriptionCreate,
  toApiSubscriptionPatch,
} from "./api/adapters/subscriptions";


import WorkspaceContent from "./components/modals/WorkspaceContent";
import HelpContent from "./components/modals/HelpContent";
import ModalShell from "./components/modals/ModalShell";
import ImportFlow from "./components/modals/ImportFlow";
import NewChecklist from "./components/modals/NewChecklist";
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
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";

import { useCallback, useEffect, useState } from "react";

import {
  initialApprovals,
  initialChecklists,
  daysLeft,
} from "./data";

import type { Subscription } from "./data";
import { getSubscriptionsForUi } from "./api/subscriptions";



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
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

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
  const checkedLicenses: Record<string, string> = {};
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


  useEffect(() => {
    let active = true;

    async function loadSubscriptions() {
      try {
        const data = await getSubscriptionsForUi();

        if (active) {
          setSubscriptions(data);
          setSubscriptionsError(null);
        }
      } catch (error) {
        if (active) {
          setSubscriptionsError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить подписки",
          );
        }
      } finally {
        if (active) {
          setSubscriptionsLoading(false);
        }
      }
    }

    void loadSubscriptions();

    return () => {
      active = false;
    };
  }, []);

  
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
          {(page === 0 || page === 1 || page === 3) && subscriptionsLoading ? (
          <div className="inline-note" role="status">
            Загружаем подписки...
          </div>
        ) : (page === 0 || page === 1 || page === 3) && subscriptionsError ? (
          <div className="inline-note" role="alert">
            Не удалось загрузить подписки: {subscriptionsError}
          </div>
        ) : (
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
                subscriptions={subscriptions}
                selectedService={licenseService}
                onSelectService={setLicenseService}
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
              onSave={async (subscription) => {
                if (modal.type === "edit") {
                  const updated = await updateSubscription(
                    subscription.id,
                    toApiSubscriptionPatch(subscription),
                  );

                  const updatedSubscription = toSubscription(updated);

                  setSubscriptions((previous) =>
                    previous.map((item) =>
                      item.id === updatedSubscription.id
                        ? updatedSubscription
                        : item,
                    ),
                  );

                  notify("Подписка успешно обновлена");
                } else {
                  const created = await createSubscription(
                    toApiSubscriptionCreate(subscription),
                  );

                  setSubscriptions((previous) => [
                    ...previous,
                    toSubscription(created),
                  ]);

                  notify("Подписка успешно создана");
                }

                setModal(null);
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
              onImported={async () => {
                const updatedSubscriptions =
                  await getSubscriptionsForUi();

                setSubscriptions(updatedSubscriptions);
                setSubscriptionsError(null);
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
          {modal.type === "help" && <HelpContent />}
          {modal.type === "workspace" && (
            <WorkspaceContent onContinue={closeModal} />
          )}
        </ModalShell>
      )}
    </div>
  );
}
