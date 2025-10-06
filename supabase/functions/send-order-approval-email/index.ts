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
    const order = payload.record || payload.order;
    if (!order) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let customerEmail: string | null = null;
    let customerName: string | null = null;

    if (order.customer_id) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", order.customer_id)
        .single();
      if (profileError || !profile) {
        throw new Error(`Failed to fetch customer profile for id: ${order.customer_id}`);
      }
      customerEmail = profile.email;
      customerName = profile.full_name;
    } else if (order.account_id) {
      const { data: relationship, error: relError } = await supabase
        .from("contact_account_relationships")
        .select("contact_id")
        .eq("account_id", order.account_id)
        .limit(1)
        .single();
      if (relError || !relationship) {
        throw new Error(`Failed to find contact for account id: ${order.account_id}`);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", relationship.contact_id)
        .single();
      if (profileError || !profile) {
        throw new Error(`Failed to fetch contact profile for id: ${relationship.contact_id}`);
      }
      customerEmail = profile.email;
      customerName = profile.full_name;
    }

    if (!customerEmail) {
      throw new Error("Could not determine customer email for the order.");
    }

    const emailHtml = `
      <div>
        <h1>Order Approved!</h1>
        <p>Hi ${customerName || 'Valued Customer'},</p>
        <p>Your order #${order.order_number} has been approved.</p>
        <p>Total: $${order.total_amount.toFixed(2)}</p>
        <p>We'll notify you again once it has shipped.</p>
        <p>Thanks for your order!</p>
      </div>
    `;

    const requestBody = {
      personalizations: [{
        to: [{ email: customerEmail }],
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
