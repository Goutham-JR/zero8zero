"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Phone, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { logToSheetClient } from "@/lib/google-sheet";

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  emailid: string;
  number: string;
  company: string;
  address: string;
  pincode: string;
  agreeTerms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(isAdmin ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setLoading(true);

    try {
      // Get service token from reseller account for registration
      const loginRes = await fetch("https://obd3api.expressivr.com/api/obd/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "Cloudcentral", password: "Admin@123" }),
      });
      const loginData = await loginRes.json();
      if (!loginData.token) {
        setError("Registration service unavailable. Please try again later.");
        setLoading(false);
        return;
      }

      const res = await fetch("https://obd3api.expressivr.com/api/obd/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          planId: "100318",
          name: data.name,
          emailid: data.emailid,
          number: data.number,
          address: data.address || "",
          company: data.company,
          pincode: data.pincode,
          parent: loginData.userid,
          accountType: "0",
          userType: "user",
          expiryDate: "2027-12-31 23:59:59",
          auth_token: loginData.token,
          groupRows: JSON.stringify({ groupsList: [{ groupId: "34", groupName: "BLR_ALL" }] }),
          locationRows: JSON.stringify({ locationsList: [{ locationId: "3", locationName: "Bangalore" }] }),
          moduleId: "1",
          planType: "0",
        }),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (result.userId) {
        // Log new registration to Google Sheet
        await logToSheetClient({
          _sheet: "Users",
          userId: String(result.userId),
          username: data.username,
          name: data.name,
          email: data.emailid,
          phone: data.number,
          company: data.company,
          credits: "0",
          creditsUsed: "0",
          userType: "user",
          planName: "Trial",
          pulsePrice: "",
          pulseDuration: "15",
          accountType: "0",
          registeredOn: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          expiryDate: "2027-12-31 23:59:59",
          groups: "BLR_ALL",
          locations: "Bangalore",
          modules: "",
          status: "Active",
        });

        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

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
              <Link href="/login" className="px-4 py-1.5 text-xs font-semibold text-white gradient-bg rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg relative z-10">

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-xl shadow-black/5">
          <h2 className="text-2xl font-bold mb-2 text-center text-foreground">Create Account</h2>
          <p className="text-sm text-muted text-center mb-6">Fill in your details to register</p>

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Account Created!</h3>
              <p className="text-sm text-muted">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Username *</label>
                    <input
                      {...register("username", {
                        required: "Username is required",
                        minLength: { value: 4, message: "Min 4 characters" },
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, underscore only" },
                      })}
                      className={inputClass}
                      placeholder="johndoe"
                    />
                    {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                  <input
                    type="email"
                    {...register("emailid", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                    })}
                    className={inputClass}
                    placeholder="john@company.com"
                  />
                  {errors.emailid && <p className="text-danger text-xs mt-1">{errors.emailid.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number *</label>
                  <input
                    {...register("number", {
                      required: "Phone number is required",
                      pattern: { value: /^[0-9]{10,12}$/, message: "Enter 10-12 digit number" },
                    })}
                    className={inputClass}
                    placeholder="9876543210"
                  />
                  {errors.number && <p className="text-danger text-xs mt-1">{errors.number.message}</p>}
                </div>

                {/* Company & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Company *</label>
                    <input
                      {...register("company", { required: "Company is required" })}
                      className={inputClass}
                      placeholder="Company name"
                    />
                    {errors.company && <p className="text-danger text-xs mt-1">{errors.company.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Pincode *</label>
                    <input
                      {...register("pincode", {
                        required: "Pincode is required",
                        pattern: { value: /^[0-9]{5,6}$/, message: "Enter valid pincode" },
                      })}
                      className={inputClass}
                      placeholder="560001"
                    />
                    {errors.pincode && <p className="text-danger text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
                  <input
                    {...register("address")}
                    className={inputClass}
                    placeholder="Street address, City"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 8, message: "Min 8 characters" },
                        })}
                        className={`${inputClass} pr-12`}
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground rounded-lg transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password *</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("confirmPassword", {
                        required: "Confirm your password",
                        validate: (val) => val === watch("password") || "Passwords don't match",
                      })}
                      className={inputClass}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Terms & Privacy Agreement */}
                <div className="mt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("agreeTerms", { required: "You must agree to the terms and conditions" })}
                      className="w-4 h-4 rounded accent-primary mt-0.5 shrink-0"
                    />
                    <span className="text-xs text-muted leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms-and-conditions" target="_blank" className="text-primary font-semibold hover:underline">Terms & Conditions</Link>
                      {" "}and{" "}
                      <Link href="/privacy-policy" target="_blank" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-danger text-xs mt-1 ml-7">{errors.agreeTerms.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
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
