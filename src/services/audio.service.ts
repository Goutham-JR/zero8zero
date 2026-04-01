import { apiGet, apiPostForm } from "./api";
import type { Prompt, BaseItem } from "@/types";

export function fetchPrompts(userId: string) {
  return apiGet<Prompt[]>(`/api/obd/prompts/${userId}`);
}

export function uploadVoiceFile(
  userId: string,
  waveFile: File,
  fileName: string,
  promptCategory: string,
  fileType: string
) {
  const formData = new FormData();
  formData.append("waveFile", waveFile);
  formData.append("userId", userId);
  formData.append("fileName", fileName);
  formData.append("promptCategory", promptCategory);
  formData.append("fileType", fileType);
  return apiPostForm<{ promptId: string; message: string }>("/api/obd/promptupload", formData);
}

export function uploadBase(
  userId: string,
  baseFile: File,
  baseName: string
) {
  const formData = new FormData();
  formData.append("baseFile", baseFile);
  formData.append("userId", userId);
  formData.append("baseName", baseName);
  formData.append("contactList", "null");
  return apiPostForm<{ baseId: string; message: string }>("/api/obd/baseupload", formData);
}

export function fetchBases(userId: string) {
  return apiGet<BaseItem[]>(`/api/obd/base/${userId}`);
}
