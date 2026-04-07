"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchUsers,
  fetchTotalCalls,
  fetchUserStatsSummary,
} from "@/services/admin.service";
import { fetchDashboardDetails } from "@/services/campaign.service";
import { getDefaultDateRange } from "@/services/api";
import type { AdminUser, DashboardStats, TotalCallsStats } from "@/types";
import {
  Users,
  PhoneCall,
  Phone,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Pagination } from "@/components/pagination";

interface DashboardHeader {
  totalCalls: number;
  connectedCalls: number;
  failedCalls: number;
  totalVoiceCampaigns: number;
  voiceCreditsAvailable: number;
  voiceCreditsUsed: number;
}

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const profile = useAuthStore((s) => s.profile);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [header, setHeader] = useState<DashboardHeader | null>(null);
  const [callStats, setCallStats] = useState<TotalCallsStats | null>(null);
  const [userStats, setUserStats] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [statsPage, setStatsPage] = useState(1);
  const STATS_PAGE_SIZE = 5;

  const displayName = profile?.name || user?.username || "Admin";
  const resellerCredits = header?.voiceCreditsAvailable ?? profile?.credits ?? 0;

  const loadData = useCallback(async () => {
    const userId = user?.id;
    if (!userId || !token) return;

    setLoading(true);

    const defaultRange = getDefaultDateRange();

    // Fast: dashboard + users (load page quickly)
    const [dashRes, usersRes] = await Promise.allSettled([
      fetchDashboardDetails(userId),
      fetchUsers(userId),
    ]);

    if (dashRes.status === "fulfilled" && dashRes.value && typeof dashRes.value === "object") {
      const data = dashRes.value as Record<string, unknown>;
      if (data.dbHeader) setHeader(data.dbHeader as DashboardHeader);
    }

    if (usersRes.status === "fulfilled") {
      setUsers(Array.isArray(usersRes.value) ? usersRes.value : []);
    }

    setLoading(false);
    setLoaded(true);

    // Slow: totalCalls + userStatsSummary (background, updates cards when done)
    fetchTotalCalls(userId, defaultRange.startDate, defaultRange.endDate)
      .then((res) => {
        if (res && typeof res === "object" && "totalCalls" in res) setCallStats(res);
      })
      .catch(() => {});

    fetchUserStatsSummary(userId, defaultRange.startDate, defaultRange.endDate)
      .then((res) => {
        if (Array.isArray(res)) setUserStats(res);
      })
      .catch(() => {});
  }, [user?.id, token]);

  useEffect(() => {
    if (user?.id && token && !loaded) {
      loadData();
    }
  }, [user?.id, token, loaded, loadData]);

  // Compute totals from user stats
  const computedTotalCalls = userStats.reduce((sum, s) => sum + (s.totalNosProcessed ?? 0), 0);
  const computedConnectedCalls = userStats.reduce((sum, s) => sum + (s.totalConnectedCalls ?? 0), 0);

  const totalCalls = callStats?.totalCalls ?? (computedTotalCalls || (header?.totalCalls ?? 0));
  const connectedCalls = callStats?.totalConnectedCalls ?? (computedConnectedCalls || (header?.connectedCalls ?? 0));

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {displayName}
          </h2>
          <p className="text-muted mt-1">Reseller dashboard overview</p>
        </div>
        <button
          onClick={() => { setLoaded(false); loadData(); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={users.length}
          subtitle="Managed accounts"
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={<Phone className="w-5 h-5" />}
          label="Total Calls"
          value={totalCalls.toLocaleString()}
          subtitle={callStats || userStats.length > 0 ? "Last 90 days" : "Loading..."}
          color="text-secondary"
          bg="bg-secondary/10"
        />
        <StatCard
          icon={<PhoneCall className="w-5 h-5" />}
          label="Connected Calls"
          value={connectedCalls.toLocaleString()}
          subtitle={callStats || userStats.length > 0 ? "Last 90 days" : "Loading..."}
          color="text-success"
          bg="bg-success/10"
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Reseller Credits"
          value={resellerCredits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          subtitle={profile?.expiryDate ? `Valid till ${new Date(profile.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Available balance"}
          color="text-danger"
          bg="bg-danger/10"
        />
      </div>

      {/* User Statistics Summary Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">User Statistics Summary</h3>
            <p className="text-sm text-muted mt-0.5">
              {userStats.length > 0
                ? `${userStats.length} user${userStats.length !== 1 ? "s" : ""} with activity`
                : "Loading user statistics..."}
            </p>
          </div>
          <Link href="/admin/users" className="text-sm text-danger font-medium hover:underline flex items-center gap-1">
            View all users <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-muted">
                <th className="px-6 py-3.5 font-medium text-left">User</th>
                <th className="px-6 py-3.5 font-medium text-right">Campaigns</th>
                <th className="px-6 py-3.5 font-medium text-right">Connected Calls</th>
                <th className="px-6 py-3.5 font-medium text-right">Numbers Processed</th>
                <th className="px-6 py-3.5 font-medium text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {userStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    {loaded ? "No user statistics found." : "Loading..."}
                  </td>
                </tr>
              ) : (
                userStats.slice((statsPage - 1) * STATS_PAGE_SIZE, statsPage * STATS_PAGE_SIZE).map((stat) => (
                  <tr key={stat.userId} className="border-t border-border hover:bg-card-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger text-xs font-bold shrink-0">
                          {stat.userName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-foreground">{stat.userName || `User #${stat.userId}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">{stat.totalCampaigns.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-success font-medium">{stat.totalConnectedCalls.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-foreground font-medium">{stat.totalNosProcessed.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-accent-warm font-medium">{stat.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={statsPage} totalPages={Math.ceil(userStats.length / STATS_PAGE_SIZE)} totalItems={userStats.length} pageSize={STATS_PAGE_SIZE} onPageChange={setStatsPage} activeClass="bg-gradient-to-br from-danger to-accent-warm text-white shadow-lg" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
          <QuickActionCard href="/admin/users" icon={<Users className="w-5 h-5" />} title="Manage Users" description="Create, edit, and manage reseller user accounts" />
          <QuickActionCard href="/admin/credits" icon={<Wallet className="w-5 h-5" />} title="Manage Credits" description="Add or remove credits and view transaction history" />
          <QuickActionCard href="/admin/campaigns" icon={<PhoneCall className="w-5 h-5" />} title="View Campaigns" description="Monitor and analyze all campaign activity" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color, bg }: { icon: React.ReactNode; label: string; value: string | number; subtitle: string; color: string; bg: string }) {
  return (
    <div className="p-5 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>{icon}</div>
        <div className="flex items-center gap-1 text-xs text-muted"><TrendingUp className="w-3 h-3" />{subtitle}</div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted mt-0.5">{label}</p>
    </div>
  );
}

function QuickActionCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href} className="p-5 bg-card rounded-2xl border border-border hover:border-danger/30 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">{icon}</div>
        <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-danger transition-colors" />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted mt-1">{description}</p>
    </Link>
  );
}
