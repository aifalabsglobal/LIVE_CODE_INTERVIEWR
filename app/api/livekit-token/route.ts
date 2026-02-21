import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

const isLiveKitConfigured = () => {
  const key = apiKey?.trim();
  const secret = apiSecret?.trim();
  return !!(
    key &&
    secret &&
    key !== "xxx" &&
    secret !== "xxx" &&
    key.length > 10 &&
    secret.length > 10
  );
};

export async function POST(request: NextRequest) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env" },
      { status: 503 }
    );
  }

  const { roomId, participantIdentity } = await request.json();

  if (!roomId || !participantIdentity) {
    return NextResponse.json(
      { error: "roomId and participantIdentity required" },
      { status: 400 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantIdentity,
    metadata: JSON.stringify({ roomId }),
  });

  at.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token });
}
