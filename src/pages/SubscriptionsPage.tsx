import { useState } from "react";
import type { Subscription } from "../data";
import { daysLeft } from "../data";
import Search from "../components/ui/Search";
import Icon from "../components/ui/Icon";
import SubscriptionTable from "../components/subscriptions/SubscriptionTable";

type SubscriptionsPageProps = {
  subscriptions: Subscription[];
  onOpenSubscription: (id: number) => void;
};

export default function SubscriptionsPage({
  subscriptions,
  onOpenSubscription,
}: SubscriptionsPageProps) {
  // Filters are local to this page and reset when leaving /subscriptions.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все статусы");
  const [ownerFilter, setOwnerFilter] = useState("Все ответственные");
  const [registryPeriod, setRegistryPeriod] = useState("all");

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "Все статусы" || s.status === statusFilter) &&
      (ownerFilter === "Все ответственные" || s.owner === ownerFilter) &&
      (registryPeriod === "all" ||
        (daysLeft(s.renewal) >= 0 && daysLeft(s.renewal) <= Number(registryPeriod))),
  );

  return (
    <section className="panel">
      <div className="toolbar">
        <Search value={search} onChange={setSearch} />
        <select
          aria-label="Фильтр статуса"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["Все статусы", "Активна", "Trial", "Отменена"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Фильтр ответственного"
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
        >
          <option>Все ответственные</option>
          {[...new Set(subscriptions.map((s) => s.owner))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Срок продления"
          value={registryPeriod}
          onChange={(e) => setRegistryPeriod(e.target.value)}
        >
          <option value="all">Любой срок</option>
          <option value="7">В ближайшие 7 дней</option>
          <option value="30">В ближайшие 30 дней</option>
        </select>
        <span className="toolbar-count">{filteredSubs.length} записей</span>
      </div>
      <SubscriptionTable
        subscriptions={filteredSubs}
        onOpenSubscription={onOpenSubscription}
      />
      <div className="panel-footer">
        <Icon name="info" size={16} />
        Источник оплаты — справочное поле, не платёжная интеграция.
      </div>
    </section>
  );
}
