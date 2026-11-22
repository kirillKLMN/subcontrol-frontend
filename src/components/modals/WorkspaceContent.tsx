import type { UserRole } from "../../types/auth";
import { formatUserRoles } from "../../utils/userRoles";

type WorkspaceContentProps = {
  organizationName: string;
  userName: string;
  userEmail: string;
  roles: UserRole[];
  onContinue: () => void;
};

export default function WorkspaceContent({
  organizationName,
  userName,
  userEmail,
  roles,
  onContinue,
}: WorkspaceContentProps) {
  return (
    <div className="help-content">
      <div className="employee-heading">
        <span className="workspace-symbol">
          {organizationName.charAt(0).toLocaleUpperCase("ru")}
        </span>

        <div>
          <h2>{organizationName}</h2>
          <p>Ваше рабочее пространство</p>
        </div>
      </div>

      <p>
        Вы вошли как {userName} ({userEmail}).
        Ваша роль: {formatUserRoles(roles)}.
        Подписки, лицензии и заявки относятся к этой организации;
        доступ к ним контролирует сервер.
      </p>

      <button
        className="btn primary"
        onClick={onContinue}
      >
        Продолжить работу
      </button>
    </div>
  );
}
