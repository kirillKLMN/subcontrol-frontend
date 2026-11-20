<div align="center">

# SUBcontrol

### Subscription & License Management Platform

Frontend-приложение для централизованного управления корпоративными подписками и программными лицензиями.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

[![Frontend CI](https://github.com/kirillKLMN/subcontrol-frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/kirillKLMN/subcontrol-frontend/actions/workflows/frontend-ci.yml)

</div>

## О проекте

**SUBcontrol** - веб-приложение для учёта подписок, контроля использования лицензий и автоматизации связанных бизнес-процессов.

Система объединяет информацию о сервисах и подписках, помогает отслеживать продления, обрабатывать заявки и управлять доступами сотрудников.

В этом репозитории находится **клиентская часть приложения**.

## Возможности

- **Dashboard** - панель с общей информацией о подписках и лицензиях.
- **Subscriptions** - просмотр, добавление и редактирование подписок, импорт данных из CSV.
- **Licenses** - учёт лицензий и проверка их использования.
- **Reminders** - отслеживание предстоящих продлений подписок.
- **Approvals** - работа с заявками и решениями по согласованию.
- **Offboarding** - управление процессом отключения доступов при увольнении сотрудников.

## Технологии

| Категория | Технологии |
|---|---|
| Frontend | React, TypeScript |
| Стилизация | Tailwind CSS, CSS |
| Маршрутизация | React Router |
| Сборка | Vite |
| Работа с данными | REST API, Fetch API |
| Тестирование | Vitest |
| Инструменты | ESLint, Git, GitHub Actions |

## Архитектура

Код организован с разделением ответственности между страницами, компонентами, хуками и слоем взаимодействия с API.

```text
src/
├── api/          # HTTP-клиент, API-модули и адаптеры
├── assets/       # Статические ресурсы
├── components/   # Переиспользуемые компоненты интерфейса
├── hooks/        # Пользовательские React-хуки
├── pages/        # Страницы приложения
├── types/        # TypeScript-типы
└── utils/        # Вспомогательные функции
```

## Запуск проекта

Для запуска необходимы Node.js и npm.

**1. Клонируйте репозиторий**

```bash
git clone https://github.com/kirillKLMN/subcontrol-frontend.git
cd subcontrol-frontend
```

**2. Установите зависимости**

```bash
npm ci
```

**3. Настройте подключение к API**

При необходимости создайте файл `.env.local` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:8000
```

По умолчанию приложение обращается к API по адресу `http://localhost:8000`.

Для работы с серверными данными необходим запущенный backend.

**4. Запустите приложение**

```bash
npm run dev
```

### Дополнительные команды

| Команда | Назначение |
|---|---|
| `npm run build` | Проверка TypeScript и сборка приложения |
| `npm run lint` | Проверка кода ESLint |
| `npm run test` | Запуск тестов Vitest |
| `npm run test:watch` | Запуск тестов в режиме наблюдения |
| `npm run preview` | Просмотр production-сборки |

## Мой вклад

**Frontend Developer**

- Разработал клиентскую часть приложения на React и TypeScript.
- Реализовал страницы и компоненты по макетам Figma.
- Настроил маршрутизацию между разделами приложения.
- Организовал взаимодействие с сервером через REST API.
- Вынес логику работы с данными в отдельные API-модули и React-хуки.
- Участвовал в тестировании и настройке автоматических проверок проекта.

## Связанные репозитории

- [Backend SUBcontrol](https://github.com/like-Ocean/SUBcontrol)

---

<div align="center">
  <sub>Frontend developed by <a href="https://github.com/kirillKLMN">Kirill Malmygin</a></sub>
</div>
