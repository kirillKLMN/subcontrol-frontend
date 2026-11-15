import { useState } from "react";

import type { Subscription } from "../../data";
import Icon from "../ui/Icon";

type SubscriptionFormProps = {
  existing?: Subscription;
  subscriptions: Subscription[];
  onSave: (subscription: Subscription) => void;
};

export default function SubscriptionForm({
  existing,
  subscriptions,
  onSave,
}: SubscriptionFormProps) {
  const [name, setName] = useState(existing?.name || "");

  const similar = subscriptions.filter(
    (subscription) =>
      subscription.id !== existing?.id &&
      name.trim().length > 1 &&
      subscription.name
        .toLowerCase()
        .includes(name.trim().toLowerCase()),
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        onSave({
          id: existing?.id || Date.now(),
          name: name.trim(),
          vendor: String(data.get("vendor")).trim(),
          tariff: String(data.get("tariff")).trim(),
          price: Number(data.get("price")),
          currency: String(data.get("currency")),
          renewal: String(data.get("renewal")),
          paySource: String(data.get("paySource")),
          owner: String(data.get("owner")).trim(),
          status: String(data.get("status")),
        });
      }}
    >
      <p className="form-intro">
        Укажите условия подписки. Оплата выполняется вне SubControl.
      </p>

      <div className="form-grid">
        <label className="full">
          Название сервиса *
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например, Figma"
          />
        </label>

        {similar.length > 0 && (
          <div className="warning-box full">
            <Icon name="warning" size={18} />
            <span>
              Похожее название:{" "}
              {similar.map((subscription) => subscription.name).join(", ")}.
              Проверьте вручную — это не подтверждённый дубль.
            </span>
          </div>
        )}

        <label>
          Поставщик *
          <input
            name="vendor"
            required
            defaultValue={existing?.vendor}
            placeholder="Название компании"
          />
        </label>

        <label>
          Тариф *
          <input
            name="tariff"
            required
            defaultValue={existing?.tariff}
            placeholder="Professional"
          />
        </label>

        <label>
          Стоимость в месяц *
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={existing?.price}
            placeholder="0"
          />
        </label>

        <label>
          Валюта
          <select
            name="currency"
            defaultValue={existing?.currency || "RUB"}
          >
            <option value="RUB">RUB — Российский рубль</option>
            <option value="USD">USD — Доллар США</option>
            <option value="EUR">EUR — Евро</option>
          </select>
        </label>

        <label>
          Дата продления *
          <input
            name="renewal"
            required
            type="date"
            defaultValue={existing?.renewal}
          />
        </label>

        <label>
          Статус
          <select
            name="status"
            defaultValue={existing?.status || "Активна"}
          >
            <option>Активна</option>
            <option>Trial</option>
            <option>Отменена</option>
          </select>
        </label>

        <label>
          Ответственный *
          <input
            name="owner"
            required
            defaultValue={existing?.owner || "Анна Смирнова"}
            placeholder="Имя и фамилия"
          />
        </label>

        <label>
          Источник оплаты
          <input
            name="paySource"
            defaultValue={existing?.paySource}
            placeholder="По счёту, карта…"
          />
        </label>
      </div>

      <div className="modal-actions">
        <span className="form-hint">
          * Обязательные поля · демо
        </span>

        <button className="btn primary" type="submit">
          Сохранить подписку
          <Icon name="check" size={17} />
        </button>
      </div>
    </form>
  );
}
