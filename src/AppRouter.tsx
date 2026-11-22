import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";

import App from "./App";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";

const authPaths = new Set([
  "/login",
  "/register",
  "/accept-invitation",
]);

export default function AppRouter() {
  const { status, error, retry, signOut } = useAuth();
  const { pathname } = useLocation();

  if (status === "loading") {
    return (
      <main className="auth-status" role="status">
        Проверяем сессию...
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="auth-status">
        <div className="auth-status-card">
          <h1>Не удалось проверить сессию</h1>
          <p role="alert">{error}</p>

          <div className="auth-status-actions">
            <button
              type="button"
              onClick={() => void retry()}
            >
              Повторить
            </button>

            <button type="button" onClick={signOut}>
              Выйти
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (status === "authenticated") {
    return authPaths.has(pathname)
      ? <Navigate to="/" replace />
      : <App />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<AuthPage mode="login" />}
      />

      <Route
        path="/register"
        element={<AuthPage mode="register" />}
      />

      <Route
        path="/accept-invitation"
        element={<AuthPage mode="invite" />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}