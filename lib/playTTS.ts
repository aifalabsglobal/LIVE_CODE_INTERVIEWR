/**
 * Frontend TTS utility — Real-Time Streaming Playback
 *
 * Designed to work with streaming AI responses:
 * 1. As sentences complete mid-stream → fetch audio immediately
 * 2. Play audio chunks sequentially as they arrive
 * 3. First sentence plays within ~2-3s of being generated
 *
 * Usage:
 *   const tts = new TTSQueue();
 *   // Call as streaming text grows:
 *   tts.feed(currentFullText);
 *   // When stream is done:
 *   tts.flush();
 *   // To cancel:
 *   tts.stop();
 */

// Simple cache: sentence → Blob
const cache = new Map<string, Blob>();
const MAX_CACHE = 30;

function addToCache(key: string, blob: Blob) {
    if (cache.size >= MAX_CACHE) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) cache.delete(firstKey);
    }
    cache.set(key, blob);
}

/**
 * Strip markdown from text for cleaner speech.
 */
function cleanForSpeech(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, " code block omitted ") // code blocks
        .replace(/`([^`]+)`/g, "$1") // inline code
        .replace(/[#*_~>\[\]()!|]/g, "") // markdown symbols
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * Detect sentence boundaries in text.
 * Returns [completeSentences[], remainingFragment]
 */
function extractSentences(text: string): [string[], string] {
    const cleaned = cleanForSpeech(text);
    // Split on sentence-ending punctuation followed by space
    const parts = cleaned.split(/(?<=[.!?;:])\s+/);

    if (parts.length <= 1) {
        // No complete sentence yet
        return [[], cleaned];
    }

    // All but last are complete sentences; last may be a fragment
    const complete = parts.slice(0, -1).filter(s => s.trim().length > 0);
    const remaining = parts[parts.length - 1] || "";
    return [complete, remaining];
}

async function fetchAudio(text: string, signal: AbortSignal): Promise<Blob | null> {
    const key = text.trim().slice(0, 300);
    const cached = cache.get(key);
    if (cached) return cached;

    try {
        const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            signal,
        });
        if (!res.ok) return null;
        const blob = await res.blob();
        addToCache(key, blob);
        return blob;
    } catch (err: any) {
        if (err.name === "AbortError") return null;
        console.warn("[TTS] Fetch error:", err);
        return null;
    }
}

function playBlob(blob: Blob, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        if (signal.aborted) { resolve(); return; }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        const cleanup = () => {
            URL.revokeObjectURL(url);
            resolve();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;
        signal.addEventListener("abort", () => { audio.pause(); cleanup(); }, { once: true });

        audio.play().catch(() => { cleanup(); });
    });
}

/**
 * TTS Queue — feed streaming text, plays sentences as they complete.
 */
export class TTSQueue {
    private abortController: AbortController;
    private sentencesSent = 0; // how many sentences we've already dispatched
    private audioQueue: Promise<Blob | null>[] = [];
    private playing = false;
    private stopped = false;

    constructor() {
        this.abortController = new AbortController();
    }

    /**
     * Feed the current full text from the stream.
     * Call this every time the streaming text updates.
     * It will detect new complete sentences and dispatch TTS for them.
     */
    feed(fullText: string) {
        if (this.stopped) return;

        const [sentences] = extractSentences(fullText);

        // Only process NEW sentences we haven't sent yet
        while (this.sentencesSent < sentences.length) {
            const sentence = sentences[this.sentencesSent];
            if (sentence && sentence.trim().length > 3) {
                // Fire fetch immediately (parallel)
                const promise = fetchAudio(sentence, this.abortController.signal);
                this.audioQueue.push(promise);
                this.playNext(); // kick the player if idle
            }
            this.sentencesSent++;
        }
    }

    /**
     * Call when streaming ends. Sends any remaining text fragment as the last chunk.
     */
    flush(fullText: string) {
        if (this.stopped) return;

        const [sentences, remaining] = extractSentences(fullText);

        // Send any unsent complete sentences
        while (this.sentencesSent < sentences.length) {
            const sentence = sentences[this.sentencesSent];
            if (sentence && sentence.trim().length > 3) {
                this.audioQueue.push(fetchAudio(sentence, this.abortController.signal));
                this.playNext();
            }
            this.sentencesSent++;
        }

        // Send the remaining fragment
        if (remaining && remaining.trim().length > 3) {
            this.audioQueue.push(fetchAudio(remaining, this.abortController.signal));
            this.playNext();
        }
    }

    /**
     * Sequential player — plays queued audio one by one.
     */
    private async playNext() {
        if (this.playing || this.stopped) return;
        this.playing = true;

        while (this.audioQueue.length > 0) {
            if (this.stopped) break;
            const blobPromise = this.audioQueue.shift()!;
            const blob = await blobPromise;
            if (this.stopped) break;
            if (blob) {
                await playBlob(blob, this.abortController.signal);
            }
        }

        this.playing = false;
    }

    /**
     * Stop all pending and playing audio.
     */
    stop() {
        this.stopped = true;
        this.abortController.abort();
        this.audioQueue = [];
    }
}

// ─── Simple API for backward compat ───────────────────────────────────────────

let activeQueue: TTSQueue | null = null;

export function stopTTS() {
    if (activeQueue) {
        activeQueue.stop();
        activeQueue = null;
    }
}

/**
 * Simple one-shot: split finished text into sentences and play.
 * (Used as fallback if streaming integration isn't active.)
 */
export async function playTTS(text: string): Promise<void> {
    stopTTS();
    const queue = new TTSQueue();
    activeQueue = queue;
    queue.flush(text);
}
