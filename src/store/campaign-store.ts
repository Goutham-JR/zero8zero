import { create } from "zustand";
import type { Campaign, AudioFile, AgentGroup } from "@/types";

interface CampaignState {
  campaigns: Campaign[];
  audioFiles: AudioFile[];
  agentGroups: AgentGroup[];
  addCampaign: (campaign: Campaign) => void;
  addAudioFile: (file: AudioFile) => void;
  updateAudioStatus: (id: string, status: AudioFile["status"]) => void;
  addAgentGroup: (group: AgentGroup) => void;
  updateAgentGroupStatus: (id: string, status: AgentGroup["status"]) => void;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Welcome Campaign",
    type: "simple",
    status: "completed",
    contacts: 1500,
    createdAt: "2026-03-25",
    completedAt: "2026-03-25",
    successCount: 1420,
    failedCount: 80,
  },
  {
    id: "2",
    name: "Survey IVR",
    type: "input",
    status: "running",
    contacts: 3000,
    createdAt: "2026-03-28",
    successCount: 1800,
    failedCount: 200,
  },
  {
    id: "3",
    name: "Support Patch",
    type: "call-patch",
    status: "draft",
    contacts: 500,
    createdAt: "2026-03-30",
    successCount: 0,
    failedCount: 0,
  },
];

const MOCK_AUDIO: AudioFile[] = [
  { id: "1", name: "Welcome Message", filename: "welcome.mp3", duration: 15, status: "approved", uploadedAt: "2026-03-20" },
  { id: "2", name: "Menu Options", filename: "menu.mp3", duration: 22, status: "approved", uploadedAt: "2026-03-21" },
  { id: "3", name: "Thank You", filename: "thankyou.mp3", duration: 8, status: "pending", uploadedAt: "2026-03-28" },
  { id: "4", name: "Wrong Input", filename: "wrong_input.mp3", duration: 5, status: "rejected", uploadedAt: "2026-03-22" },
];

const MOCK_AGENT_GROUPS: AgentGroup[] = [
  {
    id: "1",
    name: "Sales Team",
    agents: [
      { id: "a1", name: "Rahul", phone: "+91-9876543210" },
      { id: "a2", name: "Priya", phone: "+91-9876543211" },
    ],
    status: "approved",
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    name: "Support Team",
    agents: [
      { id: "a3", name: "Amit", phone: "+91-9876543212" },
    ],
    status: "pending",
    createdAt: "2026-03-28",
  },
];

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: MOCK_CAMPAIGNS,
  audioFiles: MOCK_AUDIO,
  agentGroups: MOCK_AGENT_GROUPS,
  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  addAudioFile: (file) =>
    set((state) => ({ audioFiles: [...state.audioFiles, file] })),
  updateAudioStatus: (id, status) =>
    set((state) => ({
      audioFiles: state.audioFiles.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    })),
  addAgentGroup: (group) =>
    set((state) => ({ agentGroups: [...state.agentGroups, group] })),
  updateAgentGroupStatus: (id, status) =>
    set((state) => ({
      agentGroups: state.agentGroups.map((g) =>
        g.id === id ? { ...g, status } : g
      ),
    })),
}));
