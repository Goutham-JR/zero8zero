import Link from "next/link";
import { Phone } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthNavButtons } from "@/components/auth-nav-buttons";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 md:px-6 pt-3">
        <div className="max-w-7xl mx-auto bg-card/80 glass border border-border rounded-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">
                Zero<span className="gradient-text">8</span>Zero
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <AuthNavButtons />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md gradient-bg flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-foreground">Zero<span className="gradient-text">8</span>Zero</span>
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
