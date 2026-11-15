import { useState } from "react";
import type { Approval } from "../data";
import { approvalLabel, money } from "../data";

import Search from "../components/ui/Search";
import Empty from "../components/ui/Empty";
import Icon from "../components/ui/Icon";
import {
  ServiceCell,
  OwnerCell,
  StatusBadge,
} from "../components/ui/RecordCells";

type ApprovalsPageProps = {
  approvals: Approval[];
  onOpenApproval: (id: number) => void;
};

export default function ApprovalsPage({
  approvals,
  onOpenApproval,
}: ApprovalsPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все статусы");

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch = approval.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "Все статусы" ||
      approval.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="panel">
      <div className="toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Найти заявку"
        />

        <select
          aria-label="Статус заявки"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>Все статусы</option>

          {Object.entries(approvalLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Сервис</th>
              <th>Инициатор</th>
              <th>Стоимость / мес.</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredApprovals.map((approval) => (
              <tr
                key={approval.id}
                onClick={() => onOpenApproval(approval.id)}
              >
                <td>
                  <ServiceCell
                    name={approval.name}
                    tariff={approval.tariff}
                  />
                </td>

                <td>
                  <OwnerCell name={approval.author} />
                </td>

                <td>{money(approval.price)}</td>

                <td>
                  <StatusBadge status={approval.status} />
                </td>

                <td>
                  <Icon name="chevron" size={17} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApprovals.length === 0 && (
          <Empty
            title="Заявок не найдено"
            text="Измените фильтр или создайте заявку на новый сервис."
          />
        )}
      </div>
    </section>
  );
}
