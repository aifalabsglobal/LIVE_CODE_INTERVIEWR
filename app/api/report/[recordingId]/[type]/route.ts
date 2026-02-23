import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, redis } from "@/lib/redis";
import {
  REPORT_TYPES,
  type ReportType,
  parseTranscript,
  generateReportWithLLM,
  PROMPTS,
} from "@/lib/reportAgents";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string; type: string }> }
) {
  const { recordingId, type } = await params;

  if (!REPORT_TYPES.includes(type as ReportType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const cacheKey = `report:${recordingId}:${type}`;
  if (redis) {
    const cached = await getCached<{ text: string }[]>(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  const transcriptData = await getCached<any>(`transcript:${recordingId}`);
  if (!transcriptData) {
    return NextResponse.json(
      { error: "Transcript not found. Generate it first." },
      { status: 404 }
    );
  }

  const transcript = parseTranscript(transcriptData);
  const result = await generateReportWithLLM(
    transcript,
    type as ReportType,
    PROMPTS[type as ReportType] ?? PROMPTS.summary
  );
  if (redis) await setCached(cacheKey, result, 86400);

  return NextResponse.json(result);
}
