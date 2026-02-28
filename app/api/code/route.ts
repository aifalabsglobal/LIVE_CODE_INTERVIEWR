import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/code - Save a new code version
export async function POST(req: Request) {
    try {
        const { roomId, version, code } = await req.json();

        if (!roomId || version === undefined || !code) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const snapshot = await prisma.codeSnapshot.create({
            data: {
                roomId,
                version: parseInt(version, 10),
                code,
            },
        });

        return NextResponse.json({ success: true, data: snapshot });
    } catch (error) {
        console.error('Error saving code snapshot:', error);
        return NextResponse.json({ error: 'Failed to save code snapshot' }, { status: 500 });
    }
}

// GET /api/code?roomId=XYZ - Retrieve all code versions for a room
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
        }

        const versions = await prisma.codeSnapshot.findMany({
            where: { roomId },
            orderBy: { version: 'asc' },
        });

        // Formatting it as an object map to match the previous Firebase array-like structure expectations
        // But returning an array is also fine, we will adapt the frontend receiving logic.
        return NextResponse.json({ success: true, data: versions });
    } catch (error) {
        console.error('Error retrieving code snapshots:', error);
        return NextResponse.json({ error: 'Failed to retrieve code snapshots' }, { status: 500 });
    }
}
