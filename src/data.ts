export type Subscription = {
  id: number;
  name: string;
  vendor: string;
  tariff: string;
  price: number;
  currency: string;
  renewal: string;
  owner: string;
  status: string;
  paySource: string;
};
export type Approval = {
  id: number;
  name: string;
  tariff: string;
  price: number;
  goal: string;
  url: string;
  status: string;
  comment: string;
  author: string;
};
export type Checklist = {
  id: number;
  employee: string;
  role: string;
  closed: boolean;
  items: {
    id?: number;
    name: string;
    revoked: boolean;
    returned: boolean;
  }[];
};
export const initialSubscriptions: Subscription[] = [
  {
    id: 1,
    name: "Figma",
    vendor: "Figma, Inc.",
    tariff: "Professional",
    price: 12000,
    currency: "RUB",
    renewal: "2025-06-20",
    owner: "Анна Смирнова",
    status: "Активна",
    paySource: "Корпоративная карта",
  },
  {
    id: 2,
    name: "Notion",
    vendor: "Notion Labs",
    tariff: "Business",
    price: 18000,
    currency: "RUB",
    renewal: "2025-06-25",
    owner: "Михаил Козлов",
    status: "Активна",
    paySource: "По счёту",
  },
  {
    id: 3,
    name: "Slack",
    vendor: "Slack Technologies",
    tariff: "Pro",
    price: 21600,
    currency: "RUB",
    renewal: "2025-07-02",
    owner: "Елена Волкова",
    status: "Активна",
    paySource: "Корпоративная карта",
  },
  {
    id: 4,
    name: "Miro",
    vendor: "RealtimeBoard, Inc.",
    tariff: "Starter",
    price: 6400,
    currency: "RUB",
    renewal: "2025-07-08",
    owner: "Анна Смирнова",
    status: "Активна",
    paySource: "По счёту",
  },
  {
    id: 5,
    name: "OnlyOffice",
    vendor: "Ascensio System",
    tariff: "Business trial",
    price: 0,
    currency: "RUB",
    renewal: "2025-06-22",
    owner: "Михаил Козлов",
    status: "Trial",
    paySource: "Не указан",
  },
  {
    id: 6,
    name: "Zoom",
    vendor: "Zoom Communications",
    tariff: "Pro",
    price: 8900,
    currency: "RUB",
    renewal: "2025-08-10",
    owner: "Елена Волкова",
    status: "Активна",
    paySource: "По счёту",
  },
  {
    id: 7,
    name: "Linear",
    vendor: "Linear Orbit",
    tariff: "Basic",
    price: 7200,
    currency: "RUB",
    renewal: "2025-08-15",
    owner: "Михаил Козлов",
    status: "Активна",
    paySource: "Корпоративная карта",
  },
  {
    id: 8,
    name: "Dropbox",
    vendor: "Dropbox, Inc.",
    tariff: "Standard",
    price: 5600,
    currency: "RUB",
    renewal: "2025-05-31",
    owner: "Елена Волкова",
    status: "Отменена",
    paySource: "По счёту",
  },
];
export const initialApprovals: Approval[] = [
  {
    id: 1,
    name: "Figma",
    tariff: "Professional · 2 места",
    price: 3000,
    goal: "Дополнительные места для двух дизайнеров продуктовой команды.",
    url: "https://figma.com",
    status: "sent",
    comment: "",
    author: "Дарья Соколова",
  },
  {
    id: 2,
    name: "Loom",
    tariff: "Business",
    price: 2400,
    goal: "Запись обучающих видео для команды поддержки.",
    url: "https://loom.com",
    status: "sent",
    comment: "",
    author: "Алексей Петров",
  },
  {
    id: 3,
    name: "Notion",
    tariff: "Business · 3 места",
    price: 4500,
    goal: "Рабочее пространство для команды маркетинга.",
    url: "https://notion.so",
    status: "needs_info",
    comment: "Уточните, можно ли использовать существующее пространство.",
    author: "Мария Иванова",
  },
];
export const initialChecklists: Checklist[] = [
  {
    id: 1,
    employee: "Александр Морозов",
    role: "Продуктовый дизайнер",
    closed: false,
    items: [
      { name: "Figma", revoked: false, returned: false },
      { name: "Notion", revoked: true, returned: false },
      { name: "Slack", revoked: true, returned: true },
    ],
  },
  {
    id: 2,
    employee: "Ольга Белова",
    role: "Менеджер проектов",
    closed: false,
    items: [
      { name: "Notion", revoked: false, returned: false },
      { name: "Miro", revoked: false, returned: false },
    ],
  },
];
export const demoToday = new Date();

demoToday.setHours(12, 0, 0, 0);


export const daysLeft = (date: string) => {
  if (!date) return Number.POSITIVE_INFINITY;

  const timestamp = new Date(`${date}T12:00:00`).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.ceil(
    (timestamp - demoToday.getTime()) / 86400000,
  );
};

export const dateLabel = (date: string) => {
  if (!date) return "Не указана";

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Некорректная дата";
  }

  return parsedDate
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    })
    .replace(".", "");
};

export const money = (n: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    n,
  );
export const approvalLabel: Record<string, string> = {
  sent: "На согласовании",
  needs_info: "Нужно уточнение",
  approved: "Одобрена",
  rejected: "Отклонена",
};
