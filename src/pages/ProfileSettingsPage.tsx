import { useState, type FormEvent } from "react";

import { changeUserPassword } from "../api/auth";
import Avatar from "../components/ui/Avatar";
import { useAuth } from "../hooks/useAuth";
import { formatUserRoles } from "../utils/userRoles";
import {
  validatePasswordChange,
  validateProfileName,
} from "../utils/profileValidation";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось сохранить изменения";
}

export default function ProfileSettingsPage() {
  const { currentUser, updateProfile } = useAuth();
  const name = currentUser?.user.full_name ?? "";
  const [fullName, setFullName] = useState(name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingProfile) return;

    setProfileError(null);
    setProfileSuccess(null);

    const trimmedName = fullName.trim();
    const validationError = validateProfileName(trimmedName);
    if (validationError) {
      setProfileError(validationError);
      return;
    }

    if (trimmedName === name) return;

    setSavingProfile(true);
    try {
      await updateProfile({ full_name: trimmedName });
      setFullName(trimmedName);
      setProfileSuccess("Имя успешно обновлено");
    } catch (error) {
      setProfileError(errorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingPassword) return;

    setPasswordError(null);
    setPasswordSuccess(null);

    const validationError = validatePasswordChange(
      currentPassword,
      newPassword,
      repeatPassword,
    );
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setSavingPassword(true);
    try {
      await changeUserPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setPasswordSuccess("Пароль успешно изменён");
    } catch (error) {
      setPasswordError(errorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  if (!currentUser) return null;

  return (
    <div className="profile-settings">
      <section className="panel profile-settings-card">
        <div className="profile-settings-user">
          <Avatar name={name} size="large" />
          <div>
            <h2>{name}</h2>
            <p>{currentUser.user.email}</p>
            <span>{formatUserRoles(currentUser.roles)}</span>
          </div>
        </div>

        <h3>Личные данные</h3>
        <p className="profile-settings-hint">Имя будет отображаться в рабочем пространстве и в списке команды.</p>

        <form className="profile-settings-form" onSubmit={(event) => void handleProfileSubmit(event)}>
          <label>
            Имя и фамилия
            <input
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setProfileError(null);
                setProfileSuccess(null);
              }}
              autoComplete="name"
              maxLength={160}
              required
            />
          </label>
          <label>
            Электронная почта
            <input value={currentUser.user.email} readOnly aria-describedby="profile-email-help" />
            <small id="profile-email-help">Адрес электронной почты пока нельзя изменить.</small>
          </label>

          {profileError && <p className="team-feedback team-feedback-error" role="alert">{profileError}</p>}
          {profileSuccess && <p className="team-feedback" role="status">{profileSuccess}</p>}

          <button
            type="submit"
            className="btn primary"
            disabled={savingProfile || fullName.trim() === name}
          >
            {savingProfile ? "Сохраняем..." : "Сохранить имя"}
          </button>
        </form>
      </section>

      <section className="panel profile-settings-card">
        <h3>Безопасность</h3>
        <p className="profile-settings-hint">Для смены пароля укажите текущий пароль и придумайте новый.</p>

        <form className="profile-settings-form" onSubmit={(event) => void handlePasswordSubmit(event)}>
          <label>
            Текущий пароль
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              required
            />
          </label>
          <label>
            Новый пароль
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              required
            />
          </label>
          <label>
            Повторите новый пароль
            <input
              type="password"
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(event) => {
                setRepeatPassword(event.target.value);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              required
            />
          </label>

          {passwordError && <p className="team-feedback team-feedback-error" role="alert">{passwordError}</p>}
          {passwordSuccess && <p className="team-feedback" role="status">{passwordSuccess}</p>}

          <button type="submit" className="btn primary" disabled={savingPassword}>
            {savingPassword ? "Меняем пароль..." : "Изменить пароль"}
          </button>
        </form>
      </section>
    </div>
  );
}
