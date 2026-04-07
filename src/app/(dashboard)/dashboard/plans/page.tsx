"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Briefcase,
  Building2,
  Phone,
  Clock,
  Check,
  Star,
  Sparkles,
  TrendingDown,
  Shield,
  Headphones,
  BarChart3,
  MessageSquare,
} from "lucide-react";

interface Plan {
  calls: number;
  perCall: number;
  days: number;
  total: number;
  planId: string;
}

interface PlanTier {
  name: string;
  tagline: string;
  icon: React.ReactNode;
  accentFrom: string;
  accentTo: string;
  plans: Plan[];
  features: string[];
}

const TIERS: PlanTier[] = [
  {
    name: "Starter",
    tagline: "Perfect for small teams getting started",
    icon: <Zap className="w-5 h-5" />,
    accentFrom: "#3b82f6",
    accentTo: "#60a5fa",
    plans: [
      { calls: 1000, perCall: 0.36, days: 28, total: 360, planId: "100498" },
      { calls: 3000, perCall: 0.30, days: 28, total: 900, planId: "100499" },
      { calls: 5000, perCall: 0.24, days: 28, total: 1200, planId: "100500" },
    ],
    features: ["3 Types of IVR", "Bulk Voice Calls", "Live analytics", "Detailed Report"],
  },
  {
    name: "Business",
    tagline: "For growing businesses with higher volumes",
    icon: <Briefcase className="w-5 h-5" />,
    accentFrom: "#8b5cf6",
    accentTo: "#a78bfa",
    plans: [
      { calls: 10000, perCall: 0.20, days: 60, total: 2000, planId: "100501" },
      { calls: 20000, perCall: 0.18, days: 60, total: 3600, planId: "100502" },
      { calls: 30000, perCall: 0.15, days: 60, total: 4500, planId: "100503" },
    ],
    features: ["3 Types of IVR", "Bulk Voice Calls", "Live analytics", "Detailed Report"],
  },
  {
    name: "Enterprise",
    tagline: "Maximum scale, minimum cost per call",
    icon: <Building2 className="w-5 h-5" />,
    accentFrom: "#06b6d4",
    accentTo: "#22d3ee",
    plans: [
      { calls: 50000, perCall: 0.12, days: 180, total: 6000, planId: "100504" },
      { calls: 100000, perCall: 0.10, days: 365, total: 10000, planId: "100505" },
      { calls: 500000, perCall: 0.08, days: 365, total: 40000, planId: "100506" },
    ],
    features: ["3 Types of IVR", "Bulk Voice Calls", "Live analytics", "Detailed Report"],
  },
];

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function savings(plan: Plan) {
  const maxRate = 0.36;
  if (plan.perCall >= maxRate) return 0;
  return Math.round(((maxRate - plan.perCall) / maxRate) * 100);
}

