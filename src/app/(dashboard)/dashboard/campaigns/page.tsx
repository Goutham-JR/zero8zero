"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  Calendar,
  Loader2,
  Inbox,
  Pause,
  Square,
  Play,
  RefreshCw,
  AlertCircle,
  PhoneCall,
  PhoneOff,
  Hash,
  Clock,
  Users,
  ShieldBan,
  Zap,
  Megaphone,
} from "lucide-react";
import { getUserId, getDefaultDateRange } from "@/services/api";
import {
  fetchHistoricalCampaigns,
  fetchScheduledCampaigns,
  pauseCampaign,
  stopCampaign,
  resumeCampaign,
} from "@/services/campaign.service";
import type { HistoricalCampaign } from "@/types";
import { Pagination } from "@/components/pagination";

type Tab = "historical" | "scheduled";

const statusMap: Record<number, string> = {
  0: "Pending",
  1: "Running",
  2: "Completed",
  3: "Paused",
  4: "Failed",
};

const statusStyles: Record<number, string> = {
  0: "bg-accent-warm/10 text-accent-warm border-accent-warm/20",
  1: "bg-primary/10 text-primary border-primary/20",
  2: "bg-success/10 text-success border-success/20",
  3: "bg-secondary/10 text-secondary border-secondary/20",
  4: "bg-danger/10 text-danger border-danger/20",
};

const templateLabels: Record<number, string> = {
  0: "Simple IVR",
  1: "Input IVR",
  2: "Call Patch",
  3: "Custom IVR",
  7: "TTS Simple",
  8: "TTS DTMF",
  9: "TTS Call Patch",
};

