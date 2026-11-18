"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profileSchema = z.string().trim().max(80);

export async function updateProfile(formData: FormData) {
  const name = profileSchema.safeParse(formData.get("display_name"));
  if (!name.success) redirect("/conta?status=invalid");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { error } = await supabase.from("profiles").update({ display_name: name.data || null }).eq("user_id", user.id);
  redirect(error ? "/conta?status=error" : "/conta?status=saved");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
