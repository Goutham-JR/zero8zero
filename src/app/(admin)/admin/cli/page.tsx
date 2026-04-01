"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchCLIs,
  fetchDedicatedCLIs,
  fetchAllocatedCLIs,
  fetchUsers,
  allocateDedicatedCLI,
  removeDedicatedCLI,
} from "@/services/admin.service";
import type { AdminUser, DedicatedCLI } from "@/types";
import {
  Radio,
  Phone,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Inbox,
  Check,
  AlertCircle,
  X,
} from "lucide-react";

type Tab = "available" | "dedicated" | "allocated";
type AllocationType = "manual" | "bulk";

interface CLIRow {
  cliId: number;
  cli: string;
  dialerName: string;
  locationName: string;
  cliStatus: number;
}

const TAB_LABELS: Record<Tab, string> = {
  available: "Available CLIs",
  dedicated: "Dedicated CLIs",
  allocated: "User Allocated CLIs",
};

export default function CLIManagementPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [activeTab, setActiveTab] = useState<Tab>("available");

  // ── Available CLIs ──
  const [clis, setClis] = useState<CLIRow[]>([]);
  const [clisLoading, setClisLoading] = useState(false);

  // ── Dedicated CLIs ──
  const [dedicatedCLIs, setDedicatedCLIs] = useState<DedicatedCLI[]>([]);
  const [dedicatedLoading, setDedicatedLoading] = useState(false);

  // ── Allocated CLIs ──
  const [allocatedCLIs, setAllocatedCLIs] = useState<DedicatedCLI[]>([]);
  const [allocatedLoading, setAllocatedLoading] = useState(false);
  const [selectedAllocUser, setSelectedAllocUser] = useState("");

  // ── Users ──
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // ── Allocate Form ──
  const [allocUserId, setAllocUserId] = useState("");
  const [allocationType, setAllocationType] = useState<AllocationType>("manual");
  const [allocCli, setAllocCli] = useState("");
  const [allocCliRange, setAllocCliRange] = useState("");
  const [allocating, setAllocating] = useState(false);

  // ── Removing CLIs ──
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  // ── Messages ──
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setSuccessMsg(null);
    setErrorMsg(null);
  }, []);

  const showSuccess = useCallback(
    (msg: string) => {
      clearMessages();
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    [clearMessages]
  );

  const showError = useCallback(
    (msg: string) => {
      clearMessages();
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 8000);
    },
    [clearMessages]
  );

  // ── Load Users ──
  const loadUsers = useCallback(async () => {
    if (!user?.id || !token) return;
    setUsersLoading(true);
    try {
      const res = await fetchUsers(user.id);
      if (Array.isArray(res)) setUsers(res);
    } catch {
      showError("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [user?.id, token, showError]);

  // ── Load Available CLIs ──
  const loadCLIs = useCallback(async () => {
    if (!user?.id || !token) return;
    setClisLoading(true);
    try {
      const res = await fetchCLIs(user.id);
      if (Array.isArray(res)) setClis(res);
    } catch {
      showError("Failed to load available CLIs.");
    } finally {
      setClisLoading(false);
    }
  }, [user?.id, token, showError]);

  // ── Load Dedicated CLIs ──
  const loadDedicatedCLIs = useCallback(async () => {
    if (!user?.id || !token) return;
    setDedicatedLoading(true);
    try {
      const res = await fetchDedicatedCLIs(user.id);
      if (Array.isArray(res)) setDedicatedCLIs(res);
    } catch {
      showError("Failed to load dedicated CLIs.");
    } finally {
      setDedicatedLoading(false);
    }
  }, [user?.id, token, showError]);

  // ── Load Allocated CLIs for a specific user ──
  const loadAllocatedCLIs = useCallback(
    async (userId: string) => {
      if (!userId || !token) return;
      setAllocatedLoading(true);
      setAllocatedCLIs([]);
      try {
        const res = await fetchAllocatedCLIs(userId);
        if (Array.isArray(res)) setAllocatedCLIs(res);
      } catch {
        showError("Failed to load allocated CLIs.");
      } finally {
        setAllocatedLoading(false);
      }
    },
    [token, showError]
  );

  // ── Initial data load ──
  useEffect(() => {
    if (user?.id && token) {
      loadUsers();
    }
  }, [user?.id, token, loadUsers]);

  // ── Tab-switch data load ──
  useEffect(() => {
    if (!user?.id || !token) return;
    if (activeTab === "available") loadCLIs();
    else if (activeTab === "dedicated") loadDedicatedCLIs();
    // "allocated" tab waits for user selection
  }, [activeTab, user?.id, token, loadCLIs, loadDedicatedCLIs]);

  // ── Allocate handler ──
  async function handleAllocate() {
    if (!allocUserId) {
      showError("Please select a user.");
      return;
    }
    if (!allocCli.trim()) {
      showError("Please enter a CLI number.");
      return;
    }
    if (allocationType === "bulk" && !allocCliRange.trim()) {
      showError("Please enter a CLI range for bulk allocation.");
      return;
    }

    setAllocating(true);
    clearMessages();
    try {
      const res = await allocateDedicatedCLI(
        allocUserId,
        allocationType,
        allocCli.trim(),
        allocationType === "bulk" ? allocCliRange.trim() : undefined
      );
      showSuccess(res?.message || "CLI allocated successfully.");
      setAllocCli("");
      setAllocCliRange("");
      // Refresh dedicated CLIs
      loadDedicatedCLIs();
      // If viewing the same user's allocated CLIs, refresh that too
      if (selectedAllocUser === allocUserId) {
        loadAllocatedCLIs(allocUserId);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to allocate CLI.";
      showError(message);
    } finally {
      setAllocating(false);
    }
  }

  // ── Remove handler ──
  async function handleRemove(userId: string, cliId: number) {
    setRemovingIds((prev) => new Set(prev).add(cliId));
    clearMessages();
    try {
      const res = await removeDedicatedCLI(userId, String(cliId));
      showSuccess(res?.message || "CLI removed successfully.");
      // Refresh
      if (selectedAllocUser) loadAllocatedCLIs(selectedAllocUser);
      loadDedicatedCLIs();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove CLI.";
      showError(message);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(cliId);
        return next;
      });
    }
  }

  // ── Tab button class ──
  function tabClass(tab: Tab) {
    return tab === activeTab
      ? "px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-danger to-accent-warm text-white shadow-lg shadow-danger/25"
      : "px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-surface border border-border text-muted hover:text-foreground hover:border-primary/20";
  }

  const inputClass =
    "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">CLI Management</h2>
        <p className="text-muted mt-1">
          Manage available, dedicated, and user-allocated CLIs
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-success/10 border border-success/20 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-success shrink-0" />
            <p className="text-success text-sm">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-success hover:text-success/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-danger text-sm">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-danger hover:text-danger/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["available", "dedicated", "allocated"] as Tab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
            {tab === "available" && <Radio className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
            {tab === "dedicated" && <Phone className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
            {tab === "allocated" && <Inbox className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════ Available CLIs Tab */}
      {activeTab === "available" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {clis.length} CLI{clis.length !== 1 ? "s" : ""} available
            </p>
            <button
              onClick={loadCLIs}
              disabled={clisLoading}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${clisLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-6 py-3.5 font-medium text-left">CLI Number</th>
                    <th className="px-6 py-3.5 font-medium text-left">Dialer Name</th>
                    <th className="px-6 py-3.5 font-medium text-left">Location</th>
                    <th className="px-6 py-3.5 font-medium text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clisLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted">
                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                        Loading CLIs...
                      </td>
                    </tr>
                  ) : clis.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No CLIs found.
                      </td>
                    </tr>
                  ) : (
                    clis.map((cli) => (
                      <tr
                        key={cli.cliId}
                        className="border-t border-border hover:bg-card-hover transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">{cli.cli}</td>
                        <td className="px-6 py-4 text-foreground">{cli.dialerName}</td>
                        <td className="px-6 py-4 text-foreground">{cli.locationName}</td>
                        <td className="px-6 py-4">
                          {cli.cliStatus === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              <span className="w-1.5 h-1.5 rounded-full bg-success" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
                              <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ Dedicated CLIs Tab */}
      {activeTab === "dedicated" && (
        <div className="space-y-6">
          {/* Dedicated CLIs Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">
                {dedicatedCLIs.length} dedicated CLI{dedicatedCLIs.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={loadDedicatedCLIs}
                disabled={dedicatedLoading}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${dedicatedLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-muted">
                      <th className="px-6 py-3.5 font-medium text-left">CLI</th>
                      <th className="px-6 py-3.5 font-medium text-left">Dialer</th>
                      <th className="px-6 py-3.5 font-medium text-left">Location</th>
                      <th className="px-6 py-3.5 font-medium text-left">Allocation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dedicatedLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted">
                          <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                          Loading dedicated CLIs...
                        </td>
                      </tr>
                    ) : dedicatedCLIs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted">
                          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No dedicated CLIs found.
                        </td>
                      </tr>
                    ) : (
                      dedicatedCLIs.map((cli) => (
                        <tr
                          key={cli.cliId}
                          className="border-t border-border hover:bg-card-hover transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">{cli.cli}</td>
                          <td className="px-6 py-4 text-foreground">{cli.dialerName}</td>
                          <td className="px-6 py-4 text-foreground">{cli.locationName}</td>
                          <td className="px-6 py-4 text-muted">{cli.allocationDate || "\u2014"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Allocate CLI Form */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-primary" />
              Allocate CLI
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select User */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select User
                </label>
                <select
                  value={allocUserId}
                  onChange={(e) => setAllocUserId(e.target.value)}
                  className={inputClass}
                  disabled={usersLoading}
                >
                  <option value="">
                    {usersLoading ? "Loading users..." : "-- Select User --"}
                  </option>
                  {users.map((u) => (
                    <option key={u.userId} value={String(u.userId)}>
                      {u.username} ({u.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Allocation Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Allocation Type
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="allocationType"
                      checked={allocationType === "manual"}
                      onChange={() => setAllocationType("manual")}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Manual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="allocationType"
                      checked={allocationType === "bulk"}
                      onChange={() => setAllocationType("bulk")}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Bulk</span>
                  </label>
                </div>
              </div>

              {/* CLI Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CLI Number{allocationType === "bulk" ? " (Start)" : ""}
                </label>
                <input
                  type="text"
                  value={allocCli}
                  onChange={(e) => setAllocCli(e.target.value)}
                  placeholder={
                    allocationType === "bulk"
                      ? "e.g. 9100000001"
                      : "Enter CLI number"
                  }
                  className={inputClass}
                />
              </div>

              {/* CLI Range (bulk only) */}
              {allocationType === "bulk" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    CLI Range
                  </label>
                  <input
                    type="text"
                    value={allocCliRange}
                    onChange={(e) => setAllocCliRange(e.target.value)}
                    placeholder="e.g. 9100000001-9100000050"
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAllocate}
                disabled={allocating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl font-medium text-sm shadow-lg shadow-danger/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {allocating ? "Allocating..." : "Allocate CLI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ User Allocated CLIs Tab */}
      {activeTab === "allocated" && (
        <div className="space-y-4">
          {/* User Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <select
                value={selectedAllocUser}
                onChange={(e) => {
                  const uid = e.target.value;
                  setSelectedAllocUser(uid);
                  if (uid) loadAllocatedCLIs(uid);
                  else setAllocatedCLIs([]);
                }}
                className={inputClass}
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? "Loading users..." : "-- Select User --"}
                </option>
                {users.map((u) => (
                  <option key={u.userId} value={String(u.userId)}>
                    {u.username} ({u.name})
                  </option>
                ))}
              </select>
            </div>
            {selectedAllocUser && (
              <button
                onClick={() => loadAllocatedCLIs(selectedAllocUser)}
                disabled={allocatedLoading}
                className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${allocatedLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>

          {/* Allocated CLIs Table */}
          {!selectedAllocUser ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
              <p className="text-muted text-sm">
                Select a user to view their allocated CLIs.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <p className="text-sm text-muted">
                  {allocatedCLIs.length} allocated CLI{allocatedCLIs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-muted">
                      <th className="px-6 py-3.5 font-medium text-left">CLI</th>
                      <th className="px-6 py-3.5 font-medium text-left">Dialer</th>
                      <th className="px-6 py-3.5 font-medium text-left">Location</th>
                      <th className="px-6 py-3.5 font-medium text-left">Allocation Date</th>
                      <th className="px-6 py-3.5 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocatedLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                          <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                          Loading allocated CLIs...
                        </td>
                      </tr>
                    ) : allocatedCLIs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No CLIs allocated to this user.
                        </td>
                      </tr>
                    ) : (
                      allocatedCLIs.map((cli) => (
                        <tr
                          key={cli.cliId}
                          className="border-t border-border hover:bg-card-hover transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">{cli.cli}</td>
                          <td className="px-6 py-4 text-foreground">{cli.dialerName}</td>
                          <td className="px-6 py-4 text-foreground">{cli.locationName}</td>
                          <td className="px-6 py-4 text-muted">{cli.allocationDate || "\u2014"}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRemove(selectedAllocUser, cli.cliId)}
                              disabled={removingIds.has(cli.cliId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove CLI"
                            >
                              {removingIds.has(cli.cliId) ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
