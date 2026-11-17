import { useEffect, useState } from "react";

import { getApprovals } from "../api/approvals";
import { toApprovals } from "../api/adapters/approvals";

import type { Approval } from "../data";

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);

  const [approvalsLoading, setApprovalsLoading] = useState(true);

  const [approvalsError, setApprovalsError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadApprovals() {
      try {
        const data = await getApprovals();

        if (!active) return;

        setApprovals(toApprovals(data));
        setApprovalsError(null);
      } catch (error) {
        if (!active) return;

        setApprovalsError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить заявки",
        );
      } finally {
        if (active) {
          setApprovalsLoading(false);
        }
      }
    }

    void loadApprovals();

    return () => {
      active = false;
    };
  }, []);

  return {
    approvals,
    setApprovals,
    approvalsLoading,
    approvalsError,
  };
}