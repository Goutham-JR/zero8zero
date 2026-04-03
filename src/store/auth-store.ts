import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  profile: UserProfile | null;
  roles: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      profile: null,
      roles: [],
      isAuthenticated: false,
      isAdmin: false,

      login: async (username: string, password: string) => {
        try {
          const res = await fetch("https://obd3api.expressivr.com/api/obd/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          const data = await res.json();

          if (res.ok && data.message === "Success") {
            const roles: string[] = Array.isArray(data.role) ? data.role : [];
            const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ROLE_SUPERADMIN");
            const user: User = {
              id: data.userid,
              username: username,
              email: `${username}@zero8zero.com`,
              walletBalance: 0,
            };
            set({ user, token: data.token, roles, isAuthenticated: true, isAdmin });

            // Fetch profile in background
            fetch(
              `https://obd3api.expressivr.com/api/obd/user/profile/${data.userid}`,
              { headers: { Authorization: `Bearer ${data.token}` } }
            )
              .then((r) => (r.ok ? r.json() : null))
              .then((profile) => {
                if (profile) {
                  set({
                    profile,
                    user: {
                      ...user,
                      email: profile.emailid || user.email,
                      walletBalance: profile.credits || 0,
                    },
                  });
                }
              })
              .catch(() => {});

            return { success: true, isAdmin };
          }

          const msg = data.message || "Login failed";
          if (msg === "Something went wrong") {
            return { success: false, error: "Your account validity has expired. Please contact the support team." };
          }
          if (msg === "Bad credentials") {
            return { success: false, error: "Invalid username or password. If your account is inactive, please contact the support team." };
          }
          return { success: false, error: msg };
        } catch {
          return { success: false, error: "Network error. Please try again." };
        }
      },

      logout: () => {
        set({ user: null, token: null, profile: null, roles: [], isAuthenticated: false, isAdmin: false });
      },

      refreshProfile: async () => {
        const { user, token } = get();
        if (!user || !token) return;
        try {
          const res = await fetch(
            `https://obd3api.expressivr.com/api/obd/user/profile/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const profile = await res.json();
            set({
              profile,
              user: { ...user, walletBalance: profile.credits || 0 },
            });
          }
        } catch {
          // Silent fail
        }
      },
    }),
    {
      name: "zero8zero-auth",
    }
  )
);