export default function PlansPage() {
  const router = useRouter();
  const [activeTier, setActiveTier] = useState(1);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(1);

  function handleBuyPlan(tierName: string, p: Plan) {
    const gstAmount = Math.round(p.total * 1.18);
    const params = new URLSearchParams({
      plan: `${tierName} — ${fmt(p.calls)} Calls`,
      amount: String(gstAmount),
      calls: String(p.calls),
      days: String(p.days),
      basePrice: String(p.total),
      planId: String(p.planId),
    });
    router.push(`/dashboard/payment?${params.toString()}`);
  }

  const tier = TIERS[activeTier] || TIERS[0];
  const plan = tier.plans[selectedPlanIdx] || tier.plans[0];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mx-auto">
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Plans that scale with you
        </h2>
        <p className="text-muted max-w-lg mx-auto">
          Start small, grow big. Every plan includes full platform access. Only pay for the calls you need.
        </p>
      </div>

      {/* Tier Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-surface border border-border rounded-2xl p-1.5 gap-1">
          {TIERS.map((t, idx) => (
            <button
              key={t.name}
              onClick={() => { setActiveTier(idx); setSelectedPlanIdx(idx === 2 ? 0 : 1); }}
              className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTier === idx && activeTier < 3
                  ? "bg-card text-foreground shadow-lg border border-border"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.name}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTier(3)}
            className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTier === 3
                ? "bg-card text-foreground shadow-lg border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Custom</span>
          </button>
        </div>
      </div>

      {activeTier === 3 ? (
        /* Custom Plan View */
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">Custom Pack</p>
            <p className="text-sm text-muted mt-0.5">Tailored solutions built for your business needs</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-secondary to-accent">
              <div className="bg-card rounded-2xl p-8 md:p-10 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground">Need a Custom Plan?</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mt-3">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-semibold text-primary">Minimum 2,00,000 calls</span>
                  </div>
                  <p className="text-muted mt-3 max-w-md mx-auto leading-relaxed">
                    Custom plans are available for volumes starting at 2 lakh calls. Get custom call rates, dedicated CLIs, and a tailored solution built for your business needs and budget.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { label: "Custom Call Rates", desc: "Negotiate per-call pricing" },
                    { label: "Flexible Validity", desc: "Choose your own duration" },
                    { label: "Volume Discounts", desc: "Better rates at scale" },
                  ].map((f) => (
                    <div key={f.label} className="bg-surface rounded-xl p-4 border border-border">
                      <p className="text-sm font-semibold text-foreground">{f.label}</p>
                      <p className="text-xs text-muted mt-0.5">{f.desc}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                >
                  <Headphones className="w-4 h-4" /> Contact Support Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Plan View */
        <>
      {/* Tier Description */}
      <div className="text-center">
        <p className="text-lg font-bold text-foreground">{tier.name} Pack</p>
        <p className="text-sm text-muted mt-0.5">{tier.tagline}</p>
      </div>

      {/* Plan Change Warning */}
      <div className="bg-accent-warm/5 border border-accent-warm/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-accent-warm/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Switching plans will reset your credits</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            If you purchase a different plan from your current one, your existing credit balance will be removed and replaced with the new plan&apos;s credits. Purchasing the same plan will simply add credits to your current balance.
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tier.plans.map((p, idx) => {
          const isActive = selectedPlanIdx === idx;
          const save = savings(p);
          const isBest = idx === (activeTier === 2 ? 2 : 1);

          return (
            <div
              key={p.calls}
              onClick={() => setSelectedPlanIdx(idx)}
              className="relative cursor-pointer group"
            >
              {/* Best value ribbon */}
              {isBest && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1 text-white text-[11px] font-bold rounded-full shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})` }}
                  >
                    <Star className="w-3 h-3" /> BEST VALUE
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-2xl p-[1px] transition-all duration-300 ${
                  isActive ? "shadow-2xl scale-[1.02]" : "hover:shadow-xl hover:scale-[1.01]"
                }`}
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})` }
                    : {}
                }
              >
                <div className={`h-full rounded-2xl p-6 md:p-7 flex flex-col ${
                  isActive ? "bg-card" : "bg-card border border-border"
                }`}>
                  {/* Calls count */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-4xl font-extrabold tracking-tight"
                        style={{ color: isActive ? tier.accentFrom : undefined }}
                      >
                        {fmt(p.calls)}
                      </p>
                      {save > 0 && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                          style={{
                            background: `${tier.accentFrom}15`,
                            color: tier.accentFrom,
                          }}
                        >
                          <TrendingDown className="w-3 h-3" />
                          {save}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-0.5">calls included</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-extrabold text-foreground">{"\u20B9"}{fmt(p.total)}</span>
                      <span className="text-sm text-muted mb-1">+ GST</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-muted">
                        {"\u20B9"}{p.perCall.toFixed(2)}/call
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-sm text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {p.days} days
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-7 flex-1">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5 text-sm">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${tier.accentFrom}15` }}
                        >
                          <Check className="w-3 h-3" style={{ color: tier.accentFrom }} />
                        </div>
                        <span className="text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isActive) handleBuyPlan(tier.name, p);
                      else setSelectedPlanIdx(idx);
                    }}
                    className={
                      isActive
                        ? "w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 text-white"
                        : "w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-surface border border-border text-foreground group-hover:bg-card-hover"
                    }
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})`,
                            boxShadow: `0 8px 24px ${tier.accentFrom}40`,
                          }
                        : {}
                    }
                  >
                    {isActive ? (
                      <><Check className="w-4 h-4" /> Buy Now</>
                    ) : (
                      "Choose Plan"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Summary Bar */}
      <div
        className="rounded-2xl p-[1px]"
        style={{ background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})` }}
      >
        <div className="bg-card rounded-2xl p-6 md:p-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})` }}
              >
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {tier.name} &mdash; {fmt(plan.calls)} Calls
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted">
                  <span>{"\u20B9"}{plan.perCall.toFixed(2)} per call</span>
                  <span>{plan.days} days validity</span>
                  <span className="font-semibold text-foreground">
                    Total: {"\u20B9"}{fmt(plan.total)} + 18% GST = {"\u20B9"}{fmt(Math.round(plan.total * 1.18))}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleBuyPlan(tier.name, plan)}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})`,
                boxShadow: `0 8px 24px ${tier.accentFrom}30`,
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: <Shield className="w-5 h-5" />, title: "No Hidden Charges", desc: "What you see is what you pay. Only 18% GST extra." },
          { icon: <Headphones className="w-5 h-5" />, title: "Dedicated Support", desc: "Get help when you need it with our responsive team." },
          { icon: <BarChart3 className="w-5 h-5" />, title: "Real-time Analytics", desc: "Track every call with detailed campaign reports." },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-primary/20 hover:shadow-lg hover:shadow-glow transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compare All Plans */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Compare All Plans</h3>
          <p className="text-xs text-muted mt-0.5">Side-by-side comparison of every option</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-muted">
                <th className="px-6 py-3.5 text-left font-medium">Pack</th>
                <th className="px-6 py-3.5 text-right font-medium">Calls</th>
                <th className="px-6 py-3.5 text-right font-medium">Per Call</th>
                <th className="px-6 py-3.5 text-right font-medium">Validity</th>
                <th className="px-6 py-3.5 text-right font-medium">Price</th>
                <th className="px-6 py-3.5 text-right font-medium">With GST</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) =>
                t.plans.map((p, pIdx) => (
                  <tr
                    key={`${t.name}-${p.calls}`}
                    className="border-t border-border hover:bg-card-hover transition-colors"
                  >
                    {pIdx === 0 && (
                      <td className="px-6 py-3.5 font-semibold text-foreground" rowSpan={t.plans.length}>
                        <div className="flex items-center gap-2">
                          {t.icon}
                          {t.name}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-3.5 text-right font-medium text-foreground">{fmt(p.calls)}</td>
                    <td className="px-6 py-3.5 text-right text-muted">{"\u20B9"}{p.perCall.toFixed(2)}</td>
                    <td className="px-6 py-3.5 text-right text-muted">{p.days} days</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-foreground">{"\u20B9"}{fmt(p.total)}</td>
                    <td className="px-6 py-3.5 text-right text-muted">{"\u20B9"}{fmt(Math.round(p.total * 1.18))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      </>
      )}

      {/* Footer */}
      <p className="text-xs text-muted text-center pb-4">
        All prices are exclusive of 18% GST (GSTIN: 33DCTPK9031D1ZJ). Plans are non-refundable.
      </p>
    </div>
  );
}
