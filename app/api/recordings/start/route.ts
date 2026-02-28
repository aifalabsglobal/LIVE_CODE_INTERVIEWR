import { NextRequest, NextResponse } from "next/server";
import { EgressClient, EncodedFileOutput } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!url || !apiKey || !apiSecret) {
        return NextResponse.json(
            { error: "LiveKit not configured for egress." },
            { status: 503 }
        );
    }

    const egressClient = new EgressClient(url, apiKey, apiSecret);

    try {
        const { roomId } = await request.json();
        if (!roomId) {
            return NextResponse.json({ error: "roomId required" }, { status: 400 });
        }

        const fileOutput = new EncodedFileOutput({
            filepath: `recordings/${roomId}-${Date.now()}.mp4`,
        });

        const info = await egressClient.startRoomCompositeEgress(
            roomId,
            { file: fileOutput },
            { layout: "grid" }
        );

        return NextResponse.json({ success: true, egressId: info.egressId });
    } catch (error: any) {
        console.error("Egress start failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
