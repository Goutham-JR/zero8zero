// === IVR & Campaign Types ===
export type IVRType = "simple" | "input" | "call-patch";
export type CampaignStatus = "draft" | "running" | "paused" | "completed" | "failed";
export type AudioStatus = "pending" | "approved" | "rejected";
export type AgentGroupStatus = "pending" | "approved" | "rejected";

// === User ===
export interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
}

export interface UserProfile {
  username: string;
  userId: number;
  name: string;
  company: string;
  pincode: number;
  credits: number;
  creditsUsed: number;
  userType: string;
  parentCompany: string;
  planId: number;
  pulsePrice: number;
  pulseDuration: number;
  accountType: number;
  channels: number;
  expiryDate: string;
  group: unknown[];
  location: unknown[];
  modules: unknown[];
}

// === Dashboard Stats ===
export interface DashboardStats {
  totalCampaigns: number;
  totalConnectedCalls: number;
  totalNosProcessed: number;
  totalPulses: number;
  totalCost: number;
  userId: number;
  userName: string;
}

// === Campaign Analysis ===
export interface CampaignAnalysis {
  userId: number;
  campaignId: string;
  campaignName: string;
  campaignType: string;
  answered: number;
  dtmf: number;
  nonAnswered: number;
  expenditure: number;
  username: string;
}

// === Historical Campaign ===
export interface HistoricalCampaign {
  campaignId: number;
  campaignName: string;
  campaignStatus: number;
  scheduleTime: string;
  endTime: string;
  numbersUploaded: number;
  numbersProcessed: number;
  dndCount: number;
  smsCount: number;
  callsConnected: number;
  retries: number;
  pulses: number;
  dtmfCount: number;
  dtmf1Count: number;
  dtmf2Count: number;
  isRetry: number;
  retryCount: number;
  status: number;
  webhook: boolean;
  templateId?: number;
}

// === Prompts / Audio ===
export interface Prompt {
  promptId: number;
  promptCategory: string;
  fileName: string;
  userId: number;
  accountType: number;
  promptStatus: number; // 1=approved, 0=pending, 2=rejected, 9=deleted
  username: string;
  promptUrl?: string;
  promptDuration?: number;
  ttsId?: string;
}

// === Base (Contact List) ===
export interface BaseItem {
  baseId: number;
  baseName: string;
}

// === CLI ===
export interface CLIItem {
  cliId: number;
  cli: string;
  dialerName?: string;
  locationName?: string;
  allocationDate?: string;
}

// === Location ===
export interface LocationItem {
  locationId: number;
  locationName: string;
}

// === IVR ===
export interface IVRItem {
  context: string;
  ivrId: number;
  ivrName: string;
  reqDate: string;
  status: number;
  webhook: boolean;
}

// === Credit History ===
export interface CreditHistoryEntry {
  userId: number;
  credits: number;
  flag: number;
  action: string;
  reqDate: string;
  userBalance: number;
  fromUsername?: string;
  toUsername?: string;
  actionOn?: string;
  campaignName?: string;
  campId?: number;
  // legacy field kept for user-level history
  username?: string;
}

// === Admin / Reseller Types ===
export interface AdminUser {
  userId: number;
  username: string;
  name: string;
  company: string;
  credits: number;
  creditsUsed: number;
  userType: string;
  accountType: number;
  channels?: number;
  expiryDate: string;
  planId?: number;
  planName?: string;
  emailid?: string;
  number?: string;
  address?: string;
  pincode?: number;
  parentCompany?: string;
  pulsePrice?: number;
  pulseDuration?: number;
  reqDate?: string;
  userGroups?: string;
  userLocations?: string;
  userModules?: string;
  sub?: number;
  subId?: number;
  deleted?: number;
  ttsCredits?: number;
  group?: unknown[];
  location?: unknown[];
  modules?: unknown[];
}

export interface PlanItem {
  planId: number;
  planName: string;
  pulseDuration: number;
  planStatus?: number;
  pulsePrice?: number;
  channels?: number;
}

export interface GroupItem {
  groupId: number;
  groupName: string;
}

export interface ModuleItem {
  moduleId: number;
  moduleName: string;
}

export interface DedicatedCLI {
  cliId: number;
  cli: string;
  dialerName: string;
  locationName: string;
  allocationDate?: string;
}

export interface InboundCampaign {
  userId: number;
  campaignId: number;
  campaignName: string;
  campaignStatus: number;
  scheduleTime: string;
  numbersProcessed: number;
  smsCount: number;
  callsConnected: number;
  templateId: number;
  pulses: number;
  dtmfCount: number;
  username: string;
  status: number;
  webhook: boolean;
  didList?: { did: string; didId: number }[];
}

export interface ReportItem {
  status: number;
  campaignId: number;
  userId: number;
  reportType: string;
  reqDate: string;
  campaignName: string;
  reportUrl: string;
}

export interface BlacklistItem {
  blacklistId: number;
  mobile: string;
  reqDate: string;
  status: number;
}

export interface TotalCallsStats {
  totalCalls: number;
  totalConnectedCalls: number;
}

// === Legacy types kept for compatibility ===
export interface Campaign {
  id: string;
  name: string;
  type: IVRType;
  status: CampaignStatus;
  contacts: number;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
  successCount: number;
  failedCount: number;
}

export interface AudioFile {
  id: string;
  name: string;
  filename: string;
  duration: number;
  status: AudioStatus;
  uploadedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
}

export interface AgentGroup {
  id: string;
  name: string;
  agents: Agent[];
  status: AgentGroupStatus;
  createdAt: string;
}
