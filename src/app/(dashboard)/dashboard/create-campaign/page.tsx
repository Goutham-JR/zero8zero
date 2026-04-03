"use client";

import { useState, useEffect, useRef } from "react";
import { getUserId } from "@/services/api";
import { fetchPrompts, fetchBases } from "@/services/audio.service";
import { composeCampaign, fetchLocations, fetchCLIList } from "@/services/campaign.service";
import { apiGet } from "@/services/api";
import type { Prompt, BaseItem, IVRType } from "@/types";
import {
  CheckCircle,
  Phone,
  BarChart3,
  Headphones,
  Users,
  Clock,
  RotateCcw,
  Calendar,
  Megaphone,
  Music,
  Hash,
  Timer,
  AlertCircle,
  X,
  ArrowRight,
  Zap,
  Sparkles,
  Info,
  Play,
  Pause,
  Square,
  BookUser,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ═══════════════════════════════════════════
   IVR Type Definitions
   ═══════════════════════════════════════════ */

const ivrTypes = [
  {
    value: "simple" as const,
    label: "Simple IVR",
    desc: "One-way voice broadcast to your contacts",
    longDesc:
      "Send pre-recorded voice messages to thousands of contacts simultaneously. Perfect for announcements, reminders, and promotional campaigns.",
    icon: Phone,
    gradient: "from-blue-500 to-blue-600",
    gradientLight: "from-blue-500/10 to-blue-600/10",
    shadow: "shadow-blue-500/25",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    ring: "ring-blue-500/20",
    features: ["Upload contacts", "Select audio prompt", "Schedule & retry", "Real-time tracking"],
  },
  {
    value: "input" as const,
    label: "Input IVR",
    desc: "DTMF interactive menu system",
    longDesc:
      "Create interactive voice menus where callers respond by pressing keys. Ideal for surveys, polls, confirmations, and multi-option flows.",
    icon: BarChart3,
    gradient: "from-violet-500 to-purple-600",
    gradientLight: "from-violet-500/10 to-purple-600/10",
    shadow: "shadow-violet-500/25",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    ring: "ring-violet-500/20",
    features: ["DTMF key detection", "Multi-audio flows", "Wrong/No input handling", "Survey analytics"],
  },
  {
    value: "call-patch" as const,
    label: "Call Patch",
    desc: "Route callers to live agents",
    longDesc:
      "Connect your customers directly to live agents with intelligent group-based routing. Best for support, sales callbacks, and lead engagement.",
    icon: Headphones,
    gradient: "from-cyan-500 to-teal-500",
    gradientLight: "from-cyan-500/10 to-teal-500/10",
    shadow: "shadow-cyan-500/25",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    ring: "ring-cyan-500/20",
    features: ["Agent group routing", "Hold music support", "No-agent fallback", "Live call status"],
  },
];

const RETRY_OPTIONS = [
  { value: "0", label: "0 (No retry)" },
  { value: "1", label: "1 time" },
  { value: "2", label: "2 times" },
];

const INTERVAL_OPTIONS = [
  { value: "0", label: "0 mins" },
  { value: "15", label: "15 mins" },
  { value: "30", label: "30 mins" },
];

const MENU_WAIT_OPTIONS = [
  { value: "0", label: "0 sec" },
  { value: "1", label: "1 sec" },
  { value: "2", label: "2 sec" },
  { value: "3", label: "3 sec" },
  { value: "4", label: "4 sec" },
  { value: "5", label: "5 sec" },
  { value: "6", label: "6 sec" },
];

const REPROMPT_OPTIONS = [
  { value: "0", label: "0 (None)" },
  { value: "1", label: "1 time" },
  { value: "2", label: "2 times" },
];

const DTMF_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

/* ═══════════════════════════════════════════
   Shared Components
   ═══════════════════════════════════════════ */

function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full bg-muted/15 border border-border flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all shrink-0"
      >
        <Info className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 px-4 py-3 bg-card border border-border rounded-xl shadow-xl text-xs text-muted leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-card border-r border-b border-border rotate-45 -mt-[5px]" />
        </div>
      )}
    </div>
  );
}

