"use client";

import { useState, useCallback } from "react";
import {
  FileSearch,
  Search,
  Phone,
  Calendar,
  Loader2,
  Inbox,
} from "lucide-react";
import { getUserId, getDefaultDateRange } from "@/services/api";
import { searchCallRecords } from "@/services/campaign.service";

export default function CallRecordsPage() {
  const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [campaignName, setCampaignName] = useState("");

  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setError("User session not found. Please log in again.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number to search.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const payload: Record<string, unknown> = {
        userId,
        phoneNumber: phoneNumber.trim(),
        startDate,
        endDate,
      };
      if (campaignName.trim()) {
        payload.campaignName = campaignName.trim();
      }

      const data = await searchCallRecords(payload);
      const records = Array.isArray(data) ? data : [];
      setResults(records as Record<string, unknown>[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search call records");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, startDate, endDate, campaignName]);

  const inputClass =
    "px-4 py-3 border border-border rounded-xl bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSearch className="w-6 h-6 text-primary" />
          Call Detail Records
        </h2>
        <p className="text-muted mt-1">Search call records by phone number</p>
      </div>

      {/* Search Form */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className={inputClass + " w-full"}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass + " w-full"}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass + " w-full"}
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Search className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Optional"
              className={inputClass + " w-full"}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search Records
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingState />
      ) : hasSearched && results.length === 0 && !error ? (
        <EmptyState message="No records found for the given search criteria." />
      ) : !hasSearched ? (
        <EmptyState message="Enter a phone number to search for call records." />
      ) : results.length > 0 ? (
        <ResultsTable data={results} />
      ) : null}
    </div>
  );
}

/* ─── Results Table ─── */

const PREFERRED_COLUMNS = [
  "phoneNumber",
  "phone_number",
  "msisdn",
  "campaignName",
  "campaign_name",
  "callStatus",
  "call_status",
  "status",
  "duration",
  "call_duration",
  "callDuration",
  "dateTime",
  "date_time",
  "callDate",
  "call_date",
  "dtmfResponse",
  "dtmf_response",
  "dtmf",
];

function formatColumnHeader(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "--";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function ResultsTable({ data }: { data: Record<string, unknown>[] }) {
  if (data.length === 0) return null;

  // Derive columns from the first record, preferring known CDR columns first
  const allKeys = Object.keys(data[0]);
  const orderedKeys: string[] = [];

  // Add preferred columns that exist in the data
  for (const col of PREFERRED_COLUMNS) {
    if (allKeys.includes(col) && !orderedKeys.includes(col)) {
      orderedKeys.push(col);
    }
  }
  // Add remaining columns
  for (const key of allKeys) {
    if (!orderedKeys.includes(key)) {
      orderedKeys.push(key);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{data.length}</span>{" "}
          record{data.length !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-muted">
              {orderedKeys.map((key) => (
                <th
                  key={key}
                  className="px-6 py-3.5 font-medium text-left whitespace-nowrap"
                >
                  {formatColumnHeader(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-t border-border hover:bg-card-hover transition-colors"
              >
                {orderedKeys.map((key) => (
                  <td
                    key={key}
                    className="px-6 py-4 text-foreground whitespace-nowrap"
                  >
                    {formatCellValue(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Shared UI Components ─── */

function LoadingState() {
  return (
    <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted">Searching call records...</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
        <Inbox className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm text-muted text-center max-w-sm">{message}</p>
    </div>
  );
}
