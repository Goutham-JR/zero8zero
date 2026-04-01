"use client";

import { useEffect, useState, useCallback } from "react";
import { getUserId } from "@/services/api";
import { apiGet, apiPost } from "@/services/api";
import {
  Plus,
  Users,
  Trash2,
  Phone,
  Loader2,
  Inbox,
  RefreshCw,
  AlertCircle,
  X,
  Pencil,
  Save,
} from "lucide-react";

interface AgentItem {
  agentId: number;
  agentName: string;
  agentNumber: string;
  loginStatus: number;
  callStatus: number;
  groupId: number;
  userId: number;
  agentType?: string;
}

interface AgentGroupItem {
  groupId: number;
  groupName: string;
  userId: string;
  groupStatus: number;
  reqestDate: string;
  agents: AgentItem[];
}

const INPUT_CLASS =
  "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

const AGENT_TYPES = [
  { value: "0", label: "Normal Agent" },
  { value: "1", label: "Call Centre Agent" },
];

export default function AgentGroupsPage() {
  const userId = getUserId();

  const [groups, setGroups] = useState<AgentGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupsPage, setGroupsPage] = useState(1);
  const GROUPS_PAGE_SIZE = 4;

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [agents, setAgents] = useState<{ name: string; phone: string; agentType: string }[]>([
    { name: "", phone: "", agentType: "0" },
  ]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit
  const [editingGroup, setEditingGroup] = useState<AgentGroupItem | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editAgents, setEditAgents] = useState<{ agentId?: number; name: string; phone: string; agentType?: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(group: AgentGroupItem) {
    setEditingGroup(group);
    setEditGroupName(group.groupName);
    setEditAgents(
      group.agents.map((a) => ({ agentId: a.agentId, name: a.agentName, phone: a.agentNumber, agentType: a.agentType || "0" }))
    );
    setEditError(null);
  }

  function cancelEdit() {
    setEditingGroup(null);
    setEditGroupName("");
    setEditAgents([]);
    setEditError(null);
  }

  function addEditAgentField() {
    setEditAgents([...editAgents, { name: "", phone: "", agentType: "0" }]);
  }

  function removeEditAgentField(idx: number) {
    setEditAgents(editAgents.filter((_, i) => i !== idx));
  }

  function updateEditAgent(idx: number, field: "name" | "phone" | "agentType", value: string) {
    if (field === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    const updated = [...editAgents];
    updated[idx][field] = value;
    setEditAgents(updated);
  }

  async function handleSaveEdit() {
    if (!editingGroup || !editGroupName.trim()) return;
    const validAgents = editAgents.filter((a) => a.name.trim() && a.phone.trim() && a.phone.length === 10);
    if (validAgents.length === 0) return;

    setSaving(true);
    setEditError(null);
    try {
      await apiPost<{ message: string }>("/api/obd/edit/group/agent", {
        userId,
        groupName: editGroupName.trim(),
        agents: validAgents.map((a) => ({
          ...(a.agentId ? { agentId: a.agentId } : {}),
          agentName: a.name.trim(),
          agentNumber: a.phone.trim(),
          agentType: a.agentType || "0",
          groupId: editingGroup.groupId,
        })),
        groupId: String(editingGroup.groupId),
      });
      cancelEdit();
      loadGroups();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setSaving(false);
    }
  }

  const loadGroups = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<AgentGroupItem[]>(`/api/obd/group/agent/list/${userId}`);
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const addAgentField = () => setAgents([...agents, { name: "", phone: "", agentType: "0" }]);

  const removeAgentField = (idx: number) =>
    setAgents(agents.filter((_, i) => i !== idx));

  const updateAgent = (idx: number, field: "name" | "phone" | "agentType", value: string) => {
    if (field === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    const updated = [...agents];
    updated[idx][field] = value;
    setAgents(updated);
  };

  async function handleCreate() {
    if (!groupName.trim()) return;
    const validAgents = agents.filter((a) => a.name.trim() && a.phone.trim() && a.phone.length === 10);
    if (validAgents.length === 0) return;

    setCreating(true);
    setCreateError(null);
    try {
      await apiPost<{ message: string }>("/api/obd/add/group/agent", {
        userId,
        groupName: groupName.trim(),
        agents: validAgents.map((a) => ({
          agentName: a.name.trim(),
          agentNumber: a.phone.trim(),
          agentType: a.agentType || "0",
        })),
      });
      setGroupName("");
      setAgents([{ name: "", phone: "", agentType: "0" }]);
      setShowForm(false);
      loadGroups();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(groupId: number) {
    setDeletingId(groupId);
    try {
      const res = await fetch(
        `https://obd3api.expressivr.com/api/obd/group/agent/${groupId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${
              (await import("@/store/auth-store")).useAuthStore.getState().token
            }`,
          },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      setGroups((prev) => prev.filter((g) => g.groupId !== groupId));
    } catch {
      // Refresh list to get actual state
      loadGroups();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agent Groups</h2>
          <p className="text-muted mt-1">
            {loading ? "Loading..." : `${groups.length} group${groups.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadGroups}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card-hover transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Close" : "New Group"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Create Agent Group</h3>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Group Name</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="e.g. Sales Team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">Agents</label>
            <div className="space-y-3">
              {agents.map((agent, idx) => (
                <div key={idx} className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
                  <input
                    value={agent.name}
                    onChange={(e) => updateAgent(idx, "name", e.target.value)}
                    className="flex-1 min-w-[120px] px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                    placeholder="Agent name"
                  />
                  <input
                    value={agent.phone}
                    onChange={(e) => updateAgent(idx, "phone", e.target.value)}
                    className="flex-1 min-w-[120px] px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                    placeholder="9876543210"
                    inputMode="numeric"
                  />
                  <select
                    value={agent.agentType}
                    onChange={(e) => updateAgent(idx, "agentType", e.target.value)}
                    className="px-3 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                  >
                    {AGENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {agents.length > 1 && (
                    <button
                      onClick={() => removeAgentField(idx)}
                      className="p-2 text-muted hover:text-danger transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addAgentField}
              className="mt-3 text-sm text-primary font-semibold hover:underline"
            >
              + Add another agent
            </button>
          </div>

          {createError && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {createError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !groupName.trim() || !agents.some((a) => a.name.trim() && a.phone.length === 10)}
              className="px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
            <button
              onClick={() => { setShowForm(false); setCreateError(null); }}
              className="px-6 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading / Error / Empty */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted">Loading agent groups...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <p className="text-sm text-danger font-medium">{error}</p>
          <button onClick={loadGroups} className="mt-2 text-sm text-primary font-medium hover:underline">
            Try again
          </button>
        </div>
      ) : groups.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-muted opacity-40" />
          </div>
          <p className="text-sm font-medium text-muted">No agent groups yet</p>
          <p className="text-xs text-muted mt-1">Create a group to use in Call Patch campaigns</p>
        </div>
      ) : (
        /* Group Cards */
        <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.slice((groupsPage - 1) * GROUPS_PAGE_SIZE, groupsPage * GROUPS_PAGE_SIZE).map((group) => {
            const isEditing = editingGroup?.groupId === group.groupId;

            if (isEditing) {
              return (
                <div
                  key={group.groupId}
                  className="bg-card rounded-2xl border-2 border-primary/40 p-6 shadow-lg shadow-primary/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-primary" /> Edit Group
                    </h3>
                    <button
                      onClick={cancelEdit}
                      className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground">Group Name</label>
                    <input
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Agents</label>
                    <div className="space-y-2.5">
                      {editAgents.map((agent, idx) => (
                        <div key={idx} className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                          <input
                            value={agent.name}
                            onChange={(e) => updateEditAgent(idx, "name", e.target.value)}
                            className="flex-1 min-w-[100px] px-3 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                            placeholder="Agent name"
                          />
                          <input
                            value={agent.phone}
                            onChange={(e) => updateEditAgent(idx, "phone", e.target.value)}
                            className="flex-1 min-w-[100px] px-3 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                            placeholder="9876543210"
                            inputMode="numeric"
                          />
                          <select
                            value={agent.agentType || "0"}
                            onChange={(e) => updateEditAgent(idx, "agentType", e.target.value)}
                            className="px-3 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                          >
                            {AGENT_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          {editAgents.length > 1 && (
                            <button
                              onClick={() => removeEditAgentField(idx)}
                              className="p-2 text-muted hover:text-danger transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addEditAgentField}
                      className="mt-2.5 text-sm text-primary font-semibold hover:underline"
                    >
                      + Add another agent
                    </button>
                  </div>

                  {editError && (
                    <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {editError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving || !editGroupName.trim() || !editAgents.some((a) => a.name.trim() && a.phone.length === 10)}
                      className="px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Changes</>
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={group.groupId}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{group.groupName}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        {group.agents.length} agent{group.agents.length !== 1 ? "s" : ""}
                        {group.reqestDate && (
                          <> &middot; {new Date(group.reqestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(group)}
                      disabled={editingGroup !== null}
                      className="p-2.5 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30"
                      title="Edit group"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.groupId)}
                      disabled={deletingId === group.groupId}
                      className="p-2.5 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
                      title="Delete group"
                    >
                      {deletingId === group.groupId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.agents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className="flex items-center justify-between py-2.5 px-4 bg-surface rounded-xl text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {agent.agentName[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-foreground">{agent.agentName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          agent.agentType === "1" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                        }`}>
                          {agent.agentType === "1" ? "Call Centre" : "Normal"}
                        </span>
                        <span className="text-muted font-mono text-xs flex items-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          {agent.agentNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {(() => {
          const tp = Math.ceil(groups.length / GROUPS_PAGE_SIZE);
          if (tp <= 1) return null;
          return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card rounded-2xl border border-border px-6 py-4">
              <p className="text-xs text-muted">Showing {(groupsPage - 1) * GROUPS_PAGE_SIZE + 1}&ndash;{Math.min(groupsPage * GROUPS_PAGE_SIZE, groups.length)} of {groups.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setGroupsPage(1)} disabled={groupsPage === 1} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">First</button>
                <button onClick={() => setGroupsPage((p) => Math.max(1, p - 1))} disabled={groupsPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                {(() => { const pages: (number | "dots")[] = []; if (tp <= 7) { for (let i = 1; i <= tp; i++) pages.push(i); } else { pages.push(1); if (groupsPage > 3) pages.push("dots"); for (let i = Math.max(2, groupsPage - 1); i <= Math.min(tp - 1, groupsPage + 1); i++) pages.push(i); if (groupsPage < tp - 2) pages.push("dots"); pages.push(tp); } return pages.map((page, idx) => page === "dots" ? <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span> : <button key={page} onClick={() => setGroupsPage(page)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${groupsPage === page ? "gradient-bg text-white shadow-lg shadow-primary/25" : "text-muted hover:text-foreground hover:bg-surface"}`}>{page}</button>); })()}
                <button onClick={() => setGroupsPage((p) => Math.min(tp, p + 1))} disabled={groupsPage === tp} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                <button onClick={() => setGroupsPage(tp)} disabled={groupsPage === tp} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">Last</button>
              </div>
            </div>
          );
        })()}
        </div>
      )}
    </div>
  );
}
