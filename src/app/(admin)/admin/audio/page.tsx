"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchUsers, fetchAllPrompts } from "@/services/admin.service";
import type { AdminUser, Prompt } from "@/types";
import { Pagination } from "@/components/pagination";
import {
  Music,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Inbox,
  Search,
  Play,
  Pause,
  Square,
  Trash2,
  Download,
} from "lucide-react";

const PAGE_SIZE = 5;

function statusLabel(status: number) {
  switch (status) {
    case 1: return "Approved";
    case 2: return "Rejected";
    case 9: return "Deleted";
    default: return "Pending";
  }
}

function statusStyle(status: number) {
  switch (status) {
    case 1: return "bg-success/10 text-success border-success/20";
    case 2: return "bg-danger/10 text-danger border-danger/20";
    case 9: return "bg-muted/10 text-muted border-border";
    default: return "bg-accent-warm/10 text-accent-warm border-accent-warm/20";
  }
}

function StatusIcon({ status }: { status: number }) {
  switch (status) {
    case 1: return <CheckCircle className="w-3.5 h-3.5" />;
    case 2: return <XCircle className="w-3.5 h-3.5" />;
    case 9: return <Trash2 className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
}

export default function AdminAudioPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Audio player
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadData = useCallback(async () => {
    const userId = user?.id;
    if (!userId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const usersRes = await fetchUsers(userId);
      const usersList: AdminUser[] = Array.isArray(usersRes) ? usersRes : [];

      const promptResults = await Promise.allSettled(
        usersList.map((u) => fetchAllPrompts(String(u.userId)))
      );

      const allPrompts: Prompt[] = [];
      for (const result of promptResults) {
        if (result.status === "fulfilled" && Array.isArray(result.value)) {
          allPrompts.push(...result.value);
        }
      }

      allPrompts.sort((a, b) => b.promptId - a.promptId);
      setPrompts(allPrompts);
    } catch {
      setError("Failed to load audio files. Please try again.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (user?.id && token) loadData();
  }, [user?.id, token, loadData]);

  // Filtering
  const filtered = prompts.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.username || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || String(p.promptStatus) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Stats
  const pendingCount = prompts.filter((p) => p.promptStatus === 0).length;
  const approvedCount = prompts.filter((p) => p.promptStatus === 1).length;
  const rejectedCount = prompts.filter((p) => p.promptStatus === 2).length;
  const deletedCount = prompts.filter((p) => p.promptStatus === 9).length;

  // Audio functions
  function playAudio(prompt: Prompt) {
    if (!prompt.promptUrl) return;
    if (playingId === prompt.promptId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(prompt.promptUrl);
    audioRef.current = audio;
    setPlayingId(prompt.promptId);
    setAudioProgress(0);
    setAudioDuration(prompt.promptDuration || 0);

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setAudioDuration(audio.duration);
      }
    });
    audio.addEventListener("ended", () => { setPlayingId(null); setAudioProgress(0); });
    audio.addEventListener("error", () => { setPlayingId(null); setAudioProgress(0); });
    audio.play().catch(() => setPlayingId(null));
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingId(null);
    setAudioProgress(0);
  }

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audio Files</h2>
          <p className="text-muted mt-1">Manage audio prompts across all users</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && !loaded && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-danger animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl px-6 py-4 flex items-center justify-between">
          <p className="text-danger text-sm">{error}</p>
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger hover:bg-danger/20 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Retry
          </button>
        </div>
      )}

      {/* Stats */}
      {(loaded || (loading && prompts.length > 0)) && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", count: prompts.length, icon: <Music className="w-5 h-5" />, color: "primary" },
            { label: "Pending", count: pendingCount, icon: <Clock className="w-5 h-5" />, color: "accent-warm" },
            { label: "Approved", count: approvedCount, icon: <CheckCircle className="w-5 h-5" />, color: "success" },
            { label: "Rejected", count: rejectedCount, icon: <XCircle className="w-5 h-5" />, color: "danger" },
            { label: "Deleted", count: deletedCount, icon: <Trash2 className="w-5 h-5" />, color: "muted" },
          ].map((s) => (
            <div key={s.label} className={`p-4 bg-card rounded-2xl border border-border hover:border-${s.color}/20 hover:shadow-lg transition-all duration-300`}>
              <div className={`w-9 h-9 rounded-xl bg-${s.color}/10 flex items-center justify-center text-${s.color} mb-3`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Table */}
      {(loaded || (loading && prompts.length > 0)) && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-6 py-4 border-b border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by file name or username..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-danger/30 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="1">Approved</option>
              <option value="0">Pending</option>
              <option value="2">Rejected</option>
              <option value="9">Deleted</option>
            </select>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <Inbox className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No audio files found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface text-muted">
                    <th className="px-4 py-3.5 font-medium text-center w-16">Play</th>
                    <th className="px-4 py-3.5 font-medium text-left">File Name</th>
                    <th className="px-4 py-3.5 font-medium text-left hide-mobile">Category</th>
                    <th className="px-4 py-3.5 font-medium text-left">Username</th>
                    <th className="px-4 py-3.5 font-medium text-left hide-mobile">Duration</th>
                    <th className="px-4 py-3.5 font-medium text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((prompt) => {
                    const isPlaying = playingId === prompt.promptId;
                    const hasUrl = !!prompt.promptUrl;
                    return (
                      <tr
                        key={`${prompt.promptId}-${prompt.userId}`}
                        className={`border-t border-border transition-colors ${isPlaying ? "bg-primary/5" : "hover:bg-card-hover"}`}
                      >
                        <td className="px-4 py-3 text-center">
                          {hasUrl ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => playAudio(prompt)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                  isPlaying
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                                title={isPlaying ? "Pause" : "Play"}
                              >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>
                              {isPlaying && (
                                <button
                                  onClick={stopAudio}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                                  title="Stop"
                                >
                                  <Square className="w-3 h-3" />
                                </button>
                              )}
                              <a
                                href={prompt.promptUrl}
                                download={prompt.fileName || "audio"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-success/10 text-success hover:bg-success/20 transition-all"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted/30"><Music className="w-4 h-4 mx-auto" /></span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <span className="font-medium text-foreground block truncate max-w-[180px] md:max-w-none">
                              {prompt.fileName}
                            </span>
                            {isPlaying && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                                </div>
                                <span className="text-[11px] text-muted tabular-nums shrink-0">
                                  {formatDuration(audioRef.current?.currentTime ?? 0)} / {formatDuration(audioDuration)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hide-mobile">
                          <span className="capitalize text-muted">{prompt.promptCategory || "\u2014"}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {prompt.username || `User #${prompt.userId}`}
                        </td>
                        <td className="px-4 py-3 hide-mobile">
                          <span className="text-muted tabular-nums">
                            {prompt.promptDuration ? formatDuration(prompt.promptDuration) : "\u2014"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyle(prompt.promptStatus)}`}>
                            <StatusIcon status={prompt.promptStatus} />
                            {statusLabel(prompt.promptStatus)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              activeClass="bg-gradient-to-br from-danger to-accent-warm text-white shadow-lg"
            />
            </>
          )}
        </div>
      )}
    </div>
  );
}
