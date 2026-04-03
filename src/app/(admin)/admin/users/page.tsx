"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchUsers,
  fetchUserProfile,
  fetchUserStatsSummary,
  registerUser,
  updateUserProfile,
  changeAccountType,
  addCredits,
  removeCredits,
  fetchPlans,
  fetchModules,
} from "@/services/admin.service";
import { getDefaultDateRange } from "@/services/api";
import {
  Users,
  Plus,
  Minus,
  Pencil,
  RefreshCw,
  Loader2,
  X,
  Check,
  AlertCircle,
  Search,
  Wallet,
  Calendar,
  Building,
  Mail,
  Phone,
  Hash,
  KeyRound,
} from "lucide-react";
import type { AdminUser, PlanItem, ModuleItem } from "@/types";

const INPUT_CLASS =
  "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all text-sm";

interface FormState {
  username: string;
  password: string;
  name: string;
  emailid: string;
  number: string;
  company: string;
  address: string;
  pincode: string;
  planId: string;
  accountType: string;
  moduleId: string;
  expiryDate: string;
}

const emptyForm: FormState = {
  username: "",
  password: "",
  name: "",
  emailid: "",
  number: "",
  company: "",
  address: "",
  pincode: "",
  planId: "",
  accountType: "0",
  moduleId: "",
  expiryDate: "2027-12-31",
};

