import { NextRequest, NextResponse } from "next/server";
import { getCached } from "@/lib/redis";

// GET: Fetch transcript for a recording
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  const { recordingId } = await params;

  const cached = await getCached<any>(`transcript:${recordingId}`);
  if (cached) {
    return NextResponse.json(cached);
  }

  // TODO: Fetch from transcription service / storage
  return NextResponse.json(
    { error: "Transcript not found or still processing" },
    { status: 404 }
  );
}
