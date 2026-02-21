import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, redis } from "@/lib/redis";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const VALID_TYPES = ["summary", "topics", "questions", "follow-ups", "action-items"] as const;

async function generateWithLLM(
  transcript: string,
  type: string,
  systemPrompt: string
): Promise<{ text: string }[]> {
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.3,
  });

  const res = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Transcript:\n\n${transcript}\n\nExtract the ${type} as JSON array of objects with "text" field.`),
  ]);

  const content = typeof res.content === "string" ? res.content : "";
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [{ text: content }];
  } catch {
    return [{ text: content }];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordingId: string; type: string }> }
) {
  const { recordingId, type } = await params;

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const cacheKey = `report:${recordingId}:${type}`;
  if (redis) {
    const cached = await getCached<{ text: string }[]>(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  // Fetch transcript from Redis
  const transcriptData = await getCached<any>(`transcript:${recordingId}`);
  if (!transcriptData) {
    return NextResponse.json(
      { error: "Transcript not found. Generate it first." },
      { status: 404 }
    );
  }

  const segments = transcriptData.segments ?? (Array.isArray(transcriptData) ? transcriptData : []);
  const transcript = segments
    .map((s: any) => `${s.username || "Speaker"}: ${s.content}`)
    .join("\n");

  const prompts: Record<string, string> = {
    summary: "You are an expert at summarizing interview transcripts. Provide a concise summary as bullet points.",
    topics: "You are an expert at identifying key topics discussed in interviews. List the main topics covered.",
    questions: "You are an expert at extracting questions asked during interviews. List the questions.",
    "follow-ups": "You are an expert at identifying follow-up items from interviews. List suggested follow-ups.",
    "action-items": "You are an expert at extracting action items from interview transcripts. List actionable items.",
  };

  const result = await generateWithLLM(transcript, type, prompts[type] ?? prompts.summary);
  if (redis) await setCached(cacheKey, result, 86400);

  return NextResponse.json(result);
}
