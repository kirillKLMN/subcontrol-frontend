
/**
 * Контракты API FastAPI.
 * Основаны на schemas/subcontrol.py.
 */

// GET /subscriptions
export type ApiSubscription = {
  id: number;
  name: string;
  vendor: string | null;
  tariff: string | null;
  price_month: string;
  currency: string;
  renewal_date: string | null;
  pay_source: string | null;
  owner: string | null;
  status: string;
};

// POST /subscriptions
export type ApiSubscriptionCreate = {
  name: string;
  vendor?: string | null;
  tariff?: string | null;
  price_month?: string;
  currency?: string;
  renewal_date?: string | null;
  pay_source?: string | null;
  owner?: string | null;
  status?: string;
};

// PATCH /subscriptions/{sub_id}
export type ApiSubscriptionPatch = {
  vendor?: string | null;
  tariff?: string | null;
  price_month?: string | null;
  renewal_date?: string | null;
  pay_source?: string | null;
  owner?: string | null;
  status?: string | null;
};


export type ApiLicense = {
  id: number;
  subscription_id: number;
  employee: string;
  is_active: boolean;
  last_activity: string | null;
  needs_check: boolean;
};

export type ApiLicenseCreate = {
  subscription_id: number;
  employee: string;
  is_active?: boolean;
  last_activity?: string | null;
};

export type ApiLicenseWasteRow = {
  subscription: string;
  bought: number;
  active: number;
  idle: number;
  monthly_loss: number;
};

export type ApiLicenseWaste = {
  rows: ApiLicenseWasteRow[];
  total_monthly_loss: number;
};

export type ApiRenewalDecisionValue =
  | "prepare_renewal"
  | "prepare_cancel"
  | "needs_info";

export type ApiRenewalDecisionCreate = {
  subscription_id: number;
  renewal_date: string;
  decision: ApiRenewalDecisionValue;
  comment: string;
};

export type ApiRenewalDecision = ApiRenewalDecisionCreate & {
  id: number;
  decided_by_user_id: number | null;
  created_at: string;
};
