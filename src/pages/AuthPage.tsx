import { useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router";

import { useAuth } from "../hooks/useAuth";

type AuthMode = "login" | "register" | "invite";

const content = {
  login: {
    title: "С возвращением",
    description: "Войдите в рабочее пространство SubControl.",
    action: "Войти",
  },
  register: {
    title: "Создать рабочее пространство",
    description: "Зарегистрируйте организацию в SubControl.",
    action: "Создать аккаунт",
  },
  invite: {
    title: "Принять приглашение",
    description: "Создайте пароль для вашего аккаунта.",
    action: "Присоединиться",
  },
};

export default function AuthPage({
  mode,
}: {
  mode: AuthMode;
}) {
  const { signIn, signUp, acceptInvite } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const invitationToken = searchParams.get("token");
  const page = content[mode];

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (submitting) return;

    const data = new FormData(event.currentTarget);

    const email = String(
      data.get("email") ?? "",
    ).trim();

    const password = String(
      data.get("password") ?? "",
    );

    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signIn({
          email,
          password,
        });
      } else if (mode === "register") {
        await signUp({
          organization_name: String(
            data.get("organization_name") ?? "",
          ).trim(),

          full_name: String(
            data.get("full_name") ?? "",
          ).trim(),

          email,
          password,
        });
      } else {
        if (!invitationToken) {
          throw new Error(
            "В ссылке приглашения отсутствует токен",
          );
        }

        await acceptInvite({
          token: invitationToken,
          password,
        });
      }

      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось выполнить запрос",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" to="/login">
          <span className="auth-brand-symbol">S</span>
          SUBcontrol
        </Link>

        <h1>{page.title}</h1>
        <p className="auth-description">
          {page.description}
        </p>

        {mode === "invite" && !invitationToken && (
          <p className="auth-error" role="alert">
            Ссылка приглашения неполная.
            Попросите отправить новую.
          </p>
        )}

        <form
          className="auth-form"
          onSubmit={(event) => void handleSubmit(event)}
        >
          {mode === "register" && (
            <>
              <label>
                Название организации
                <input
                  name="organization_name"
                  autoComplete="organization"
                  minLength={2}
                  maxLength={160}
                  required
                />
              </label>

              <label>
                Ваше имя
                <input
                  name="full_name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={160}
                  required
                />
              </label>
            </>
          )}

          {mode !== "invite" && (
            <label>
              Электронная почта
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
          )}

          <label>
            Пароль
            <input
              name="password"
              type="password"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={
                mode === "login" ? undefined : 8
              }
              maxLength={128}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={
              submitting ||
              (mode === "invite" && !invitationToken)
            }
          >
            {submitting
              ? "Подождите..."
              : page.action}
          </button>
        </form>

        <p className="auth-footer">
          {mode === "login" ? (
            <>
              Нет аккаунта?{" "}
              <Link to="/register">
                Зарегистрироваться
              </Link>
            </>
          ) : (
            <>
              Уже есть аккаунт?{" "}
              <Link to="/login">Войти</Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}