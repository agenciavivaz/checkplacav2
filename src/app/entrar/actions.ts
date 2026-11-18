"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.email().max(254);

export async function requestLogin(formData: FormData) {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) redirect("/entrar?status=invalid");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) redirect("/entrar?status=unavailable");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: new URL("/auth/confirm", appUrl).toString() },
  });
  if (error) redirect("/entrar?status=unavailable");

  redirect("/entrar?status=sent");
}
