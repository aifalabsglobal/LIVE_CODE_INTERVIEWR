import { NextResponse } from "next/server";

const PISTON_BASE = (process.env.PISTON_BASE_URL || "http://45.198.59.91/api/v2").replace(/\/$/, "");

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