function AudioSelectWithPlay({
  label,
  tooltip,
  prompts,
  value,
  onChange,
  required,
  playingId,
  onPlay,
  onStop,
}: {
  label: string;
  tooltip: string;
  prompts: Prompt[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  playingId: number | null;
  onPlay: (p: Prompt) => void;
  onStop: () => void;
}) {
  const selected = prompts.find((p) => String(p.promptId) === value);
  const isPlaying = selected && playingId === selected.promptId;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <InfoTip text={tooltip} />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
        >
          <option value="">Select audio file</option>
          {prompts.map((p) => (
            <option key={p.promptId} value={String(p.promptId)}>
              {p.fileName} {p.promptDuration ? `(${p.promptDuration}s)` : ""}
            </option>
          ))}
        </select>
        {selected?.promptUrl && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => (isPlaying ? onStop() : onPlay(selected))}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
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
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                title="Stop"
              >
                <Square className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function CreateCampaignPage() {
  const [selectedType, setSelectedType] = useState<IVRType | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          New Campaign
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Choose your campaign type
        </h2>
        <p className="text-muted mt-2 text-sm md:text-base">
          Select the type of voice campaign you want to create and configure it in seconds.
        </p>
      </div>

      {success && (
        <div className="max-w-lg mx-auto p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Campaign created successfully!</p>
            <p className="text-success/70 text-xs mt-0.5">Your campaign is saved as a draft and ready to launch.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {ivrTypes.map((ivr) => (
          <div
            key={ivr.value}
            onClick={() => setSelectedType(ivr.value)}
            className="group relative bg-card rounded-2xl border border-border p-6 md:p-7 cursor-pointer hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${ivr.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} style={{ margin: "-1px", padding: "1px" }} />
            <div className="absolute inset-[1px] rounded-[15px] bg-card group-hover:bg-card -z-[5]" />
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${ivr.gradient} opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-500`} />
            <div className="relative mb-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ivr.gradient} flex items-center justify-center shadow-lg ${ivr.shadow} transition-transform duration-300 group-hover:scale-110`}>
                <ivr.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">{ivr.label}</h3>
            <p className="text-sm text-muted leading-relaxed mb-5">{ivr.desc}</p>
            <div className="space-y-2.5 mb-6">
              {ivr.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <div className={`w-5 h-5 rounded-full ${ivr.bg} flex items-center justify-center shrink-0`}>
                    <CheckCircle className={`w-3 h-3 ${ivr.color}`} />
                  </div>
                  <span className="text-muted">{f}</span>
                </div>
              ))}
            </div>
            <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r ${ivr.gradient} text-white shadow-lg ${ivr.shadow} hover:opacity-90 transition-all duration-300`}>
              Create {ivr.label}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
        <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> Setup in under 2 minutes</span>
        <span className="flex items-center gap-1.5"><Music className="w-4 h-4 text-secondary" /> Audio from your library</span>
        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-accent" /> Contacts from your uploads</span>
      </div>

      {selectedType && (
        <CampaignModal
          type={selectedType}
          onClose={() => setSelectedType(null)}
          onSuccess={() => {
            setSelectedType(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Campaign Modal
   ═══════════════════════════════════════════ */

interface AgentGroupItem {
  groupId: number;
  groupName: string;
  userId: string;
  groupStatus: number;
  reqestDate: string;
  agents: { agentId: number; agentName: string; agentNumber: string }[];
}

function CampaignModal({
  type,
  onClose,
  onSuccess,
}: {
  type: IVRType;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const ivr = ivrTypes.find((i) => i.value === type)!;
  const overlayRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  // ── Data from API ──
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [bases, setBases] = useState<BaseItem[]>([]);
  const [agentGroups, setAgentGroups] = useState<AgentGroupItem[]>([]);
  const [locations, setLocations] = useState<{ locationId: number; locationName: string }[]>([]);
  const [clis, setClis] = useState<{ cliId: number; cli: string; dialerName: string; locationName: string; cliStatus: number }[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ── Audio player ──
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Form state ──
  const [campaignName, setCampaignName] = useState("");
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [mainAudioId, setMainAudioId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [retries, setRetries] = useState("0");
  const [retryInterval, setRetryInterval] = useState("0");

  // Input IVR + Call Patch
  const [menuWaitTime, setMenuWaitTime] = useState("3");
  const [repromptCount, setRepromptCount] = useState("1");
  const [selectedDtmfKeys, setSelectedDtmfKeys] = useState<Set<number>>(new Set());
  // Per-group DTMF: groupId -> dtmf key
  const [groupDtmfMap, setGroupDtmfMap] = useState<Record<number, string>>({});
  const [welcomeAudioId, setWelcomeAudioId] = useState("");
  const [noInputAudioId, setNoInputAudioId] = useState("");
  const [wrongInputAudioId, setWrongInputAudioId] = useState("");
  const [thanksAudioId, setThanksAudioId] = useState("");
  const [noAgentAudioId, setNoAgentAudioId] = useState("");

  // Call Patch agent groups (multi-select)
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(new Set());

  const [submitError, setSubmitError] = useState<string | null>(null);

  const approvedPrompts = prompts.filter((p) => p.promptStatus === 1);

  // ── Load data ──
  useEffect(() => {
    if (!userId) return;
    setDataLoading(true);
    Promise.all([
      fetchPrompts(userId).catch(() => []),
      fetchBases(userId).catch(() => []),
      type === "call-patch"
        ? apiGet<AgentGroupItem[]>(`/api/obd/group/agent/list/${userId}`).catch(() => [])
        : Promise.resolve([]),
      fetchLocations(userId).catch(() => []),
      fetchCLIList(userId).catch(() => []),
    ]).then(([p, b, g, loc, cli]) => {
      setPrompts(Array.isArray(p) ? p : []);
      setBases(Array.isArray(b) ? b : []);
      setAgentGroups(Array.isArray(g) ? g : []);
      setLocations(Array.isArray(loc) ? loc : []);
      setClis(Array.isArray(cli) ? cli : []);
      setDataLoading(false);
    });
  }, [userId, type]);

  // ── Audio player helpers ──
  function playAudio(prompt: Prompt) {
    if (!prompt.promptUrl) return;
    if (playingId === prompt.promptId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(prompt.promptUrl);
    audioRef.current = audio;
    setPlayingId(prompt.promptId);
    audio.addEventListener("ended", () => setPlayingId(null));
    audio.addEventListener("error", () => setPlayingId(null));
    audio.play().catch(() => setPlayingId(null));
  }

  function stopAudio() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setPlayingId(null);
  }

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  // ── Lock scroll & ESC ──
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Toggle DTMF key ──
  function toggleDtmfKey(key: number) {
    setSelectedDtmfKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // ── Toggle agent group ──
  function toggleGroup(groupId: number) {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
        setGroupDtmfMap((m) => { const n = { ...m }; delete n[groupId]; return n; });
      } else {
        next.add(groupId);
        setGroupDtmfMap((m) => ({ ...m, [groupId]: m[groupId] || "1" }));
      }
      return next;
    });
  }

  // ── Format schedule time from datetime-local to YYYY-MM-DD HH:MM:SS ──
  function formatScheduleTime(dtLocal: string): string {
    if (!dtLocal) return "";
    // datetime-local gives "2026-04-01T12:30" or "2026-04-01T12:30:00"
    const [datePart, timePart] = dtLocal.split("T");
    if (!datePart || !timePart) return dtLocal;
    const time = timePart.length === 5 ? `${timePart}:00` : timePart;
    return `${datePart} ${time}`;
  }

  // ── Build location JSON ──
  function buildLocationJson(): string {
    if (locations.length === 0) {
      return JSON.stringify({ locationList: [{ locationId: 3, locationName: "Bangalore" }] });
    }
    return JSON.stringify({
      locationList: locations.map((l) => ({ locationId: l.locationId, locationName: l.locationName })),
    });
  }

  // ── Build CLI JSON ──
  function buildCliJson(): string {
    if (clis.length === 0) return "";
    return JSON.stringify({
      cliList: clis.map((c) => ({ cliId: String(c.cliId), cli: c.cli })),
    });
  }

  // ── Build agentRows JSON for Call Patch ──
  function buildAgentRows(): string {
    if (selectedGroupIds.size === 0) return '""';
    const patchList = Array.from(selectedGroupIds).map((gid) => {
      const group = agentGroups.find((g) => g.groupId === gid);
      return {
        groupId: String(gid),
        agentDtmf: groupDtmfMap[gid] || "1",
        groupName: group?.groupName || "",
      };
    });
    return JSON.stringify({ patchList });
  }

  // ── Validate & Submit via API ──
  async function handleSubmit() {
    setSubmitError(null);

    if (!campaignName.trim()) { setSubmitError("Campaign Name is required."); return; }
    if (!selectedBaseId) { setSubmitError("Please select a contact list."); return; }
    if (!scheduleDate.trim()) { setSubmitError("Schedule Date & Time is required."); return; }

    if (type === "simple") {
      if (!mainAudioId) { setSubmitError("Please select an audio file."); return; }
    }

    if (type === "input") {
      if (!mainAudioId) { setSubmitError("Please select a Main Audio File."); return; }
      if (!menuWaitTime) { setSubmitError("Menu Wait Time is required."); return; }
      if (!repromptCount) { setSubmitError("Re-prompt Count is required."); return; }
      if (selectedDtmfKeys.size === 0) { setSubmitError("Please select at least one DTMF key."); return; }
    }

    if (type === "call-patch") {
      if (!mainAudioId) { setSubmitError("Please select a Main Audio File."); return; }
      if (!menuWaitTime) { setSubmitError("Menu Wait Time is required."); return; }
      if (!repromptCount) { setSubmitError("Re-prompt Count is required."); return; }
      if (!noAgentAudioId) { setSubmitError("No Agent Audio File is required."); return; }
      if (selectedGroupIds.size === 0) { setSubmitError("Please select at least one Agent Group."); return; }
    }

    // ── Build payload per campaign type ──
    const templateId = type === "simple" ? "0" : type === "input" ? "1" : "2";
    const formattedTime = formatScheduleTime(scheduleDate);

    // Build payload matching exact API format
    const base: Record<string, unknown> = {
      userId: String(userId),
      campaignName: campaignName.trim(),
      templateId,
      baseId: String(selectedBaseId),
      scheduleTime: formattedTime,
      retries: String(retries),
      retryInterval: String(retryInterval),
      smsSuccessApi: "",
      smsFailApi: "",
      smsDtmfApi: "",
      callDurationSMS: 0,
      location: buildLocationJson(),
      clis: "",
      webhook: false,
      webhookId: "",
      callPatchSuccessMessage: "",
      callPatchFailMessage: "",
    };

    let payload: Record<string, unknown>;

    if (type === "simple") {
      payload = {
        ...base,
        dtmf: "",
        welcomePId: String(mainAudioId),
        menuPId: "",
        noInputPId: "",
        wrongInputPId: "",
        thanksPId: "",
        agentRows: '""',
        menuWaitTime: "",
        rePrompt: "",
      };
    } else if (type === "input") {
      payload = {
        ...base,
        dtmf: Array.from(selectedDtmfKeys).sort().join(","),
        welcomePId: welcomeAudioId ? String(welcomeAudioId) : "",
        menuPId: String(mainAudioId),
        noInputPId: noInputAudioId ? String(noInputAudioId) : "",
        wrongInputPId: wrongInputAudioId ? String(wrongInputAudioId) : "",
        thanksPId: thanksAudioId ? String(thanksAudioId) : "",
        agentRows: '""',
        menuWaitTime: String(menuWaitTime),
        rePrompt: String(repromptCount),
      };
    } else {
      // Call Patch — match exact working payload format
      payload = {
        userId: String(userId),
        campaignName: campaignName.trim(),
        templateId: "2",
        dtmf: "",
        baseId: String(selectedBaseId),
        welcomePId: welcomeAudioId ? String(welcomeAudioId) : "",
        menuPId: String(mainAudioId),
        noInputPId: noInputAudioId ? String(noInputAudioId) : "",
        wrongInputPId: wrongInputAudioId ? String(wrongInputAudioId) : "",
        thanksPId: thanksAudioId ? String(thanksAudioId) : "",
        scheduleTime: formattedTime,
        smsSuccessApi: "",
        smsFailApi: "",
        smsDtmfApi: "",
        callDurationSMS: 0,
        retries: String(retries),
        retryInterval: String(retryInterval),
        agentRows: buildAgentRows(),
        menuWaitTime: String(menuWaitTime),
        rePrompt: String(repromptCount),
        location: buildLocationJson(),
        clis: "",
        webhook: false,
        webhookId: "",
        noAgentId: String(noAgentAudioId),
        callPatchSuccessMessage: "",
        callPatchFailMessage: "",
      };
    }

    // Fire and close — campaign is created server-side once the request is sent
    composeCampaign(payload).catch(() => {});
    onSuccess();
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";
  const selectClass = inputClass;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-4"
    >
      <div className="w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl my-auto">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${ivr.gradient} opacity-[0.08]`} />
          <div className="relative px-6 md:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ivr.gradient} flex items-center justify-center shadow-lg ${ivr.shadow}`}>
                <ivr.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{ivr.label} Campaign</h3>
                <p className="text-xs text-muted mt-0.5">Fill all required fields to create</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-card-hover transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
          <div className="px-6 md:px-8 py-6 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Loading indicator */}
            {dataLoading && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                Loading audio files, contacts{type === "call-patch" ? ", agent groups" : ""} & locations...
              </div>
            )}

            {/* 1. Campaign Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-foreground">Campaign Name <span className="text-danger">*</span></label>
                <InfoTip text="A unique name to identify this campaign. It will appear in your campaign list and reports." />
              </div>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className={inputClass}
                placeholder="e.g. March_Promo_Campaign"
              />
            </div>

            {/* 2. Select Contact */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-foreground">Select Contact List <span className="text-danger">*</span></label>
                <InfoTip text="Choose a contact list that you have previously uploaded in the Contact Library. The campaign will dial all numbers in this list." />
              </div>
              <div className="flex items-center gap-2">
                <BookUser className="w-5 h-5 text-muted shrink-0" />
                <select value={selectedBaseId} onChange={(e) => setSelectedBaseId(e.target.value)} className={selectClass}>
                  <option value="">Select a contact list</option>
                  {bases.map((b) => (
                    <option key={b.baseId} value={String(b.baseId)}>
                      {b.baseName} (#{b.baseId})
                    </option>
                  ))}
                </select>
              </div>
              {bases.length === 0 && (
                <p className="text-xs text-accent-warm mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> No contact lists found. Upload contacts in the Contact Library first.</p>
              )}
            </div>

            {/* 3. Select Audio (Simple) / Main Audio (Input & Call Patch) */}
            <AudioSelectWithPlay
              label={type === "simple" ? "Select Audio" : "Select Main Audio File"}
              tooltip={
                type === "simple"
                  ? "The pre-recorded voice message that will be played when the call is answered by the recipient."
                  : "The primary audio file played when the call connects. For Input IVR, this is the main menu prompt. For Call Patch, this is the initial greeting."
              }
              prompts={approvedPrompts}
              value={mainAudioId}
              onChange={setMainAudioId}
              required
              playingId={playingId}
              onPlay={playAudio}
              onStop={stopAudio}
            />

            {/* ── Input IVR & Call Patch: Menu Wait + Re-prompt ── */}
            {(type === "input" || type === "call-patch") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-foreground">Menu Wait Time <span className="text-danger">*</span></label>
                    <InfoTip text="How many seconds to wait for the caller to press a key before playing the no-input audio or re-prompting." />
                  </div>
                  <select value={menuWaitTime} onChange={(e) => setMenuWaitTime(e.target.value)} className={selectClass}>
                    {MENU_WAIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-foreground">Re-prompt Count <span className="text-danger">*</span></label>
                    <InfoTip text="How many times to replay the menu audio if the caller does not press any key within the wait time." />
                  </div>
                  <select value={repromptCount} onChange={(e) => setRepromptCount(e.target.value)} className={selectClass}>
                    {REPROMPT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── Input IVR & Call Patch: Additional Audio (collapsible) ── */}
            {(type === "input" || type === "call-patch") && (
              <AdditionalAudioSection
                type={type}
                approvedPrompts={approvedPrompts}
                welcomeAudioId={welcomeAudioId} setWelcomeAudioId={setWelcomeAudioId}
                noInputAudioId={noInputAudioId} setNoInputAudioId={setNoInputAudioId}
                wrongInputAudioId={wrongInputAudioId} setWrongInputAudioId={setWrongInputAudioId}
                thanksAudioId={thanksAudioId} setThanksAudioId={setThanksAudioId}
                noAgentAudioId={noAgentAudioId} setNoAgentAudioId={setNoAgentAudioId}
                playingId={playingId} onPlay={playAudio} onStop={stopAudio}
              />
            )}

            {/* ── Input IVR: DTMF Keys (multi-select) ── */}
            {type === "input" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-foreground">DTMF Keys <span className="text-danger">*</span></label>
                  <InfoTip text="Select the keys (1-9) that the caller can press as valid inputs. You can select multiple keys. For example, selecting 1, 3, 5 means only those keys are accepted." />
                </div>
                <div className="flex flex-wrap gap-2">
                  {DTMF_OPTIONS.map((o) => {
                    const key = Number(o.value);
                    const isSelected = selectedDtmfKeys.has(key);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleDtmfKey(key)}
                        className={`w-11 h-11 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20"
                            : "border-border bg-card text-muted hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {o.value}
                      </button>
                    );
                  })}
                </div>
                {selectedDtmfKeys.size > 0 && (
                  <p className="text-xs text-muted mt-2">
                    Selected: <span className="font-semibold text-foreground">{Array.from(selectedDtmfKeys).sort().join(", ")}</span>
                  </p>
                )}
              </div>
            )}

            {/* ── Call Patch: Agent Groups with per-group DTMF ── */}
            {type === "call-patch" && (
              <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Agent Groups <span className="text-danger">*</span></h4>
                  <InfoTip text="Select one or more agent groups and assign a DTMF key to each. The caller presses the assigned key to be routed to that group's agents." />
                </div>

                {agentGroups.length === 0 ? (
                  <p className="text-xs text-accent-warm flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> No agent groups found. Create groups in Agent Groups section first.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {agentGroups.map((g) => {
                      const isSelected = selectedGroupIds.has(g.groupId);
                      return (
                        <div
                          key={g.groupId}
                          className={`rounded-xl border transition-all ${
                            isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-card-hover"
                          }`}
                        >
                          <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleGroup(g.groupId)}
                              className="w-4 h-4 rounded accent-primary shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{g.groupName}</p>
                              <p className="text-xs text-muted">{g.agents.length} agent{g.agents.length !== 1 ? "s" : ""}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                          </label>

                          {/* Per-group DTMF selector */}
                          {isSelected && (
                            <div className="px-4 pb-3 pt-1 flex items-center gap-3 border-t border-border/50 ml-7">
                              <label className="text-xs font-medium text-muted whitespace-nowrap">DTMF Key:</label>
                              <div className="flex gap-1">
                                {DTMF_OPTIONS.map((o) => {
                                  const active = (groupDtmfMap[g.groupId] || "1") === o.value;
                                  return (
                                    <button
                                      key={o.value}
                                      type="button"
                                      onClick={() => setGroupDtmfMap((m) => ({ ...m, [g.groupId]: o.value }))}
                                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        active
                                          ? "bg-primary text-white shadow-md shadow-primary/30"
                                          : "bg-card border border-border text-muted hover:border-primary/30 hover:text-foreground"
                                      }`}
                                    >
                                      {o.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Schedule Date & Time ── */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-foreground">Schedule Date & Time <span className="text-danger">*</span></label>
                <InfoTip text="The exact date and time when the campaign will start dialing. Format: YYYY-MM-DD HH:MM:SS. The campaign will begin automatically at this time." />
              </div>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className={inputClass}
                step="1"
              />
              <p className="text-xs text-muted mt-1.5">Format: YYYY-MM-DD HH:MM:SS</p>
            </div>

            {/* ── Retries & Interval ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-foreground">Retries <span className="text-danger">*</span></label>
                  <InfoTip text="Number of times to retry calling a number if the first attempt fails (not answered, busy, etc.). Set 0 for no retries." />
                </div>
                <select value={retries} onChange={(e) => setRetries(e.target.value)} className={selectClass}>
                  {RETRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-foreground">Retry Interval <span className="text-danger">*</span></label>
                  <InfoTip text="The waiting time between retry attempts. A longer interval gives recipients more time to become available." />
                </div>
                <select value={retryInterval} onChange={(e) => setRetryInterval(e.target.value)} className={selectClass}>
                  {INTERVAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* ── Error ── */}
            {submitError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}
          </div>

        {/* ── Footer ── */}
          <div className="px-6 md:px-8 py-5 border-t border-border flex items-center justify-between gap-3 rounded-b-3xl bg-surface/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-card-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r ${ivr.gradient} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg ${ivr.shadow}`}
            >
              <Megaphone className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Collapsible Additional Audio Section
   ═══════════════════════════════════════════ */

function AdditionalAudioSection({
  type,
  approvedPrompts,
  welcomeAudioId, setWelcomeAudioId,
  noInputAudioId, setNoInputAudioId,
  wrongInputAudioId, setWrongInputAudioId,
  thanksAudioId, setThanksAudioId,
  noAgentAudioId, setNoAgentAudioId,
  playingId, onPlay, onStop,
}: {
  type: IVRType;
  approvedPrompts: Prompt[];
  welcomeAudioId: string; setWelcomeAudioId: (v: string) => void;
  noInputAudioId: string; setNoInputAudioId: (v: string) => void;
  wrongInputAudioId: string; setWrongInputAudioId: (v: string) => void;
  thanksAudioId: string; setThanksAudioId: (v: string) => void;
  noAgentAudioId: string; setNoAgentAudioId: (v: string) => void;
  playingId: number | null;
  onPlay: (p: Prompt) => void;
  onStop: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const selectedCount = [welcomeAudioId, noInputAudioId, wrongInputAudioId, thanksAudioId, ...(type === "call-patch" ? [noAgentAudioId] : [])].filter(Boolean).length;
  const totalFields = type === "call-patch" ? 5 : 4;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Music className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-foreground">Additional Audio</h4>
            <p className="text-[11px] text-muted mt-0.5">
              {selectedCount > 0
                ? `${selectedCount} of ${totalFields} configured`
                : type === "call-patch" ? "No Agent File is required" : "Optional audio files"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {type !== "call-patch" && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/10 text-muted border border-border">Optional</span>
          )}
          {selectedCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20">
              {selectedCount}/{totalFields}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          <AudioSelectWithPlay label="Welcome File" tooltip="Played as a greeting when the call first connects, before the main menu." prompts={approvedPrompts} value={welcomeAudioId} onChange={setWelcomeAudioId} playingId={playingId} onPlay={onPlay} onStop={onStop} />
          <AudioSelectWithPlay label="No Input File" tooltip="Played when the caller does not press any key within the menu wait time." prompts={approvedPrompts} value={noInputAudioId} onChange={setNoInputAudioId} playingId={playingId} onPlay={onPlay} onStop={onStop} />
          <AudioSelectWithPlay label="Wrong Input File" tooltip="Played when the caller presses an invalid key that is not in the accepted DTMF range." prompts={approvedPrompts} value={wrongInputAudioId} onChange={setWrongInputAudioId} playingId={playingId} onPlay={onPlay} onStop={onStop} />
          <AudioSelectWithPlay label="Thanks File" tooltip="Played after a successful key press, before the call ends. A thank-you or confirmation message." prompts={approvedPrompts} value={thanksAudioId} onChange={setThanksAudioId} playingId={playingId} onPlay={onPlay} onStop={onStop} />

          {type === "call-patch" && (
            <AudioSelectWithPlay
              label="No Agent File"
              tooltip="Played when no agents are available to take the call. This file is mandatory for Call Patch campaigns."
              prompts={approvedPrompts}
              value={noAgentAudioId}
              onChange={setNoAgentAudioId}
              required
              playingId={playingId}
              onPlay={onPlay}
              onStop={onStop}
            />
          )}
        </div>
      )}
    </div>
  );
}
