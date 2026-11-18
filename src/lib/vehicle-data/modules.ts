export const moduleCodes = [
  "nacional", "estadual", "gravame", "roubo_furto", "renajud",
  "recall", "multas_radar", "leilao", "historico_proprietarios", "fipe",
] as const;

export type ModuleCode = typeof moduleCodes[number];

export const referenceCosts: Record<ModuleCode, number> = {
  nacional: 110,
  estadual: 190,
  gravame: 180,
  roubo_furto: 145,
  renajud: 190,
  recall: 120,
  multas_radar: 36,
  leilao: 1200,
  historico_proprietarios: 410,
  fipe: 389,
};

export const essentialModules: readonly ModuleCode[] = moduleCodes.slice(0, 7);
export const completeModules: readonly ModuleCode[] = moduleCodes;
