import { apiGet, apiPost } from "./api";
import type {
  AdminUser,
  PlanItem,
  LocationItem,
  GroupItem,
  ModuleItem,
  DedicatedCLI,
  CreditHistoryEntry,
  CampaignAnalysis,
  DashboardStats,
  TotalCallsStats,
  Prompt,
  HistoricalCampaign,
  InboundCampaign,
  ReportItem,
} from "@/types";

// ── Users ──

export async function fetchUsers(parentUserId: string) {
  const res = await apiGet<{ users: AdminUser[] } | AdminUser[]>(`/api/obd/user/${parentUserId}`);
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "users" in res && Array.isArray(res.users)) return res.users;
  return [];
}

export function registerUser(payload: Record<string, unknown>) {
  return apiPost<{ userId: string; message: string }>("/api/obd/register", payload);
}

export function fetchUserProfile(userId: string) {
  return apiGet<Record<string, unknown>>(`/api/obd/user/profile/${userId}`);
}

export function updateUserProfile(payload: Record<string, unknown>) {
  return apiPost<{ message: string }>("/api/obd/user/update", payload);
}

export function changeAccountType(userId: string, accountType: string) {
  return apiPost<{ message: string }>("/api/obd/change/accountType", { userId, accountType });
}

// ── Credits ──

export function addCredits(userId: number, parent: string, credits: string) {
  return apiPost<{ message: string }>("/api/obd/credits/add", { userId, parent, credits });
}

export function removeCredits(userId: number, parent: string, credits: string) {
  return apiPost<{ message: string }>("/api/obd/credits/remove", { userId, parent, credits });
}

export function fetchAllCreditHistory(userId: string, startDate: string, endDate: string) {
  return apiPost<CreditHistoryEntry[]>("/api/obd/credits/history", { userId, startDate, endDate });
}

// ── Dashboard ──

export function fetchTotalCalls(userId: string, startDate: string, endDate: string) {
  return apiPost<TotalCallsStats>("/api/obd/dashboard/totalCalls", { userId, startDate, endDate });
}

export function fetchUserStatsSummary(userId: string, startDate: string, endDate: string) {
  return apiPost<DashboardStats[]>("/api/obd/user/statistic/summary", { userId, startDate, endDate });
}

// ── Campaigns ──

export function fetchAdminCampaignAnalysis(
  userId: string,
  startDate: string,
  endDate: string,
  campaignType = "All",
  campaignName = "All",
  username = ""
) {
  return apiPost<CampaignAnalysis[]>("/api/obd/campaign/analysis", {
    userId,
    startDate,
    endDate,
    campaignType,
    campaignName,
    username,
  });
}

export function fetchAdminHistoricalCampaigns(userId: string, startDate: string, endDate: string) {
  return apiPost<HistoricalCampaign[]>("/api/obd/campaign/historical", { userId, startDate, endDate });
}

// ── Audio / Prompts ──

export function fetchAllPrompts(userId: string) {
  return apiGet<Prompt[]>(`/api/obd/prompts/${userId}`);
}

// ── CLI Management ──

export function fetchCLIs(userId: string) {
  return apiGet<{ cliId: number; cli: string; dialerName: string; locationName: string; cliStatus: number }[]>(
    `/api/obd/cli/${userId}`
  );
}

export function fetchDedicatedCLIs(userId: string) {
  return apiGet<DedicatedCLI[]>(`/api/obd/cli/dedicated/${userId}`);
}

export function fetchAllocatedCLIs(userId: string) {
  return apiGet<DedicatedCLI[]>(`/api/obd/dedicated/cli/allocated/${userId}`);
}

export function allocateDedicatedCLI(userId: string, allocationType: "manual" | "bulk", cli: string, cliRange?: string) {
  const payload: Record<string, unknown> = { userId, allocationType, cli };
  if (allocationType === "bulk" && cliRange) {
    payload.cliRange = cliRange;
  }
  return apiPost<{ message: string }>("/api/obd/dedicated/cli/allocate", payload);
}

export function removeDedicatedCLI(userId: string, cliIds: string) {
  return apiPost<{ message: string }>("/api/obd/dedicated/remove/cli", { userId, cliIds });
}

// ── Plans, Locations, Modules ──

export function fetchPlans(userId: string) {
  return apiGet<PlanItem[]>(`/api/obd/plans/list/${userId}`);
}

export function fetchLocations() {
  return apiGet<LocationItem[]>("/api/obd/locations");
}

export function fetchGroups() {
  return apiGet<GroupItem[]>("/api/obd/groups");
}

export function fetchModules() {
  return apiGet<ModuleItem[]>("/api/obd/module");
}

// ── Reports ──

export function generateReport(campaignId: number, reportType: string) {
  return apiPost<{ reportStatus: string; message: string; reportId?: string }>("/api/obd/report/generate", {
    campaignId,
    reportType,
  });
}

export function fetchReports(userId: string) {
  return apiGet<ReportItem[]>(`/api/obd/report/download/${userId}`);
}

// ── Inbound Campaigns ──

export function fetchInboundCampaigns(userId: string, campaignName = "", did = "") {
  return apiPost<InboundCampaign[]>("/api/obd/inbound/campaign", { userId, campaignName, did });
}

export function stopInboundCampaign(campaignId: number) {
  return apiPost<{ message: string }>("/api/obd/inbound/campaign/stop", { campaignId });
}

export function startInboundCampaign(campaignId: number, clis: string) {
  return apiPost<{ message: string }>("/api/obd/inbound/campaign/start", { campaignId, clis });
}

// ── CDR (Call Detail Records) ──

export function searchCDR(bni: string, startDate: string, endDate: string, pageNo = 1, pageSize = 50) {
  return apiPost<unknown[]>("/api/obd/searchNumber", { bni, startDate, endDate, pageNo, pageSize });
}

// ── User Locations ──

export function fetchUserLocations(userId: string) {
  return apiGet<LocationItem[]>(`/api/obd/user/locations/${userId}`);
}
