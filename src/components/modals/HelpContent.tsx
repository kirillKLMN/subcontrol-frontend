import Icon from "../ui/Icon";

export default function HelpContent() {
  return (
    <div className="help-content">
      <h2>Процесс виден. Решение — за вами.</h2>

      <p>
        SubControl помогает вести реестр корпоративных подписок,
        контролировать лицензии и согласовывать заявки.
        Данные привязаны к вашему рабочему пространству.
      </p>

      <h3>Подключённые функции</h3>

      <p>
        Подписки, импорт CSV, проверка лицензий, заявки
        и чек-листы офбординга работают через API.
        Доступ к действиям зависит от роли пользователя.
      </p>

      <h3>Что ещё дорабатывается</h3>

      <p>
        Решения о продлениях пока сохраняются только в этом
        браузере. Интерфейс управления командой и центр
        уведомлений ещё не подключены к API.
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
