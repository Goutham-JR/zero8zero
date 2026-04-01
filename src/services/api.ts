import { useAuthStore } from "@/store/auth-store";

const BASE_URL = "https://obd3api.expressivr.com";

function getHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAuthHeader(): HeadersInit {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (useAuthStore.getState().token) {
      useAuthStore.getState().logout();
    }
    throw new Error("Session expired");
  }
  const text = await res.text();
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = JSON.parse(text).message || msg; } catch {}
    throw new Error(msg);
  }
  if (!text || text.trim() === "") {
    return [] as unknown as T;
  }
  try {
    return JSON.parse(text);
  } catch {
    return [] as unknown as T;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders() });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse<T>(res);
}

export function getUserId(): string {
  return useAuthStore.getState().user?.id ?? "";
}

export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}
