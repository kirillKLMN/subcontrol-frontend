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
  closed: boolean;
  items: {
    id: number;
    name: string;
    revoked: boolean;
    returned: boolean;
  }[];
};

const MILLISECONDS_PER_DAY = 86_400_000;

export const daysLeft = (date: string): number => {
  if (!date) {
    return Number.POSITIVE_INFINITY;
  }

  const targetDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(targetDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Math.ceil(
    (targetDate.getTime() - today.getTime()) /
      MILLISECONDS_PER_DAY,
  );
};

export const dateLabel = (date: string): string => {
  if (!date) {
    return "Не указана";
  }

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

export const money = (
  amount: number,
  currency = "RUB",
): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const approvalLabel: Record<string, string> = {
  sent: "На согласовании",
  needs_info: "Нужно уточнение",
  approved: "Одобрена",
  rejected: "Отклонена",
};