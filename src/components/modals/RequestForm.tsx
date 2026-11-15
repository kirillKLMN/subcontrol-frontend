import { useState } from "react";

import type { Approval, Subscription } from "../../data";
import Icon from "../ui/Icon";

type RequestFormProps = {
  subscriptions: Subscription[];
  onSave: (approval: Approval) => void;
};

export default function RequestForm({
  subscriptions,
  onSave,
}: RequestFormProps) {
  const [name, setName] = useState("");

  const similar = subscriptions.filter(
    (subscription) =>
      name.length > 1 &&
      subscription.name
        .toLowerCase()
        .includes(name.toLowerCase()),
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        onSave({
          id: Date.now(),
          name: name.trim(),
          tariff: String(formData.get("tariff")),
          price: Number(formData.get("price")),
          goal: String(formData.get("goal")),
          url: String(formData.get("url")),
          status: "sent",
          comment: "",
          author: "Анна Смирнова",
        });
      }}
    >
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

      <div className="modal-actions">
        <span className="form-hint">
          Демо-заявка
        </span>

        <button className="btn primary" type="submit">
          Отправить на согласование
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  );
}
