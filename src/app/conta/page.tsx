import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Notice } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout, updateProfile } from "./acoes/actions";

export const instant = false;

export const metadata: Metadata = { title: "Minha conta | Checkplaca", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/entrar?status=unavailable");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).single();
  const { status } = await searchParams;

  return <main className="shell account-page"><div className="account-card"><p className="eyebrow">Minha conta</p><h1>Seus dados</h1><p>Você entrou como {user.email}.</p>
    {status === "saved" && <Notice>Perfil atualizado.</Notice>}
    {status === "invalid" && <Notice tone="danger">O nome deve ter até 80 caracteres.</Notice>}
    {status === "error" && <Notice tone="danger">Não foi possível atualizar o perfil.</Notice>}
    <form action={updateProfile} className="account-form"><label htmlFor="display-name">Nome de exibição</label><input id="display-name" name="display_name" defaultValue={profile?.display_name ?? ""} maxLength={80} /><button className="button button--primary" type="submit">Salvar perfil</button></form>
    <form action={logout} className="account-form"><button className="button button--secondary" type="submit">Sair da conta</button></form>
  </div></main>;
}
