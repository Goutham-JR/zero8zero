"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Phone, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(isAdmin ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    setLoading(true);
    const result = await login(data.username, data.password);
    setLoading(false);
    if (result.success) {
      router.push(result.isAdmin ? "/admin" : "/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 md:px-6 pt-3">
        <div className="max-w-7xl mx-auto bg-card/80 glass border border-border rounded-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight hidden sm:block">
                Zero<span className="gradient-text">8</span>Zero
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <Link href="/" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-foreground hover:bg-surface transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <Link href="/register" className="px-4 py-1.5 text-xs font-semibold text-white gradient-bg rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10">

        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-black/5">
          <h2 className="text-2xl font-bold mb-2 text-center text-foreground">Welcome back</h2>
          <p className="text-sm text-muted text-center mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                {...register("username", { required: "Username is required" })}
                className="w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-danger text-xs mt-1.5">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Password is required" })}
                  className="w-full px-4 py-3 pr-12 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>

        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md gradient-bg flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-foreground">Zero<span className="gradient-text">8</span>Zero</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted">
              <Link href="/fair-usage-policy" className="hover:text-foreground transition-colors">Fair Usage</Link>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/content-policy" className="hover:text-foreground transition-colors">Content Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund</Link>
              <Link href="/contact-us" className="hover:text-foreground transition-colors">Contact Us</Link>
            </div>
            <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Zero8Zero.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
