import { apiRequest } from "./client";

import type {
  ApiLicense,
  ApiLicenseCreate,
  ApiLicenseWaste,
} from "../types/api";

export function getLicenses(): Promise<ApiLicense[]> {
  return apiRequest<ApiLicense[]>("/api/licenses");
}

export function createLicense(
  data: ApiLicenseCreate,
): Promise<ApiLicense> {
  return apiRequest<ApiLicense>("/api/licenses", {
    method: "POST",
    body: data,
  });
}

export function checkInLicense(
  id: number,
  inUse: boolean,
): Promise<ApiLicense> {
  return apiRequest<ApiLicense>(
    `/api/licenses/${id}/check-in`,
    {
      method: "POST",
      body: { in_use: inUse },
    },
  );
}

export function getLicenseWaste(): Promise<ApiLicenseWaste> {
  return apiRequest<ApiLicenseWaste>(
    "/api/licenses/waste",
  );
}
