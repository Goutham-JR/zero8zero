"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Phone,
  LayoutDashboard,
  Users,
  Wallet,
  Megaphone,
  Music,
  Radio,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  User,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/credits", label: "Credits", icon: Wallet },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/audio", label: "Audio", icon: Music },
  { href: "/admin/cli", label: "CLI", icon: Radio },
  { href: "/admin/reports", label: "Reports", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, isAdmin, logout, refreshProfile } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user?.id) refreshProfile();
  }, [mounted, isAuthenticated, user?.id, refreshProfile]);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !isAdmin)) router.push("/login");
  }, [mounted, isAuthenticated, isAdmin, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function close(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [userMenuOpen]);

  if (!mounted) return null;
  if (!isAuthenticated || !isAdmin || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ═══ Top Navbar ═══ */}
      <header className="sticky top-0 z-50 px-4 md:px-6 pt-3">
        <div className="max-w-7xl mx-auto bg-card/80 glass border border-border rounded-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-danger to-accent-warm flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-lg font-bold text-foreground tracking-tight">
                  Zero<span className="text-danger">8</span>Zero
                </span>
                <span className="block text-[9px] font-bold text-danger uppercase tracking-wider -mt-0.5">Admin Panel</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-danger/15 text-danger"
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
              {/* Credits badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-danger/10 border border-danger/20 rounded-full">
                <Shield className="w-3.5 h-3.5 text-danger" />
                <span className="text-xs font-semibold text-danger">
                  {profile?.credits?.toFixed(2) ?? "0.00"}
                </span>
              </div>

              <ThemeToggle />

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-danger to-accent-warm flex items-center justify-center text-white text-xs font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{profile?.name || user.username}</p>
                      <p className="text-xs text-muted truncate">Reseller Admin</p>
                    </div>
                    <div className="p-1.5">
                      <Link href="/admin/users" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-colors">
                        <Users className="w-4 h-4" /> User Management
                      </Link>
                      <Link href="/admin/credits" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-colors">
                        <Wallet className="w-4 h-4" /> Credit History
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
              <div className="flex items-center gap-2 px-3 py-2.5 mb-2 bg-danger/10 border border-danger/20 rounded-full sm:hidden">
                <Shield className="w-4 h-4 text-danger" />
                <span className="text-sm font-semibold text-danger">
                  {profile?.credits?.toFixed(2) ?? "0.00"}
                </span>
              </div>
              {navItems.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-danger/15 text-danger"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-border pt-2 mt-2">
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-danger to-accent-warm flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">
                Zero<span className="text-danger">8</span>Zero
                <span className="text-[9px] text-danger ml-1.5 uppercase font-bold">Admin</span>
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
