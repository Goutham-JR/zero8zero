"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";

export function AuthNavButtons() {
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    // SSR fallback — show login/register
    return (
      <>
        <Link href="/login" className="hidden sm:inline-block px-5 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
          Login
        </Link>
        <Link href="/register" className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
          Get Started
        </Link>
      </>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Link
        href={isAdmin ? "/admin" : "/dashboard"}
        className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
      >
        Go to {isAdmin ? "Admin Panel" : "Dashboard"}
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className="hidden sm:inline-block px-5 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
        Login
      </Link>
      <Link href="/register" className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
        Get Started
      </Link>
    </>
  );
}
