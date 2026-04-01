import { apiGet, apiPost } from "./api";
import type { CampaignAnalysis, HistoricalCampaign } from "@/types";

export function fetchCampaignAnalysis(
  userId: string,
  startDate: string,
  endDate: string,
  campaignType = "All",
  campaignName = "All"
) {
  return apiPost<CampaignAnalysis[]>("/api/obd/campaign/analysis", {
    userId,
    startDate,
    endDate,
    campaignType,
    campaignName,
    username: "",
  });
}

export function fetchLiveCampaigns(userId: string) {
  return apiGet<unknown[]>(`/api/obd/campaign/${userId}`);
}

export function fetchHistoricalCampaigns(userId: string, startDate: string, endDate: string) {
  return apiPost<HistoricalCampaign[]>("/api/obd/campaign/historical", {
    userId,
    startDate,
    endDate,
  });
}

export function composeCampaign(payload: Record<string, unknown>) {
  return apiPost<{ campaignId: string; message: string }>("/api/obd/campaign/compose", payload);
}

export function pauseCampaign(campaignId: number) {
  return apiPost<{ message: string }>("/api/obd/campaign/pause", { campaignId });
}

export function stopCampaign(campaignId: number) {
  return apiPost<{ message: string }>("/api/obd/campaign/stop", { campaignId });
}

export function resumeCampaign(campaignId: number, userId: string) {
  return apiPost<{ message: string }>("/api/obd/campaign/resume", { campaignId, userId });
}

export function fetchLocations(userId: string) {
  return apiGet<{ locationId: number; locationName: string }[]>(`/api/obd/user/locations/${userId}`);
}

export function fetchCLIList(userId: string) {
  return apiGet<{ cliId: number; cli: string; dialerName: string; locationName: string; cliStatus: number }[]>(
    `/api/obd/cli/${userId}`
  );
}

export function fetchDedicatedCLI(userId: string) {
  return apiGet<{ cliId: number; cli: string; dialerName: string; locationName: string; allocationDate: string }[]>(
    `/api/obd/dedicated/cli/allocated/${userId}`
  );
}

// Retry
export function fetchRetryOptions(campaignId: number) {
  return apiGet<{ optionName: string; count: string }[]>(`/api/obd/campaign/retry/option/${campaignId}`);
}

export function retryCampaign(campaignId: number, userId: string, selectedOptions: string) {
  return apiPost<{ campaignId: string; message: string }>("/api/obd/campaign/retry", {
    campaignId,
    userId,
    selectedOptions,
  });
}

// Scheduled campaigns
export function fetchScheduledCampaigns(userId: string) {
  return apiGet<unknown[]>(`/api/obd/campaign/schedule/${userId}`);
}

// Call Detail Records
export function searchCallRecords(payload: Record<string, unknown>) {
  return apiPost<unknown[]>("/api/obd/searchNumber", payload);
}

// Dashboard details
export function fetchDashboardDetails(userId: string) {
  return apiGet<Record<string, unknown>>(`/api/obd/dashboard/${userId}`);
}
