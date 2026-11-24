import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import { formatUserRoles } from "../../utils/userRoles";
import type { UserRole } from "../../types/auth";

type NavigationItem = {
  title: string;
  icon: string;
};

type SidebarProps = {
  items: NavigationItem[];
  activePage: number;
  pendingCount: number;
  openChecklistCount: number;
  userName: string;
  organizationName: string;
  roles: UserRole[];
  onNavigate: (page: number) => void;
  onOpenProfile: () => void;
  onOpenModal: (type: "workspace" | "help") => void;
};

export default function Sidebar({
  items,
  activePage,
  pendingCount,
  openChecklistCount,
  userName,
  organizationName,
  roles,
  onNavigate,
  onOpenProfile,
  onOpenModal,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onNavigate(0);
        }}
      >
        <span className="brand-icon">
          <Icon name="layers" size={23} />
        </span>
        SubControl<span className="brand-period">.</span>
      </a>

      <button
        className="workspace"
        onClick={() => onOpenModal("workspace")}
      >
        <span className="workspace-symbol">{organizationName.charAt(0).toLocaleUpperCase("ru")}</span>
        <span>
          <strong>Пространство команды</strong>
          <small>{organizationName}</small>
        </span>
        <Icon name="down" size={15} />
      </button>

      <div className="nav-caption">
        РАБОЧЕЕ ПРОСТРАНСТВО
      </div>

      <nav aria-label="Основная навигация">
        {items.map((item, index) => (
          <button
            key={item.title}
            onClick={() => onNavigate(index)}
            className={`nav-item ${
              activePage === index ? "selected" : ""
            }`}
            aria-current={
              activePage === index ? "page" : undefined
            }
          >
            <Icon name={item.icon} />
            <span>{item.title}</span>

            {index === 4 && pendingCount > 0 && (
              <b className="nav-count">{pendingCount}</b>
            )}

            {index === 5 && openChecklistCount > 0 && (
              <span className="nav-dot" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="demo-card">
          <span className="demo-card-icon">
            <Icon name="layers" size={19} />
          </span>

          <strong>
            Порядок в подписках.
            <br />
            Спокойствие в работе.
          </strong>

          <p>
            Все сроки и следующие шаги
            <br />
            под вашим контролем.
          </p>

        </div>

        <button
          className="nav-item help-link"
          onClick={() => onOpenModal("help")}
        >
          <Icon name="help" />
          <span>Помощь и возможности</span>
          <Icon name="arrow" size={16} />
        </button>

        <button
          type="button"
          className="sidebar-profile"
          aria-label="Открыть настройки профиля"
          title="Настройки профиля"
          onClick={onOpenProfile}
        >
          <Avatar name={userName} size="large" />
          <div>
            <strong>{userName}</strong>
            <small>{formatUserRoles(roles)}</small>
          </div>
          <span className="profile-dot" />
        </button>
      </div>
    </aside>
  );
}
