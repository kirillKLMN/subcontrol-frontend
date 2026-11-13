import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";

type NavigationItem = {
  title: string;
  icon: string;
};

type SidebarProps = {
  items: NavigationItem[];
  activePage: number;
  pendingCount: number;
  openChecklistCount: number;
  onNavigate: (page: number) => void;
  onOpenModal: (type: "workspace" | "help") => void;
};

export default function Sidebar({
  items,
  activePage,
  pendingCount,
  openChecklistCount,
  onNavigate,
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
        <span className="workspace-symbol">П</span>
        <span>
          <strong>Пространство команды</strong>
          <small>Демо-компания</small>
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

          <span className="demo-tag">
            <span />
            Демонстрационный режим
          </span>
        </div>

        <button
          className="nav-item help-link"
          onClick={() => onOpenModal("help")}
        >
          <Icon name="help" />
          <span>Помощь и возможности</span>
          <Icon name="arrow" size={16} />
        </button>

        <div className="sidebar-profile">
          <Avatar name="Анна Смирнова" size="large" />
          <div>
            <strong>Анна Смирнова</strong>
            <small>Координатор</small>
          </div>
          <span className="profile-dot" />
        </div>
      </div>
    </aside>
  );
}
