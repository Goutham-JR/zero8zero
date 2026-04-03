import { NextRequest } from "next/server";
import { decrypt } from "@/lib/ccavenue";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const encResp = formData.get("encResp") as string;

    if (!encResp) {
      return redirectTo("/dashboard/payment/failure?error=no_response");
    }

    const decrypted = decrypt(encResp);

    // Parse the response string into key-value pairs
    const params: Record<string, string> = {};
    decrypted.split("&").forEach((pair) => {
      const [key, ...valueParts] = pair.split("=");
      if (key) params[key] = valueParts.join("=");
    });

    const orderStatus = params.order_status;
    const orderId = params.order_id || "";
    const trackingId = params.tracking_id || "";
    const amount = params.amount || "";
    const planName = params.merchant_param1 || "";
    const calls = params.merchant_param2 || "";
    const days = params.merchant_param3 || "";
    const statusMessage = params.status_message || "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    if (orderStatus === "Success") {
      const successParams = new URLSearchParams({
        order_id: orderId,
        tracking_id: trackingId,
        amount,
        plan: planName,
        calls,
        days,
      });
      return Response.redirect(
        `${baseUrl}/dashboard/payment/success?${successParams.toString()}`,
        303
      );
    } else {
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
    console.error("CCAvenue response error:", error);
    return redirectTo("/dashboard/payment/failure?error=decrypt_failed");
  }
}

function redirectTo(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  return Response.redirect(`${baseUrl}${path}`, 303);
}
