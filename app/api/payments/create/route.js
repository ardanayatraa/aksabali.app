import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { requireLearner } from "../../../../lib/server/auth";
import { getAppUrl } from "../../../../lib/server/env";
import { jsonError, readJson } from "../../../../lib/server/http";
import { query } from "../../../../lib/server/db";

export const dynamic = "force-dynamic";

const PLAN_CONFIG = {
  lifetime: { amount: 49000, plan: "pro", tier: "premium", label: "Aksa Bali Premium Lifetime" },
  school: { amount: 150000, plan: "lite", tier: "lite", label: "Aksa Bali School Lite" }
};

export async function POST(request) {
  try {
    const user = await requireLearner();
    const body = await readJson(request);
    const planKey = body.plan || "lifetime";
    const planInfo = PLAN_CONFIG[planKey];
    if (!planInfo) {
      return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi" }, { status: 503 });
    }

    const isProduction = String(process.env.MIDTRANS_IS_PRODUCTION || "true") === "true";
    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";
    const orderId = `${planKey.toUpperCase()}-${String(user.id).slice(0, 8)}-${Date.now()}`;

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: planInfo.amount
      },
      customer_details: {
        email: user.email,
        first_name: user.display_name || user.email.split("@")[0]
      },
      item_details: [
        {
          id: `${planKey}-upgrade`,
          price: planInfo.amount,
          quantity: 1,
          name: planInfo.label
        }
      ],
      callbacks: {
        finish: `${getAppUrl()}/dashboard?payment=success`
      }
    };

    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`
      },
      body: JSON.stringify(payload)
    });

    const midtransData = await midtransResponse.json();
    if (!midtransResponse.ok) {
      return NextResponse.json(
        {
          error: midtransData?.error_messages?.join(", ") || "Failed to create Midtrans transaction",
          details: midtransData
        },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO payment_transactions (user_id, order_id, amount, plan, status, midtrans_response, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?, NOW(), NOW())`,
      [user.id, orderId, planInfo.amount, planInfo.plan, JSON.stringify(midtransData)]
    );

    return NextResponse.json({ data: midtransData });
  } catch (error) {
    return jsonError(error, "Payment creation failed");
  }
}
