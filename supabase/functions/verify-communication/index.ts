import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Hash-based lookup (from QR code links) — no file needed
    if (action === "verify-hash") {
      const { contentHash } = body;
      if (!contentHash) {
        return new Response(JSON.stringify({ error: "Missing contentHash" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data, error } = await supabase
        .from("verified_communications")
        .select("*")
        .eq("content_hash", contentHash)
        .eq("status", "verified")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return new Response(
          JSON.stringify({
            verified: true,
            record: {
              documentTitle: data.document_title,
              authorizingExecutive: data.authorizing_executive,
              mintedAt: data.minted_at,
              contentHash: data.content_hash,
              signature: data.signature,
              chainTxHash: data.chain_tx_hash,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ verified: false, contentHash }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { fileBase64, fileName, fileSize, mimeType, documentTitle, authorizingExecutive } = body;

    if (!fileBase64) {
      return new Response(JSON.stringify({ error: "Missing fileBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode base64 to bytes and compute SHA-256
    const fileBytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
    const contentHash = await sha256(fileBytes);

    if (action === "verify") {
      // Public verification — no auth needed
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data, error } = await supabase
        .from("verified_communications")
        .select("*")
        .eq("content_hash", contentHash)
        .eq("status", "verified")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return new Response(
          JSON.stringify({
            verified: true,
            record: {
              documentTitle: data.document_title,
              authorizingExecutive: data.authorizing_executive,
              mintedAt: data.minted_at,
              contentHash: data.content_hash,
              signature: data.signature,
              chainTxHash: data.chain_tx_hash,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ verified: false, contentHash }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "mint") {
      // Auth required
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = claimsData.claims.sub;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const signature = await hmacSign(contentHash, serviceKey);

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        serviceKey
      );

      // Insert as anchoring
      const { data: record, error: insertError } = await supabaseAdmin
        .from("verified_communications")
        .insert({
          document_title: documentTitle || fileName || "Untitled",
          authorizing_executive: authorizingExecutive || "Unknown",
          content_hash: contentHash,
          signature,
          file_name: fileName || "unknown",
          file_size: fileSize || fileBytes.length,
          mime_type: mimeType || "application/octet-stream",
          minted_by: userId,
          status: "anchoring",
          verification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-communication`,
          chain_tx_hash: `0x${contentHash.slice(0, 16)}...${signature.slice(-8)}`,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Simulate blockchain anchoring delay, then update to verified
      setTimeout(async () => {
        await supabaseAdmin
          .from("verified_communications")
          .update({ status: "verified" })
          .eq("id", record.id);
      }, 3000);

      return new Response(
        JSON.stringify({
          success: true,
          record: {
            id: record.id,
            contentHash,
            signature,
            status: "anchoring",
            chainTxHash: record.chain_tx_hash,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
