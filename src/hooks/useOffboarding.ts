import { useEffect, useState } from "react";

import { getOffboardingChecklists } from "../api/offboarding";

import { toChecklists } from "../api/adapters/offboarding";

import type { Checklist } from "../data";

export function useOffboarding() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);

  const [offboardingLoading, setOffboardingLoading] =
    useState(true);

  const [offboardingError, setOffboardingError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOffboarding() {
      try {
        const data = await getOffboardingChecklists();

        if (!active) return;

        setChecklists(toChecklists(data));
        setOffboardingError(null);
      } catch (error) {
        if (!active) return;

        setOffboardingError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить чек-листы",
        );
      } finally {
        if (active) {
          setOffboardingLoading(false);
        }
      }
    }

    void loadOffboarding();

    return () => {
      active = false;
    };
  }, []);

  return {
    checklists,
    setChecklists,
    offboardingLoading,
    offboardingError,
    setOffboardingError,
  };
}