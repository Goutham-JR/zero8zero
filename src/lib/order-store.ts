// File-based store for pending payment order IDs.
// Tracks orders created by /api/ccavenue/encrypt and validates them in /api/ccavenue/response.
// Persists to disk so orders survive server restarts.
// Orders expire after 30 minutes to prevent stale buildup.

import fs from "fs";
import path from "path";

const ORDER_TTL_MS = 30 * 60 * 1000; // 30 minutes
const STORE_PATH = path.join(process.cwd(), ".pending-orders.json");

interface PendingOrder {
  createdAt: number;
}

function readStore(): Record<string, PendingOrder> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
    }
  } catch {
    // Corrupted file — start fresh
  }
  return {};
}

function writeStore(store: Record<string, PendingOrder>) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store), "utf-8");
  } catch (err) {
    console.error("[OrderStore] Failed to write:", err);
  }
}

function cleanup(store: Record<string, PendingOrder>): Record<string, PendingOrder> {
  const now = Date.now();
  const cleaned: Record<string, PendingOrder> = {};
  for (const [id, order] of Object.entries(store)) {
    if (now - order.createdAt <= ORDER_TTL_MS) {
      cleaned[id] = order;
    }
  }
  return cleaned;
}

export function addPendingOrder(orderId: string) {
  const store = cleanup(readStore());
  store[orderId] = { createdAt: Date.now() };
  writeStore(store);
}

export function consumeOrder(orderId: string): boolean {
  const store = cleanup(readStore());
  if (!(orderId in store)) return false;
  delete store[orderId];
  writeStore(store);
  return true;
}
