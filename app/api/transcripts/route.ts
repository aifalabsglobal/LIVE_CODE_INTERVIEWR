import { NextRequest, NextResponse } from "next/server";
import { setCached } from "@/lib/redis";

// POST: Request transcript generation (async job)
export async function POST(request: NextRequest) {
  const { recordingId, language } = await request.json();
  if (!recordingId) {
    return NextResponse.json({ error: "recordingId required" }, { status: 400 });
  }

  // TODO: Enqueue job to transcribe recording (Whisper/Deepgram)
  // For now, store request and return 202
  await setCached(`transcript:requested:${recordingId}`, { language }, 86400);

  return NextResponse.json({
    message: "Transcript generation requested",
    recordingId,
  });
}
