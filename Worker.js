// Cloudflare Worker — backend proxy for the Strategy Desk site.
//
// This holds your Anthropic API key server-side (as a secret, never in
// code) and forwards requests from your GitHub Pages site to Anthropic's
// API. The static site never sees the key.
//
// Deploy: see README.md for step-by-step instructions.

export default {
  async fetch(request, env) {
    const corsHeaders = {
      // For tighter security, replace "*" with your exact GitHub Pages
      // origin, e.g. "https://yourusername.github.io"
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();

      if (!body.system || !body.messages) {
        return new Response(JSON.stringify({ error: "Missing system or messages" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: body.system,
          messages: body.messages,
        }),
      });

      const data = await anthropicRes.text();
      return new Response(data, {
        status: anthropicRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
