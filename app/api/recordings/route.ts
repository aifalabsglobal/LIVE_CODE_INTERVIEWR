import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// GET: List recordings for a room (from Redis/LiveKit Egress)
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");
  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }

  if (redis) {
    const raw = await redis.get(`recordings:${roomId}`);
    if (raw) {
      const list = JSON.parse(raw);
      return NextResponse.json({ recordings: list });
    }
  }

  return NextResponse.json({ recordings: [] });
}
