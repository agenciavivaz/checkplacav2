import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Notice, PlanCard } from "@/components/ui";
import { getVisibleOffers } from "@/lib/catalog/server";

export const metadata: Metadata = { title: "Planos | Checkplaca", description: "Compare a validação gratuita do formato da placa e os planos de consulta veicular." };

export const instant = false;

export default async function PlansPage() {
  const offers = await getVisibleOffers();
  return <main className="shell plans-page"><Link href="/" className="brand"><span className="brand__accent">check</span>placa</Link>
    <p className="eyebrow">Planos</p><h1>Escolha o nível de informação.</h1>
    <p className="lead">O Grátis confere somente o formato da placa. Os planos pagos acrescentarão consultas documentais após liberação das fontes e do pagamento.</p>
    <div className="plan-grid">{offers.map((plan) => <PlanCard key={plan.code} {...plan} featured={plan.code === "essential"} footer={plan.code === "free" ? <ButtonLink href="/">Validar formato</ButtonLink> : <ButtonLink href={`/checkout?plan=${plan.code}`} variant="secondary">Selecionar {plan.name}</ButtonLink>} />)}</div>
    <Notice>Valores de lançamento. Consultas pagas ainda indisponíveis. A cobertura final dependerá da licença e da disponibilidade de cada fonte.</Notice>
  </main>;
}
