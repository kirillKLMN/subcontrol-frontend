import { useState } from "react";

import type { Subscription } from "../../data";
import Icon from "../ui/Icon";

type SubscriptionFormProps = {
  existing?: Subscription;
  subscriptions: Subscription[];
  onSave: (subscription: Subscription) => Promise<void>;
};

export default function SubscriptionForm({
  existing,
  subscriptions,
  onSave,
}: SubscriptionFormProps) {
  const [name, setName] = useState(existing?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(existing);

  const similar = subscriptions.filter(
    (subscription) =>
      subscription.id !== existing?.id &&
      name.trim().length > 1 &&
      subscription.name
        .toLowerCase()
        .includes(name.trim().toLowerCase()),
  );

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) return;

    const formData = new FormData(event.currentTarget);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Укажите название сервиса");
      return;
    }

    const subscription: Subscription = {
      id: existing?.id ?? Date.now(),
      name: trimmedName,
      vendor: String(formData.get("vendor") ?? "").trim(),
      tariff: String(formData.get("tariff") ?? "").trim(),
      price: Number(formData.get("price")),
      currency:
        existing?.currency ??
        String(formData.get("currency") ?? "RUB"),
      renewal: String(formData.get("renewal") ?? ""),
      paySource: String(formData.get("paySource") ?? ""),
      owner: String(formData.get("owner") ?? "").trim(),
      status: String(formData.get("status") ?? "Активна"),
    };

    setIsSaving(true);
    setError(null);

    try {
      await onSave(subscription);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось сохранить подписку",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
            readOnly={isEditing}
          />
        </label>

        {similar.length > 0 && (
          <div className="warning-box full">
            <Icon name="warning" size={18} />
            <span>
              Похожее название:{" "}
              {similar
                .map((subscription) => subscription.name)
                .join(", ")}
              . Проверьте вручную — это не подтверждённый дубль.
            </span>
          </div>
        )}

        <label>
          Поставщик *
          <input
            name="vendor"
            required
            defaultValue={existing?.vendor ?? ""}
            placeholder="Название компании"
          />
        </label>

        <label>
          Тариф *
          <input
            name="tariff"
            required
            defaultValue={existing?.tariff ?? ""}
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
            defaultValue={existing?.currency ?? "RUB"}
            disabled={isEditing}
          >
            <option value="RUB">RUB — Российский рубль</option>
            <option value="USD">USD — Доллар США</option>
            <option value="EUR">EUR — Евро</option>
          </select>
        </label>

        <label>
          Дата продления
          <input
            name="renewal"
            type="date"
            defaultValue={existing?.renewal ?? ""}
          />
        </label>

        <label>
          Статус
          <select
            name="status"
            defaultValue={existing?.status ?? "Активна"}
          >
            <option value="Активна">Активна</option>
            <option value="Trial">Trial</option>
            <option value="Отменена">Отменена</option>
          </select>
        </label>

        <label>
          Ответственный *
          <input
            name="owner"
            required
            defaultValue={existing?.owner ?? ""}
            placeholder="Имя и фамилия"
          />
        </label>

        <label>
          Источник оплаты
          <input
            name="paySource"
            defaultValue={existing?.paySource ?? ""}
            placeholder="По счёту, карта..."
          />
        </label>
      </div>

      {error && (
        <p className="form-hint" role="alert">
          Ошибка сохранения: {error}
        </p>
      )}

      <div className="modal-actions">
        <span className="form-hint">
          * Обязательные поля
        </span>

        <button
          className="btn primary"
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить изменения"
              : "Сохранить подписку"}

          <Icon name="check" size={17} />
        </button>
      </div>
    </form>
  );
}
