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

import { daysLeft } from "./data";

import type { Approval, Subscription, Checklist } from "./data";

import { createApproval, getApprovals, decideApproval } from "./api/approvals";
import { toApproval, toApprovals } from "./api/adapters/approvals";
import { getSubscriptionsForUi } from "./api/subscriptions";
import { getLicenses } from "./api/licenses";

import { getOffboardingChecklists, createOffboardingChecklist, updateOffboardingItem, closeOffboardingChecklist } from "./api/offboarding";
import { toChecklist, toChecklists } from "./api/adapters/offboarding";

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

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [offboardingLoading, setOffboardingLoading] = useState(true);
  const [offboardingError, setOffboardingError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const closeModal = useCallback(() => {
  setModal(null);
}, []);
  const [toast, setToast] = useState("");
  const [period, setPeriod] = useState("30");
  const [taskTab, setTaskTab] = useState("Все действия");
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [reviewCountError, setReviewCountError] = useState(false);
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

  useEffect(() => {
    let active = true;

    async function loadApprovals() {
      try {
        const data = await getApprovals();

        if (active) {
          setApprovals(toApprovals(data));
          setApprovalsError(null);
        }
      } catch (error) {
        if (active) {
          setApprovalsError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить заявки",
          );
        }
      } finally {
        if (active) {
          setApprovalsLoading(false);
        }
      }
    }

    void loadApprovals();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadOffboarding() {
      try {
        const data = await getOffboardingChecklists();

        if (active) {
          setChecklists(toChecklists(data));
          setOffboardingError(null);
        }
      } catch (error) {
        if (active) {
          setOffboardingError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить чек-листы",
          );
        }
      } finally {
        if (active) {
          setOffboardingLoading(false);
        }
      }
    }

    void loadOffboarding();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (page !== 0) return;

    let active = true;

    async function loadReviewCount() {
      try {
        const licenses = await getLicenses();

        if (active) {
          setReviewCount(
            licenses.filter((license) => license.needs_check).length,
          );
          setReviewCountError(false);
        }
      } catch {
        if (active) {
          setReviewCount(null);
          setReviewCountError(true);
        }
      }
    }

    void loadReviewCount();

    return () => {
      active = false;
    };
  }, [page]);

  const go = (index: number) => {
    const destination = navigation[index];

    if (!destination) return;

    navigate(destination.path);

  };

  const activeSubs = subscriptions.filter((s) => s.status !== "Отменена");
  const renewals = activeSubs
    .filter((subscription) => {
      const remainingDays = daysLeft(subscription.renewal);

      return (
        Number.isFinite(remainingDays) &&
        remainingDays >= 0 &&
        remainingDays <= 30
      );
    })
    .sort((a, b) => a.renewal.localeCompare(b.renewal));
  const pending = approvals.filter((a) => a.status === "sent" || a.status === "needs_info");
  const openChecklists = checklists.filter((c) => !c.closed);

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
          ) : page === 4 && approvalsLoading ? (
            <div className="inline-note" role="status">
              Загружаем заявки...
            </div>
          ) : page === 4 && approvalsError ? (
            <div className="inline-note" role="alert">
              Не удалось загрузить заявки: {approvalsError}
            </div>
          ) : page === 5 && offboardingLoading ? (
            <div className="inline-note" role="status">
              Загружаем чек-листы...
            </div>
          ) : page === 5 && offboardingError ? (
            <div className="inline-note" role="alert">
              Не удалось загрузить чек-листы: {offboardingError}
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
                  reviewCountError={reviewCountError}
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
              onSave={async (request) => {
                const created = await createApproval({
                  service_name: request.name,
                  tariff: request.tariff,
                  price_month: String(request.price),
                  reason: request.goal,
                  link: request.url,
                });

                setApprovals((previous) => [
                  toApproval(created),
                  ...previous,
                ]);

                setModal(null);
                notify("Заявка успешно отправлена на согласование");
              }}
            />
          )}
          {modal.type === "approval" &&
            approvals
              .filter((approval) => approval.id === modal.id)
              .map((approval) => (
                <ApprovalDetail
                  key={approval.id}
                  approval={approval}
                  subscriptions={subscriptions}
                  onDecision={async (status, comment) => {
                    if (
                      approval.status === "approved" ||
                      approval.status === "rejected"
                    ) {
                      return;
                    }

                    const updated = await decideApproval(
                      approval.id,
                      {
                        decision: status,
                        comment: comment || null,
                      },
                    );

                    setApprovals((previous) =>
                      previous.map((item) =>
                        item.id === approval.id
                          ? toApproval(updated)
                          : item,
                      ),
                    );

                    setModal(null);

                    if (status === "approved") {
                      try {
                        const updatedSubscriptions =
                          await getSubscriptionsForUi();

                        setSubscriptions(updatedSubscriptions);
                        setSubscriptionsError(null);

                        notify(
                          "Заявка одобрена. Подписка добавлена в реестр.",
                        );
                      } catch {
                        notify(
                          "Решение сохранено, но реестр не обновился. Обновите страницу.",
                        );
                      }

                      return;
                    }

                    notify(
                      status === "rejected"
                        ? "Заявка отклонена"
                        : "Запрос уточнения сохранён",
                    );
                  }}
                />
              ))}
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
                    onItemChange={async (index, field, checked) => {
                      if (checklist.closed) {
                        throw new Error("Закрытый чек-лист нельзя изменять");
                      }

                      const item = checklist.items[index];

                      if (!item || item.id === undefined) {
                        throw new Error("Не найден ID пункта чек-листа");
                      }

                      const updated = await updateOffboardingItem(
                        item.id,
                        field === "revoked"
                          ? { access_revoked: checked }
                          : { license_returned: checked },
                      );

                      setChecklists((previous) =>
                        previous.map((current) =>
                          current.id === checklist.id
                            ? {
                                ...current,
                                items: current.items.map((currentItem) =>
                                  currentItem.id === updated.id
                                    ? {
                                        ...currentItem,
                                        revoked: updated.access_revoked,
                                        returned: updated.license_returned,
                                      }
                                    : currentItem,
                                ),
                              }
                            : current,
                        ),
                      );
                    }}
                    onComplete={async () => {
                      if (
                        checklist.closed ||
                        checklist.items.length === 0 ||
                        !checklist.items.every(
                          (item) => item.revoked && item.returned,
                        )
                      ) {
                        throw new Error(
                          "Для закрытия необходимо выполнить все пункты",
                        );
                      }

                      await closeOffboardingChecklist(checklist.id);

                      setChecklists((previous) =>
                        previous.map((current) =>
                          current.id === checklist.id
                            ? { ...current, closed: true }
                            : current,
                        ),
                      );

                      setModal(null);
                      notify("Чек-лист успешно закрыт");
                    }}
                  />
                ))}
                {modal.type === "new-checklist" && (
                  <NewChecklist
                    onSave={async (data) => {
                      const created = await createOffboardingChecklist({
                        employee: data.employee,
                        services: data.services,
                      });

                      const checklist = toChecklist(created);

                      setChecklists((previous) => [
                        checklist,
                        ...previous,
                      ]);

                      setOffboardingError(null);

                      setModal({
                        type: "checklist",
                        id: checklist.id,
                      });

                      notify("Чек-лист успешно создан");
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
