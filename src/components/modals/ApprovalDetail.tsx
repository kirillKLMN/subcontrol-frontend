import { useState } from "react";

import type { Approval, Subscription } from "../../data";
import { approvalLabel, money } from "../../data";

import Icon from "../ui/Icon";
import Badge from "../ui/Badge";
import ServiceLogo from "../ui/ServiceLogo";

type ApprovalDetailProps = {
  approval: Approval;
  subscriptions: Subscription[];
  onDecision: (status: string, comment: string) => void;
};

export default function ApprovalDetail({
  approval: a,
  subscriptions,
  onDecision,
}: ApprovalDetailProps) {
  const [comment, setComment] = useState(a.comment);
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState("");

  const finished =
    a.status === "approved" || a.status === "rejected";

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
          disabled={finished}
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
            Одобрение создаст демо-запись в реестре
            с примером даты продления. Условия нужно
            проверить вручную.
          </div>

          <div className="modal-actions wrap">
            <button
              className="btn danger"
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
              onClick={() => {
                if (!comment.trim()) {
                  setError("Укажите, что нужно уточнить");
                  return;
                }

                onDecision("needs_info", comment);
              }}
            >
              Запросить уточнение
            </button>

            <button
              className="btn primary"
              onClick={() => onDecision("approved", comment)}
            >
              Одобрить
              <Icon name="check" size={16} />
            </button>
          </div>

          {confirmReject && (
            <div className="warning-box confirm-box">
              <p>Отклонить заявку на {a.name}?</p>

              <button
                className="btn danger"
                onClick={() => onDecision("rejected", comment)}
              >
                Да, отклонить
              </button>

              <button
                className="btn"
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
