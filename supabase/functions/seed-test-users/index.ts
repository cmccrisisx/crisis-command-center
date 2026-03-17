import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_USERS = [
  { email: "admin@crisisx.demo", display_name: "Super Admin", role: "admin", department: "Executive" },
  { email: "pr@crisisx.demo", display_name: "Sarah Chen (PR Manager)", role: "pr_manager", department: "Communications" },
  { email: "legal@crisisx.demo", display_name: "David Okafor (Legal Reviewer)", role: "legal_reviewer", department: "Legal" },
  { email: "social@crisisx.demo", display_name: "Maria Santos (Social Manager)", role: "social_manager", department: "Social Media" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const results: any[] = [];

  for (const u of TEST_USERS) {
    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: "CrisisX2026!",
      email_confirm: true,
      user_metadata: { display_name: u.display_name },
    });

    if (error) {
      results.push({ email: u.email, status: "error", message: error.message });
      continue;
    }

    const userId = data.user.id;

    // Update role (trigger defaults to pr_manager)
    if (u.role !== "pr_manager") {
      await supabase.from("user_roles").update({ role: u.role }).eq("user_id", userId);
    }

    // Update profile with department
    await supabase.from("profiles").update({ display_name: u.display_name, department: u.department }).eq("user_id", userId);

    results.push({ email: u.email, role: u.role, status: "created", userId });
  }

  // Upgrade existing user ybo@cmcconnect.com to admin
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const ybo = existingUsers?.users?.find((u: any) => u.email === "ybo@cmcconnect.com");
  if (ybo) {
    // Check if already admin
    const { data: existingRole } = await supabase.from("user_roles").select("role").eq("user_id", ybo.id).eq("role", "admin").maybeSingle();
    if (!existingRole) {
      await supabase.from("user_roles").insert({ user_id: ybo.id, role: "admin" });
    }
    results.push({ email: "ybo@cmcconnect.com", role: "admin", status: "upgraded" });
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
