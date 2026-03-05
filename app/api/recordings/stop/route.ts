import { NextRequest, NextResponse } from "next/server";
import { EgressClient } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!url || !apiKey || !apiSecret) {
        return NextResponse.json(
            { error: "LiveKit not configured." },
            { status: 503 }
        );
    }

    const egressClient = new EgressClient(url, apiKey, apiSecret);

    try {
        const { egressId } = await request.json();
        if (!egressId) {
            return NextResponse.json({ error: "egressId required" }, { status: 400 });
        }

        const info = await egressClient.stopEgress(egressId);
        return NextResponse.json({ success: true, info });
    } catch (error: unknown) {
        console.error("Egress stop failed:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
