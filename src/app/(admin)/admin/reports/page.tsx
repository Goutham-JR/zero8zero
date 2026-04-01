"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getDefaultDateRange } from "@/services/api";
import {
  fetchUsers,
  fetchAdminCampaignAnalysis,
  generateReport,
} from "@/services/admin.service";
import type { AdminUser, CampaignAnalysis } from "@/types";
import {
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Hash,
} from "lucide-react";

const INPUT_CLASS =
  "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all text-sm";

export default function AdminReportsPage() {
  const user = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignAnalysis[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [reportType, setReportType] = useState<"full" | "inbound_full">("full");
  const [generating, setGenerating] = useState(false);

  // History of generated reports in this session
  const [generatedReports, setGeneratedReports] = useState<
    { reportId: string; campaignName: string; reportType: string; status: string; message: string; time: string }[]
  >([]);
  const [reportsPage, setReportsPage] = useState(1);
  const REPORTS_PAGE_SIZE = 5;

  const loadUsers = useCallback(async () => {
    if (!user?.id) return;
    setUsersLoading(true);
    try {
      const data = await fetchUsers(user.id);
      if (Array.isArray(data)) setUsers(data);
    } catch { /* silent */ } finally { setUsersLoading(false); }
  }, [user?.id]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Load campaigns when user selected
  useEffect(() => {
    if (!selectedUserId || !user?.id) {
      setCampaigns([]);
      setSelectedCampaignId("");
      return;
    }
    let cancelled = false;
    setCampaignsLoading(true);
    setCampaigns([]);
    setSelectedCampaignId("");

    const selectedUser = users.find((u) => String(u.userId) === selectedUserId);
    const username = selectedUser?.username || "";
    const { startDate, endDate } = getDefaultDateRange();

    fetchAdminCampaignAnalysis(user.id, startDate, endDate, "All", "All", username)
      .then((data) => { if (!cancelled) setCampaigns(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCampaignsLoading(false); });

    return () => { cancelled = true; };
  }, [selectedUserId, user?.id, users]);

  async function handleGenerate() {
    if (!selectedCampaignId) return;
    setGenerating(true);
    try {
      const campaign = campaigns.find((c) => c.campaignId === selectedCampaignId);
      const res = await generateReport(Number(selectedCampaignId), reportType);
      setGeneratedReports((prev) => [
        {
          reportId: res.reportId || "-",
          campaignName: campaign?.campaignName || `#${selectedCampaignId}`,
          reportType,
          status: res.reportStatus === "1" ? "Ready" : "Processing",
          message: res.message || "Report generation started.",
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
      setSelectedCampaignId("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate report.";
      setGeneratedReports((prev) => [
        {
          reportId: "-",
          campaignName: `#${selectedCampaignId}`,
          reportType,
          status: "Failed",
          message: msg,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-muted mt-1">Generate campaign reports for users</p>
      </div>

      {/* Generate Report */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Generate Report</h3>
            <p className="text-sm text-muted">Select a user and campaign to generate a report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">User</label>
            <select className={INPUT_CLASS} value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)} disabled={usersLoading}>
              <option value="">{usersLoading ? "Loading users..." : "Select a user"}</option>
              {users.map((u) => (
                <option key={u.userId} value={String(u.userId)}>
                  {u.name || u.username} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Campaign</label>
            <select className={INPUT_CLASS} value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              disabled={!selectedUserId || campaignsLoading}>
              <option value="">
                {!selectedUserId ? "Select a user first"
                  : campaignsLoading ? "Loading campaigns..."
                  : campaigns.length === 0 ? "No campaigns found"
                  : "Select a campaign"}
              </option>
              {campaigns.map((c) => (
                <option key={c.campaignId} value={c.campaignId}>
                  {c.campaignName} (#{c.campaignId}) — {c.campaignType}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Report Type</label>
            <select className={INPUT_CLASS} value={reportType}
              onChange={(e) => setReportType(e.target.value as "full" | "inbound_full")}>
              <option value="full">Full Report</option>
              <option value="inbound_full">Inbound Full Report</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={!selectedCampaignId || generating}
              className="w-full px-6 py-3 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl font-semibold hover:opacity-90 shadow-lg shadow-danger/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><FileText className="w-4 h-4" /> Generate Report</>}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Reports Log */}
      {generatedReports.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Generated Reports</h3>
            <p className="text-xs text-muted mt-0.5">Reports generated in this session. Downloads are sent to the user&apos;s reports section in their dashboard.</p>
          </div>
          <div className="divide-y divide-border">
            {generatedReports.slice((reportsPage - 1) * REPORTS_PAGE_SIZE, reportsPage * REPORTS_PAGE_SIZE).map((r, i) => {
              const isSuccess = r.status === "Processing" || r.status === "Ready";
              const isFailed = r.status === "Failed";
              return (
                <div key={i} className="px-6 py-4 hover:bg-card-hover transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isFailed ? "bg-danger/10" : "bg-success/10"
                      }`}>
                        {isFailed
                          ? <AlertCircle className="w-4 h-4 text-danger" />
                          : r.status === "Ready"
                            ? <Check className="w-4 h-4 text-success" />
                            : <Loader2 className="w-4 h-4 text-success animate-spin" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">{r.campaignName}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isFailed ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                          }`}>
                            {r.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-muted capitalize">
                            {r.reportType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                          <span>{r.time}</span>
                          {r.reportId !== "-" && (
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" /> Report ID: {r.reportId}
                            </span>
                          )}
                        </div>
                        {r.message && (
                          <p className={`text-xs mt-1 ${isFailed ? "text-danger" : "text-muted"}`}>{r.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {(() => {
            const tp = Math.ceil(generatedReports.length / REPORTS_PAGE_SIZE);
            if (tp <= 1) return null;
            return (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border">
                <p className="text-xs text-muted">Showing {(reportsPage - 1) * REPORTS_PAGE_SIZE + 1}&ndash;{Math.min(reportsPage * REPORTS_PAGE_SIZE, generatedReports.length)} of {generatedReports.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setReportsPage(1)} disabled={reportsPage === 1} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">First</button>
                  <button onClick={() => setReportsPage((p) => Math.max(1, p - 1))} disabled={reportsPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                  {(() => { const pages: (number | "dots")[] = []; const t = tp; if (t <= 7) { for (let i = 1; i <= t; i++) pages.push(i); } else { pages.push(1); if (reportsPage > 3) pages.push("dots"); for (let i = Math.max(2, reportsPage - 1); i <= Math.min(t - 1, reportsPage + 1); i++) pages.push(i); if (reportsPage < t - 2) pages.push("dots"); pages.push(t); } return pages.map((page, idx) => page === "dots" ? <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span> : <button key={page} onClick={() => setReportsPage(page)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${reportsPage === page ? "bg-gradient-to-r from-danger to-accent-warm text-white shadow-lg shadow-danger/25" : "text-muted hover:text-foreground hover:bg-surface"}`}>{page}</button>); })()}
                  <button onClick={() => setReportsPage((p) => Math.min(tp, p + 1))} disabled={reportsPage === tp} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                  <button onClick={() => setReportsPage(tp)} disabled={reportsPage === tp} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">Last</button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Info Note */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <p className="text-sm text-muted">
          Generated reports are delivered to the respective user&apos;s account. Once processing completes, users can download reports from their dashboard&apos;s Reports section.
        </p>
      </div>
    </div>
  );
}
