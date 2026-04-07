"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Megaphone,
  BarChart3,
  Calendar,
  Search,
  Loader2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Pagination } from "@/components/pagination";
import { getDefaultDateRange } from "@/services/api";
import { fetchAdminCampaignAnalysis } from "@/services/admin.service";
import type { CampaignAnalysis } from "@/types";

const campaignTypeOptions = [
  { label: "All", value: "All" },
  { label: "Simple IVR", value: "basic" },
  { label: "Input IVR", value: "interactive" },
  { label: "Call Patch", value: "callpatch" },
] as const;

const typeDisplayMap: Record<string, string> = {
  basic: "Simple IVR",
  interactive: "Input IVR",
  callpatch: "Call Patch",
};

const typeBadgeStyles: Record<string, string> = {
  basic: "bg-primary/10 text-primary",
  interactive: "bg-secondary/10 text-secondary",
  callpatch: "bg-accent/10 text-accent",
};

export default function AdminCampaignsPage() {
  const user = useAuthStore((s) => s.user);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [campaignType, setCampaignType] = useState("All");
  const [username, setUsername] = useState("");

  const [data, setData] = useState<CampaignAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Initialize date range
  useEffect(() => {
    const { startDate: s, endDate: e } = getDefaultDateRange();
    setStartDate(s);
    setEndDate(e);
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.id || !startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminCampaignAnalysis(
        user.id,
        startDate,
        endDate,
        campaignType,
        "All",
        username
      );
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign analysis");
    } finally {
      setLoading(false);
    }
  }, [user?.id, startDate, endDate, campaignType, username]);

  // Load on mount once dates are set
  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadData();
  };

  // Compute totals
  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => ({
        answered: acc.answered + row.answered,
        nonAnswered: acc.nonAnswered + row.nonAnswered,
        dtmf: acc.dtmf + row.dtmf,
        expenditure: acc.expenditure + row.expenditure,
      }),
      { answered: 0, nonAnswered: 0, dtmf: 0, expenditure: 0 }
    );
  }, [data]);

  const inputClass =
    "px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Overview</h2>
        <p className="text-muted mt-0.5">Analyze campaign performance across all users</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <BarChart3 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Campaign Type
            </label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className={inputClass}
            >
              {campaignTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Search className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Filter by username"
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-danger/25 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Campaign Analysis Table */}
      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-danger animate-spin" />
          <p className="text-sm text-muted">Loading campaign analysis...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
            <Inbox className="w-6 h-6 text-muted" />
          </div>
          <p className="text-sm text-muted text-center max-w-sm">
            No campaign analysis data found for the selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-muted">
                  <th className="px-6 py-3.5 font-medium text-left">Campaign Name</th>
                  <th className="px-6 py-3.5 font-medium text-left">Type</th>
                  <th className="px-6 py-3.5 font-medium text-left">Username</th>
                  <th className="px-6 py-3.5 font-medium text-right">Answered</th>
                  <th className="px-6 py-3.5 font-medium text-right">Non-Answered</th>
                  <th className="px-6 py-3.5 font-medium text-right">DTMF</th>
                  <th className="px-6 py-3.5 font-medium text-right">Expenditure</th>
                </tr>
              </thead>
              <tbody>
                {data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((row) => {
                  const typeKey = row.campaignType?.toLowerCase() ?? "";
                  const displayType = typeDisplayMap[typeKey] || row.campaignType;
                  const badgeStyle = typeBadgeStyles[typeKey] || "bg-muted/10 text-muted";

                  return (
                    <tr
                      key={row.campaignId}
                      className="border-t border-border hover:bg-card-hover transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{row.campaignName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${badgeStyle}`}
                        >
                          {displayType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{row.username}</td>
                      <td className="px-6 py-4 text-right text-success font-medium">
                        {row.answered.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-danger font-medium">
                        {row.nonAnswered.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-foreground font-medium">
                        {row.dtmf.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-accent-warm font-semibold">
                        {row.expenditure.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {/* Totals Row */}
                <tr className="border-t-2 border-border bg-surface font-semibold">
                  <td className="px-6 py-4 text-foreground" colSpan={3}>
                    Totals
                  </td>
                  <td className="px-6 py-4 text-right text-success">
                    {totals.answered.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-danger">
                    {totals.nonAnswered.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-foreground">
                    {totals.dtmf.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-accent-warm">
                    {totals.expenditure.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(data.length / PAGE_SIZE)}
            totalItems={data.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            activeClass="bg-gradient-to-br from-danger to-accent-warm text-white shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
