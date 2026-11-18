import type { ModuleCode } from "./modules";
import type { ProviderResult, SourceState, VehicleDataProvider } from "./types";

type Scenario = "clear" | "alert" | "no_data" | "unavailable" | "inconclusive";

export class MockVehicleDataProvider implements VehicleDataProvider {
  constructor(private readonly scenarios: Partial<Record<ModuleCode, Scenario>> = {}) {}

  async query(module: ModuleCode, _plate: string, signal: AbortSignal): Promise<ProviderResult> {
    signal.throwIfAborted();
    const scenario = this.scenarios[module] ?? "clear";
    if (scenario === "unavailable") throw new Error("Synthetic source unavailable");

    const state: SourceState = scenario === "no_data" ? "not_found" : scenario;
    return {
      state,
      sourceName: `Fixture sintética: ${module}`,
      findings: scenario === "alert" ? [{ code: "synthetic_alert", text: "Ocorrência sintética para teste." }] : [],
    };
  }
}
