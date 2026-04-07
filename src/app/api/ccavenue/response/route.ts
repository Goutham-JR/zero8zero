import { NextRequest } from "next/server";
import { decrypt } from "@/lib/ccavenue";
import { logToSheet } from "@/lib/google-sheet";

const OBD_API = "https://obd3api.expressivr.com";
const RESELLER_USERNAME = process.env.RESELLER_USERNAME!;
const RESELLER_PASSWORD = process.env.RESELLER_PASSWORD!;
const RESELLER_USERID = process.env.RESELLER_USERID!;

async function getResellerToken(): Promise<string | null> {
  try {
    const loginRes = await fetch(`${OBD_API}/api/obd/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: RESELLER_USERNAME, password: RESELLER_PASSWORD }),
    });
    const loginData = await loginRes.json();
    return loginData?.token || null;
  } catch (err) {
    console.error("Failed to get reseller token:", err);
    return null;
  }
}

async function getUserProfile(token: string, userId: string) {
  const res = await fetch(`${OBD_API}/api/obd/user/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function addCredits(token: string, userId: string, credits: string) {
  const payload = { userId: Number(userId), parent: RESELLER_USERID.trim(), credits: String(credits) };
  console.log("[Credits] Add request:", JSON.stringify(payload));
  const res = await fetch(`${OBD_API}/api/obd/credits/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("[Credits] Add response:", res.status, JSON.stringify(data));
  return res.ok;
}

async function removeCredits(token: string, userId: string, credits: string) {
  const payload = { userId: Number(userId), parent: RESELLER_USERID.trim(), credits: String(credits) };
  console.log("[Credits] Remove request:", JSON.stringify(payload));
  const res = await fetch(`${OBD_API}/api/obd/credits/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("[Credits] Remove response:", res.status, JSON.stringify(data));
  return res.ok;
}

function calculateExpiryDate(days: number): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  const yyyy = expiry.getFullYear();
  const mm = String(expiry.getMonth() + 1).padStart(2, "0");
  const dd = String(expiry.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 23:59:59`;
}

async function updateUserPlan(token: string, profile: Record<string, unknown>, newPlanId: string, expiryDate: string) {
  const res = await fetch(`${OBD_API}/api/obd/user/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      userId: profile.userId,
      username: profile.username,
      password: profile.username,
      parent: RESELLER_USERID,
      name: profile.name || "NA",
      emailid: profile.emailid || profile.email || "NA",
      number: profile.number || "NA",
      company: profile.company || "NA",
      address: profile.address || "NA",
      pincode: profile.pincode || "000000",
      planId: newPlanId,
      accountType: String(profile.accountType ?? "0"),
      expiryDate,
      userType: "user",
      groupRows: JSON.stringify({ groupsList: [{ groupId: "34", groupName: "BLR_ALL" }] }),
      locationRows: JSON.stringify({ locationsList: [{ locationId: "3", locationName: "Bangalore" }] }),
      moduleId: "1",
      planType: "0",
    }),
  });
  const data = await res.json();
  console.log("User plan updated:", data);
  return res.ok;
}

