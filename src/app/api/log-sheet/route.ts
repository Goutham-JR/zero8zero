import { NextRequest, NextResponse } from "next/server";
import { logToSheet } from "@/lib/google-sheet";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await logToSheet(data);
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
