export type PlateFormat = "old" | "mercosul";
export type PlateValidation =
  | { valid: true; normalized: string; format: PlateFormat }
  | { valid: false; normalized: string; reason: "empty" | "length" | "characters" | "pattern" };

export function validatePlate(input: string): PlateValidation {
  const normalized = input.toUpperCase().replace(/[\s-]/g, "");
  if (!normalized) return { valid: false, normalized, reason: "empty" };
  if (normalized.length !== 7) return { valid: false, normalized, reason: "length" };
  if (!/^[A-Z0-9]{7}$/.test(normalized)) return { valid: false, normalized, reason: "characters" };
  if (/^[A-Z]{3}[0-9]{4}$/.test(normalized)) return { valid: true, normalized, format: "old" };
  if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(normalized)) return { valid: true, normalized, format: "mercosul" };
  return { valid: false, normalized, reason: "pattern" };
}
