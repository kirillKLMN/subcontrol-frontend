import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";

type HeaderProps = {
  pageTitle: string;
  userName: string;
  onOpenReminders: () => void;
  onSignOut: () => void;
};

export default function Header({
  pageTitle,
  userName,
  onOpenReminders,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Рабочее пространство <span>/</span>
        <strong>{pageTitle}</strong>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="notification-btn"
          aria-label="Открыть очередь напоминаний"
          onClick={onOpenReminders}
        >
          <Icon name="bell" />
          <i />
        </button>

        <Avatar name={userName} />
        <button
          type="button"
          className="profile-signout"
          aria-label="Выйти из аккаунта"
          title="Выйти из аккаунта"
          onClick={onSignOut}
        >
          <Icon name="exit" size={17} />
        </button>
      </div>
    </header>
  );
}
