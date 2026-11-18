import "server-only";
import type { ProviderResult, VehicleDataProvider } from "./types";

export class DirectDataProvider implements VehicleDataProvider {
  async query(): Promise<ProviderResult> {
    throw new Error("Direct Data real adapter is disabled pending contract and payload validation.");
  }
}
