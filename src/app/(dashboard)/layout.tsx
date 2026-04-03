"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Phone,
  LayoutDashboard,
  Megaphone,
  Music,
  Users,
  Wallet,
  LogOut,
  History,
  CreditCard,
  FileText,
  User,
  Crown,
  Menu,
  X,
  BookUser,
  ChevronDown,
  Speech,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/create-campaign", label: "Create Campaign", icon: Megaphone },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: History },
  { href: "/dashboard/audio-library", label: "Audio", icon: Music },
  { href: "/dashboard/text-to-speech", label: "TTS", icon: Speech },
  { href: "/dashboard/contact-library", label: "Contacts", icon: BookUser },
  { href: "/dashboard/agent-groups", label: "Agents", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, logout, refreshProfile } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user?.id) refreshProfile();
  }, [mounted, isAuthenticated, user?.id, refreshProfile]);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push("/login");
  }, [mounted, isAuthenticated, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function close(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [userMenuOpen]);

  if (!mounted) return null;
  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ═══ Top Navbar ═══ */}
      <header className="sticky top-0 z-50 px-4 md:px-6 pt-3">
        <div className="max-w-7xl mx-auto bg-card/80 glass border border-border rounded-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight hidden sm:block">
                Zero<span className="gradient-text">8</span>Zero
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary-light"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Wallet */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-accent-warm/10 border border-accent-warm/20 rounded-full">
                <Wallet className="w-3 h-3 text-accent-warm" />
                <span className="text-[11px] font-bold text-accent-warm">
                  {profile?.credits?.toFixed(2) ?? user.walletBalance.toLocaleString("en-IN")}
                </span>
              </div>

              <ThemeToggle />

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface transition-colors"
                >
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{profile?.name || user.username}</p>
                      <p className="text-xs text-muted truncate">{profile?.company || user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/dashboard/plans" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-colors">
                        <Crown className="w-4 h-4" /> Plans & Pricing
                      </Link>
                      <Link href="/dashboard/credits" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-colors">
                        <CreditCard className="w-4 h-4" /> Credits
                      </Link>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => { logout(); router.push("/login"); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-muted hover:text-foreground rounded-full border border-border bg-surface"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden mt-2 mx-4 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {/* Wallet on mobile */}
              <div className="flex items-center gap-2 px-3 py-2.5 mb-2 bg-accent-warm/10 border border-accent-warm/20 rounded-full sm:hidden">
                <Wallet className="w-4 h-4 text-accent-warm" />
                <span className="text-sm font-semibold text-accent-warm">
                  {profile?.credits?.toFixed(2) ?? user.walletBalance.toLocaleString("en-IN")}
                </span>
              </div>
              {navItems.map((item) => {
                const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary-light"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all">
                  <User className="w-[18px] h-[18px]" /> Profile
                </Link>
                <Link href="/dashboard/plans" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all">
                  <Crown className="w-[18px] h-[18px]" /> Plans & Pricing
                </Link>
                <Link href="/dashboard/credits" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-all">
                  <CreditCard className="w-[18px] h-[18px]" /> Credits
                </Link>
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all w-full"
                >
                  <LogOut className="w-[18px] h-[18px]" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">
                Zero<span className="gradient-text">8</span>Zero
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
              <Link href="/fair-usage-policy" className="hover:text-foreground transition-colors">Fair Usage</Link>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/content-policy" className="hover:text-foreground transition-colors">Content Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund</Link>
              <Link href="/contact-us" className="hover:text-foreground transition-colors">Contact Us</Link>
            </div>
            <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Zero8Zero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
