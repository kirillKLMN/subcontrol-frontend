
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
