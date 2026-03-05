import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/ai-sessions — List AI mock sessions (role-filtered)
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: Record<string, unknown> = {};

        // Candidates only see their own
        if (user.role === "CANDIDATE") {
            where.candidateId = user.id;
        }
        // ADMIN and INTERVIEWER see all

        const [sessions, total] = await Promise.all([
            prisma.aIMockSession.findMany({
                where,
                include: {
                    candidate: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.aIMockSession.count({ where }),
        ]);

        return NextResponse.json({ sessions, total, page, limit });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/**
 * POST /api/ai-sessions — Save an AI mock session record
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            roomId,
            language,
            difficulty,
            role,
            duration,
            questions,
            responses,
            evaluation,
            aiFeedback,
        } = body;

        const session = await prisma.aIMockSession.create({
            data: {
                candidateId: user.id,
                roomId: roomId || null,
                language: language || "javascript",
                difficulty: difficulty || "Medium",
                role: role || "General Software Engineer",
                duration: parseInt(duration) || 30,
                questions: questions ? JSON.stringify(questions) : null,
                responses: responses ? JSON.stringify(responses) : null,
                evaluation: evaluation ? JSON.stringify(evaluation) : null,
                aiFeedback: aiFeedback || null,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: "AI_MOCK_COMPLETED",
                entityType: "ai_session",
                entityId: session.id,
                metadata: JSON.stringify({ language, difficulty, role }),
            },
        });

        return NextResponse.json({ session }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
