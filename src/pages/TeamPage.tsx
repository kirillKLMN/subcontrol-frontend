import { useEffect, useState, type FormEvent } from "react";

import {
  createTeamInvitation,
  getTeamInvitations,
  getTeamMembers,
  refreshInvitationLink,
  setDefaultApprover,
  updateTeamMember,
} from "../api/team";
import { getCurrentUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/auth";
import type { TeamInvitation, TeamMember } from "../types/team";
import { formatUserRoles } from "../utils/userRoles";
import Avatar from "../components/ui/Avatar";

type EditableRole = Exclude<UserRole, "owner">;

const roleOptions: { value: EditableRole; label: string }[] = [
  { value: "coordinator", label: "Координатор" },
  { value: "approver", label: "Согласующий" },
  { value: "requester", label: "Инициатор заявки" },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось выполнить действие";
}

function toggleRole(
  roles: EditableRole[],
  role: EditableRole,
): EditableRole[] {
  return roles.includes(role)
    ? roles.filter((item) => item !== role)
    : [...roles, role];
}

export default function TeamPage() {
  const { currentUser } = useAuth();
  const isOwner = currentUser?.roles.includes("owner") ?? false;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoles, setInviteRoles] = useState<EditableRole[]>(["requester"]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftRoles, setDraftRoles] = useState<EditableRole[]>([]);
  const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
  const [busyInvitationId, setBusyInvitationId] = useState<number | null>(null);
  const [defaultApproverId, setDefaultApproverId] = useState<number | null>(
    currentUser?.organization.default_approver_user_id ?? null,
  );
  const [savingApprover, setSavingApprover] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTeam() {
      try {
        const [team, pending, account] = await Promise.all([
          getTeamMembers(),
          isOwner ? getTeamInvitations() : Promise.resolve([]),
          getCurrentUser(),
        ]);
        if (!active) return;

        setMembers(team);
        setInvitations(pending);
        setDefaultApproverId(account.organization.default_approver_user_id);
        setLoadError(null);
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTeam();

    return () => {
      active = false;
    };
  }, [isOwner, reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((version) => version + 1);
  }

  function clearMessage() {
    setActionError(null);
    setActionSuccess(null);
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isOwner || inviting) return;
    clearMessage();

    if (inviteRoles.length === 0) {
      setActionError("Выберите хотя бы одну роль");
      return;
    }

    setInviting(true);
    try {
      const invitation = await createTeamInvitation({
        full_name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        roles: inviteRoles,
      });
      setInvitations((previous) => [invitation, ...previous]);
      setInviteLink(invitation.invite_url ?? null);
      setInviteName("");
      setInviteEmail("");
      setInviteRoles(["requester"]);
      setActionSuccess("Приглашение создано. Передайте ссылку сотруднику вручную.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setInviting(false);
    }
  }

  async function handleRefreshInvitation(invitationId: number) {
    if (!isOwner || busyInvitationId !== null) return;
    clearMessage();
    setBusyInvitationId(invitationId);

    try {
      const updated = await refreshInvitationLink(invitationId);
      setInvitations((previous) => previous.map((invitation) =>
        invitation.id === updated.id ? updated : invitation,
      ));
      setInviteLink(updated.invite_url ?? null);
      setActionSuccess("Ссылка обновлена. Предыдущая больше не действует.");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyInvitationId(null);
    }
  }

  async function handleCopyLink() {
    if (!inviteLink) return;
    clearMessage();

    try {
      await navigator.clipboard.writeText(inviteLink);
      setActionSuccess("Ссылка скопирована");
    } catch {
      setActionError("Не удалось скопировать автоматически. Выделите ссылку в поле.");
    }
  }

  function startEditing(member: TeamMember) {
    clearMessage();
    setEditingId(member.membership_id);
    setDraftRoles(member.roles.filter(
      (role): role is EditableRole => role !== "owner",
    ));
  }

  async function handleSaveRoles(member: TeamMember) {
    if (!isOwner || busyMemberId !== null) return;
    clearMessage();

    if (draftRoles.length === 0) {
      setActionError("У сотрудника должна остаться хотя бы одна роль");
      return;
    }

    setBusyMemberId(member.membership_id);
    try {
      const updated = await updateTeamMember(member.membership_id, {
        roles: draftRoles,
      });
      setMembers((previous) => previous.map((item) =>
        item.membership_id === updated.membership_id
          ? { ...item, roles: updated.roles, is_active: updated.is_active }
          : item,
      ));
      setEditingId(null);
      setActionSuccess("Роли сотрудника обновлены");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyMemberId(null);
    }
  }

  async function handleChangeActivity(member: TeamMember) {
    if (!isOwner || busyMemberId !== null || member.roles.includes("owner")) return;
    const nextActive = !member.is_active;

    if (!nextActive && !window.confirm(
      `Отключить доступ сотруднику ${member.user.full_name}?`,
    )) return;

    clearMessage();
    setBusyMemberId(member.membership_id);
    try {
      const updated = await updateTeamMember(member.membership_id, {
        is_active: nextActive,
      });
      setMembers((previous) => previous.map((item) =>
        item.membership_id === updated.membership_id
          ? { ...item, roles: updated.roles, is_active: updated.is_active }
          : item,
      ));
      setActionSuccess(nextActive ? "Доступ восстановлен" : "Доступ отключён");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyMemberId(null);
    }
  }

  async function handleSaveDefaultApprover() {
    if (!isOwner || defaultApproverId === null || savingApprover) return;
    clearMessage();
    setSavingApprover(true);

    try {
      const organization = await setDefaultApprover(defaultApproverId);
      setDefaultApproverId(organization.default_approver_user_id);
      setActionSuccess("Согласующий по умолчанию обновлён");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSavingApprover(false);
    }
  }

  const approverCandidates = members.filter((member) =>
    member.is_active &&
    (member.roles.includes("owner") || member.roles.includes("approver")),
  );

  return (
    <div className="team-page">
      <div className="info-strip">
        <div>
          <strong>Одно пространство — одна команда</strong>
          <span>
            Участники работают с данными своей организации.
            Доступ к действиям определяется ролями на сервере.
          </span>
        </div>
      </div>

      {actionError && <div className="team-feedback team-feedback-error" role="alert">{actionError}</div>}
      {actionSuccess && <div className="team-feedback" role="status">{actionSuccess}</div>}

      <section className="panel team-panel">
        <div className="toolbar team-toolbar">
          <h2>Участники</h2>
          <span>{members.length} в рабочем пространстве</span>
        </div>

        {loading ? (
          <p className="team-placeholder" role="status">Загружаем сотрудников...</p>
        ) : loadError ? (
          <div className="team-placeholder" role="alert">
            Не удалось загрузить команду: {loadError}
            <button className="btn" type="button" onClick={reload}>Повторить</button>
          </div>
        ) : members.length === 0 ? (
          <p className="team-placeholder">В организации пока нет участников</p>
        ) : members.map((member) => {
          const isOwnerMember = member.roles.includes("owner");
          const editable = isOwner && !isOwnerMember;
          const isEditing = editingId === member.membership_id;

          return (
            <article className="team-member" key={member.membership_id}>
              <div className="team-member-main">
                <Avatar name={member.user.full_name} size="large" />
                <div className="team-member-name">
                  <strong>{member.user.full_name}</strong>
                  <span>{member.user.email}</span>
                </div>
              </div>
              <div className="team-member-detail">
                <span>{formatUserRoles(member.roles)}</span>
                <span className={member.is_active ? "team-active" : "team-inactive"}>
                  {member.is_active ? "Активен" : "Отключён"}
                </span>
                {member.assigned_services.length > 0 && (
                  <small>Сервисы: {member.assigned_services.join(", ")}</small>
                )}
              </div>

              {editable && (
                <div className="team-member-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    disabled={busyMemberId !== null}
                    onClick={() => isEditing ? setEditingId(null) : startEditing(member)}
                  >
                    {isEditing ? "Отмена" : "Изменить роли"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-small"
                    disabled={busyMemberId !== null}
                    onClick={() => void handleChangeActivity(member)}
                  >
                    {member.is_active ? "Отключить" : "Восстановить"}
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="team-role-editor">
                  <div className="team-role-list">
                    {roleOptions.map((role) => (
                      <label key={role.value}>
                        <input
                          type="checkbox"
                          checked={draftRoles.includes(role.value)}
                          onChange={() => setDraftRoles((previous) => toggleRole(previous, role.value))}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn primary btn-small"
                    disabled={busyMemberId !== null || draftRoles.length === 0}
                    onClick={() => void handleSaveRoles(member)}
                  >
                    Сохранить роли
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {isOwner && !loading && !loadError && (
        <>
          <section className="panel team-panel">
            <div className="toolbar"><h2>Пригласить сотрудника</h2></div>
            <form className="team-invite-form" onSubmit={(event) => void handleInvite(event)}>
              <label>
                Имя сотрудника
                <input
                  required
                  minLength={2}
                  maxLength={160}
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                  placeholder="Имя и фамилия"
                />
              </label>
              <label>
                Электронная почта
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                />
              </label>
              <div className="team-role-list team-invite-roles" role="group" aria-label="Роли приглашённого">
                {roleOptions.map((role) => (
                  <label key={role.value}>
                    <input
                      type="checkbox"
                      checked={inviteRoles.includes(role.value)}
                      onChange={() => setInviteRoles((previous) => toggleRole(previous, role.value))}
                    />
                    {role.label}
                  </label>
                ))}
              </div>
              <button className="btn primary" type="submit" disabled={inviting || inviteRoles.length === 0}>
                {inviting ? "Создаём приглашение..." : "Создать приглашение"}
              </button>
            </form>

            {inviteLink && (
              <div className="team-invite-link">
                <strong>Одноразовая ссылка для сотрудника</strong>
                <p>Ссылка действует 7 дней. Передайте её только адресату: письмо не отправляется автоматически.</p>
                <input
                  aria-label="Ссылка-приглашение"
                  type="text"
                  readOnly
                  value={inviteLink}
                  onFocus={(event) => event.currentTarget.select()}
                />
                <button type="button" className="btn" onClick={() => void handleCopyLink()}>
                  Скопировать ссылку
                </button>
              </div>
            )}
          </section>

          <section className="panel team-panel">
            <div className="toolbar"><h2>Ожидающие приглашения</h2></div>
            {invitations.length === 0 ? (
              <p className="team-placeholder">Ожидающих приглашений нет</p>
            ) : invitations.map((invitation) => (
              <div className="team-invitation-row" key={invitation.id}>
                <div>
                  <strong>{invitation.full_name}</strong>
                  <span>{invitation.email}</span>
                  <small>
                    {formatUserRoles(invitation.roles)} · Истекает {new Date(invitation.expires_at).toLocaleDateString("ru-RU")}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={busyInvitationId !== null}
                  onClick={() => void handleRefreshInvitation(invitation.id)}
                >
                  {busyInvitationId === invitation.id ? "Обновляем..." : "Новая ссылка"}
                </button>
              </div>
            ))}
          </section>

          <section className="panel team-panel">
            <div className="toolbar"><h2>Согласующий по умолчанию</h2></div>
            <div className="team-approver-settings">
              <label>
                Кому назначать новые заявки
                <select
                  value={defaultApproverId ?? ""}
                  onChange={(event) => setDefaultApproverId(Number(event.target.value))}
                >
                  {approverCandidates.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn primary"
                disabled={savingApprover || defaultApproverId === null}
                onClick={() => void handleSaveDefaultApprover()}
              >
                {savingApprover ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
