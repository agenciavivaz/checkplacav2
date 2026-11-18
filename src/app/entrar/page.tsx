import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { requestLogin } from "./actions";

export const instant = false;

export const metadata: Metadata = { title: "Entrar | Checkplaca", robots: { index: false, follow: false } };

const messages = {
  sent: "Se o endereço estiver apto, você receberá um link para entrar. Confira também a pasta de spam.",
  invalid: "Informe um endereço de e-mail válido.",
  unavailable: "Não foi possível enviar o acesso agora. Tente novamente mais tarde.",
  expired: "Este link expirou ou já foi usado. Solicite outro acesso.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const message = status && Object.hasOwn(messages, status) ? messages[status as keyof typeof messages] : null;

  return <main className="shell account-page"><Link href="/" className="brand"><span className="brand__accent">check</span>placa</Link>
    <div className="account-card"><p className="eyebrow">Acesso à conta</p><h1>Entre com seu e-mail.</h1>
      <p>Enviaremos um link temporário para acessar seus dados com segurança.</p>
      {message && <Notice tone={status === "sent" ? "info" : "danger"}>{message}</Notice>}
      <form action={requestLogin} className="account-form"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} /><button className="button button--primary" type="submit">Enviar link de acesso</button></form>
    </div>
  </main>;
}
