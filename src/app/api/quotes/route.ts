import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validatePlate } from "@/lib/vehicles/plate";

const inputSchema = z.object({
  plate: z.string().max(12),
  plan: z.enum(["essential", "complete"]),
}).strict();

const privateHeaders = { "Cache-Control": "private, no-store" };
const quoteAttempts = new Map<string, { count: number; expires: number }>();

function isRateLimited(request: NextRequest) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const previous = quoteAttempts.get(client);
  if (quoteAttempts.size > 5000) {
    for (const [key, value] of quoteAttempts) {
      if (value.expires <= now) quoteAttempts.delete(key);
    }
    if (quoteAttempts.size > 5000) quoteAttempts.clear();
  }
  const current = previous && previous.expires > now ? previous : { count: 0, expires: now + 60_000 };
  current.count += 1;
  quoteAttempts.set(client, current);
  return current.count > 20;
}

export async function POST(request: NextRequest) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: privateHeaders });
  }
  if (Number(request.headers.get("content-length")) > 1024) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400, headers: privateHeaders });
  }

  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400, headers: privateHeaders });
  }

  const plate = validatePlate(input.plate);
  if (!plate.valid) {
    return NextResponse.json({ error: "invalid_plate" }, { status: 400, headers: privateHeaders });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    return NextResponse.json({ error: "catalog_unavailable" }, { status: 503, headers: privateHeaders });
  }

  const db = createClient(url, secretKey, { auth: { persistSession: false } });
  const { data: plan, error: planError } = await db.from("plans")
    .select("id, name, active, published_version_id")
    .eq("code", input.plan).single();
  if (planError || !plan?.active || !plan.published_version_id) {
    return NextResponse.json({ error: "plan_unavailable" }, { status: 503, headers: privateHeaders });
  }

  const { data: version, error: versionError } = await db.from("plan_versions")
    .select("id, price_cents, modules, is_published")
    .eq("id", plan.published_version_id).eq("plan_id", plan.id).single();
  if (versionError || !version?.is_published || !Array.isArray(version.modules)) {
    return NextResponse.json({ error: "plan_unavailable" }, { status: 503, headers: privateHeaders });
  }

  const { data: modules, error: moduleError } = await db.from("integration_modules")
    .select("code, license_approved, enabled").in("code", version.modules);
  if (moduleError || modules?.length !== version.modules.length || modules.some((module) => !module.license_approved || !module.enabled)) {
    return NextResponse.json({ error: "plan_unavailable" }, { status: 503, headers: privateHeaders });
  }

  return NextResponse.json({ plan: input.plan, name: plan.name, price_cents: version.price_cents, plan_version_id: version.id }, { headers: privateHeaders });
}
