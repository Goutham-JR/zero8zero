"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchCreditHistory } from "@/services/user.service";
import { getUserId, getDefaultDateRange } from "@/services/api";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Loader2,
  Search,
  Inbox,
} from "lucide-react";
import type { CreditHistoryEntry } from "@/types";
import { Pagination } from "@/components/pagination";

export default function CreditsPage() {
  const profile = useAuthStore((s) => s.profile);

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditsPage, setCreditsPage] = useState(1);
  const CREDITS_PAGE_SIZE = 5;

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      const data = await fetchCreditHistory(userId, startDate, endDate);
      setHistory(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credit history");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const totalAdded = history
    .filter((e) => e.action === "addition" || e.flag === 1)
    .reduce((sum, e) => sum + e.credits, 0);

  const totalDeducted = history
    .filter((e) => e.action !== "addition" && e.flag !== 1)
    .reduce((sum, e) => sum + e.credits, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Credits & Billing</h2>
        <p className="text-muted mt-1">Manage your credit balance and view transaction history</p>
      </div>

      {/* Balance Card */}
      <div className="gradient-bg rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Available Balance</p>
              <p className="text-3xl font-bold tracking-tight">
                {profile?.credits?.toLocaleString("en-IN") ?? "0"} Credits
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/70">Channels:</span>
              <span className="text-sm font-semibold">{profile?.channels ?? "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/70">Expires:</span>
              <span className="text-sm font-semibold">
                {profile?.expiryDate
                  ? new Date(profile.expiryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/70">Used:</span>
              <span className="text-sm font-semibold">
                {profile?.creditsUsed?.toLocaleString("en-IN") ?? "0"} Credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-card rounded-2xl border border-border hover:border-success/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-muted">From filtered period</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalAdded.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-muted mt-0.5">Total Credits Added</p>
        </div>

        <div className="p-5 bg-card rounded-2xl border border-border hover:border-danger/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs text-muted">Lifetime</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(profile?.creditsUsed ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-muted mt-0.5">Total Credits Used</p>
        </div>
      </div>

      {/* Date Filter & Transaction Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Transaction History</h3>
            <p className="text-sm text-muted mt-0.5">
              {history.length} transaction{history.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border bg-surface text-muted">
                <th className="px-6 py-3 font-medium text-left">Date</th>
                <th className="px-6 py-3 font-medium text-left">Action</th>
                <th className="px-6 py-3 font-medium text-left">Campaign</th>
                <th className="px-6 py-3 font-medium text-left">Type</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-left hide-mobile">User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-danger" />
                      </div>
                      <p className="text-sm text-danger font-medium">{error}</p>
                      <button
                        onClick={loadHistory}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center">
                        <Inbox className="w-6 h-6 text-muted" />
                      </div>
                      <p className="text-sm text-muted">No transactions found for this period</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.slice((creditsPage - 1) * CREDITS_PAGE_SIZE, creditsPage * CREDITS_PAGE_SIZE).map((entry, idx) => {
                  const isAddition = entry.action === "addition" || entry.flag === 1;
                  const actionLabel = entry.action
                    ? entry.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "—";
                  return (
                    <tr
                      key={`${entry.reqDate}-${entry.userId}-${idx}`}
                      className="border-t border-border hover:bg-card-hover transition-colors"
                    >
                      <td className="px-6 py-4 text-muted whitespace-nowrap">
                        {new Date(entry.reqDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <span className="block text-xs text-muted/60">
                          {new Date(entry.reqDate).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{actionLabel}</span>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {entry.campaignName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isAddition
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-danger/10 text-danger border-danger/20"
                          }`}
                        >
                          {isAddition ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isAddition ? "Addition" : "Deduction"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold tabular-nums ${
                          isAddition ? "text-success" : "text-danger"
                        }`}
                      >
                        {isAddition ? "+" : "-"}
                        {entry.credits.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-muted hide-mobile">
                        {entry.actionOn || entry.fromUsername || entry.toUsername || entry.username || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination currentPage={creditsPage} totalPages={Math.ceil(history.length / CREDITS_PAGE_SIZE)} totalItems={history.length} pageSize={CREDITS_PAGE_SIZE} onPageChange={setCreditsPage} />
      </div>
    </div>
  );
}
