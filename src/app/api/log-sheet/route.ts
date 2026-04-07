import { NextRequest, NextResponse } from "next/server";
import { logToSheet } from "@/lib/google-sheet";

const ALLOWED_SHEETS = new Set(["User Updates"]);

const ALLOWED_FIELDS = new Set([
  "_sheet",
  "userId",
  "username",
  "name",
  "email",
  "phone",
  "company",
  "address",
  "pincode",
  "planId",
  "accountType",
  "expiryDate",
  "updatedOn",
  "updatedBy",
]);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate _sheet is present and allowed
    if (!data._sheet || !ALLOWED_SHEETS.has(data._sheet)) {
      return NextResponse.json({ error: "Invalid sheet" }, { status: 400 });
    }

    // Strip any fields not in the allowlist
    const sanitized: Record<string, string> = {};
    for (const key of Object.keys(data)) {
      if (ALLOWED_FIELDS.has(key) && typeof data[key] === "string") {
        sanitized[key] = data[key];
      }
    }

    await logToSheet(sanitized);
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
