import { NextRequest, NextResponse } from "next/server";

const XTTS_URL = process.env.XTTS_URL || "http://45.198.59.91/tts/tts";

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== "string" || !text.trim()) {
            return NextResponse.json({ error: "text is required" }, { status: 400 });
        }

        // Strip markdown formatting for cleaner speech
        const cleanText = text
            .replace(/```[\s\S]*?```/g, " code block omitted ") // remove code blocks
            .replace(/`([^`]+)`/g, "$1") // inline code → plain text
            .replace(/[#*_~>\[\]()!|]/g, "") // strip markdown symbols
            .replace(/\n{2,}/g, ". ") // paragraph breaks → pause
            .replace(/\n/g, " ") // newlines → space
            .replace(/\s{2,}/g, " ") // collapse whitespace
            .trim();

        if (!cleanText) {
            return NextResponse.json({ error: "No speakable text" }, { status: 400 });
        }

        // Limit text length to prevent very long TTS requests
        const truncated = cleanText.length > 2000 ? cleanText.slice(0, 2000) + "..." : cleanText;

        const res = await fetch(XTTS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: truncated }),
            signal: AbortSignal.timeout(120000), // 120s timeout for GPU processing
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => "Unknown error");
            console.error("[TTS] XTTS server error:", res.status, errText);
            return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
        }

        const audioBuffer = await res.arrayBuffer();

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/wav",
                "Cache-Control": "public, max-age=3600", // cache for 1 hour
            },
        });
    } catch (error) {
        console.error("[TTS] Error:", error);
        return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
    }
}
