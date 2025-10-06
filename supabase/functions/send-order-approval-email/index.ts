import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SENDGRID_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing one or more required environment variables.");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const order = payload.record || payload.order; // Accept both trigger and client-side payloads
    if (!order) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.customer_id)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to fetch customer profile or profile not found.");
    }

    const emailHtml = `
      <div>
        <h1>Order Approved!</h1>
        <p>Hi ${profile.full_name || 'Valued Customer'},</p>
        <p>Your order #${order.order_number} has been approved.</p>
        <p>Total: $${order.total_amount.toFixed(2)}</p>
        <p>We'll notify you again once it has shipped.</p>
        <p>Thanks for your order!</p>
      </div>
    `;

    const requestBody = {
      personalizations: [{
        to: [{ email: profile.email }],
        subject: `Order #${order.order_number} Approved`,
      }],
      from: { email: "s.jain@cloudroo.com.au", name: "SN Foods" },
      content: [{
        type: "text/html",
        value: emailHtml,
      }],
    };

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const responseBody = await res.text();
      throw new Error(`SendGrid API error: ${res.statusText} - ${responseBody}`);
    }

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error processing request:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
