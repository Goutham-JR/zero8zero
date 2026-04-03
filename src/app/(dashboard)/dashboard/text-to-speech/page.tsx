"use client";

import { useState, useRef, useEffect } from "react";
import { getUserId } from "@/services/api";
import { uploadVoiceFile } from "@/services/audio.service";
import {
  Volume2,
  Square,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Languages,
  Mic,
  Play,
  Pause,
  ArrowRight,
} from "lucide-react";

const LANGUAGES = [
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "en", label: "English (Indian)", native: "English" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "si", label: "Sinhala", native: "සිංහල" },
];

const INPUT_CLASS =
  "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

export default function TextToSpeechPage() {
  const userId = getUserId();

  // Form
  const [text, setText] = useState("");
  const [lang, setLang] = useState("hi");

  // Translation
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);

  // Preview audio
  const [previewing, setPreviewing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Generated audio (for upload)
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);

  // Upload
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Reset translation when text or language changes
  useEffect(() => {
    setTranslatedText("");
  }, [text, lang]);

  // Translate text
  async function handleTranslate() {
    if (!text.trim()) return;
    if (lang === "en") {
      setTranslatedText(text);
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/tts/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), lang }),
      });
      const data = await res.json();
      if (data.translated) {
        setTranslatedText(data.translated);
      }
    } catch {
      setGenError("Translation failed. Try again.");
    } finally {
      setTranslating(false);
    }
  }

  // Preview — translate + TTS in one go
  async function handlePreview() {
    if (!text.trim()) return;

    if (previewing && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setPreviewing(false);
      return;
    }

    setPreviewLoading(true);
    setPreviewing(false);

    try {
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), lang, translate: true }),
      });

      if (!res.ok) throw new Error("Failed to generate preview");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        URL.revokeObjectURL(previewAudioRef.current.src);
      }

      const audio = new Audio(url);
      audio.onended = () => setPreviewing(false);
      audio.onerror = () => setPreviewing(false);
      previewAudioRef.current = audio;
      await audio.play();
      setPreviewing(true);

      // Also fetch translation to show
      if (!translatedText && lang !== "en") {
        handleTranslate();
      }
    } catch {
      setGenError("Preview failed. Try again.");
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleStop() {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setPreviewing(false);
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime = 0;
    }
    setPlayerPlaying(false);
  }

  // Generate audio file for upload
  async function handleGenerate() {
    if (!text.trim()) return;
    setGenerating(true);
    setGenError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), lang, translate: true }),
      });

      if (!res.ok) throw new Error("Failed to generate audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);

      if (!fileName) {
        const langLabel = LANGUAGES.find((l) => l.code === lang)?.label || lang;
        setFileName(`TTS_${langLabel}`.replace(/\s+/g, "_"));
      }

      // Also fetch translation to show
      if (!translatedText && lang !== "en") {
        handleTranslate();
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function togglePlayer() {
    if (!playerRef.current || !audioUrl) return;
    if (playerPlaying) {
      playerRef.current.pause();
      setPlayerPlaying(false);
    } else {
      playerRef.current.play();
      setPlayerPlaying(true);
    }
  }

  async function handleUpload() {
    if (!audioBlob || !fileName.trim() || !userId) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      const cleanName = fileName.trim().replace(/\s+/g, "_");
      const file = new File([audioBlob], `${cleanName}.mp3`, { type: "audio/mpeg" });
      await uploadVoiceFile(userId, file, cleanName, "welcome", "mp3");
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const selectedLang = LANGUAGES.find((l) => l.code === lang);
  const charCount = text.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Text to Speech</h2>
        <p className="text-muted mt-1">Write in English, translate to any Indian language, and convert to audio</p>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">

        {/* Language */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-foreground">Target Language</label>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={INPUT_CLASS}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} ({l.native})
              </option>
            ))}
          </select>
        </div>

        {/* English Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Enter Text in English</label>
            <span className={`text-xs ${charCount > 5000 ? "text-danger" : "text-muted"}`}>
              {charCount.toLocaleString()} characters
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className={`${INPUT_CLASS} resize-none`}
            placeholder="Type your message in English here... It will be translated to the selected language and converted to speech."
          />
        </div>

        {/* Translate Button */}
        {lang !== "en" && text.trim() && (
          <button
            onClick={handleTranslate}
            disabled={translating}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent/10 border border-accent/20 text-accent rounded-xl text-sm font-semibold hover:bg-accent/20 transition-all disabled:opacity-50"
          >
            {translating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</>
            ) : (
              <><Languages className="w-4 h-4" /> Translate to {selectedLang?.label}</>
            )}
          </button>
        )}

        {/* Translated Text Preview */}
        {translatedText && lang !== "en" && (
          <div className="p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-3.5 h-3.5 text-success" />
              <span className="text-xs font-semibold text-success uppercase tracking-wide">{selectedLang?.label} Translation</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{translatedText}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePreview}
            disabled={!text.trim() || previewLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
              previewing
                ? "bg-danger text-white shadow-lg shadow-danger/25"
                : "gradient-bg text-white shadow-lg shadow-primary/25 hover:opacity-90"
            }`}
          >
            {previewLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
            ) : previewing ? (
              <><Pause className="w-4 h-4" /> Pause</>
            ) : (
              <><Volume2 className="w-4 h-4" /> Preview</>
            )}
          </button>

          {(previewing || playerPlaying) && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={!text.trim() || generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-secondary to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-secondary/25 disabled:opacity-50"
          >
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Mic className="w-4 h-4" /> Generate Audio</>}
          </button>
        </div>

        {genError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" /> {genError}
          </div>
        )}
      </div>

      {/* Generated Audio Card */}
      {audioUrl && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Audio Generated</h3>
              <p className="text-xs text-muted">{selectedLang?.label} ({selectedLang?.native})</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface rounded-xl">
            <button
              onClick={togglePlayer}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                playerPlaying
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {playerPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <audio
              ref={playerRef}
              src={audioUrl}
              onEnded={() => setPlayerPlaying(false)}
              onError={() => setPlayerPlaying(false)}
              className="flex-1"
              controls
              style={{ height: "36px" }}
            />
          </div>

          <div className="border-t border-border pt-5 space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Upload to Audio Library
            </h4>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">File Name</label>
              <input
                value={fileName}
                onChange={(e) => setFileName(e.target.value.replace(/\s+/g, "_"))}
                className={INPUT_CLASS}
                placeholder="e.g. Hindi_Welcome_Message"
              />
              <p className="text-xs text-muted mt-1">Spaces are replaced with underscores</p>
            </div>

            {uploadSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-xl text-sm text-success">
                <CheckCircle className="w-4 h-4 shrink-0" /> Audio uploaded to library! It will be available after approval.
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !fileName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload to Library</>}
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">How it works</h4>
        <div className="space-y-2 text-xs text-muted">
          <p>1. Select your target language from 16 Indian languages</p>
          <p>2. Type your message in <strong>English</strong></p>
          <p>3. Click <strong>Translate</strong> to see the translation (optional)</p>
          <p>4. Click <strong>Preview</strong> to hear the translated audio</p>
          <p>5. Click <strong>Generate Audio</strong> to create an MP3 file</p>
          <p>6. Name the file and <strong>Upload to Library</strong> for approval</p>
        </div>
      </div>
    </div>
  );
}
