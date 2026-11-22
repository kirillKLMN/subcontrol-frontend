import { useState, type FormEvent } from "react";

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
  loading: boolean;
  loadError: string | null;
  onRetry: () => void;
  onDecision: (
    decision: RenewalDecisionValue,
    comment: string,
  ) => Promise<void>;
};

export default function RenewalDetail({
  subscription: s,
  decision,
  savedComment,
  loading,
  loadError,
  onRetry,
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || loading || loadError) return;

    if (choice === "Отменить" && !confirm) {
      setConfirm(true);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await onDecision(
        choice === "Продлить"
          ? "Подготовить продление"
          : choice === "Отменить"
            ? "Подготовить отмену"
            : "Запрошено уточнение",
        comment.trim(),
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить решение",
      );
    } finally {
      setSaving(false);
    }
  }

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

      <form onSubmit={(event) => void handleSubmit(event)}>
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
          Решение и комментарий сохраняются в вашем рабочем
          пространстве. Подписка у поставщика не продлевается
          и не отменяется автоматически.
        </div>

        {loading && (
          <p className="inline-note" role="status">
            Загружаем предыдущие решения...
          </p>
        )}

        {loadError && (
          <div className="warning-box" role="alert">
            Не удалось получить решения: {loadError}.{" "}
            <button type="button" onClick={onRetry}>
              Повторить
            </button>
          </div>
        )}

        {saveError && (
          <div className="warning-box" role="alert">
            {saveError}
          </div>
        )}

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
            disabled={saving || loading || loadError !== null}
          >
            {saving
              ? "Сохраняем..."
              : confirm
                ? "Подтвердить решение"
                : "Зафиксировать решение"}

            <Icon name="check" size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
