import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// LiveKit Egress webhook: called when recording completes
// Store recording URL in Redis keyed by roomId for the report page
export async function POST(request: NextRequest) {
  if (!redis) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const body = await request.json();

    // LiveKit Egress sends different event types
    // See: https://docs.livekit.io/realtime/egress/webhook/
    const { event, egress } = body;
    if (event === "egress_ended" && egress) {
      const roomName = egress.roomName;
      const output = egress.fileOutput ?? egress.streamOutput ?? egress.segmentOutput;
      const url = output?.filename ?? output?.playlistName ?? output?.url;

      if (roomName && url) {
        const recording = {
          uuid: egress.egressId,
          roomId: roomName,
          url,
          createdAt: new Date().toISOString(),
        };
        const key = `recordings:${roomName}`;
        const existing = await redis.get(key);
        const list = existing ? JSON.parse(existing) : [];
        list.push(recording);
        await redis.setex(key, 86400 * 7, JSON.stringify(list)); // 7 days
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LiveKit webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
