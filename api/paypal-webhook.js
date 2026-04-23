import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the Service Role Key
// This bypasses RLS — only use in server/serverless functions
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  // 1. Only allow POST (PayPal sends POST)
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // 2. Security Check (Matches the secret in your PayPal webhook URL)
  // PayPal will call: https://your-domain.com/api/paypal-webhook?secret=YOUR_SECRET
  const { secret } = req.query;
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;

  // 3. Look for "APPROVED" status
  // PAYMENT.CAPTURE.COMPLETED doesn't contain the buyer's name.
  // CHECKOUT.ORDER.APPROVED contains the payer object with their name!
  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    const payerName =
      event.resource?.payer?.name?.given_name || "Anonymous Legend";

    // 4. Insert into Supabase
    const { error } = await supabase
      .from("players")
      .insert([{ name: payerName }]);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Player added:", payerName);
    return res.status(200).json({ status: "Success", name: payerName });
  }

  // Tell PayPal we got the message, even if we didn't add a player
  console.log("Event received but ignored:", event.event_type);
  return res.status(200).send("Event received");
}
