import { useState } from "react";

import type { Checklist } from "../../data";

import Icon from "../ui/Icon";
import ServiceLogo from "../ui/ServiceLogo";

type NewChecklistProps = {
  onSave: (checklist: Checklist) => void;
};

const availableServices = [
  "Figma",
  "Notion",
  "Slack",
  "Miro",
  "OnlyOffice",
  "Zoom",
  "Linear",
  "Dropbox",
];

export default function NewChecklist({
  onSave,
}: NewChecklistProps) {
  const [services, setServices] = useState<string[]>([]);

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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        if (!services.length) return;

        onSave({
          id: Date.now(),
          employee: String(formData.get("employee")),
          role: String(formData.get("role")),
          closed: false,
          items: services.map((name) => ({
            name,
            revoked: false,
            returned: false,
          })),
        });
      }}
    >
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

        <label className="full">
          Должность / подразделение
          <input
            name="role"
            placeholder="Например, дизайнер"
          />
        </label>
      </div>

      <h3 className="detail-label">
        Сервисы для ручной проверки *
      </h3>

      <div className="service-choices">
        {availableServices.map((service) => (
          <label key={service}>
            <input
              type="checkbox"
              checked={services.includes(service)}
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

      <div className="modal-actions">
        <span className="form-hint">
          Выбрано: {services.length}
        </span>

        <button
          className="btn primary"
          type="submit"
          disabled={!services.length}
        >
          Создать чек-лист
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  );
}
