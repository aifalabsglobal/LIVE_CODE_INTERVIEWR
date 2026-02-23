import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const REPORT_TYPES = ["summary", "topics", "questions", "follow-ups", "action-items"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const PROMPTS: Record<ReportType, string> = {
  summary:
    "You are an expert at summarizing interview transcripts. Provide a concise summary as bullet points.",
  topics:
    "You are an expert at identifying key topics discussed in interviews. List the main topics covered.",
  questions:
    "You are an expert at extracting questions asked during interviews. List the questions.",
  "follow-ups":
    "You are an expert at identifying follow-up items from interviews. List suggested follow-ups.",
  "action-items":
    "You are an expert at extracting action items from interview transcripts. List actionable items.",
};

export type ReportItem = { text: string };
export type ReportResult = ReportItem[];

export function parseTranscript(transcriptData: unknown): string {
  const segments =
    (transcriptData as any)?.segments ??
    (Array.isArray(transcriptData) ? transcriptData : []);
  return segments
    .map((s: any) => `${s.username || "Speaker"}: ${s.content}`)
    .join("\n");
}

export async function generateReportWithLLM(
  transcript: string,
  type: ReportType,
  systemPrompt: string
): Promise<ReportResult> {
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.3,
  });

  const res = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(
      `Transcript:\n\n${transcript}\n\nExtract the ${type} as JSON array of objects with "text" field.`
    ),
  ]);

  const content = typeof res.content === "string" ? res.content : "";
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [{ text: content }];
  } catch {
    return [{ text: content }];
  }
}
