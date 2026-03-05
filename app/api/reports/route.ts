import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAnyRole } from "@/lib/auth";

/**
 * GET /api/reports — List interview reports (role-filtered)
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

        if (user.role === "INTERVIEWER") {
            where.interviewerId = user.id;
        } else if (user.role === "CANDIDATE") {
            where.candidateId = user.id;
        }
        // ADMIN sees all

        const [reports, total] = await Promise.all([
            prisma.interviewReport.findMany({
                where,
                include: {
                    interviewer: { select: { id: true, name: true, email: true } },
                    candidate: { select: { id: true, name: true, email: true } },
                    schedule: { select: { id: true, roomId: true, mode: true, scheduledAt: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.interviewReport.count({ where }),
        ]);

        return NextResponse.json({ reports, total, page, limit });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/**
 * POST /api/reports — Create an interview report
 * Only ADMIN or INTERVIEWER can create
 */
export async function POST(req: NextRequest) {
    try {
        const user = await requireAnyRole(["ADMIN", "INTERVIEWER"]);

        const body = await req.json();
        const {
            scheduleId,
            candidateId,
            mode,
            durationMinutes,
            performanceSummary,
            feedback,
            codeSnapshot,
            recordingRef,
        } = body;

        if (!candidateId || !mode) {
            return NextResponse.json(
                { error: "candidateId and mode are required" },
                { status: 400 }
            );
        }

        const report = await prisma.interviewReport.create({
            data: {
                scheduleId: scheduleId || null,
                interviewerId: user.id,
                candidateId,
                mode,
                durationMinutes: durationMinutes || null,
                performanceSummary: performanceSummary || null,
                feedback: feedback || null,
                codeSnapshot: codeSnapshot || null,
                recordingRef: recordingRef || null,
            },
            include: {
                interviewer: { select: { id: true, name: true, email: true } },
                candidate: { select: { id: true, name: true, email: true } },
            },
        });

        // Update schedule status if linked
        if (scheduleId) {
            await prisma.interviewSchedule.update({
                where: { id: scheduleId },
                data: { status: "COMPLETED" },
            }).catch(() => { });
        }

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: "REPORT_GENERATED",
                entityType: "report",
                entityId: report.id,
                metadata: JSON.stringify({ mode, candidateId }),
            },
        });

        return NextResponse.json({ report }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
