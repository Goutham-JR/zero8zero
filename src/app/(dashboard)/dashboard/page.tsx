"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchDashboardStats } from "@/services/user.service";
import { fetchLiveCampaigns } from "@/services/campaign.service";
import { fetchDashboardDetails } from "@/services/campaign.service";
import type { DashboardStats } from "@/types";
import { Pagination } from "@/components/pagination";
import {
  Megaphone,
  PhoneCall,
  Users,
  Wallet,
  TrendingUp,
  RefreshCw,
  Activity,
  Radio,
  Loader2,
  Inbox,
  Pause,
  Square,
  Play,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";

interface LiveCampaign {
  campaignId: number;
  campaignName: string;
  campaignStatus: number;
  scheduleTime: string;
  numbersUploaded: number;
  numbersProcessed: number;
  callsConnected: number;
  dndCount: number;
  retries: number;
  pulses: number;
  dtmfCount: number;
  templateId?: number;
  status?: number;
}

interface DashboardHeader {
  totalCalls: number;
  connectedCalls: number;
  failedCalls: number;
  totalVoiceCampaigns: number;
  voiceCreditsAvailable: number;
  pulsePrice: number;
  voiceCreditsUsed: number;
  smsSubmitted: number;
}

interface DashboardData {
  dbHeader: DashboardHeader;
  runningCampaigns: LiveCampaign[];
  dbUserWiseCampaigns: LiveCampaign[];
}

const statusMap: Record<number, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  0: { label: "Pending", color: "text-accent-warm", bg: "bg-accent-warm/10", icon: <Clock className="w-3.5 h-3.5" /> },
  1: { label: "Running", color: "text-primary", bg: "bg-primary/10", icon: <Activity className="w-3.5 h-3.5" /> },
  2: { label: "Completed", color: "text-success", bg: "bg-success/10", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  3: { label: "Paused", color: "text-secondary", bg: "bg-secondary/10", icon: <Pause className="w-3.5 h-3.5" /> },
  4: { label: "Failed", color: "text-danger", bg: "bg-danger/10", icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const profile = useAuthStore((s) => s.profile);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [liveCampaigns, setLiveCampaigns] = useState<LiveCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const displayName = profile?.name || user?.username || "User";

  const loadData = useCallback(async () => {
    const userId = user?.id;
    if (!userId || !token) return;

    setLoading(true);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    // Fetch dashboard + live campaigns first (fast)
    const [dashRes, liveRes] = await Promise.allSettled([
      fetchDashboardDetails(userId),
      fetchLiveCampaigns(userId),
    ]);

    if (dashRes.status === "fulfilled" && dashRes.value && typeof dashRes.value === "object") {
      setDashData(dashRes.value as unknown as DashboardData);
    }

    if (liveRes.status === "fulfilled" && Array.isArray(liveRes.value)) {
      setLiveCampaigns(liveRes.value as LiveCampaign[]);
    }

    setLoading(false);
    setLoaded(true);

    // Fetch statistic/summary in background (slow but has accurate totals)
    fetchDashboardStats(userId, startDate, endDate)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setStats(res[0]);
      })
      .catch(() => {});
  }, [user?.id, token]);

  useEffect(() => {
    if (user?.id && token && !loaded) {
      loadData();
    }
  }, [user?.id, token, loaded, loadData]);

  // Combine live campaigns from both sources
  const allLive = [
    ...liveCampaigns,
    ...(dashData?.runningCampaigns || []),
  ];
  // Deduplicate by campaignId and sort descending
  const seenIds = new Set<number>();
  const uniqueLive = allLive
    .filter((c) => {
      if (seenIds.has(c.campaignId)) return false;
      seenIds.add(c.campaignId);
      return true;
    })
    .sort((a, b) => b.campaignId - a.campaignId);

  // Pagination
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(uniqueLive.length / PAGE_SIZE);
  const paginatedLive = uniqueLive.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const header = dashData?.dbHeader;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {displayName}
          </h2>
          <p className="text-muted mt-1">
            Here&apos;s your live campaign summary
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          icon={<Megaphone className="w-5 h-5" />}
          label="Total Campaigns"
          value={loading && !stats && !header ? "—" : (header?.totalVoiceCampaigns ?? stats?.totalCampaigns ?? 0)}
          sub="All time"
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={<PhoneCall className="w-5 h-5" />}
          label="Connected Calls"
          value={loading && !stats && !header ? "—" : (stats?.totalConnectedCalls ?? header?.connectedCalls ?? 0).toLocaleString()}
          sub={stats ? "Last 90 days" : "Loading..."}
          color="text-success"
          bg="bg-success/10"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Calls"
          value={loading && !stats && !header ? "—" : (stats?.totalNosProcessed ?? header?.totalCalls ?? 0).toLocaleString()}
          sub={stats ? "Last 90 days" : "Loading..."}
          color="text-secondary"
          bg="bg-secondary/10"
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Credits Available"
          value={loading && !header ? "—" : (header?.voiceCreditsAvailable ?? profile?.credits ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          sub={profile?.expiryDate ? `Valid till ${new Date(profile.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Balance"}
          color="text-accent-warm"
          bg="bg-accent-warm/10"
        />
      </div>

      {/* Live Summary */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className="w-5 h-5 text-primary" />
              {uniqueLive.some((c) => c.campaignStatus === 1) && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Live Summary
              </h3>
              <p className="text-sm text-muted mt-0.5">
                {uniqueLive.length === 0
                  ? "No active campaigns"
                  : `${uniqueLive.length} campaign${uniqueLive.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          {uniqueLive.some((c) => c.campaignStatus === 1) && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-xl">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-success">
                {uniqueLive.filter((c) => c.campaignStatus === 1).length} Running
              </span>
            </div>
          )}
        </div>

        {loading && uniqueLive.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center gap-3 border-t border-border">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted">Loading live data...</p>
          </div>
        ) : uniqueLive.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center gap-3 border-t border-border">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
              <Inbox className="w-6 h-6 text-muted" />
            </div>
            <p className="text-sm text-muted">No active or recent campaigns</p>
            <p className="text-xs text-muted">Create a campaign to see live stats here</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border bg-surface text-muted">
                  <th className="px-6 py-3 font-medium text-left">Campaign</th>
                  <th className="px-6 py-3 font-medium text-left">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Uploaded</th>
                  <th className="px-6 py-3 font-medium text-right">Processed</th>
                  <th className="px-6 py-3 font-medium text-right">Connected</th>
                  <th className="px-6 py-3 font-medium text-right">DND</th>
                  <th className="px-6 py-3 font-medium text-right hide-mobile">Pulses</th>
                  <th className="px-6 py-3 font-medium text-left hide-mobile">Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLive.map((c) => {
                  const st = statusMap[c.campaignStatus] ?? statusMap[0];
                  const progress = c.numbersUploaded > 0
                    ? Math.round((c.numbersProcessed / c.numbersUploaded) * 100)
                    : 0;

                  return (
                    <tr
                      key={c.campaignId}
                      className="border-t border-border hover:bg-card-hover transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-foreground">{c.campaignName}</span>
                          <span className="text-xs text-muted ml-2">#{c.campaignId}</span>
                        </div>
                        {c.campaignStatus === 1 && c.numbersUploaded > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-muted tabular-nums">{progress}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${st.bg} ${st.color} border-current/20`}>
                          {st.icon}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-foreground font-medium tabular-nums">
                        {c.numbersUploaded.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-foreground font-medium tabular-nums">
                        {c.numbersProcessed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-success font-medium tabular-nums">
                        {c.callsConnected.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-danger font-medium tabular-nums">
                        {(c.dndCount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-accent-warm font-medium tabular-nums hide-mobile">
                        {c.pulses.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted hide-mobile">
                        {c.scheduleTime ? formatDateTime(c.scheduleTime) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={uniqueLive.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-3 md:p-5 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="hidden md:flex items-center gap-1 text-xs text-muted">
          <TrendingUp className="w-3 h-3" />
          {sub}
        </div>
      </div>
      <p className="text-lg md:text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs md:text-sm text-muted mt-0.5">{label}</p>
    </div>
  );
}

/* ─── Helpers ─── */

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
