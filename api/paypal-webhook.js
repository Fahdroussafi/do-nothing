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
    const payerEmail = event.resource?.payer?.email_address;

    // Extract amount from purchase_units
    const amountStr =
      event.resource?.purchase_units?.[0]?.amount?.value || "1.00";
    const amount = parseFloat(amountStr);

    if (!payerEmail) {
      console.error("No email provided in payload.");
      return res.status(400).send("No email provided");
    }

    // 4. Check if player exists by email
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("*")
      .eq("email", payerEmail)
      .maybeSingle();

    let dbError = null;

    if (existingPlayer) {
      // Update existing player: increment count and add to total spent
      const newCount = (existingPlayer.purchases_count || 0) + 1;
      const newTotal = (parseFloat(existingPlayer.total_spent) || 0) + amount;

      const { error } = await supabase
        .from("players")
        .update({
          purchases_count: newCount,
          total_spent: newTotal,
          name: payerName, // Update name to latest
        })
        .eq("email", payerEmail);
      dbError = error;
    } else {
      // Insert new player
      const { error } = await supabase.from("players").insert([
        {
          email: payerEmail,
          name: payerName,
          purchases_count: 1,
          total_spent: amount,
        },
      ]);
      dbError = error;
    }

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return res.status(500).json({ error: dbError.message });
    }

    console.log("Player processed:", payerName, "Total:", amount);
    return res.status(200).json({ status: "Success", name: payerName });
  }

  // Tell PayPal we got the message, even if we didn't add a player
  console.log("Event received but ignored:", event.event_type);
  return res.status(200).send("Event received");
}
