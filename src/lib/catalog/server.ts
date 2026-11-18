import "server-only";
import { createClient } from "@supabase/supabase-js";
import { introductoryOffers } from "./offers";

const moduleLabels: Record<string, string> = {
  nacional: "Cadastro nacional",
  estadual: "Situação estadual",
  gravame: "Gravame",
  roubo_furto: "Roubo e furto",
  renajud: "RENAJUD",
  recall: "Recall",
  multas_radar: "Multas Radar",
  leilao: "Histórico de leilão",
  historico_proprietarios: "Histórico agregado de proprietários",
  fipe: "FIPE",
};

export async function getVisibleOffers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return introductoryOffers;

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: plans, error } = await db.from("plans")
    .select("id, code, name, published_version_id")
    .eq("active", true);
  if (error || !plans?.length) return introductoryOffers;

  const ids = plans.map((plan) => plan.published_version_id).filter((id): id is string => Boolean(id));
  if (!ids.length) return introductoryOffers;
  const { data: versions, error: versionError } = await db.from("plan_versions")
    .select("id, price_cents, description, modules")
    .in("id", ids);
  if (versionError || !versions) return introductoryOffers;

  return introductoryOffers.map((offer) => {
    if (offer.code === "free") return offer;
    const plan = plans.find((item) => item.code === offer.code);
    const version = versions.find((item) => item.id === plan?.published_version_id);
    if (!plan || !version || !Array.isArray(version.modules)) return offer;
    return {
      code: offer.code,
      name: plan.name,
      price: (version.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      description: version.description,
      items: version.modules.map((code: string) => moduleLabels[code] ?? code),
    };
  });
}