const templateColors: Record<number, { text: string; bg: string; border: string }> = {
  0: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  1: { text: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
  2: { text: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  3: { text: "text-accent-warm", bg: "bg-accent-warm/10", border: "border-accent-warm/20" },
};

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("historical");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [historicalData, setHistoricalData] = useState<HistoricalCampaign[]>([]);
  const [scheduledData, setScheduledData] = useState<Record<string, unknown>[]>([]);

  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { startDate: s, endDate: e } = getDefaultDateRange();
    setStartDate(s);
    setEndDate(e);
  }, []);

  const loadHistorical = useCallback(async () => {
    const userId = getUserId();
    if (!userId || !startDate || !endDate) return;
    setLoadingHistorical(true);
    setError(null);
    try {
      const data = await fetchHistoricalCampaigns(userId, startDate, endDate);
      setHistoricalData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoadingHistorical(false);
    }
  }, [startDate, endDate]);

  const loadScheduled = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    setLoadingScheduled(true);
    setError(null);
    try {
      const data = await fetchScheduledCampaigns(userId);
      setScheduledData(data as Record<string, unknown>[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scheduled campaigns");
    } finally {
      setLoadingScheduled(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "scheduled") {
      loadScheduled();
      return;
    }
    if (!startDate || !endDate) return;
    loadHistorical();
  }, [activeTab, startDate, endDate, loadHistorical, loadScheduled]);

  const handlePause = async (campaignId: number) => {
    setActionLoading(campaignId);
    try {
      await pauseCampaign(campaignId);
      await loadHistorical();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (campaignId: number) => {
    setActionLoading(campaignId);
    try {
      await stopCampaign(campaignId);
      await loadHistorical();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (campaignId: number) => {
    setActionLoading(campaignId);
    try {
      const userId = getUserId();
      await resumeCampaign(campaignId, userId);
      await loadHistorical();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    if (activeTab === "historical") loadHistorical();
    else loadScheduled();
  };

  const isLoading = activeTab === "historical" ? loadingHistorical : loadingScheduled;

  const inputClass =
    "px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaigns</h2>
        <p className="text-muted mt-1">View your campaign history and scheduled campaigns</p>
      </div>

      {/* Date Range */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Start Date
            </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              End Date
            </label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("historical")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === "historical"
              ? "gradient-bg text-white shadow-lg shadow-primary/25"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-primary/20"
          }`}
        >
          <History className="w-4 h-4" />
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === "scheduled"
              ? "gradient-bg text-white shadow-lg shadow-primary/25"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-primary/20"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Scheduled
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {activeTab === "historical" ? (
        <HistoricalCards
          data={historicalData}
          loading={loadingHistorical}
          actionLoading={actionLoading}
          onPause={handlePause}
          onStop={handleStop}
          onResume={handleResume}
                />
      ) : (
        <ScheduledTable data={scheduledData} loading={loadingScheduled} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Historical Campaign Cards
   ═══════════════════════════════════════════ */

function HistoricalCards({
  data,
  loading,
  actionLoading,
  onPause,
  onStop,
  onResume,
}: {
  data: HistoricalCampaign[];
  loading: boolean;
  actionLoading: number | null;
  onPause: (id: number) => void;
  onStop: (id: number) => void;
  onResume: (id: number) => void;
}) {
  const PAGE_SIZE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginated = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) return <LoadingState />;
  if (data.length === 0) return <EmptyState message="No campaigns found for the selected date range." />;

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paginated.map((c) => {
        const st = statusMap[c.campaignStatus] ?? "Unknown";
        const stStyle = statusStyles[c.campaignStatus] ?? "";
        const tid = c.templateId;
        const tc = templateColors[tid ?? 0] ?? templateColors[0];
        const isActioning = actionLoading === c.campaignId;

        return (
          <div
            key={c.campaignId}
            className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-glow transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground truncate">{c.campaignName}</h4>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {tid != null && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${tc.bg} ${tc.text} ${tc.border}`}>
                      {templateLabels[tid] ?? `Type ${tid}`}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${stStyle}`}>
                    {st}
                  </span>
                  <span className="text-[10px] text-muted">#{c.campaignId}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {isActioning ? (
                  <Loader2 className="w-4 h-4 text-muted animate-spin" />
                ) : (
                  <>
                    {c.campaignStatus === 1 && (
                      <button onClick={() => onPause(c.campaignId)} title="Pause" className="p-1.5 rounded-lg text-accent-warm hover:bg-accent-warm/10 transition-colors">
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {(c.campaignStatus === 1 || c.campaignStatus === 3) && (
                      <button onClick={() => onStop(c.campaignId)} title="Stop" className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors">
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    {c.campaignStatus === 3 && (
                      <button onClick={() => onResume(c.campaignId)} title="Resume" className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Time Row */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {c.scheduleTime ? formatDateTime(c.scheduleTime) : "—"}
              </span>
              <span className="text-border">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-success" />
                {c.endTime ? formatDateTime(c.endTime) : "—"}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Uploaded" value={c.numbersUploaded} color="text-foreground" bg="bg-surface" />
              <MiniStat icon={<PhoneCall className="w-3.5 h-3.5" />} label="Connected" value={c.callsConnected} color="text-success" bg="bg-success/5" />
              <MiniStat icon={<ShieldBan className="w-3.5 h-3.5" />} label="DND" value={c.dndCount} color="text-accent-warm" bg="bg-accent-warm/5" />
              <MiniStat icon={<Zap className="w-3.5 h-3.5" />} label="Pulses" value={c.pulses} color="text-secondary" bg="bg-secondary/5" />
              <MiniStat icon={<Hash className="w-3.5 h-3.5" />} label="DTMF" value={c.dtmfCount} color="text-accent" bg="bg-accent/5" />
              <MiniStat icon={<Megaphone className="w-3.5 h-3.5" />} label="Retries" value={c.retries} color="text-muted" bg="bg-surface" />
            </div>
          </div>
        );
      })}
    </div>

    {totalPages > 1 && (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={data.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
      </div>
    )}
    </div>
  );
}

function MiniStat({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl px-3 py-2.5 text-center`}>
      <div className={`flex items-center justify-center gap-1 ${color} mb-1`}>
        {icon}
        <span className="text-sm font-bold tabular-nums">{value.toLocaleString()}</span>
      </div>
      <p className="text-[10px] text-muted leading-tight">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Scheduled Cards
   ═══════════════════════════════════════════ */

function ScheduledTable({ data, loading }: { data: Record<string, unknown>[]; loading: boolean }) {
  const PAGE_SIZE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginated = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) return <LoadingState />;
  if (data.length === 0) return <EmptyState message="No scheduled campaigns found." />;

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paginated.map((row, idx) => {
        const name = String(row.campaignName ?? row.name ?? `Campaign ${idx + 1}`);
        const id = row.campaignId ?? row.id;
        const status = typeof row.campaignStatus === "number" ? row.campaignStatus : (typeof row.status === "number" ? row.status : 0);
        const st = statusMap[status as number] ?? "Scheduled";
        const stStyle = statusStyles[status as number] ?? "bg-primary/10 text-primary border-primary/20";
        const tid = typeof row.templateId === "number" ? row.templateId : undefined;
        const tc = templateColors[tid ?? 0] ?? templateColors[0];

        const schedule = row.scheduleTime ?? row.scheduleDate ?? "";
        const uploaded = Number(row.numbersUploaded ?? 0);
        const connected = Number(row.callsConnected ?? 0);
        const dnd = Number(row.dndCount ?? 0);
        const pulses = Number(row.pulses ?? 0);
        const dtmf = Number(row.dtmfCount ?? row.dtmf ?? 0);
        const retries = Number(row.retries ?? 0);

        return (
          <div
            key={id != null ? String(id) : idx}
            className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-glow transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground truncate">{name}</h4>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {tid != null && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${tc.bg} ${tc.text} ${tc.border}`}>
                      {templateLabels[tid] ?? `Type ${tid}`}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${stStyle}`}>
                    {st}
                  </span>
                  {id != null && <span className="text-[10px] text-muted">#{String(id)}</span>}
                </div>
              </div>
            </div>

            {/* Schedule Time */}
            {schedule && (
              <div className="flex items-center gap-2 mb-4 text-xs text-muted">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Scheduled: <span className="font-medium text-foreground">{formatDateTime(String(schedule))}</span></span>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Uploaded" value={uploaded} color="text-foreground" bg="bg-surface" />
              <MiniStat icon={<PhoneCall className="w-3.5 h-3.5" />} label="Connected" value={connected} color="text-success" bg="bg-success/5" />
              <MiniStat icon={<ShieldBan className="w-3.5 h-3.5" />} label="DND" value={dnd} color="text-accent-warm" bg="bg-accent-warm/5" />
              <MiniStat icon={<Zap className="w-3.5 h-3.5" />} label="Pulses" value={pulses} color="text-secondary" bg="bg-secondary/5" />
              <MiniStat icon={<Hash className="w-3.5 h-3.5" />} label="DTMF" value={dtmf} color="text-accent" bg="bg-accent/5" />
              <MiniStat icon={<Megaphone className="w-3.5 h-3.5" />} label="Retries" value={retries} color="text-muted" bg="bg-surface" />
            </div>
          </div>
        );
      })}
    </div>

    {totalPages > 1 && (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={data.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
      </div>
    )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Shared UI
   ═══════════════════════════════════════════ */

function LoadingState() {
  return (
    <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted">Loading campaigns...</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
        <Inbox className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm text-muted text-center max-w-sm">{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

function formatColumnHeader(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}[T ]/.test(value)) return formatDateTime(value);
  return String(value);
}
