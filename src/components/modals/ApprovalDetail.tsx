import { useState } from "react";

import type { Approval, Subscription } from "../../data";
import { approvalLabel, money } from "../../data";

import Icon from "../ui/Icon";
import Badge from "../ui/Badge";
import ServiceLogo from "../ui/ServiceLogo";

type DecisionStatus = "approved" | "rejected" | "needs_info";

type ApprovalDetailProps = {
  approval: Approval;
  subscriptions: Subscription[];
  onDecision: (
    status: DecisionStatus,
    comment: string,
  ) => Promise<void>;
};

export default function ApprovalDetail({
  approval: a,
  subscriptions,
  onDecision,
}: ApprovalDetailProps) {
  const [comment, setComment] = useState(a.comment ?? "");
  const [confirmReject, setConfirmReject] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const finished =
    a.status === "approved" || a.status === "rejected";

  const handleDecision = async (status: DecisionStatus) => {
    if (saving || finished) return;

    const trimmedComment = comment.trim();

    if (
      (status === "rejected" || status === "needs_info") &&
      !trimmedComment
    ) {
      setError(
        status === "rejected"
          ? "Укажите причину отказа"
          : "Укажите, что нужно уточнить",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onDecision(status, trimmedComment);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить решение",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="detail-hero">
        <div className="service-cell">
          <ServiceLogo name={a.name} />

          <div>
            <h2>{a.name}</h2>
            <p>{a.tariff}</p>
          </div>
        </div>

        <Badge tone={a.status === "approved" ? "green" : "purple"}>
          {approvalLabel[a.status]}
        </Badge>
      </div>

      <div className="detail-grid">
        <div>
          <small>Инициатор</small>
          <strong>{a.author}</strong>
        </div>

        <div>
          <small>Стоимость в месяц</small>
          <strong>{money(a.price)}</strong>
        </div>
      </div>

      <h3 className="detail-label">Обоснование</h3>
      <p className="detail-text">{a.goal}</p>

      <a
        className="text-link"
        href={a.url}
        target="_blank"
        rel="noreferrer"
      >
        Сайт сервиса
        <Icon name="arrow" size={15} />
      </a>

      {subscriptions.some((subscription) =>
        subscription.name
          .toLowerCase()
          .includes(a.name.toLowerCase()),
      ) && (
        <div className="warning-box">
          <Icon name="info" size={19} />

          <span>
            В реестре есть похожее название: {a.name}.
            Проверьте вручную. Это не автоматическое
            определение дублирующего сервиса.
          </span>
        </div>
      )}

      <label className="standalone-label">
        Комментарий ответственного

        <textarea
          disabled={finished || saving}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            setError("");
          }}
          placeholder="Обязателен для отказа или запроса уточнения"
          rows={3}
        />
      </label>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {!finished && (
        <>
          <div className="inline-note">
            При одобрении подписка автоматически создаётся
            в реестре. Дату продления, ответственного
            и условия оплаты потребуется уточнить вручную.
          </div>

          <div className="modal-actions wrap">
            <button
              className="btn danger"
              disabled={saving}
              onClick={() => {
                if (!comment.trim()) {
                  setError("Укажите причину отказа");
                  return;
                }

                setConfirmReject(true);
              }}
            >
              Отклонить
            </button>

            <button
              className="btn"
              disabled={saving}
              onClick={() => void handleDecision("needs_info")}
            >
              Запросить уточнение
            </button>

            <button
              className="btn primary"
              disabled={saving}
              onClick={() => void handleDecision("approved")}
            >
              {saving ? "Сохраняем..." : "Одобрить"}
              <Icon name="check" size={16} />
            </button>
          </div>

          {confirmReject && (
            <div className="warning-box confirm-box">
              <p>Отклонить заявку на {a.name}?</p>

              <button
                className="btn danger"
                disabled={saving}
                onClick={() => void handleDecision("rejected")}
              >
                {saving ? "Сохраняем..." : "Да, отклонить"}
              </button>

              <button
                className="btn"
                disabled={saving}
                onClick={() => setConfirmReject(false)}
              >
                Назад
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
