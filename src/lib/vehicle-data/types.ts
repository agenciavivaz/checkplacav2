import type { ModuleCode } from "./modules";

export type SourceState = "clear" | "alert" | "inconclusive" | "unavailable" | "not_found";
export type ReportState = SourceState | "not_included" | "not_applicable";

export type ProviderResult = {
  state: SourceState;
  sourceName: string;
  sourceUpdatedAt?: string;
  findings: readonly { code: string; text: string }[];
  actualCostCents?: number;
};

export interface VehicleDataProvider {
  query(module: ModuleCode, plate: string, signal: AbortSignal): Promise<ProviderResult>;
}

export type ModuleConfig = {
  code: ModuleCode;
  enabled: boolean;
  licenseApproved: boolean;
  estimatedCostCents: number;
};

export type PaidOrderSnapshot = {
  id: string;
  status: "paid" | "pending" | "expired" | "canceled" | "refunded";
  plate: string;
  modules: readonly ModuleCode[];
};

export type ModuleReport = {
  module: ModuleCode;
  state: ReportState;
  sourceName: string;
  queriedAt: string | null;
  sourceUpdatedAt: string | null;
  findings: readonly { code: string; text: string }[];
  estimatedCostCents: number;
  actualCostCents: number | null;
};
