import Link from "next/link";
import {
  Phone, BarChart3, Users, Headphones, Zap, Shield, ArrowRight, Check,
  Upload, Music, BookUser, FileText, Megaphone, Radio, Clock, Hash,
  PhoneCall, TrendingUp, Globe, Layers,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { VideoIntro } from "@/components/video-intro";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { ScrollAnimateInit } from "@/components/scroll-animate";

export default function Home() {
  return (
    <VideoIntro>
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollAnimateInit />

      {/* ═══ Navbar ═══ */}
      <nav className="sticky top-0 z-50 px-4 md:px-6 pt-3 animate-slide-up">
        <div className="max-w-7xl mx-auto bg-card/80 glass border border-border rounded-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center animate-pulse-glow">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">
                Zero<span className="gradient-text">8</span>Zero
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-foreground transition-all">Features</a>
              <a href="#how-it-works" className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-foreground transition-all">How It Works</a>
              <a href="#campaigns" className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-foreground transition-all">Campaigns</a>
              <a href="#pricing" className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-foreground transition-all">Pricing</a>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <AuthNavButtons />
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative flex flex-col items-center justify-center px-4 md:px-6 py-20 md:py-36 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-20 left-[10%] w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float-x" />
          <div className="absolute top-[60%] right-[10%] w-32 h-32 bg-danger/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-10 right-[15%] w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDuration: "2s" }} />
          <div className="absolute top-[30%] left-[12%] w-1.5 h-1.5 bg-secondary/30 rounded-full animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
          <div className="absolute bottom-[25%] right-[20%] w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce" style={{ animationDuration: "3s", animationDelay: "1s" }} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Zap className="w-3.5 h-3.5" />
          Cloud Telephony Platform
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground max-w-5xl leading-[1.05] tracking-tight animate-slide-up" style={{ animationDelay: "0.4s" }}>
          Automate voice campaigns{" "}
          <span className="animate-shimmer">at scale</span>
        </h1>
        <p className="mt-5 md:mt-7 text-base md:text-lg text-muted max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.6s" }}>
          Zero8Zero lets you launch Simple IVR, Input IVR, and Call Patch campaigns
          to thousands of contacts — with real-time analytics, audio approval workflows,
          and intelligent agent routing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 md:mt-10 w-full sm:w-auto animate-slide-up" style={{ animationDelay: "0.8s" }}>
          <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-3.5 text-white gradient-bg rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
            Start Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform animate-float-x" />
          </Link>
          <Link href="/login" className="px-8 py-3.5 border border-border rounded-full font-semibold text-foreground hover:bg-surface hover:-translate-y-0.5 transition-all">
            Login to Dashboard
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 md:mt-20 text-muted text-xs md:text-sm animate-slide-up" style={{ animationDelay: "1s" }}>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> 3 campaign types</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> Real-time tracking</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> Audio approval workflow</span>
        </div>
      </section>

      {/* ═══ Stats Banner ═══ */}
      <section className="px-4 md:px-6 -mt-8 relative z-10">
        <div className="max-w-5xl mx-auto gradient-bg rounded-2xl p-1 animate-gradient-bg animate-on-scroll blur-in">
          <div className="bg-card rounded-xl grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { value: "3", label: "Campaign Types", icon: <Layers className="w-4 h-4" /> },
              { value: "100K+", label: "Contacts per campaign", icon: <BookUser className="w-4 h-4" /> },
              { value: "9", label: "DTMF Keys Supported", icon: <Hash className="w-4 h-4" /> },
              { value: "9-9", label: "Runs 9AM-9PM, schedule anytime", icon: <Clock className="w-4 h-4" /> },
            ].map((s) => (
              <div key={s.label} className="p-5 md:p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">{s.icon}<span className="text-2xl md:text-3xl font-extrabold text-foreground">{s.value}</span></div>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Campaign Types ═══ */}
      <section id="campaigns" className="px-4 md:px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">Campaign Types</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Three ways to reach your audience</h2>
            <p className="mt-4 text-muted max-w-xl mx-auto">Choose the campaign type that fits your use case — from simple broadcasts to interactive agent routing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="animate-on-scroll flip-up delay-1">
              <CampaignCard icon={<Phone className="w-7 h-7" />} title="Simple IVR" templateId="0" description="One-way voice broadcast. Upload contacts, select an approved audio file, schedule the time, and launch. Perfect for announcements, reminders, and promotions." features={["Upload contact list (CSV/TXT)", "Select approved audio prompt", "Schedule with retries (0/15/30 min)", "Track connected vs DND calls"]} gradient="from-blue-500 to-blue-600" />
            </div>
            <div className="animate-on-scroll flip-up delay-2">
              <CampaignCard icon={<BarChart3 className="w-7 h-7" />} title="Input IVR" templateId="1" description="Interactive DTMF menus. Callers press keys (1-9) to respond. Ideal for surveys, polls, confirmations, and multi-option flows with re-prompts." features={["Multi-key DTMF selection (1-9)", "Menu wait time (0-6 sec)", "Welcome, wrong input, no input audio", "Re-prompt count (0-2 times)"]} gradient="from-violet-500 to-purple-600" />
            </div>
            <div className="animate-on-scroll flip-up delay-3">
              <CampaignCard icon={<Headphones className="w-7 h-7" />} title="Call Patch" templateId="2" description="Route callers to live agents. Select multiple agent groups with per-group DTMF keys. Includes no-agent fallback audio and hold music." features={["Multiple agent group selection", "Per-group DTMF key assignment", "No-agent fallback audio (required)", "Hold music + welcome audio"]} gradient="from-cyan-500 to-teal-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="px-4 md:px-6 py-20 md:py-28 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Built for cloud telephony at scale</h2>
            <p className="mt-4 text-muted max-w-xl mx-auto">Every tool you need to manage contacts, audio, agents, campaigns, and reports — in one dashboard.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="animate-on-scroll from-left delay-1"><FeatureCard icon={<BookUser className="w-5 h-5" />} title="Contact Library" description="Upload CSV/TXT files or paste numbers in bulk. 10-digit validation. All uploads stored and reusable via API." color="text-primary" bg="bg-primary/10" /></div>
            <div className="animate-on-scroll blur-in delay-2"><FeatureCard icon={<Music className="w-5 h-5" />} title="Audio Library" description="Upload WAV/MP3 prompts. Approval workflow (pending/approved/rejected). Play and download directly from the dashboard." color="text-secondary" bg="bg-secondary/10" /></div>
            <div className="animate-on-scroll from-right delay-3"><FeatureCard icon={<Users className="w-5 h-5" />} title="Agent Groups" description="Create groups with multiple agents (name + phone). Normal or call centre types. Edit, delete, and assign to Call Patch campaigns." color="text-accent" bg="bg-accent/10" /></div>
            <div className="animate-on-scroll from-left delay-1"><FeatureCard icon={<Megaphone className="w-5 h-5" />} title="Campaign Compose" description="Step-by-step campaign creation with info tooltips. Audio preview with play button. Fire-and-close — no waiting for API." color="text-success" bg="bg-success/10" /></div>
            <div className="animate-on-scroll blur-in delay-2"><FeatureCard icon={<Radio className="w-5 h-5" />} title="Live Dashboard" description="Real-time campaign status with progress bars. Running/paused/completed indicators. Auto-refresh with paginated views." color="text-accent-warm" bg="bg-accent-warm/10" /></div>
            <div className="animate-on-scroll from-right delay-3"><FeatureCard icon={<FileText className="w-5 h-5" />} title="Reports & Downloads" description="Generate full or inbound reports per campaign. Processing status tracking. Download when ready." color="text-danger" bg="bg-danger/10" /></div>
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="px-4 md:px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Launch a campaign in 4 steps</h2>
          </div>
          <div className="space-y-0">
            {[
              { step: "1", title: "Upload Contacts", desc: "Upload a CSV or TXT file with 10-digit phone numbers, or paste them in bulk. Your contact lists are stored and reusable.", icon: <Upload className="w-5 h-5" /> },
              { step: "2", title: "Upload & Approve Audio", desc: "Upload WAV or MP3 voice prompts. Audio goes through an approval workflow — only approved files can be used in campaigns.", icon: <Music className="w-5 h-5" /> },
              { step: "3", title: "Create Campaign", desc: "Choose Simple IVR, Input IVR, or Call Patch. Select contacts, audio, schedule time (YYYY-MM-DD HH:MM:SS), retries, and launch.", icon: <Megaphone className="w-5 h-5" /> },
              { step: "4", title: "Track & Report", desc: "Monitor live campaign progress — connected calls, DND, pulses, DTMF responses. Generate and download detailed reports.", icon: <BarChart3 className="w-5 h-5" /> },
            ].map((item, i) => (
              <div key={item.step} className={`flex gap-5 md:gap-8 animate-on-scroll from-left delay-${i + 1}`}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full gradient-bg animate-gradient-bg flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-primary/20 animate-pulse-glow">
                    {item.step}
                  </div>
                  {i < 3 && <div className="w-px flex-1 bg-border my-2" />}
                </div>
                <div className="pb-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary">{item.icon}</span>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="px-4 md:px-6 py-20 md:py-28 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted">Pay per call. No hidden fees. Scale when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="animate-on-scroll rotate-in delay-1"><PricingCard title="Starter" price="360" calls="1,000" perCall="0.36" days="28" planId="100498" features={["3 Types of IVR", "Bulk Voice Calls", "Live analytics", "Detailed Report"]} /></div>
            <div className="animate-on-scroll scale-in delay-2"><PricingCard title="Business" price="2,000" calls="10,000" perCall="0.20" days="60" planId="100501" featured features={["3 Types of IVR", "Bulk Voice Calls", "Live analytics", "Detailed Report"]} /></div>
            <div className="animate-on-scroll rotate-in delay-3"><PricingCard title="Enterprise" price="6,000" calls="50,000" perCall="0.12" days="180" planId="100504" features={["3 Types of IVR", "Bulk Voice Calls", "Live analytics", "Detailed Report"]} /></div>
          </div>
          <p className="text-xs text-muted text-center mt-8 animate-on-scroll delay-4">All prices exclusive of 18% GST (GSTIN: 33DCTPK9031D1ZJ). Plans are non-refundable.</p>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center rounded-3xl gradient-bg animate-gradient-bg p-10 md:p-16 relative overflow-hidden animate-on-scroll blur-in">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to automate your voice campaigns?</h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">Create your account in 2 minutes. Upload contacts, approve audio, and launch your first campaign today.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-background text-foreground rounded-full font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-xl">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all">
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">Zero<span className="gradient-text">8</span>Zero</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">Cloud telephony platform for bulk voice calls and IVR campaign management.</p>
              <p className="text-xs text-muted mt-2">GSTIN: 33DCTPK9031D1ZJ</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Platform</h4>
              <div className="space-y-2.5 text-sm text-muted">
                <p><Link href="/register" className="hover:text-foreground transition-colors">Simple IVR</Link></p>
                <p><Link href="/register" className="hover:text-foreground transition-colors">Input IVR</Link></p>
                <p><Link href="/register" className="hover:text-foreground transition-colors">Call Patch</Link></p>
                <p><Link href="/register" className="hover:text-foreground transition-colors">Audio Library</Link></p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Features</h4>
              <div className="space-y-2.5 text-sm text-muted">
                <p><Link href="/register" className="hover:text-foreground transition-colors">Contact Upload</Link></p>
                <p><Link href="/register" className="hover:text-foreground transition-colors">Agent Groups</Link></p>
                <p><Link href="/register" className="hover:text-foreground transition-colors">Live Dashboard</Link></p>
                <p><Link href="/register" className="hover:text-foreground transition-colors">Reports</Link></p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <div className="space-y-2.5 text-sm text-muted">
                <p><Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</Link></p>
                <p><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></p>
                <p><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></p>
                <p><Link href="/fair-usage-policy" className="hover:text-foreground transition-colors">Fair Usage Policy</Link></p>
                <p><Link href="/content-policy" className="hover:text-foreground transition-colors">Content Policy</Link></p>
                <p><Link href="/contact-us" className="hover:text-foreground transition-colors">Contact Us</Link></p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Zero8Zero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </VideoIntro>
  );
}

/* ─── Campaign Type Card ─── */

function CampaignCard({ icon, title, templateId, description, features, gradient }: { icon: React.ReactNode; title: string; templateId: string; description: string; features: string[]; gradient: string }) {
  return (
    <div className="group bg-card rounded-2xl border border-border p-7 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden relative hover-tilt">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} style={{ margin: "-1px", padding: "1px" }} />
      <div className="absolute inset-[1px] rounded-[15px] bg-card -z-[5]" />
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-muted border border-border">ID: {templateId}</span>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-5">{description}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <span className="text-muted">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Feature Card ─── */

function FeatureCard({ icon, title, description, color, bg }: { icon: React.ReactNode; title: string; description: string; color: string; bg: string }) {
  return (
    <div className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Pricing Card ─── */

function PricingCard({ title, price, calls, perCall, days, planId, featured, features }: { title: string; price: string; calls: string; perCall: string; days: string; planId: string; featured?: boolean; features: string[] }) {
  return (
    <div className={`relative p-8 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 ${featured ? "gradient-border bg-card shadow-xl shadow-primary/10 scale-[1.02]" : "border border-border bg-card hover:border-primary/30 hover:shadow-lg"}`}>
      {featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg text-white text-xs font-semibold shadow-lg">Most Popular</div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted mb-1 font-mono">Plan ID: {planId}</p>
      <p className="text-sm text-muted mb-5">{calls} calls &middot; {days} days</p>
      <div className="text-4xl font-extrabold text-foreground mb-1">
        <span className="text-lg font-normal text-muted align-top">{"\u20B9"}</span>{price}
      </div>
      <p className="text-xs text-muted mb-1">{"\u20B9"}{perCall}/call</p>
      <p className="text-xs text-muted mb-8">{days} days validity</p>
      <ul className="text-sm text-left space-y-3 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-muted">
            <Check className="w-4 h-4 text-success shrink-0" />{f}
          </li>
        ))}
      </ul>
      <Link href="/register" className={`block w-full py-2.5 rounded-full font-semibold text-sm transition-all ${featured ? "gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/25" : "bg-surface text-foreground hover:bg-primary/10 hover:text-primary border border-border"}`}>
        Get Started
      </Link>
    </div>
  );
}
