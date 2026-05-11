import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { query } from "../../../../lib/server/db";
import { jsonError, readJson } from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

function verifySignature(notification, serverKey) {
  const { order_id, status_code, gross_amount, signature_key } = notification || {};
  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");
  return hash === signature_key;
}

function mapPaymentStatus(transactionStatus, fraudStatus) {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "success" : "pending";
  }
  if (transactionStatus === "settlement") return "success";
  if (["cancel", "deny"].includes(transactionStatus)) return "failed";
  if (transactionStatus === "expire") return "expired";
  return "pending";
}

export async function POST(request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi" }, { status: 503 });
    }

    const notification = await readJson(request);
    if (!verifySignature(notification, serverKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const { transaction_status, order_id, payment_type, transaction_time, fraud_status } = notification;
    const status = mapPaymentStatus(transaction_status, fraud_status);
    const rows = await query(
      "SELECT id, user_id, plan, status FROM payment_transactions WHERE order_id = ? LIMIT 1",
      [order_id]
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const tx = rows[0];
    const alreadySuccess = tx.status === "success";
    await query(
      `UPDATE payment_transactions
       SET status = ?, payment_type = ?, transaction_time = ?, midtrans_response = ?, updated_at = NOW()
       WHERE order_id = ?`,
      [status, payment_type || null, transaction_time || null, JSON.stringify(notification), order_id]
    );

    if (status === "success" && !alreadySuccess) {
      const tier = tx.plan === "lite" ? "lite" : "premium";
      const endDays = tx.plan === "lite" ? 365 : 3650;
      await query(
        `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, source_order_id, created_at, updated_at)
         VALUES (?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           plan = VALUES(plan),
           status = 'active',
           start_date = NOW(),
           end_date = VALUES(end_date),
           source_order_id = VALUES(source_order_id),
           updated_at = NOW()`,
        [tx.user_id, tx.plan || "pro", endDays, order_id]
      );
      await query("UPDATE profiles SET tier = ? WHERE id = ?", [tier, tx.user_id]);
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return jsonError(error, "Webhook failed");
  }
}
