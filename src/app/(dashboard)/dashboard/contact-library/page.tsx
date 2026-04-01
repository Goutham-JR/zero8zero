"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getUserId } from "@/services/api";
import { uploadBase, fetchBases } from "@/services/audio.service";
import type { BaseItem } from "@/types";
import {
  BookUser,
  Upload,
  Plus,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  FileUp,
  Phone,
  Hash,
  RefreshCw,
} from "lucide-react";

/* ─── Page ─── */

export default function ContactLibraryPage() {
  const userId = getUserId();

  // API-fetched base list
  const [bases, setBases] = useState<BaseItem[]>([]);
  const [basesLoading, setBasesLoading] = useState(true);
  const [basesError, setBasesError] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadBases = useCallback(async () => {
    if (!userId) return;
    setBasesLoading(true);
    setBasesError(null);
    try {
      const data = await fetchBases(userId);
      setBases(Array.isArray(data) ? data : []);
    } catch (err) {
      setBasesError(err instanceof Error ? err.message : "Failed to load contact lists");
    } finally {
      setBasesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBases();
  }, [loadBases]);

  const filtered = [...bases]
    .sort((a, b) => b.baseId - a.baseId)
    .filter(
    (b) =>
      !searchQuery ||
      b.baseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.baseId).includes(searchQuery)
  );

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page on search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // ── File Upload state ──
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Manual Entry state ──
  const [manualName, setManualName] = useState("");
  const [manualText, setManualText] = useState("");
  const [manualUploading, setManualUploading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState(false);


  // ── File helpers ──

  const ACCEPTED = [".csv", ".txt"];

  function isValidFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ACCEPTED.includes(`.${ext}`);
  }

  function handleFileSelect(f: File | null) {
    if (!f) return;
    if (!isValidFile(f)) {
      setUploadError("Only .csv and .txt files are allowed.");
      return;
    }
    setUploadError(null);
    setFile(f);
    if (!fileName) {
      setFileName(f.name.replace(/\.(csv|txt)$/i, "").replace(/\s+/g, "_"));
    }
  }

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
    handleFileSelect(e.dataTransfer.files?.[0] ?? null);
  };

  function parseNumbers(text: string): string[] {
    return text
      .split(/[\n\r,;\s]+/)
      .map((n) => n.trim().replace(/[^0-9]/g, ""))
      .filter((n) => n.length === 10);
  }

  async function handleFileUpload() {
    if (!file || !fileName.trim()) return;
    if (!userId) {
      setUploadError("User not authenticated");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const res = await uploadBase(userId, file, fileName.trim());

      if (!res || !res.baseId) {
        throw new Error(res?.message || "Upload failed — no base ID returned");
      }

      setFile(null);
      setFileName("");
      setShowUpload(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadBases();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // ── Manual Entry helpers ──

  const manualParsed = parseNumbers(manualText);
  const validManualCount = manualParsed.length;

  // Count raw lines user typed (to show invalid count)
  const rawManualLines = manualText
    .split(/[\n\r,;\s]+/)
    .map((n) => n.trim())
    .filter(Boolean).length;
  const invalidManualCount = rawManualLines - validManualCount;

  async function handleManualUpload() {
    if (!manualName.trim() || validManualCount === 0) return;
    if (!userId) {
      setManualError("User not authenticated");
      return;
    }

    setManualUploading(true);
    setManualError(null);
    setManualSuccess(false);

    try {
      const content = manualParsed.join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const txtFile = new File([blob], `${manualName.trim()}.txt`, { type: "text/plain" });

      const res = await uploadBase(userId, txtFile, manualName.trim());

      if (!res || !res.baseId) {
        throw new Error(res?.message || "Upload failed — no base ID returned");
      }

      setManualName("");
      setManualText("");
      setShowManual(false);
      setManualSuccess(true);
      setTimeout(() => setManualSuccess(false), 4000);
      loadBases();
    } catch (err) {
      setManualError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setManualUploading(false);
    }
  }

  const INPUT_CLASS =
    "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Contact Library</h2>
          <p className="text-muted mt-1">
            {basesLoading
              ? "Loading..."
              : bases.length === 0
              ? "Upload and manage your contact lists"
              : `${bases.length} contact list${bases.length !== 1 ? "s" : ""} uploaded`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBases}
            disabled={basesLoading}
            className="p-2.5 bg-surface border border-border rounded-xl text-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${basesLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setShowManual(!showManual);
              setShowUpload(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showManual
                ? "bg-surface border border-border text-muted hover:text-foreground"
                : "bg-surface border border-border text-foreground hover:bg-card-hover"
            }`}
          >
            {showManual ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showManual ? "Close" : "Manual Entry"}
          </button>
          <button
            onClick={() => {
              setShowUpload(!showUpload);
              setShowManual(false);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showUpload
                ? "bg-surface border border-border text-muted hover:text-foreground"
                : "gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/25"
            }`}
          >
            {showUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {showUpload ? "Close" : "Upload File"}
          </button>
        </div>
      </div>

      {/* Success Messages */}
      {(uploadSuccess || manualSuccess) && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Contacts uploaded successfully!</p>
            <p className="text-success/70 text-xs mt-0.5">
              Your contact list is ready to use in campaigns.
            </p>
          </div>
        </div>
      )}

      {/* ═══ File Upload Form ═══ */}
      {showUpload && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <FileUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Upload Contact File</h3>
              <p className="text-xs text-muted">CSV or TXT file with phone numbers</p>
            </div>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">List Name</label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value.replace(/\s+/g, "_"))}
              className={INPUT_CLASS}
              placeholder="e.g. March_Leads, Delhi_Customers"
            />
            <p className="text-xs text-muted mt-1.5">Spaces are replaced with underscores</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Contact File <span className="text-muted font-normal">(CSV or TXT)</span>
            </label>
            {file ? (
              <div className="flex items-center gap-3 px-4 py-4 border border-success/30 bg-success/5 rounded-xl text-sm">
                <FileText className="w-5 h-5 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
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
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dragActive ? "bg-primary/10" : "bg-surface"
                  }`}
                >
                  <Upload
                    className={`w-6 h-6 ${dragActive ? "text-primary" : "text-muted"}`}
                  />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${dragActive ? "text-primary" : "text-foreground"}`}>
                    {dragActive ? "Drop your file here" : "Drag & drop your contact file"}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    or click to browse &middot; CSV, TXT
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="p-4 bg-surface rounded-xl text-xs text-muted space-y-1.5">
            <p className="font-semibold text-foreground text-sm">File format tips</p>
            <p>&bull; One phone number per line, or comma/semicolon separated</p>
            <p>&bull; Numbers must be exactly 10 digits (no country code)</p>
            <p>&bull; Non-numeric characters are automatically stripped</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFileUpload}
              disabled={uploading || !file || !fileName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Uploading..." : "Upload Contacts"}
            </button>
            <button
              onClick={() => {
                setShowUpload(false);
                setUploadError(null);
                setFile(null);
                setFileName("");
              }}
              disabled={uploading}
              className="px-6 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ═══ Manual Entry Form ═══ */}
      {showManual && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Manual Entry</h3>
              <p className="text-xs text-muted">
                Paste or type numbers in bulk &middot; uploaded as TXT
              </p>
            </div>
          </div>

          {manualError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {manualError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              List Name
            </label>
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value.replace(/\s+/g, "_"))}
              className={INPUT_CLASS}
              placeholder="e.g. VIP_Customers, Follow_up_List"
            />
            <p className="text-xs text-muted mt-1.5">Spaces are replaced with underscores</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Phone Numbers</label>
              <div className="flex items-center gap-2">
                {invalidManualCount > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-danger/10 text-danger">
                    {invalidManualCount} invalid
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    validManualCount > 0
                      ? "bg-success/10 text-success"
                      : "bg-muted/10 text-muted"
                  }`}
                >
                  {validManualCount} valid
                </span>
              </div>
            </div>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={8}
              className={`${INPUT_CLASS} font-mono`}
              placeholder={"9876543210\n9876543211\n9876543212\n\nPaste numbers here \u2014 one per line, comma or space separated"}
            />
            <p className="text-xs text-muted mt-2">
              10-digit numbers only &middot; one per line, or comma / space separated &middot; non-numeric characters are ignored
            </p>
          </div>

          {/* Live preview of parsed numbers */}
          {validManualCount > 0 && (
            <div className="p-4 bg-surface rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Preview
                </p>
                <span className="text-xs text-muted">
                  {validManualCount > 10 ? `First 10 of ${validManualCount}` : `${validManualCount} number${validManualCount !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {manualParsed.slice(0, 10).map((num, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-mono text-foreground"
                  >
                    <Phone className="w-3 h-3 text-success" />
                    {num}
                  </span>
                ))}
                {validManualCount > 10 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted">
                    +{validManualCount - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleManualUpload}
              disabled={manualUploading || !manualName.trim() || validManualCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
            >
              {manualUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {manualUploading
                ? "Uploading..."
                : `Upload ${validManualCount} Contact${validManualCount !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={() => {
                setShowManual(false);
                setManualError(null);
                setManualName("");
                setManualText("");
              }}
              disabled={manualUploading}
              className="px-6 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ═══ Search ═══ */}
      {bases.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by list name or ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
          />
        </div>
      )}

      {/* ═══ Contact Lists from API ═══ */}
      {basesLoading && bases.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted">Loading contact lists...</p>
        </div>
      ) : basesError && bases.length === 0 ? (
        <div className="bg-card rounded-2xl border border-danger/20 py-12 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-10 h-10 text-danger" />
          <p className="text-sm text-danger font-medium">{basesError}</p>
          <button
            onClick={loadBases}
            className="mt-1 px-5 py-2 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      ) : bases.length === 0 && !showUpload && !showManual ? (
        <div className="bg-card rounded-2xl border border-border py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookUser className="w-8 h-8 text-primary opacity-60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No contact lists yet</p>
            <p className="text-xs text-muted mt-1 max-w-xs">
              Upload a CSV/TXT file or add numbers manually to build your first contact list.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowManual(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card-hover transition-all"
            >
              <Plus className="w-4 h-4" />
              Manual Entry
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>
        </div>
      ) : bases.length > 0 && filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center justify-center gap-3">
          <Search className="w-10 h-10 text-muted opacity-40" />
          <p className="text-sm font-medium text-foreground">No matches found</p>
          <p className="text-xs text-muted">Try a different search term</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface text-muted">
                  <th className="px-6 py-3.5 font-medium text-left">Base ID</th>
                  <th className="px-6 py-3.5 font-medium text-left">List Name</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((base) => (
                  <tr
                    key={base.baseId}
                    className="border-t border-border hover:bg-card-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <Hash className="w-3 h-3" />
                        {base.baseId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                          <BookUser className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-foreground">{base.baseName}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border">
              <p className="text-xs text-muted">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">First</button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                {(() => {
                  const pages: (number | "dots")[] = [];
                  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
                  else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("dots");
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push("dots");
                    pages.push(totalPages);
                  }
                  return pages.map((page, idx) =>
                    page === "dots" ? (
                      <span key={`d${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">...</span>
                    ) : (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${currentPage === page ? "gradient-bg text-white shadow-lg shadow-primary/25" : "text-muted hover:text-foreground hover:bg-surface"}`}>{page}</button>
                    )
                  );
                })()}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block">Last</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
