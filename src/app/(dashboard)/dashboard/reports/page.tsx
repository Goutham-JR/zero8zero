"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getUserId, getDefaultDateRange } from "@/services/api";
import {
  fetchCampaignAnalysis,
  fetchHistoricalCampaigns,
} from "@/services/campaign.service";
import { apiGet, apiPost } from "@/services/api";
import type { CampaignAnalysis, ReportItem } from "@/types";
import {
  FileText,
  Download,
  Loader2,
  Inbox,
  Check,
  AlertCircle,
  Hash,
  RefreshCw,
  Clock,
  Search,
  ChevronDown,
  X as XIcon,
} from "lucide-react";

const INPUT_CLASS =
  "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

const statusMap: Record<string, { label: string; style: string }> = {
  "0": { label: "Processing", style: "bg-accent-warm/10 text-accent-warm" },
  "1": { label: "Processing", style: "bg-accent-warm/10 text-accent-warm" },
  "2": { label: "Ready", style: "bg-success/10 text-success" },
  "3": { label: "Failed", style: "bg-danger/10 text-danger" },
};

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = getUserId();

  // Reports list
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsPage, setReportsPage] = useState(1);
  const REPORTS_PAGE_SIZE = 5;

  // Campaign selection for generating
  const [campaigns, setCampaigns] = useState<CampaignAnalysis[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [reportType, setReportType] = useState<"full" | "inbound_full">("full");
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Searchable campaign dropdown
  const [campaignSearch, setCampaignSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCampaigns = campaigns.filter((c) => {
    const q = campaignSearch.toLowerCase();
    return (
      c.campaignName.toLowerCase().includes(q) ||
      c.campaignId.toString().includes(q)
    );
  });

  const selectedCampaign = campaigns.find((c) => c.campaignId === selectedCampaignId);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadReports = useCallback(async () => {
    if (!userId) return;
    setReportsLoading(true);
    try {
      const data = await apiGet<ReportItem[]>(`/api/obd/report/download/${userId}`);
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(b.reqDate).getTime() - new Date(a.reqDate).getTime());
      setReports(list);
    } catch {
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, [userId]);

  const loadCampaigns = useCallback(async () => {
    if (!userId) return;
    setCampaignsLoading(true);
    try {
      const { startDate, endDate } = getDefaultDateRange();
      const data = await fetchCampaignAnalysis(userId, startDate, endDate);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReports();
    loadCampaigns();
  }, [loadReports, loadCampaigns]);

  async function handleGenerate() {
    if (!selectedCampaignId) return;
    setGenerating(true);
    setGenMessage(null);
    try {
      const res = await apiPost<{ reportStatus: string; message: string; reportId?: string }>(
        "/api/obd/report/generate",
        { campaignId: Number(selectedCampaignId), reportType }
      );
      const campaign = campaigns.find((c) => c.campaignId === selectedCampaignId);
      setGenMessage({
        type: "success",
        text: `Report ${res.reportId ? `#${res.reportId} ` : ""}requested for "${campaign?.campaignName || selectedCampaignId}". ${res.message || "It will appear below once ready."}`,
      });
      setSelectedCampaignId("");
      // Refresh the list after a short delay to pick up the new report
      setTimeout(() => loadReports(), 3000);
    } catch (err: unknown) {
      setGenMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to generate report.",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports</h2>
          <p className="text-muted mt-1">Generate and download campaign reports</p>
        </div>
        <button
          onClick={loadReports}
          disabled={reportsLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card-hover transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reportsLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Generate Report */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Generate Report</h3>
            <p className="text-sm text-muted">Select a campaign and report type</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Campaign — searchable dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Campaign</label>
            <div className="relative" ref={dropdownRef}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => { if (!campaignsLoading) setDropdownOpen(!dropdownOpen); }}
                disabled={campaignsLoading}
                className={`${INPUT_CLASS} text-left flex items-center justify-between gap-2 cursor-pointer`}
              >
                <span className={`truncate ${selectedCampaign ? "text-foreground" : "text-muted"}`}>
                  {campaignsLoading
                    ? "Loading campaigns..."
                    : selectedCampaign
                    ? `${selectedCampaign.campaignName} (#${selectedCampaign.campaignId})`
                    : campaigns.length === 0
                    ? "No campaigns found"
                    : "Select a campaign"}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {selectedCampaign && (
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedCampaignId(""); setCampaignSearch(""); }}
                      className="p-0.5 hover:bg-surface rounded"
                    >
                      <XIcon className="w-3.5 h-3.5 text-muted" />
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  {/* Search input */}
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                    <Search className="w-4 h-4 text-muted shrink-0" />
                    <input
                      type="text"
                      value={campaignSearch}
                      onChange={(e) => setCampaignSearch(e.target.value)}
                      placeholder="Search by name or ID..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
                      autoFocus
                    />
                    {campaignSearch && (
                      <button onClick={() => setCampaignSearch("")} className="p-0.5 hover:bg-surface rounded shrink-0">
                        <XIcon className="w-3.5 h-3.5 text-muted" />
                      </button>
                    )}
                  </div>
                  {/* Options */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCampaigns.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted">No campaigns match your search</div>
                    ) : (
                      filteredCampaigns.map((c) => (
                        <button
                          key={c.campaignId}
                          type="button"
                          onClick={() => {
                            setSelectedCampaignId(c.campaignId);
                            setDropdownOpen(false);
                            setCampaignSearch("");
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-card-hover transition-colors flex items-center justify-between gap-2 ${
                            c.campaignId === selectedCampaignId ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                          }`}
                        >
                          <span className="truncate">{c.campaignName}</span>
                          <span className="text-xs text-muted shrink-0">#{c.campaignId}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Report Type</label>
            <select
              className={INPUT_CLASS}
              value={reportType}
              onChange={(e) => setReportType(e.target.value as "full" | "inbound_full")}
            >
              <option value="full">Full Report</option>
              <option value="inbound_full">Inbound Full Report</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedCampaignId || generating}
              className="w-full px-6 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generation message */}
        {genMessage && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
              genMessage.type === "success"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-danger/10 text-danger border border-danger/20"
            }`}
          >
            {genMessage.type === "success" ? (
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            {genMessage.text}
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Your Reports</h3>
          <p className="text-xs text-muted mt-0.5">
            Download reports once they are ready
          </p>
        </div>

        {reportsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Inbox className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No reports yet</p>
            <p className="text-xs mt-1">Generate a report above to get started</p>
          </div>
        ) : (
          <>
          <div className="divide-y divide-border">
            {reports.slice((reportsPage - 1) * REPORTS_PAGE_SIZE, reportsPage * REPORTS_PAGE_SIZE).map((r, i) => {
              const st = statusMap[String(r.status)] || { label: `Status ${r.status}`, style: "bg-surface text-muted" };
              const isReady = String(r.status) === "2" && r.reportUrl && r.reportUrl !== "no_data";
              const isProcessing = String(r.status) === "0" || String(r.status) === "1";
              return (
                <div key={i} className="px-6 py-4 hover:bg-card-hover transition-colors">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">
                            {r.campaignName || `Campaign #${r.campaignId}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${st.style}`}>
                            {isReady ? "Ready" : st.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-muted capitalize">
                            {(r.reportType || "full").replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Campaign {r.campaignId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {r.reqDate ? new Date(r.reqDate).toLocaleString("en-IN") : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isReady && (
                      <a
                        href={r.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/20 rounded-xl text-sm font-medium hover:bg-success/20 transition-all shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                    {isProcessing && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-accent-warm/10 text-accent-warm border border-accent-warm/20 rounded-xl text-sm font-medium shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing
                      </span>
                    )}
                    {String(r.status) === "2" && r.reportUrl === "no_data" && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-muted/10 text-muted border border-border rounded-xl text-sm font-medium shrink-0">
                        No data
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {(() => {
            const tp = Math.ceil(reports.length / REPORTS_PAGE_SIZE);
            if (tp <= 1) return null;
            return (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border">
                <p className="text-xs text-muted">Showing {(reportsPage - 1) * REPORTS_PAGE_SIZE + 1}&ndash;{Math.min(reportsPage * REPORTS_PAGE_SIZE, reports.length)} of {reports.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setReportsPage(1)} disabled={reportsPage === 1} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">First</button>
                  <button onClick={() => setReportsPage((p) => Math.max(1, p - 1))} disabled={reportsPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                  {(() => { const pages: (number | "dots")[] = []; if (tp <= 7) { for (let i = 1; i <= tp; i++) pages.push(i); } else { pages.push(1); if (reportsPage > 3) pages.push("dots"); for (let i = Math.max(2, reportsPage - 1); i <= Math.min(tp - 1, reportsPage + 1); i++) pages.push(i); if (reportsPage < tp - 2) pages.push("dots"); pages.push(tp); } return pages.map((page, idx) => page === "dots" ? <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span> : <button key={page} onClick={() => setReportsPage(page)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${reportsPage === page ? "gradient-bg text-white shadow-lg shadow-primary/25" : "text-muted hover:text-foreground hover:bg-surface"}`}>{page}</button>); })()}
                  <button onClick={() => setReportsPage((p) => Math.min(tp, p + 1))} disabled={reportsPage === tp} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                  <button onClick={() => setReportsPage(tp)} disabled={reportsPage === tp} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">Last</button>
                </div>
              </div>
            );
          })()}
          </>
        )}
      </div>
    </div>
  );
}
