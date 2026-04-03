"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Music,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  FileAudio,
  X,
  Search,
  Trash2,
  Play,
  Pause,
  Square,
  Download,
} from "lucide-react";
import { fetchPrompts, uploadVoiceFile } from "@/services/audio.service";
import { getUserId } from "@/services/api";
import type { Prompt } from "@/types";

const PROMPT_CATEGORIES = [
  { value: "welcome", label: "Welcome" },
  { value: "menu", label: "Menu" },
  { value: "noinput", label: "No Input" },
  { value: "wronginput", label: "Wrong Input" },
  { value: "noagent", label: "No Agent" },
  { value: "thanks", label: "Thanks" },
] as const;

const ACCEPTED_TYPES = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3"];
const ACCEPTED_EXTENSIONS = [".wav", ".mp3"];

const FILE_TYPES = [
  { value: "wav", label: "WAV" },
  { value: "mp3", label: "MP3" },
] as const;

function statusLabel(status: number) {
  switch (status) {
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    case 9:
      return "Deleted";
    default:
      return "Pending";
  }
}

function statusIcon(status: number) {
  switch (status) {
    case 1:
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 2:
      return <XCircle className="w-4 h-4 text-danger" />;
    case 9:
      return <Trash2 className="w-4 h-4 text-muted" />;
    default:
      return <Clock className="w-4 h-4 text-accent-warm" />;
  }
}

function statusStyle(status: number) {
  switch (status) {
    case 1:
      return "bg-success/10 text-success border-success/20";
    case 2:
      return "bg-danger/10 text-danger border-danger/20";
    case 9:
      return "bg-muted/10 text-muted border-border";
    default:
      return "bg-accent-warm/10 text-accent-warm border-accent-warm/20";
  }
}

