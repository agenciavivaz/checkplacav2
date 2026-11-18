"use client";

import { useState, type FormEvent } from "react";
import { validatePlate } from "@/lib/vehicles/plate";

type Quote = { name: string; price_cents: number };

export function QuoteForm({ plan }: { plan: "essential" | "complete" }) {
  const [plate, setPlate] = useState("");
  const [message, setMessage] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validatePlate(plate);
    setQuote(null);
    if (!validation.valid) {
      setMessage("Confira a placa. Use AAA1234 ou AAA1A23.");
      return;
    }

    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: validation.normalized, plan }),
        cache: "no-store",
      });
      if (!response.ok) {
        setMessage("Esta consulta ainda não está disponível para compra.");
        return;
      }
      const result = await response.json() as Quote;
      setQuote(result);
      setMessage("A oferta foi encontrada, mas o pagamento ainda está em preparação.");
    } catch {
      setMessage("Não foi possível conferir a disponibilidade agora.");
    } finally {
      setPending(false);
    }
  }

  return <form className="account-form" onSubmit={submit}>
    <label htmlFor="quote-plate">Placa</label>
    <input id="quote-plate" value={plate} onChange={(event) => setPlate(event.target.value)} maxLength={12} autoComplete="off" autoCapitalize="characters" placeholder="AAA1A23" aria-describedby="quote-status" />
    <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Conferindo…" : "Conferir disponibilidade"}</button>
    <div id="quote-status" aria-live="polite">{quote && <p>{quote.name}: {(quote.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>}{message && <p>{message}</p>}</div>
  </form>;
}
