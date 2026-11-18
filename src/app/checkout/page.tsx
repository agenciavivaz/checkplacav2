import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { getVisibleOffers } from "@/lib/catalog/server";
import { QuoteForm } from "@/components/plate/quote-form";

export const instant = false;

export const metadata: Metadata = { title: "Checkout em preparação | Checkplaca", robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: code } = await searchParams;
  const offers = await getVisibleOffers();
  const offer = offers.find((item) => item.code === code && item.code !== "free");

  return <main className="shell account-page"><Link href="/" className="brand"><span className="brand__accent">check</span>placa</Link>
    <div className="account-card"><p className="eyebrow">Consulta veicular</p><h1>{offer ? offer.name : "Escolha um plano"}</h1>
      {offer && <p>Preço de lançamento: {offer.price} por consulta.</p>}
      <Notice tone="warning">O checkout está em preparação. Nenhum pedido, cobrança ou consulta veicular será criado nesta etapa.</Notice>
      {offer && offer.code !== "free" && <QuoteForm plan={offer.code} />}
      <p><Link className="text-link" href="/planos">Voltar aos planos</Link></p>
    </div>
  </main>;
}
