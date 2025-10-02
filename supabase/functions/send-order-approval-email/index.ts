import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    // Fetch order details with customer/contact info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          total_price,
          products (name, sku)
        ),
        profiles!orders_customer_id_fkey (email, full_name),
        accounts (name, email),
        profiles!orders_ordered_by_contact_id_fkey (email, full_name)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine recipient email
    let recipientEmail = "";
    let recipientName = "";

    if (order.customer_id && order.profiles) {
      recipientEmail = order.profiles.email;
      recipientName = order.profiles.full_name || "Customer";
    } else if (order.ordered_by_contact_id) {
      const contactProfile = order.profiles;
      recipientEmail = contactProfile?.email || "";
      recipientName = contactProfile?.full_name || "Customer";
    } else if (order.account_id && order.accounts?.email) {
      recipientEmail = order.accounts.email;
      recipientName = order.accounts.name || "Customer";
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "No recipient email found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build order items HTML
    let orderItemsHtml = "";
    if (order.order_items && Array.isArray(order.order_items)) {
      orderItemsHtml = order.order_items.map((item: any) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.products?.name || 'Product'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.products?.sku || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(item.total_price).toFixed(2)}</td>
        </tr>
      `).join('');
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }
          .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Approved! 🎉</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            <p>Great news! Your service order has been approved and is being processed.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> Approved</p>
            
            <h3>Order Items:</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <p>Subtotal: $${Number(order.subtotal).toFixed(2)}</p>
              <p>Tax: $${Number(order.tax_amount).toFixed(2)}</p>
              <p>Total Amount: $${Number(order.total_amount).toFixed(2)}</p>
            </div>
            
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
            
            <p>We'll notify you once your order is ready for delivery.</p>
            <p>Thank you for your business!</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via SendGrid
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail, name: recipientName }],
          subject: `Order ${order.order_number} Approved`,
        }],
        from: {
          email: "noreply@yourdomain.com",
          name: "Your Company Name"
        },
        content: [{
          type: "text/html",
          value: emailHtml
        }]
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send email", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Order approval email sent to ${recipientEmail} for order ${order.order_number}`);

    return new Response(JSON.stringify({ 
      message: "Order approval email sent successfully",
      recipient: recipientEmail 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
