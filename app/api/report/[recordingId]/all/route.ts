import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, redis } from "@/lib/redis";
import {
  REPORT_TYPES,
  type ReportType,
  type ReportResult,
  PROMPTS,
  parseTranscript,
  generateReportWithLLM,
} from "@/lib/reportAgents";

export type BatchReportResponse = {
  transcriptReady: boolean;
  summary?: ReportResult;
  topics?: ReportResult;
  questions?: ReportResult;
  "follow-ups"?: ReportResult;
  "action-items"?: ReportResult;
  errors?: Partial<Record<ReportType, string>>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  const { recordingId } = await params;

  // Fetch transcript once (shared by all agents)
  const transcriptData = await getCached<unknown>(`transcript:${recordingId}`);
  if (!transcriptData) {
    return NextResponse.json(
      {
        transcriptReady: false,
        error: "Transcript not found. Generate it first.",
      } satisfies BatchReportResponse & { error: string },
      { status: 404 }
    );
  }

  const transcript = parseTranscript(transcriptData);

  // Check cache for each type; run only uncached
  const toGenerate: ReportType[] = [];
  const cached: Partial<Record<ReportType, ReportResult>> = {};

  if (redis) {
    for (const type of REPORT_TYPES) {
      const cacheKey = `report:${recordingId}:${type}`;
      const c = await getCached<ReportResult>(cacheKey);
      if (c) cached[type] = c;
      else toGenerate.push(type);
    }
  } else {
    toGenerate.push(...REPORT_TYPES);
  }

  // Run uncached agents in parallel
  const entries = toGenerate.map((type) => ({ type }));
  const results = await Promise.allSettled(
    entries.map(async ({ type }) => {
      const result = await generateReportWithLLM(
        transcript,
        type,
        PROMPTS[type]
      );
      if (redis) {
        await setCached(`report:${recordingId}:${type}`, result, 86400);
      }
      return { type, result };
    })
  );

  const response: BatchReportResponse = {
    transcriptReady: true,
    ...cached,
  };

  const errors: Partial<Record<ReportType, string>> = {};

  results.forEach((r, i) => {
    const type = entries[i]?.type;
    if (r.status === "fulfilled") {
      (response as unknown as Record<string, unknown>)[r.value.type] = r.value.result;
    } else if (type) {
      errors[type] = String(r.reason?.message ?? r.reason);
    }
  });
  if (Object.keys(errors).length > 0) response.errors = errors;

  return NextResponse.json(response);
}
