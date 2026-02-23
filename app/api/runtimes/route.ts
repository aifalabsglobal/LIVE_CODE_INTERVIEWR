import { NextResponse } from "next/server";

const PISTON_BASE = (process.env.PISTON_BASE_URL || "https://emkc.org/api/v2/piston").replace(/\/$/, "");

export async function GET() {
    try {
        const res = await fetch(`${PISTON_BASE}/runtimes`);
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch runtimes" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch runtimes" }, { status: 500 });
    }
}
