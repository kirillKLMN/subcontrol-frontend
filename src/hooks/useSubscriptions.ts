import { useEffect, useState } from "react";

import { getSubscriptionsForUi } from "../api/subscriptions";

import type { Subscription } from "../data";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<
    Subscription[]
  >([]);

  const [subscriptionsLoading, setSubscriptionsLoading] =
    useState(true);

  const [subscriptionsError, setSubscriptionsError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSubscriptions() {
      try {
        const data = await getSubscriptionsForUi();

        if (!active) return;

        setSubscriptions(data);
        setSubscriptionsError(null);
      } catch (error) {
        if (!active) return;

        setSubscriptionsError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить подписки",
        );
      } finally {
        if (active) {
          setSubscriptionsLoading(false);
        }
      }
    }

    void loadSubscriptions();

    return () => {
      active = false;
    };
  }, []);

  return {
    subscriptions,
    setSubscriptions,
    subscriptionsLoading,
    subscriptionsError,
    setSubscriptionsError,
  };
}