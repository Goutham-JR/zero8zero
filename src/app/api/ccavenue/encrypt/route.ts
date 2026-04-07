import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/ccavenue";
import { addPendingOrder } from "@/lib/order-store";

const OBD_API = "https://obd3api.expressivr.com";

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();

    const {
      order_id,
      amount,
      currency = "INR",
      billing_name,
      billing_email,
      billing_tel,
      billing_address,
      billing_city,
      billing_state,
      billing_zip,
      billing_country = "India",
      // Custom params to track plan info
      merchant_param1, // plan name
      merchant_param2, // calls_days
      merchant_param3, // userId
      merchant_param4, // basePrice (without GST)
      merchant_param5, // planId
    } = body;

    // Validate token by fetching the user's profile
    if (!merchant_param3) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    const verifyRes = await fetch(`${OBD_API}/api/obd/user/profile/${merchant_param3}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (verifyRes.status === 401) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const merchantId = process.env.CCAVENUE_MERCHANT_ID!;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const redirectUrl = `${baseUrl}/api/ccavenue/response`;
    const cancelUrl = `${baseUrl}/api/ccavenue/response`;

    const params = [
      `merchant_id=${merchantId}`,
      `order_id=${order_id}`,
      `currency=${currency}`,
      `amount=${amount}`,
      `redirect_url=${redirectUrl}`,
      `cancel_url=${cancelUrl}`,
      `language=EN`,
      `billing_name=${billing_name || ""}`,
      `billing_address=${billing_address || ""}`,
      `billing_city=${billing_city || ""}`,
      `billing_state=${billing_state || ""}`,
      `billing_zip=${billing_zip || ""}`,
      `billing_country=${billing_country}`,
      `billing_tel=${billing_tel || ""}`,
      `billing_email=${billing_email || ""}`,
      `merchant_param1=${merchant_param1 || ""}`,
      `merchant_param2=${merchant_param2 || ""}`,
      `merchant_param3=${merchant_param3 || ""}`,
      `merchant_param4=${merchant_param4 || ""}`,
      `merchant_param5=${merchant_param5 || ""}`,
    ].join("&");

    addPendingOrder(order_id);

    const encRequest = encrypt(params);
    const accessCode = process.env.CCAVENUE_ACCESS_CODE!;
    const ccavenueUrl = `${process.env.CCAVENUE_URL}/transaction/transaction.do?command=initiateTransaction`;

    return NextResponse.json({
      encRequest,
      accessCode,
      ccavenueUrl,
    });
  } catch (error) {
    console.error("CCAvenue encrypt error:", error);
    return NextResponse.json(
      { error: "Failed to encrypt payment data" },
      { status: 500 }
    );
  }
}
