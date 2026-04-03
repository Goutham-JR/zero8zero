"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1488963627666116709/wOCU6wEc_d5ycaN_jLcfQw9dt_f8UI11hagUftWp0PGUlkop-mWWhzXBGLKC8WU9GdrQ";
const WHATSAPP_LINK = "https://wa.me/918951537972";
const TELEGRAM_LINK = "https://t.me/zero8zero";
const DISCORD_LINK = "https://discord.gg/7sjpRaGPBX";
const EMAIL = "cloudcentral24@gmail.com";
const PHONE = "+91 89515 37972";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !number.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    setStatus("idle");

    try {
      const res = await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Zero8Zero",
          avatar_url: "https://zero8zero.com/favicon.ico",
          embeds: [{
            title: "New Contact Form Submission",
            description: `**${name}** has sent a message from the Zero8Zero website.`,
            color: 0x4A35E0,
            thumbnail: { url: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=4A35E0&color=fff&size=128&bold=true" },
            fields: [
              { name: "\ud83d\udc64 Name", value: `\`${name}\``, inline: true },
              { name: "\ud83d\udcde Phone", value: `\`${number}\``, inline: true },
              { name: "\ud83d\udce7 Email", value: `\`${email}\``, inline: true },
              { name: "\ud83d\udcac Message", value: `>>> ${message}` },
            ],
            footer: {
              text: "Zero8Zero Contact Form \u2022 Cloud Central",
              icon_url: "https://ui-avatars.com/api/?name=Z8Z&background=4A35E0&color=fff&size=32&bold=true",
            },
            timestamp: new Date().toISOString(),
          }],
        }),
      });
      if (res.ok || res.status === 204) {
        setStatus("success");
        setName("");
        setNumber("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

  return (
    <article className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Contact Us</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto leading-relaxed">
          Have a question, feedback, or need help? Reach out to us through any of the channels below — we&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ═══ Contact Form ═══ */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-foreground mb-1">Send us a message</h2>
          <p className="text-xs text-muted mb-6">Fill in the form and we&apos;ll get back to you shortly.</p>

          {status === "success" && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl text-success text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">Message sent successfully!</p>
                <p className="text-success/70 text-xs mt-0.5">We&apos;ll get back to you soon.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">Failed to send message.</p>
                <p className="text-danger/70 text-xs mt-0.5">Please try again or contact us directly.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone *</label>
                <input value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputClass} placeholder="9876543210" inputMode="numeric" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputClass} placeholder="How can we help you?" required />
            </div>
            <button
              type="submit"
              disabled={sending || !name.trim() || !number.trim() || !email.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </form>
        </div>

        {/* ═══ Contact Channels ═══ */}
        <div className="space-y-5">
          {/* Quick Channels */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-5">Reach us instantly</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-surface hover:border-success/40 hover:bg-success/5 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <span className="text-sm font-semibold text-foreground">WhatsApp</span>
              </a>

              <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-surface hover:border-accent/40 hover:bg-accent/5 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <span className="text-sm font-semibold text-foreground">Telegram</span>
              </a>

              <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-surface hover:border-secondary/40 hover:bg-secondary/5 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
                </div>
                <span className="text-sm font-semibold text-foreground">Discord</span>
              </a>

              <a href={`mailto:${EMAIL}`} className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Email Us</span>
              </a>
            </div>
          </div>

          {/* Direct Info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Direct Contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <a href={`mailto:${EMAIL}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{EMAIL}</a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted">Phone</p>
                  <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-sm font-medium text-foreground hover:text-success transition-colors">{PHONE}</a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface">
                <div className="w-10 h-10 rounded-xl bg-accent-warm/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent-warm" />
                </div>
                <div>
                  <p className="text-xs text-muted">Address</p>
                  <p className="text-sm font-medium text-foreground">45, Kamarajar Street, 1st Cross, KK Pudur, Coimbatore, Tamil Nadu, 641038</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Business Hours</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Monday - Saturday</span><span className="font-medium text-foreground">9:00 AM - 6:00 PM</span></div>
              <div className="flex justify-between"><span className="text-muted">Sunday</span><span className="font-medium text-danger">Closed</span></div>
              <div className="flex justify-between"><span className="text-muted">Campaign Hours</span><span className="font-medium text-foreground">9:00 AM - 9:00 PM</span></div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