export default function AudioLibraryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch = !searchQuery || p.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.promptCategory === filterCategory;
    const matchesStatus = filterStatus === "all" || String(p.promptStatus) === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPrompts.length / PAGE_SIZE);
  const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  // Audio player
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playAudio(prompt: Prompt) {
    if (!prompt.promptUrl) return;

    // If same audio is playing, pause it
    if (playingId === prompt.promptId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    // Stop any current audio
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

    audio.addEventListener("ended", () => {
      setPlayingId(null);
      setAudioProgress(0);
    });

    audio.addEventListener("error", () => {
      setPlayingId(null);
      setAudioProgress(0);
    });

    audio.play().catch(() => {
      setPlayingId(null);
    });
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [promptCategory, setPromptCategory] = useState("welcome");
  const [fileType, setFileType] = useState("wav");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadPrompts = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const data = await fetchPrompts(userId);
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => b.promptId - a.promptId);
      setPrompts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleUpload = async () => {
    if (!file || !fileName.trim()) return;

    const userId = getUserId();
    if (!userId) {
      setUploadError("User not authenticated");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      await uploadVoiceFile(userId, file, fileName.trim(), promptCategory, fileType);
      // Reset form
      setFile(null);
      setFileName("");
      setPromptCategory("welcome");
      setFileType("wav");
      setShowUpload(false);
      // Refresh list
      await loadPrompts();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function isValidAudioFile(f: File): boolean {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(`.${ext}`) || ACCEPTED_TYPES.includes(f.type);
  }

  function handleFileSelect(f: File | null) {
    if (!f) return;
    if (!isValidAudioFile(f)) {
      setUploadError("Only .wav and .mp3 files are allowed.");
      return;
    }
    setUploadError(null);
    setFile(f);
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "mp3") setFileType("mp3");
    else setFileType("wav");
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(droppedFile);
  };

  const inputClass =
    "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  const selectClass =
    "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Audio Library</h2>
          <p className="text-muted mt-1">
            {loading
              ? "Loading..."
              : filteredPrompts.length === prompts.length
              ? `${prompts.length} audio file${prompts.length !== 1 ? "s" : ""}`
              : `${filteredPrompts.length} of ${prompts.length} audio files`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPrompts}
            disabled={loading}
            className="p-2.5 bg-surface border border-border rounded-xl text-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Upload Audio
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Upload New Audio</h3>

          {uploadError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              File Name
            </label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value.replace(/\s+/g, "_"))}
              className={inputClass}
              placeholder="e.g. welcome_greeting"
            />
            <p className="text-xs text-muted mt-1.5">Spaces are replaced with underscores</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Prompt Category
              </label>
              <select
                value={promptCategory}
                onChange={(e) => setPromptCategory(e.target.value)}
                className={selectClass}
              >
                {PROMPT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                File Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className={selectClass}
              >
                {FILE_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Audio File <span className="text-muted font-normal">(WAV or MP3 only)</span>
            </label>
            {file ? (
              <div className="flex items-center gap-3 px-4 py-4 border border-success/30 bg-success/5 rounded-xl text-sm">
                <FileAudio className="w-5 h-5 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB &middot; {fileType.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center gap-3 px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all text-sm ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-surface"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  dragActive ? "bg-primary/10" : "bg-surface"
                }`}>
                  <Upload className={`w-6 h-6 ${dragActive ? "text-primary" : "text-muted"}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${dragActive ? "text-primary" : "text-foreground"}`}>
                    {dragActive ? "Drop your file here" : "Drag & drop your audio file here"}
                  </p>
                  <p className="text-xs text-muted mt-1">or click to browse &middot; WAV, MP3</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,audio/wav,audio/mpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !fileName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              onClick={() => {
                setShowUpload(false);
                setUploadError(null);
              }}
              disabled={uploading}
              className="px-6 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-card rounded-2xl border border-danger/20 p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-danger mx-auto" />
          <p className="text-foreground font-medium">Failed to load audio files</p>
          <p className="text-sm text-muted">{error}</p>
          <button
            onClick={loadPrompts}
            className="mt-2 px-5 py-2 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted text-sm">Loading audio files...</p>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && prompts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          >
            <option value="all">All Categories</option>
            {PROMPT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="1">Approved</option>
            <option value="0">Pending</option>
            <option value="2">Rejected</option>
            <option value="9">Deleted</option>
          </select>
        </div>
      )}

      {/* Prompts Table */}
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {prompts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Music className="w-10 h-10 text-muted mx-auto" />
              <p className="text-foreground font-medium">No audio files yet</p>
              <p className="text-sm text-muted">
                Upload your first audio prompt to get started.
              </p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-muted mx-auto opacity-40" />
              <p className="text-foreground font-medium">No matches found</p>
              <p className="text-sm text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface text-muted">
                  <th className="px-4 py-3.5 font-medium text-center w-16">Play</th>
                  <th className="px-4 py-3.5 font-medium text-left">File Name</th>
                  <th className="px-4 py-3.5 font-medium text-left hide-mobile">Category</th>
                  <th className="px-4 py-3.5 font-medium text-left hide-mobile">Duration</th>
                  <th className="px-4 py-3.5 font-medium text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrompts.map((prompt) => {
                  const isPlaying = playingId === prompt.promptId;
                  const hasUrl = !!prompt.promptUrl;
                  return (
                    <tr
                      key={prompt.promptId}
                      className={`border-t border-border transition-colors ${
                        isPlaying ? "bg-primary/5" : "hover:bg-card-hover"
                      }`}
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
                              {isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
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
                          <span className="text-muted/30">
                            <Music className="w-4 h-4 mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate max-w-[200px] md:max-w-none">
                            {prompt.fileName}
                          </span>
                          {isPlaying && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-300"
                                  style={{ width: `${audioProgress}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-muted tabular-nums shrink-0">
                                {formatDuration(audioRef.current?.currentTime ?? 0)} / {formatDuration(audioDuration)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hide-mobile">
                        <span className="capitalize text-muted">
                          {prompt.promptCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 hide-mobile">
                        <span className="text-muted tabular-nums">
                          {prompt.promptDuration ? formatDuration(prompt.promptDuration) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyle(prompt.promptStatus)}`}
                        >
                          {statusIcon(prompt.promptStatus)}
                          {statusLabel(prompt.promptStatus)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border">
                <p className="text-xs text-muted">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, filteredPrompts.length)} of {filteredPrompts.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {(() => {
                    const pages: (number | "dots")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("dots");
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push("dots");
                      pages.push(totalPages);
                    }
                    return pages.map((page, idx) =>
                      page === "dots" ? (
                        <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                            currentPage === page
                              ? "gradient-bg text-white shadow-lg shadow-primary/25"
                              : "text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    );
                  })()}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
