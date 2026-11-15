import Avatar from "./Avatar";
import Badge from "./Badge";
import ServiceLogo from "./ServiceLogo";
import { approvalLabel } from "../../data";

// Presentational cells shared by the registry, renewals, approvals and details.
export function ServiceCell({ name, tariff }: { name: string; tariff: string }) {
  return (
    <div className="service-cell">
      <ServiceLogo name={name} />
      <div>
        <strong>{name}</strong>
        <span>{tariff}</span>
      </div>
    </div>
  );
}

export function OwnerCell({ name }: { name: string }) {
  return (
    <div className="person">
      <Avatar name={name} />
      <span>{name}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      tone={
        status === "Активна" || status === "approved"
          ? "green"
          : status === "Trial" || status === "needs_info"
            ? "amber"
            : status === "rejected" || status === "Отменена"
              ? "neutral"
              : "purple"
      }
    >
      {approvalLabel[status] || status}
    </Badge>
  );
}
