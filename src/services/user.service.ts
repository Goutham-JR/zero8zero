import { apiGet, apiPost } from "./api";
import type { UserProfile, DashboardStats, CreditHistoryEntry } from "@/types";

export function fetchProfile(userId: string) {
  return apiGet<UserProfile>(`/api/obd/user/profile/${userId}`);
}

export function fetchDashboardStats(userId: string, startDate: string, endDate: string) {
  return apiPost<DashboardStats[]>("/api/obd/user/statistic/summary", {
    userId,
    startDate,
    endDate,
  });
}

export function fetchCreditHistory(userId: string, startDate: string, endDate: string) {
  return apiPost<CreditHistoryEntry[]>("/api/obd/credits/history/user", {
    userId,
    startDate,
    endDate,
  });
}
