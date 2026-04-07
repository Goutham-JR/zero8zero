"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, CreditCard } from "lucide-react";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const profile = useAuthStore((s) => s.profile);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    encRequest: string;
    accessCode: string;
    ccavenueUrl: string;
  } | null>(null);

  const planName = searchParams.get("plan") || "";
  const amount = searchParams.get("amount") || "";
  const calls = searchParams.get("calls") || "";
  const days = searchParams.get("days") || "";
  const basePrice = searchParams.get("basePrice") || "";
  const planId = searchParams.get("planId") || "";

  useEffect(() => {
    if (!amount || !user) return;

    const orderId = `Z8Z_${user.id}_${Date.now()}`;

    fetch("/api/ccavenue/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        order_id: orderId,
        amount,
        billing_name: profile?.name || user.username,
        billing_email: user.email,
        billing_tel: "",
        billing_address: "",
        billing_city: "",
        billing_state: "",
        billing_zip: profile?.pincode ? String(profile.pincode) : "",
        billing_country: "India",
        merchant_param1: planName,
        merchant_param2: `${calls}_${days}`,
        merchant_param3: user.id,
        merchant_param4: basePrice,
        merchant_param5: planId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setPaymentData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to initiate payment. Please try again.");
        setLoading(false);
      });
  }, [amount, user, token, profile, planName, calls, days, basePrice, planId]);

  // Auto-submit form once payment data is ready
  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-danger" />
        </div>
        <p className="text-danger font-medium">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
        <CreditCard className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Redirecting to Payment</h2>
        <p className="text-muted mt-2 text-sm">
          {planName && `${planName} — `}{calls && `${Number(calls).toLocaleString("en-IN")} calls — `}₹{Number(amount).toLocaleString("en-IN")}
        </p>
      </div>
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-xs text-muted">Please wait, do not close this page...</p>

      {paymentData && (
        <form
          ref={formRef}
          method="POST"
          action={paymentData.ccavenueUrl}
          className="hidden"
        >
          <input type="hidden" name="encRequest" value={paymentData.encRequest} />
          <input type="hidden" name="access_code" value={paymentData.accessCode} />
        </form>
      )}
    </div>
  );
}