export default function UserManagementPage() {
  const { user, token } = useAuthStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Map of userId -> totalCost from stats summary (actual usage)
  const [usageMap, setUsageMap] = useState<Record<number, number>>({});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>({ ...emptyForm });
  const [creating, setCreating] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...emptyForm });
  const [updating, setUpdating] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [togglingType, setTogglingType] = useState<number | null>(null);

  // Credit modal
  const [creditUser, setCreditUser] = useState<AdminUser | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditAction, setCreditAction] = useState(false);

  // Password info modal
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);


  const clearMessages = useCallback(() => { setError(null); setSuccess(null); }, []);

  const loadUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    clearMessages();
    try {
      const data = await fetchUsers(user.id);
      setUsers(Array.isArray(data) ? data : []);
      // Fetch usage stats in background
      const { startDate, endDate } = getDefaultDateRange();
      fetchUserStatsSummary(user.id, startDate, endDate)
        .then((stats) => {
          if (Array.isArray(stats)) {
            const map: Record<number, number> = {};
            for (const s of stats) map[s.userId] = s.totalCost ?? 0;
            setUsageMap(map);
          }
        })
        .catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user, clearMessages]);

  const loadPlansAndModules = useCallback(async () => {
    if (!user) return;
    try {
      const [planData, moduleData] = await Promise.all([fetchPlans(user.id), fetchModules()]);
      setPlans(Array.isArray(planData) ? planData : []);
      setModules(Array.isArray(moduleData) ? moduleData : []);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { loadUsers(); loadPlansAndModules(); }, [loadUsers, loadPlansAndModules]);

  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(null); setError(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) =>
      u.username?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.company?.toLowerCase().includes(q) ||
      u.emailid?.toLowerCase().includes(q) ||
      u.number?.includes(q) ||
      String(u.userId).includes(q)
    );
  }, [users, searchQuery]);

  const USERS_PAGE_SIZE = 6;
  const [usersPage, setUsersPage] = useState(1);
  const usersTotalPages = Math.ceil(filteredUsers.length / USERS_PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((usersPage - 1) * USERS_PAGE_SIZE, usersPage * USERS_PAGE_SIZE);

  // Reset page on search
  useEffect(() => { setUsersPage(1); }, [searchQuery]);

  const handleCreateUser = async () => {
    if (!user || !token) return;
    if (!createForm.username || !createForm.password || !createForm.name || !createForm.emailid) {
      setError("Please fill in all required fields.");
      return;
    }
    setCreating(true);
    clearMessages();
    try {
      const res = await registerUser({
        username: createForm.username, password: createForm.password,
        planId: createForm.planId, name: createForm.name, emailid: createForm.emailid,
        number: createForm.number, address: createForm.address, company: createForm.company,
        pincode: createForm.pincode, parent: user.id, accountType: createForm.accountType,
        userType: "user", expiryDate: `${createForm.expiryDate} 23:59:59`, auth_token: token,
        groupRows: JSON.stringify({ groupsList: [{ groupId: "34", groupName: "BLR_ALL" }] }),
        locationRows: JSON.stringify({ locationsList: [{ locationId: "3", locationName: "Bangalore" }] }),
        moduleId: createForm.moduleId, planType: "0",
      });
      setSuccess(res.message || `User "${createForm.username}" created.`);
      setShowCreateModal(false);
      setCreateForm({ ...emptyForm });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = async (u: AdminUser) => {
    setEditingUser(u);
    setEditLoading(true);
    setEditForm({
      username: u.username, password: "", name: u.name || "", emailid: u.emailid || "",
      number: u.number || "", company: u.company || "", address: "", pincode: "",
      planId: u.planId?.toString() || "", accountType: u.accountType?.toString() || "0",
      moduleId: "", expiryDate: u.expiryDate ? u.expiryDate.split(" ")[0] : "2027-12-31",
    });
    clearMessages();
    try {
      const profile = await fetchUserProfile(String(u.userId));
      if (profile && typeof profile === "object") {
        setEditForm((f) => ({
          ...f,
          address: (profile.address as string) || "",
          pincode: profile.pincode ? String(profile.pincode) : "",
          planId: profile.planId ? String(profile.planId) : f.planId,
        }));
      }
    } catch { /* silent */ } finally { setEditLoading(false); }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !user) return;
    setUpdating(true);
    clearMessages();
    try {
      const res = await updateUserProfile({
        userId: editingUser.userId,
        username: editingUser.username,
        password: editingUser.username,
        parent: user.id,
        name: editForm.name,
        emailid: editForm.emailid,
        number: editForm.number,
        company: editForm.company,
        address: editForm.address || "NA",
        pincode: editForm.pincode || "000000",
        planId: editForm.planId,
        accountType: editForm.accountType,
        expiryDate: `${editForm.expiryDate} 23:59:59`,
        userType: "user",
        groupRows: JSON.stringify({ groupsList: [{ groupId: "34", groupName: "BLR_ALL" }] }),
        locationRows: JSON.stringify({ locationsList: [{ locationId: "3", locationName: "Bangalore" }] }),
        moduleId: "1",
        planType: "0",
      });
      setSuccess(res.message || `User "${editingUser.username}" updated.`);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const handleCreditAction = async (action: "add" | "remove") => {
    if (!creditUser || !user || !creditAmount) return;
    const amt = parseFloat(creditAmount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid positive amount."); return; }
    setCreditAction(true);
    clearMessages();
    try {
      const res = action === "add"
        ? await addCredits(creditUser.userId, user.id, creditAmount)
        : await removeCredits(creditUser.userId, user.id, creditAmount);
      setSuccess(res.message || `Credits ${action === "add" ? "added to" : "removed from"} ${creditUser.username}.`);
      setCreditUser(null);
      setCreditAmount("");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} credits`);
    } finally { setCreditAction(false); }
  };

  const handleToggleAccountType = async (u: AdminUser) => {
    setTogglingType(u.userId);
    clearMessages();
    try {
      const newType = u.accountType === 0 ? "1" : "0";
      const res = await changeAccountType(u.userId.toString(), newType);
      setSuccess(res.message || `Account type changed.`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change account type");
    } finally {
      setTogglingType(null);
    }
  };

  const fmtDate = (s: string) => {
    if (!s) return "N/A";
    try { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return s; }
  };

  const fmtCredits = (n: number) => (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // Plan select options for modals
  const planOptions = plans.map((p) => (
    <option key={p.planId} value={p.planId.toString()}>
      {p.planName} ({p.pulseDuration}s pulse)
    </option>
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted mt-1">Manage users under your reseller account</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadUsers} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card-hover transition-all disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => { setCreateForm({ ...emptyForm }); clearMessages(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-danger/25 text-sm">
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 px-5 py-4 bg-success/10 border border-success/20 rounded-xl text-success">
          <Check className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-danger/10 border border-danger/20 rounded-xl text-danger">
          <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini icon={<Users className="w-4 h-4" />} label="Total Users" value={users.length} color="text-primary" bg="bg-primary/10" />
        <StatMini icon={<Hash className="w-4 h-4" />} label="Promotional" value={users.filter((u) => u.accountType === 0).length} color="text-secondary" bg="bg-secondary/10" />
        <StatMini icon={<Hash className="w-4 h-4" />} label="Transactional" value={users.filter((u) => u.accountType === 1).length} color="text-accent" bg="bg-accent/10" />
        <StatMini icon={<Wallet className="w-4 h-4" />} label="Total Credits" value={users.reduce((s, u) => s + (u.credits ?? 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} color="text-success" bg="bg-success/10" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, username, email, phone, or user ID..."
          className="w-full pl-11 pr-10 py-3 border border-border rounded-2xl bg-card text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all text-sm" />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground rounded-lg hover:bg-surface">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-card rounded-2xl border border-border">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center">
            {searchQuery ? <Search className="w-6 h-6 text-muted" /> : <Users className="w-6 h-6 text-muted" />}
          </div>
          <p className="text-sm text-muted">{searchQuery ? `No users matching "${searchQuery}"` : "No users found"}</p>
          {searchQuery && <button onClick={() => setSearchQuery("")} className="text-sm text-primary font-medium hover:underline">Clear search</button>}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted">
            {filteredUsers.length === users.length ? `${users.length} users` : `${filteredUsers.length} of ${users.length} users`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paginatedUsers.map((u) => (
              <div key={u.userId} className="bg-card rounded-2xl border border-border p-5 hover:border-danger/20 hover:shadow-lg transition-all duration-300 group">
                {/* Top row: avatar, name, badges, actions */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-danger to-accent-warm flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase() || u.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">{u.name || u.username}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          u.accountType === 0 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                        }`}>
                          {u.accountType === 0 ? "Promo" : "Trans"}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 truncate">@{u.username} · #{u.userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setCreditUser(u); setCreditAmount(""); clearMessages(); }} title="Add / Remove Credits"
                      className="p-2 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-colors opacity-60 group-hover:opacity-100">
                      <Wallet className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPasswordUser(u)} title="Password Info"
                      className="p-2 rounded-lg text-muted hover:text-accent-warm hover:bg-accent-warm/10 transition-colors opacity-60 group-hover:opacity-100">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(u)} title="Edit"
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-60 group-hover:opacity-100">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleAccountType(u)} disabled={togglingType === u.userId}
                      title={`Switch to ${u.accountType === 0 ? "Transactional" : "Promotional"}`}
                      className="p-2 rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-50 opacity-60 group-hover:opacity-100">
                      {togglingType === u.userId ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <InfoItem icon={<Wallet className="w-3.5 h-3.5" />} label="Credits" value={fmtCredits(u.credits)} valueClass="text-success font-semibold" />
                  <InfoItem icon={<Wallet className="w-3.5 h-3.5" />} label="Spent" value={`${fmtCredits(usageMap[u.userId] ?? 0)}`} valueClass="text-danger font-medium" />
                  <InfoItem icon={<Building className="w-3.5 h-3.5" />} label="Company" value={u.company?.trim() || "-"} />
                  <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Expiry" value={fmtDate(u.expiryDate)} />
                  {u.emailid && <InfoItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={u.emailid} colSpan />}
                  {u.planName && <InfoItem icon={<Hash className="w-3.5 h-3.5" />} label="Plan" value={u.planName} colSpan />}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {usersTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card rounded-2xl border border-border px-6 py-4">
              <p className="text-xs text-muted">Showing {(usersPage - 1) * USERS_PAGE_SIZE + 1}&ndash;{Math.min(usersPage * USERS_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setUsersPage(1)} disabled={usersPage === 1} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">First</button>
                <button onClick={() => setUsersPage((p) => Math.max(1, p - 1))} disabled={usersPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                {(() => { const tp = usersTotalPages; const pages: (number | "dots")[] = []; if (tp <= 7) { for (let i = 1; i <= tp; i++) pages.push(i); } else { pages.push(1); if (usersPage > 3) pages.push("dots"); for (let i = Math.max(2, usersPage - 1); i <= Math.min(tp - 1, usersPage + 1); i++) pages.push(i); if (usersPage < tp - 2) pages.push("dots"); pages.push(tp); } return pages.map((page, idx) => page === "dots" ? <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span> : <button key={page} onClick={() => setUsersPage(page)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${usersPage === page ? "bg-gradient-to-r from-danger to-accent-warm text-white shadow-lg shadow-danger/25" : "text-muted hover:text-foreground hover:bg-surface"}`}>{page}</button>); })()}
                <button onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))} disabled={usersPage === usersTotalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                <button onClick={() => setUsersPage(usersTotalPages)} disabled={usersPage === usersTotalPages} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">Last</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Credit Modal ── */}
      {creditUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Manage Credits</h3>
                <p className="text-sm text-muted mt-0.5">
                  {creditUser.name || creditUser.username} <span className="font-mono text-xs">#{creditUser.userId}</span>
                </p>
              </div>
              <button onClick={() => setCreditUser(null)} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current balance */}
            <div className="flex items-center gap-3 p-4 bg-surface rounded-xl mb-5">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Current Balance</p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {(creditUser.credits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </p>
              </div>
            </div>

            {/* Amount input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">Credit Amount</label>
              <input type="number" min="0" step="any" value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter amount"
                className={INPUT_CLASS} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={() => handleCreditAction("add")}
                disabled={creditAction || !creditAmount}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-success text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm">
                {creditAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Credits
              </button>
              <button onClick={() => handleCreditAction("remove")}
                disabled={creditAction || !creditAmount}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm">
                {creditAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                Remove Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Password Info Modal ── */}
      {passwordUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Password Info</h3>
                <p className="text-sm text-muted mt-0.5">
                  {passwordUser.name || passwordUser.username} <span className="font-mono text-xs">#{passwordUser.userId}</span>
                </p>
              </div>
              <button onClick={() => setPasswordUser(null)} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent-warm/10 border border-accent-warm/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-accent-warm shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Password cannot be changed</p>
                <p className="text-muted text-xs leading-relaxed">
                  The OBD3 API does not support password changes for existing users. To reset a password, the user must be deleted and re-created with a new password. Contact the platform administrator for assistance.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setPasswordUser(null)}
                className="w-full py-3 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card-hover transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <Modal title="Create New User" subtitle="Fill in details to register a new user" onClose={() => setShowCreateModal(false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Username *" value={createForm.username} onChange={(v) => setCreateForm((f) => ({ ...f, username: v }))} placeholder="Enter username" />
            <Field label="Password *" value={createForm.password} onChange={(v) => setCreateForm((f) => ({ ...f, password: v }))} placeholder="Min 8 characters" type="password" />
            <Field label="Full Name *" value={createForm.name} onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))} placeholder="John Doe" />
            <Field label="Email *" value={createForm.emailid} onChange={(v) => setCreateForm((f) => ({ ...f, emailid: v }))} placeholder="user@example.com" type="email" />
            <Field label="Phone" value={createForm.number} onChange={(v) => setCreateForm((f) => ({ ...f, number: v }))} placeholder="9876543210" />
            <Field label="Company" value={createForm.company} onChange={(v) => setCreateForm((f) => ({ ...f, company: v }))} placeholder="Company name" />
            <div className="md:col-span-2">
              <Field label="Address" value={createForm.address} onChange={(v) => setCreateForm((f) => ({ ...f, address: v }))} placeholder="Street address, City" />
            </div>
            <Field label="Pincode" value={createForm.pincode} onChange={(v) => setCreateForm((f) => ({ ...f, pincode: v }))} placeholder="560001" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
              <select value={createForm.planId} onChange={(e) => setCreateForm((f) => ({ ...f, planId: e.target.value }))} className={INPUT_CLASS}>
                <option value="">Select a plan</option>
                {planOptions}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Account Type</label>
              <select value={createForm.accountType} onChange={(e) => setCreateForm((f) => ({ ...f, accountType: e.target.value }))} className={INPUT_CLASS}>
                <option value="0">Promotional</option>
                <option value="1">Transactional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Module</label>
              <select value={createForm.moduleId} onChange={(e) => setCreateForm((f) => ({ ...f, moduleId: e.target.value }))} className={INPUT_CLASS}>
                <option value="">Select a module</option>
                {modules.map((m) => <option key={m.moduleId} value={m.moduleId.toString()}>{m.moduleName}</option>)}
              </select>
            </div>
            <Field label="Expiry Date" value={createForm.expiryDate} onChange={(v) => setCreateForm((f) => ({ ...f, expiryDate: v }))} type="date" />
          </div>
          <ModalFooter onCancel={() => setShowCreateModal(false)} onSubmit={handleCreateUser} loading={creating} submitLabel="Create User" submitIcon={<Plus className="w-4 h-4" />} />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editingUser && (
        <Modal title="Edit User" subtitle={<>Updating <span className="font-medium text-foreground">{editingUser.username}</span> <span className="font-mono text-xs">#{editingUser.userId}</span></>} onClose={() => setEditingUser(null)}>
          {editLoading && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading profile details...
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" value={editForm.name} onChange={(v) => setEditForm((f) => ({ ...f, name: v }))} placeholder="Full name" />
            <Field label="Email" value={editForm.emailid} onChange={(v) => setEditForm((f) => ({ ...f, emailid: v }))} placeholder="user@example.com" type="email" />
            <Field label="Phone" value={editForm.number} onChange={(v) => setEditForm((f) => ({ ...f, number: v }))} placeholder="Phone number" />
            <Field label="Company" value={editForm.company} onChange={(v) => setEditForm((f) => ({ ...f, company: v }))} placeholder="Company name" />
            <div className="md:col-span-2">
              <Field label="Address" value={editForm.address} onChange={(v) => setEditForm((f) => ({ ...f, address: v }))} placeholder={editLoading ? "Loading..." : "Street address"} />
            </div>
            <Field label="Pincode" value={editForm.pincode} onChange={(v) => setEditForm((f) => ({ ...f, pincode: v }))} placeholder={editLoading ? "Loading..." : "Pincode"} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
              <select value={editForm.planId} onChange={(e) => setEditForm((f) => ({ ...f, planId: e.target.value }))} className={INPUT_CLASS}>
                <option value="">Select a plan</option>
                {planOptions}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Account Type</label>
              <select value={editForm.accountType} onChange={(e) => setEditForm((f) => ({ ...f, accountType: e.target.value }))} className={INPUT_CLASS}>
                <option value="0">Promotional</option>
                <option value="1">Transactional</option>
              </select>
            </div>
            <Field label="Expiry Date" value={editForm.expiryDate} onChange={(v) => setEditForm((f) => ({ ...f, expiryDate: v }))} type="date" />
          </div>
          <ModalFooter onCancel={() => setEditingUser(null)} onSubmit={handleUpdateUser} loading={updating} submitLabel="Save Changes" submitIcon={<Check className="w-4 h-4" />} />
        </Modal>
      )}
    </div>
  );
}

/* ── Reusable Components ── */

function StatMini({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>{icon}</div>
      <div>
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, valueClass, colSpan }: { icon: React.ReactNode; label: string; value: string; valueClass?: string; colSpan?: boolean }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${colSpan ? "col-span-2" : ""}`}>
      <span className="text-muted shrink-0">{icon}</span>
      <span className="text-[11px] text-muted shrink-0">{label}:</span>
      <span className={`text-xs truncate ${valueClass || "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_CLASS} />
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onSubmit, loading, submitLabel, submitIcon }: { onCancel: () => void; onSubmit: () => void; loading: boolean; submitLabel: string; submitIcon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
      <button onClick={onCancel} disabled={loading}
        className="px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card-hover transition-all disabled:opacity-60">
        Cancel
      </button>
      <button onClick={onSubmit} disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-danger to-accent-warm text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-danger/25 text-sm disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>{submitIcon} {submitLabel}</>}
      </button>
    </div>
  );
}
