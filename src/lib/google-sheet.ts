// Server-side: calls Google Sheets directly
export async function logToSheet(data: Record<string, string>) {
  const url = process.env.GOOGLE_SHEET_WEBHOOK;
  if (!url) {
    console.error("[Sheet] GOOGLE_SHEET_WEBHOOK not configured");
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      redirect: "follow",
    });
  } catch (err) {
    console.error("[Sheet] Failed to log:", err);
  }
}

// Client-side: calls our API route which proxies to Google Sheets
export async function logToSheetClient(data: Record<string, string>) {
  try {
    await fetch("/api/log-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("[Sheet] Failed to log:", err);
  }
}
