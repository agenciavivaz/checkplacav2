import { validatePlate } from "../vehicles/plate";
import { z } from "zod";
import type { ModuleCode } from "./modules";
import type { ModuleConfig, ModuleReport, PaidOrderSnapshot, VehicleDataProvider } from "./types";

const providerResultSchema = z.object({
  state: z.enum(["clear", "alert", "inconclusive", "unavailable", "not_found"]),
  sourceName: z.string().min(1).max(80),
  sourceUpdatedAt: z.iso.datetime().optional(),
  findings: z.array(z.object({ code: z.string().max(64), text: z.string().max(240) }).strict()).max(50),
  actualCostCents: z.number().int().nonnegative().optional(),
}).strict();

export function estimateJobCost(modules: readonly ModuleCode[], config: readonly ModuleConfig[]) {
  return modules.reduce((total, moduleCode) => {
    const item = config.find((entry) => entry.code === moduleCode);
    if (!item || !item.enabled || !item.licenseApproved) {
      throw new Error(`Module ${moduleCode} is not approved for execution.`);
    }
    return total + item.estimatedCostCents;
  }, 0);
}

export async function runPaidReport(
  order: PaidOrderSnapshot,
  config: readonly ModuleConfig[],
  provider: VehicleDataProvider,
  maxEstimatedCostCents: number,
  now: () => string = () => new Date().toISOString(),
): Promise<readonly ModuleReport[]> {
  if (order.status !== "paid") throw new Error("Payment must be confirmed before querying a provider.");
  const plate = validatePlate(order.plate);
  if (!plate.valid) throw new Error("Invalid plate in paid order.");
  if (new Set(order.modules).size !== order.modules.length) throw new Error("Duplicate module in order snapshot.");
  if (maxEstimatedCostCents < 0 || estimateJobCost(order.modules, config) > maxEstimatedCostCents) {
    throw new Error("Estimated provider cost exceeds the configured budget.");
  }

  const reports: ModuleReport[] = [];
  for (const moduleCode of order.modules) {
    const moduleConfig = config.find((entry) => entry.code === moduleCode)!;
    const queriedAt = now();
    try {
      const result = providerResultSchema.parse(await provider.query(moduleCode, plate.normalized, AbortSignal.timeout(10_000)));
      reports.push({
        module: moduleCode,
        state: result.state,
        sourceName: result.sourceName,
        queriedAt,
        sourceUpdatedAt: result.sourceUpdatedAt ?? null,
        findings: result.findings,
        estimatedCostCents: moduleConfig.estimatedCostCents,
        actualCostCents: result.actualCostCents ?? null,
      });
    } catch {
      reports.push({
        module: moduleCode,
        state: "unavailable",
        sourceName: "Fonte indisponível",
        queriedAt,
        sourceUpdatedAt: null,
        findings: [],
        estimatedCostCents: moduleConfig.estimatedCostCents,
        actualCostCents: null,
      });
    }
  }
  return reports;
}
