import { useState, type FormEvent } from "react";

import Icon from "../ui/Icon";
import ServiceLogo from "../ui/ServiceLogo";

export type NewChecklistData = {
  employee: string;
  services: string[];
};

type NewChecklistProps = {
  availableServices: string[];
  servicesLoading: boolean;
  servicesError: string | null;
  onSave: (data: NewChecklistData) => Promise<void>;
};

export default function NewChecklist({
  availableServices,
  servicesLoading,
  servicesError,
  onSave,
}: NewChecklistProps) {
  const [services, setServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (
    service: string,
    checked: boolean,
  ) => {
    setServices((previous) =>
      checked
        ? [...previous, service]
        : previous.filter((item) => item !== service),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (submitting) return;

    const formData = new FormData(event.currentTarget);

    const data: NewChecklistData = {
      employee: String(formData.get("employee") ?? "").trim(),
      services: [...services],
    };

    if (!data.employee || !data.services.length) {
      setError("Укажите сотрудника и выберите сервисы");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSave(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось создать чек-лист",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <p className="form-intro">
        Укажите сотрудника и вручную выберите сервисы,
        которые необходимо проверить. Список не
        синхронизируется с назначениями.
      </p>

      <div className="form-grid">
        <label className="full">
          Сотрудник *
          <input
            name="employee"
            required
            placeholder="Имя и фамилия"
          />
        </label>

      </div>

      <h3 className="detail-label">
        Сервисы для ручной проверки *
      </h3>

{servicesLoading ? (
  <p className="form-hint" role="status">
    Загружаем список сервисов...
  </p>
) : servicesError ? (
  <p className="field-error" role="alert">
    Не удалось загрузить сервисы: {servicesError}
  </p>
) : availableServices.length === 0 ? (
  <p className="form-hint">
    В реестре пока нет подписок.
    Сначала добавьте хотя бы один сервис.
  </p>
) : (
  <div className="service-choices">
    {availableServices.map((service) => (
      <label key={service}>
        <input
          type="checkbox"
          checked={services.includes(service)}
          disabled={submitting}
          onChange={(event) =>
            toggleService(
              service,
              event.target.checked,
            )
          }
        />

        <ServiceLogo name={service} small />
        {service}
      </label>
    ))}
  </div>
)}


      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <div className="modal-actions">
        <span className="form-hint">
          Выбрано: {services.length}
        </span>

        <button
          className="btn primary"
          type="submit"
          disabled={
            !services.length ||
            submitting ||
            servicesLoading ||
            Boolean(servicesError)
          }
        >
          {submitting
            ? "Создаём..."
            : "Создать чек-лист"}
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  );
}
