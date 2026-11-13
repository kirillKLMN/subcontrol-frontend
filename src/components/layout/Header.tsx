import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";

type HeaderProps = {
  pageTitle: string;
  onOpenReminders: () => void;
};

export default function Header({
  pageTitle,
  onOpenReminders,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Рабочее пространство <span>/</span>
        <strong>{pageTitle}</strong>
      </div>

      <div className="topbar-right">
        <span className="demo-top">
          <span />
          Демо-данные
        </span>

        <span className="topbar-divider" />

        <button
          type="button"
          className="notification-btn"
          aria-label="Открыть очередь напоминаний"
          onClick={onOpenReminders}
        >
          <Icon name="bell" />
          <i />
        </button>

        <Avatar name="Анна Смирнова" />
      </div>
    </header>
  );
}
