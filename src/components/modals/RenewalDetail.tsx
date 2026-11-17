import { useState } from "react";

import type {
  RenewalDecisionValue,
} from "../../utils/renewalDecisions";
import type { Subscription } from "../../data";
import { daysLeft, dateLabel, money } from "../../data";

import Icon from "../ui/Icon";
import Badge from "../ui/Badge";
import ServiceLogo from "../ui/ServiceLogo";

type RenewalDetailProps = {
  subscription: Subscription;
  decision?: string;
  savedComment?: string;
  onDecision: (
    decision: RenewalDecisionValue,
    comment: string,
  ) => void;
};

export default function RenewalDetail({
  subscription: s,
  decision,
  savedComment,
  onDecision,
}: RenewalDetailProps) {
  const [choice, setChoice] = useState(
    decision === "Подготовить отмену"
      ? "Отменить"
      : decision === "Запрошено уточнение"
        ? "Запросить уточнение"
        : "Продлить",
  );

  const [comment, setComment] = useState(savedComment ?? "");
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <div className="detail-hero">
        <div className="service-cell">
          <ServiceLogo name={s.name} />

          <div>
            <h2>{s.name}</h2>
            <p>{s.tariff}</p>
          </div>
        </div>

        <Badge tone="amber">
          {daysLeft(s.renewal)} дн. до срока
        </Badge>
      </div>

      <div className="detail-grid">
        <div>
          <small>Ответственный</small>
          <strong>{s.owner}</strong>
        </div>

        <div>
          <small>Стоимость / мес.</small>
          <strong>{money(s.price, s.currency)}</strong>
        </div>

        <div>
          <small>Дата продления</small>
          <strong>
            {dateLabel(s.renewal)}{" "}
            {new Date(s.renewal).getFullYear()}
          </strong>
        </div>

        <div>
          <small>Текущий шаг</small>
          <strong>{decision || "Решение не принято"}</strong>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (choice === "Отменить" && !confirm) {
            setConfirm(true);
            return;
          }
          onDecision(
            choice === "Продлить"
              ? "Подготовить продление"
              : choice === "Отменить"
                ? "Подготовить отмену"
                : "Запрошено уточнение",
            comment.trim(),
          );
        }}
      >
        <label className="standalone-label">
          Решение

          <select
            value={choice}
            onChange={(event) => {
              setChoice(event.target.value);
              setConfirm(false);
            }}
          >
            <option>Продлить</option>
            <option>Запросить уточнение</option>
            <option>Отменить</option>
          </select>
        </label>

        <label className="standalone-label">
          Комментарий {choice !== "Продлить" ? "*" : ""}

          <textarea
            required={choice !== "Продлить"}
            rows={2}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>

        <div className="inline-note">
          Решение и комментарий сохраняются только
          в этом браузере. Они не передаются в API,
          не продлевают подписку и не отменяют её
          у поставщика.
        </div>

        {confirm && (
          <div className="warning-box">
            Подтвердите подготовку отмены.
            Доступ у поставщика останется без изменений.
          </div>
        )}

        <div className="modal-actions">
          <button
            className={`btn ${confirm ? "danger" : "primary"}`}
            type="submit"
          >
            {confirm
              ? "Подтвердить решение"
              : "Зафиксировать решение"}

            <Icon name="check" size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
