import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAnyRole, generateRoomId } from "@/lib/auth";
import { sendInterviewInvitation } from "@/lib/email";
import type { UserRole } from "@/lib/auth";

/**
 * GET /api/schedules — List interview schedules (role-filtered)
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: Record<string, unknown> = {};

        // Role-based filtering
        if (user.role === "INTERVIEWER") {
            where.interviewerId = user.id;
        } else if (user.role === "CANDIDATE") {
            where.candidateId = user.id;
        }
        // ADMIN sees all

        if (status) where.status = status;

        const [schedules, total] = await Promise.all([
            prisma.interviewSchedule.findMany({
                where,
                include: {
                    interviewer: { select: { id: true, name: true, email: true } },
                    candidate: { select: { id: true, name: true, email: true } },
                },
                orderBy: { scheduledAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.interviewSchedule.count({ where }),
        ]);

        return NextResponse.json({ schedules, total, page, limit });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/**
 * POST /api/schedules — Create interview schedule
 * Only ADMIN or INTERVIEWER can create
 */
export async function POST(req: NextRequest) {
    try {
        const user = await requireAnyRole(["ADMIN", "INTERVIEWER"]);

        const body = await req.json();
        const { candidateId: providedId, candidateEmail, mode, scheduledAt, notes } = body;

        if ((!providedId && !candidateEmail) || !mode || !scheduledAt) {
            return NextResponse.json(
                { error: "candidateEmail (or candidateId), mode, and scheduledAt are required" },
                { status: 400 }
            );
        }

        if (!["MEET", "INTERVIEW", "AI_MOCK"].includes(mode)) {
            return NextResponse.json(
                { error: "mode must be MEET, INTERVIEW, or AI_MOCK" },
                { status: 400 }
            );
        }

        let finalCandidateId = providedId;

        // If email is provided, find or create the user
        if (candidateEmail) {
            let candidate = await prisma.user.findFirst({
                where: { email: candidateEmail },
            });

            if (!candidate) {
                // Create a placeholder user
                candidate = await prisma.user.create({
                    data: {
                        email: candidateEmail,
                        name: candidateEmail.split("@")[0],
                        clerkId: `invited_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        role: "CANDIDATE",
                        active: true,
                    },
                });
            }
            finalCandidateId = candidate.id;
        }

        // Verify candidate exists (if only ID was provided)
        if (!candidateEmail && providedId) {
            const candidate = await prisma.user.findUnique({
                where: { id: providedId },
            });
            if (!candidate) {
                return NextResponse.json(
                    { error: "Candidate not found" },
                    { status: 404 }
                );
            }
        }

        // Get final candidate object for email invitation
        const candidateRecord = await prisma.user.findUnique({
            where: { id: finalCandidateId },
        });

        if (!candidateRecord) {
            return NextResponse.json({ error: "Candidate resolution failed" }, { status: 500 });
        }

        const roomId = generateRoomId();

        const schedule = await prisma.interviewSchedule.create({
            data: {
                roomId,
                mode,
                scheduledAt: new Date(scheduledAt),
                notes: notes || null,
                interviewerId: user.id,
                candidateId: finalCandidateId,
            },
            include: {
                interviewer: { select: { id: true, name: true, email: true } },
                candidate: { select: { id: true, name: true, email: true } },
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: "SCHEDULE_CREATED",
                entityType: "schedule",
                entityId: schedule.id,
                metadata: JSON.stringify({ roomId, mode, candidateId: finalCandidateId }),
            },
        });

        // Send email invitation
        await sendInterviewInvitation({
            candidateEmail: candidateRecord.email,
            candidateName: candidateRecord.name,
            roomId,
            mode,
            scheduledAt: new Date(scheduledAt),
            interviewerName: user.name,
        });

        return NextResponse.json({ schedule }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("[SCHEDULES] Error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