async function processCreditsAndPlan(userId: string, newCredits: string, newPlanId: string, days: number): Promise<boolean> {
  try {
    const token = await getResellerToken();
    if (!token) return false;

    const profile = await getUserProfile(token, userId);
    const currentPlanId = String(profile.planId || "");
    const availableCredits = Number(profile.credits || 0);
    const newExpiryDate = calculateExpiryDate(days);

    console.log(`[Credits] User ${userId}: currentPlanId="${currentPlanId}" (type:${typeof currentPlanId}), newPlanId="${newPlanId}" (type:${typeof newPlanId}), availableCredits=${availableCredits}, newExpiry=${newExpiryDate}`);
    console.log(`[Credits] Same plan? ${currentPlanId === newPlanId} | trimmed match? ${currentPlanId.trim() === newPlanId.trim()}`);

    if (currentPlanId.trim() === newPlanId.trim()) {
      // Same plan — add credits and extend expiry from now
      console.log(`[Credits] Same plan ${newPlanId}, adding ${newCredits} credits, extending expiry by ${days} days`);
      const added = await addCredits(token, userId, newCredits);

      console.log(`[Credits] Updating expiry to ${newExpiryDate}...`);
      await updateUserPlan(token, profile, newPlanId, newExpiryDate);

      return added;
    } else {
      // Different plan — remove existing credits, update plan, then add new credits
      console.log(`[Credits] Different plan: ${currentPlanId} -> ${newPlanId}`);

      if (availableCredits > 0) {
        console.log(`[Credits] Removing ${availableCredits} credits...`);
        const removed = await removeCredits(token, userId, String(availableCredits));
        console.log(`[Credits] Remove result: ${removed}`);
      } else {
        console.log(`[Credits] No credits to remove (balance: ${availableCredits})`);
      }

      console.log(`[Credits] Updating plan to ${newPlanId}, expiry to ${newExpiryDate}...`);
      const updated = await updateUserPlan(token, profile, newPlanId, newExpiryDate);
      console.log(`[Credits] Plan update result: ${updated}`);

      console.log(`[Credits] Adding ${newCredits} credits...`);
      const added = await addCredits(token, userId, newCredits);
      console.log(`[Credits] Add result: ${added}`);

      return added;
    }
  } catch (err) {
    console.error("Failed to process credits and plan:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse body as text first, then extract encResp — more reliable than formData()
    const body = await req.text();
    const bodyParams = new URLSearchParams(body);
    const encResp = bodyParams.get("encResp")?.trim();

    if (!encResp) {
      console.error("CCAvenue response: encResp is missing. Body:", body.substring(0, 200));
      return redirectTo("/dashboard/payment/failure?error=no_response");
    }

    const decrypted = decrypt(encResp);

    // Parse the response string into key-value pairs
    const params: Record<string, string> = {};
    decrypted.split("&").forEach((pair) => {
      const [key, ...valueParts] = pair.split("=");
      if (key) params[key.trim()] = valueParts.join("=");
    });

    const orderStatus = params.order_status;
    const orderId = params.order_id || "";
    const trackingId = params.tracking_id || "";
    const amount = params.amount || "";
    const planName = params.merchant_param1 || "";
    const callsDays = params.merchant_param2 || "";
    const [calls, days] = callsDays.split("_");
    const userId = params.merchant_param3 || "";
    const basePrice = params.merchant_param4 || "";
    const planId = params.merchant_param5 || "";
    const statusMessage = params.status_message || "";

    console.log("[Payment] Parsed params:", { orderStatus, userId, basePrice, planId, calls, days, amount });

    // Verify this order was initiated by our system (order IDs are formatted as Z8Z_{userId}_{timestamp})
    if (!orderId.startsWith("Z8Z_")) {
      console.error("[Payment] Invalid order_id format:", orderId);
      return redirectTo("/dashboard/payment/failure?error=invalid_order");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    if (orderStatus === "Success") {
      // Process credits: same plan = add credits, different plan = reset credits + change plan
      const planDays = Number(days) || 28;
      const expiryDate = calculateExpiryDate(planDays);

      if (userId && basePrice && planId) {
        console.log(`[Payment] Processing credits for user ${userId}: basePrice=${basePrice}, planId=${planId}, days=${planDays}`);
        await processCreditsAndPlan(userId, basePrice, planId, planDays);
      } else {
        console.error("[Payment] Missing data, skipping credit processing:", { userId, basePrice, planId });
      }

      // Log payment to Google Sheet
      await logToSheet({
        _sheet: "Payments",
        orderId,
        trackingId,
        userId,
        planName,
        planId,
        amount,
        basePrice,
        calls: calls || "",
        days: days || "",
        expiryDate,
        status: "Success",
      });

      const successParams = new URLSearchParams({
        order_id: orderId,
        tracking_id: trackingId,
        amount,
        plan: planName,
        calls: calls || "",
        days: days || "",
        planId: planId || "",
      });
      return Response.redirect(
        `${baseUrl}/dashboard/payment/success?${successParams.toString()}`,
        303
      );
    } else {
      // Log failed payment to Google Sheet
      await logToSheet({
        _sheet: "Payments",
        orderId,
        trackingId,
        userId,
        planName,
        planId,
        amount,
        basePrice,
        calls: calls || "",
        days: days || "",
        expiryDate: "",
        status: orderStatus || "Failed",
      });

      const failParams = new URLSearchParams({
        order_id: orderId,
        status: orderStatus || "Failed",
        message: statusMessage,
      });
      return Response.redirect(
        `${baseUrl}/dashboard/payment/failure?${failParams.toString()}`,
        303
      );
    }
  } catch (error) {
    console.error("CCAvenue response error:", error instanceof Error ? error.message : error);
    console.error("CCAvenue response stack:", error instanceof Error ? error.stack : "no stack");
    return redirectTo("/dashboard/payment/failure?error=decrypt_failed");
  }
}

function redirectTo(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  return Response.redirect(`${baseUrl}${path}`, 303);
}
