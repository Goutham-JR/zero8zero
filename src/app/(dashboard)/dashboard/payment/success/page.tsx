"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Receipt, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();

  const orderId = params.get("order_id") || "";
  const trackingId = params.get("tracking_id") || "";
  const amount = params.get("amount") || "";
  const planName = params.get("plan") || "";
  const calls = params.get("calls") || "";
  const days = params.get("days") || "";
  const planId = params.get("planId") || "";

  return (
    <div className="max-w-lg mx-auto py-16 space-y-8">
      {/* Success Icon */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
        <p className="text-muted text-sm">
          Your plan has been activated. Credits will be added to your account shortly.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Order Details</h3>
        </div>

        <div className="space-y-3">
          {planName && (
            <DetailRow label="Plan" value={planName} />
          )}
          {planId && (
            <DetailRow label="Plan ID" value={planId} mono />
          )}
          {amount && (
            <DetailRow label="Amount Paid" value={`₹${Number(amount).toLocaleString("en-IN")}`} highlight />
          )}
          {calls && (
            <DetailRow label="Calls Included" value={`${Number(calls).toLocaleString("en-IN")} calls`} />
          )}
          {days && (
            <DetailRow label="Validity" value={`${days} days`} />
          )}
          {orderId && (
            <DetailRow label="Order ID" value={orderId} mono />
          )}
          {trackingId && (
            <DetailRow label="Tracking ID" value={trackingId} mono />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard/credits"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl font-semibold text-foreground hover:bg-card-hover transition-colors"
        >
          View Credits
        </Link>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-success" : "text-foreground"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
