"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchAllCreditHistory } from "@/services/admin.service";
import { getDefaultDateRange } from "@/services/api";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Loader2,
  RefreshCw,
  Inbox,
} from "lucide-react";
import type { CreditHistoryEntry } from "@/types";

export default function AdminCreditHistoryPage() {
  const user = useAuthStore((s) => s.user);

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCreditHistory(user.id, startDate, endDate);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credit history");
    } finally {
      setLoading(false);
    }
  }, [user?.id, startDate, endDate]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const totalAdded = history
    .filter((e) => e.action === "addition")
    .reduce((sum, e) => sum + e.credits, 0);

  const totalDeducted = history
    .filter((e) => e.action === "deduction" || e.action === "campaign_deduction")
    .reduce((sum, e) => sum + e.credits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Credit History</h2>
        <p className="text-muted mt-1">View all credit transactions across users</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalAdded.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted">Total Credits Added</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalDeducted.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted">Total Credits Deducted</p>
          </div>
        </div>
      </div>

      {/* Date Filter + Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">{history.length}</span> transaction{history.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-danger/40 focus:border-danger transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-danger/40 focus:border-danger transition-colors" />
            </div>
            <button onClick={loadHistory} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-danger/25 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Filter
            </button>
            <button onClick={loadHistory} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-foreground rounded-xl text-sm font-medium hover:bg-card-hover transition-colors disabled:opacity-60">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="w-8 h-8 text-danger animate-spin" />
              <p className="text-sm text-muted">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
              <p className="text-sm text-danger font-medium">{error}</p>
              <button onClick={loadHistory} className="text-sm text-primary font-medium hover:underline">Try again</button>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Inbox className="w-10 h-10 text-muted/40" />
              <p className="text-sm text-muted">No credit transactions found for this period</p>
            </div>
          ) : (
            history.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((e, i) => {
              const isAdd = e.action === "addition";
              const isCampaign = e.action === "campaign_deduction";
              const actionColor = isAdd ? "text-success" : "text-danger";
              const actionBg = isAdd ? "bg-success/10" : isCampaign ? "bg-accent-warm/10" : "bg-danger/10";
              const badgeClass = isAdd ? "bg-success/10 text-success" : isCampaign ? "bg-accent-warm/10 text-accent-warm" : "bg-danger/10 text-danger";
              const actionLabel = isAdd ? "Addition" : isCampaign ? "Campaign" : "Deduction";

              return (
                <div key={`${e.reqDate}-${e.userId}-${i}`} className="px-6 py-3.5 hover:bg-card-hover transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl ${actionBg} flex items-center justify-center shrink-0`}>
                        {isAdd ? <TrendingUp className="w-4 h-4 text-success" /> :
                         isCampaign ? <TrendingDown className="w-4 h-4 text-accent-warm" /> :
                         <TrendingDown className="w-4 h-4 text-danger" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {e.fromUsername && e.toUsername ? (
                            <span className="text-sm text-foreground">
                              <span className="font-medium">{e.fromUsername}</span>
                              <span className="text-muted mx-1.5">&rarr;</span>
                              <span className="font-medium">{e.toUsername}</span>
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-foreground">
                              {e.actionOn || `User #${e.userId}`}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${badgeClass}`}>
                            {actionLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted flex-wrap">
                          <span>{new Date(e.reqDate).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {isCampaign && e.campaignName && (
                            <span className="truncate max-w-[200px]" title={e.campaignName}>Campaign: {e.campaignName}</span>
                          )}
                          {e.actionOn && <span>on: {e.actionOn}</span>}
                          <span>Bal: {(e.userBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums shrink-0 ${actionColor}`}>
                      {isAdd ? "+" : "-"}{e.credits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {(() => {
          const tp = Math.ceil(history.length / PAGE_SIZE);
          if (tp <= 1) return null;
          return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border">
              <p className="text-xs text-muted">Showing {(currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, history.length)} of {history.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">First</button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                {(() => { const pages: (number | "dots")[] = []; if (tp <= 7) { for (let i = 1; i <= tp; i++) pages.push(i); } else { pages.push(1); if (currentPage > 3) pages.push("dots"); for (let i = Math.max(2, currentPage - 1); i <= Math.min(tp - 1, currentPage + 1); i++) pages.push(i); if (currentPage < tp - 2) pages.push("dots"); pages.push(tp); } return pages.map((page, idx) => page === "dots" ? <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span> : <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${currentPage === page ? "bg-gradient-to-r from-danger to-accent-warm text-white shadow-lg shadow-danger/25" : "text-muted hover:text-foreground hover:bg-surface"}`}>{page}</button>); })()}
                <button onClick={() => setCurrentPage((p) => Math.min(tp, p + 1))} disabled={currentPage === tp} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                <button onClick={() => setCurrentPage(tp)} disabled={currentPage === tp} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">Last</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
