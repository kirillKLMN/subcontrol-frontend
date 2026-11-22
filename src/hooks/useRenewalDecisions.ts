import { useEffect, useState } from "react";

import {
  createRenewalDecision,
  getRenewalDecisions,
} from "../api/renewalDecisions";
import type { Subscription } from "../data";
import {
  toApiRenewalDecision,
  toStoredRenewalDecision,
  toStoredRenewalDecisions,
} from "../utils/renewalDecisions";
import type {
  RenewalDecisionValue,
  StoredRenewalDecisions,
} from "../utils/renewalDecisions";

export function useRenewalDecisions() {
  const [decisions, setDecisions] = useState<StoredRenewalDecisions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const actions = await getRenewalDecisions();

        if (!active) return;

        setDecisions(toStoredRenewalDecisions(actions));
        setError(null);
      } catch (reason) {
        if (!active) return;

        setError(
          reason instanceof Error
            ? reason.message
            : "Не удалось загрузить решения о продлении",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [requestVersion]);

  function retry() {
    setLoading(true);
    setError(null);
    setRequestVersion((previous) => previous + 1);
  }

  async function saveDecision(
    subscription: Subscription,
    decision: RenewalDecisionValue,
    comment: string,
  ): Promise<void> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(subscription.renewal)) {
      throw new Error("У подписки не указана дата продления");
    }

    const saved = await createRenewalDecision({
      subscription_id: subscription.id,
      renewal_date: subscription.renewal,
      decision: toApiRenewalDecision(decision),
      comment,
    });

    setDecisions((previous) => ({
      ...previous,
      [String(saved.subscription_id)]: toStoredRenewalDecision(saved),
    }));
  }

  return {
    decisions,
    loading,
    error,
    retry,
    saveDecision,
  };
}
