"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
      <FailureContent />
    </Suspense>
  );
}

function FailureContent() {
  const params = useSearchParams();

  const orderId = params.get("order_id") || "";
  const status = params.get("status") || "Failed";
  const message = params.get("message") || "";
  const error = params.get("error") || "";

  const displayMessage =
    message || error || "Your payment could not be processed. Please try again.";

  return (
    <div className="max-w-lg mx-auto py-16 space-y-8">
      {/* Failure Icon */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-danger" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Payment {status}</h2>
        <p className="text-muted text-sm max-w-sm">{displayMessage}</p>
      </div>

      {/* Order Info */}
      {orderId && (
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-xs text-muted">Order ID</p>
          <p className="text-sm font-mono font-medium text-foreground mt-1">{orderId}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/plans"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl font-semibold text-foreground hover:bg-card-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
