import { useState, type FormEvent } from "react";

import type { Subscription } from "../../data";
import Icon from "../ui/Icon";

type NewApprovalInput = {
  name: string;
  tariff: string;
  price: number;
  goal: string;
  url: string;
};

type RequestFormProps = {
  subscriptions: Subscription[];
  onSave: (approval: NewApprovalInput) => Promise<void>;
};

export default function RequestForm({
  subscriptions,
  onSave,
}: RequestFormProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const similar = subscriptions.filter(
    (subscription) =>
      name.trim().length > 1 &&
      subscription.name
        .toLowerCase()
        .includes(name.trim().toLowerCase()),
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (submitting) return;

    const formData = new FormData(event.currentTarget);

    const request: NewApprovalInput = {
      name: name.trim(),
      tariff: String(formData.get("tariff") ?? "").trim(),
      price: Number(formData.get("price")),
      goal: String(formData.get("goal") ?? "").trim(),
      url: String(formData.get("url") ?? "").trim(),
    };

    if (
      !request.name ||
      !request.tariff ||
      !request.goal ||
      !request.url ||
      !Number.isFinite(request.price) ||
      request.price < 0
    ) {
      setSubmitError("Проверьте обязательные поля заявки");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      await onSave(request);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <p className="form-intro">
        Новый сервис сначала проходит согласование.
        Отправка заявки не оформляет покупку.
      </p>

      <div className="form-grid">
        <label className="full">
          Сервис *
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название сервиса"
          />
        </label>

        {similar.length > 0 && (
          <div className="warning-box full">
            <Icon name="info" size={18} />
            <span>
              Похожее название в реестре:{" "}
              {similar
                .map((subscription) => subscription.name)
                .join(", ")}.
              Проверьте вручную; функциональная
              эквивалентность не установлена.
            </span>
          </div>
        )}

        <label>
          Тариф *
          <input
            required
            name="tariff"
            placeholder="Тариф и количество мест"
          />
        </label>

        <label>
          Стоимость в месяц, ₽ *
          <input
            type="number"
            min="0"
            step="0.01"
            required
            name="price"
          />
        </label>

        <label className="full">
          Ссылка на сервис *
          <input
            required
            type="url"
            name="url"
            placeholder="https://"
          />
        </label>

        <label className="full">
          Для чего нужен сервис? *
          <textarea
            required
            name="goal"
            rows={3}
            placeholder="Опишите потребность команды"
          />
        </label>
      </div>

      {submitError && (
        <p className="field-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="modal-actions">
        <span className="form-hint">
          Заявка будет сохранена в системе
        </span>

        <button
          className="btn primary"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Отправляем..."
            : "Отправить на согласование"}
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  );
}
