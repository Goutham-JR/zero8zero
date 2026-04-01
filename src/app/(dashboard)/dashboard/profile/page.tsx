"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  User,
  Building,
  CreditCard,
  Clock,
  RefreshCw,
  Shield,
  Hash,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Profile</h2>
          <p className="text-muted mt-1">Your account details and plan information</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/10 flex items-center justify-center">
            <User className="w-8 h-8 text-muted" />
          </div>
          <p className="text-muted text-sm">Profile data is not available.</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Load Profile
          </button>
        </div>
      </div>
    );
  }

  const formattedExpiry = profile.expiryDate
    ? new Date(profile.expiryDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const accountTypeLabels: Record<number, string> = {
    0: "Standard",
    1: "Premium",
    2: "Enterprise",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Profile</h2>
          <p className="text-muted mt-1">Your account details and plan information</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh Profile
        </button>
      </div>

      {/* Credits Highlight */}
      <div className="gradient-bg rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Credit Balance</p>
              <p className="text-3xl font-bold tracking-tight">
                {profile.credits?.toLocaleString("en-IN") ?? "0"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Credits Used</p>
              <p className="text-xl font-bold mt-1">
                {profile.creditsUsed?.toLocaleString("en-IN") ?? "0"}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Remaining</p>
              <p className="text-xl font-bold mt-1">
                {((profile.credits ?? 0) - (profile.creditsUsed ?? 0)).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account Info */}
        <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Account Info</h3>
          </div>
          <div className="space-y-4">
            <InfoRow
              icon={<User className="w-4 h-4" />}
              label="Name"
              value={profile.name || "N/A"}
            />
            <InfoRow
              icon={<Hash className="w-4 h-4" />}
              label="Username"
              value={profile.username}
            />
            {user?.email && (
              <InfoRow
                icon={<CreditCard className="w-4 h-4" />}
                label="Email"
                value={user.email}
              />
            )}
            <InfoRow
              icon={<Building className="w-4 h-4" />}
              label="Company"
              value={profile.company || "N/A"}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="User Type"
              value={profile.userType || "N/A"}
            />
            <InfoRow
              icon={<Building className="w-4 h-4" />}
              label="Parent Company"
              value={profile.parentCompany || "N/A"}
            />
          </div>
        </div>

        {/* Plan Details */}
        <div className="bg-card rounded-2xl border border-border p-6 hover:border-secondary/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Plan Details</h3>
          </div>
          <div className="space-y-4">
            <InfoRow
              icon={<CreditCard className="w-4 h-4" />}
              label="Pulse Price"
              value={`${profile.pulsePrice}`}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="Pulse Duration"
              value={`${profile.pulseDuration}s`}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Channels"
              value={`${profile.channels}`}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Expiry Date"
              value={formattedExpiry}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Account Type"
              value={accountTypeLabels[profile.accountType] ?? `Type ${profile.accountType}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Info Row ---------- */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
