import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  crisisId: z.string().uuid().optional(),
  crisisIds: z.array(z.string().uuid()).max(25).optional(),
  lookbackHours: z.number().int().min(1).max(24 * 30).default(24 * 7),
  maxSignals: z.number().int().min(1).max(1000).default(400),
});

type SignalRow = {
  id: string;
  crisis_id: string | null;
  content: string;
  source_url: string | null;
  keywords: string[] | null;
  matched_keyword: string | null;
  tracking_rule_id: string | null;
};

type RuleRow = {
  id: string;
  crisis_id: string;
  rule_text: string;
};

function normalizeForMatch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function resolveRuleMatch(signal: SignalRow, crisisRules: Array<RuleRow & { normalized: string }>) {
  const normalizedMatchedKeyword = signal.matched_keyword ? normalizeForMatch(signal.matched_keyword) : null;
  const byRuleId = signal.tracking_rule_id
    ? crisisRules.find((rule) => rule.id === signal.tracking_rule_id)
    : null;
  const byKeyword = normalizedMatchedKeyword
    ? crisisRules.find((rule) => rule.normalized === normalizedMatchedKeyword)
    : null;

  const haystack = normalizeForMatch([signal.content, signal.source_url ?? "", ...(signal.keywords ?? [])].join(" "));
  const contentMatches = crisisRules.filter((rule) => haystack.includes(rule.normalized));
  const exactKeywordMatches = signal.keywords
    ? crisisRules.filter((rule) => signal.keywords?.some((keyword) => normalizeForMatch(keyword) === rule.normalized))
    : [];

  if (byRuleId) return byRuleId;
  if (byKeyword) return byKeyword;
  if (exactKeywordMatches.length === 1) return exactKeywordMatches[0];
  if (contentMatches.length === 1) return contentMatches[0];
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(req.method === "POST" ? await req.json().catch(() => ({})) : {});
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Backend credentials are not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { crisisId, crisisIds, lookbackHours, maxSignals } = parsed.data;
    const targetCrisisIds = [...new Set([...(crisisIds ?? []), ...(crisisId ? [crisisId] : [])])];
    const windowStart = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();

    let signalsQuery = supabase
      .from("signals")
      .select("id, crisis_id, content, source_url, keywords, matched_keyword, tracking_rule_id")
      .gte("ingested_at", windowStart)
      .not("crisis_id", "is", null)
      .or("matched_keyword.is.null,tracking_rule_id.is.null")
      .order("ingested_at", { ascending: false })
      .limit(maxSignals);

    if (targetCrisisIds.length === 1) {
      signalsQuery = signalsQuery.eq("crisis_id", targetCrisisIds[0]);
    } else if (targetCrisisIds.length > 1) {
      signalsQuery = signalsQuery.in("crisis_id", targetCrisisIds);
    }

    const { data: candidateSignals, error: signalsError } = await signalsQuery;
    if (signalsError) throw signalsError;

    const signals = (candidateSignals ?? []) as SignalRow[];
    const crisisScope = [...new Set(signals.map((signal) => signal.crisis_id).filter(Boolean))] as string[];

    if (signals.length === 0 || crisisScope.length === 0) {
      return new Response(JSON.stringify({ scanned: 0, repaired: 0, crises: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rulesData, error: rulesError } = await supabase
      .from("tracking_rules")
      .select("id, crisis_id, rule_text")
      .in("crisis_id", crisisScope)
      .eq("is_active", true)
      .eq("rule_type", "keyword");

    if (rulesError) throw rulesError;

    const rules = (rulesData ?? []) as RuleRow[];
    const rulesByCrisis = new Map<string, Array<RuleRow & { normalized: string }>>();

    for (const rule of rules) {
      const nextRule = { ...rule, normalized: normalizeForMatch(rule.rule_text) };
      const existing = rulesByCrisis.get(rule.crisis_id) ?? [];
      existing.push(nextRule);
      rulesByCrisis.set(rule.crisis_id, existing);
    }

    for (const [crisisKey, crisisRules] of rulesByCrisis.entries()) {
      crisisRules.sort((left, right) => right.normalized.length - left.normalized.length);
      rulesByCrisis.set(crisisKey, crisisRules);
    }

    const updates: Array<{ id: string; matched_keyword: string; tracking_rule_id: string }> = [];

    for (const signal of signals) {
      if (!signal.crisis_id) continue;
      const crisisRules = rulesByCrisis.get(signal.crisis_id) ?? [];
      if (crisisRules.length === 0) continue;

      const matchedRule = resolveRuleMatch(signal, crisisRules);

      if (!matchedRule) continue;

      const nextKeyword = signal.matched_keyword ?? matchedRule.rule_text;
      const nextRuleId = signal.tracking_rule_id ?? matchedRule.id;

      if (signal.matched_keyword === nextKeyword && signal.tracking_rule_id === nextRuleId) {
        continue;
      }

      updates.push({
        id: signal.id,
        matched_keyword: nextKeyword,
        tracking_rule_id: nextRuleId,
      });
    }

    const settled = await Promise.allSettled(
      chunk(updates, 25).flatMap((group) =>
        group.map((update) =>
          supabase
            .from("signals")
            .update({
              matched_keyword: update.matched_keyword,
              tracking_rule_id: update.tracking_rule_id,
            })
            .eq("id", update.id)
        )
      )
    );

    const repaired = settled.filter((result) => result.status === "fulfilled").length;
    const failed = settled.filter((result) => result.status === "rejected").length;

    return new Response(
      JSON.stringify({
        scanned: signals.length,
        repaired,
        failed,
        crises: crisisScope,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("backfill-signal-attribution error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});