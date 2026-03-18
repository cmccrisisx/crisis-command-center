import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    // Create client with the caller's JWT to check their role
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify caller identity
    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) throw new Error("Unauthorized");

    // Check caller is admin
    const { data: isAdmin } = await callerClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const { action, email, user_id, role } = await req.json();

    // Service role client for admin operations
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "list_users") {
      // Get all profiles with their roles
      const { data: profiles, error } = await serviceClient
        .from("profiles")
        .select("user_id, display_name, department, created_at");
      if (error) throw error;

      // Get all roles
      const { data: allRoles } = await serviceClient
        .from("user_roles")
        .select("user_id, role");

      // Get emails from auth.users
      const { data: { users: authUsers } } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });

      const enriched = (profiles ?? []).map((p) => ({
        ...p,
        email: authUsers?.find((u) => u.id === p.user_id)?.email ?? "unknown",
        roles: (allRoles ?? []).filter((r) => r.user_id === p.user_id).map((r) => r.role),
      }));

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add_role") {
      if (!user_id || !role) throw new Error("user_id and role required");

      const { error } = await serviceClient
        .from("user_roles")
        .upsert({ user_id, role }, { onConflict: "user_id,role" });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove_role") {
      if (!user_id || !role) throw new Error("user_id and role required");

      const { error } = await serviceClient
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", role);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("manage-roles error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
