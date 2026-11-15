import Icon from "../ui/Icon";

export default function HelpContent() {
  return (
    <div className="help-content">
      <span className="modal-demo-tag">
        ИНТЕРАКТИВНЫЙ ПРОТОТИП
      </span>

      <h2>Процесс виден. Решение — за вами.</h2>

      <p>
        Все записи и действия в этом интерфейсе —
        демонстрационные. Изменения хранятся
        только до перезагрузки страницы.
        Подключения к API репозитория пока нет.
      </p>

      <h3>Сценарии из API</h3>

      <p>
        Реестр, ручное добавление и редактирование,
        проверка лицензий, решения по заявкам
        и ручные чек-листы представлены как
        локальные демо-сценарии.
      </p>

      <h3>Концепты, требующие доработки backend</h3>

      <p>
        Предпросмотр и подтверждение CSV.
        Надёжный учёт купленных мест.
        Отправка и доставка напоминаний.
      </p>

      <div className="inline-note">
        <Icon name="info" size={18} />

        SubControl не проводит платежи и не
        отключает доступы автоматически.
      </div>

      <a
        className="text-link"
        href="https://github.com/like-Ocean/SUBcontrol"
        target="_blank"
        rel="noreferrer"
      >
        Репозиторий проекта
        <Icon name="arrow" size={16} />
      </a>
    </div>
  );
}
