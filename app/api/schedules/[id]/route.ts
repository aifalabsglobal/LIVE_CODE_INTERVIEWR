import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * PATCH /api/schedules/[id] — Update schedule status
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, notes } = body;

        // Verify ownership or admin
        const schedule = await prisma.interviewSchedule.findUnique({
            where: { id },
        });
        if (!schedule) {
            return NextResponse.json(
                { error: "Schedule not found" },
                { status: 404 }
            );
        }
        if (
            user.role !== "ADMIN" &&
            schedule.interviewerId !== user.id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const updated = await prisma.interviewSchedule.update({
            where: { id },
            data: updateData,
            include: {
                interviewer: { select: { id: true, name: true, email: true } },
                candidate: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json({ schedule: updated });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/**
 * DELETE /api/schedules/[id] — Cancel a schedule
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const schedule = await prisma.interviewSchedule.findUnique({
            where: { id },
        });
        if (!schedule) {
            return NextResponse.json(
                { error: "Schedule not found" },
                { status: 404 }
            );
        }
        if (
            user.role !== "ADMIN" &&
            schedule.interviewerId !== user.id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.interviewSchedule.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: "SCHEDULE_CANCELLED",
                entityType: "schedule",
                entityId: id,
            },
        });

        return NextResponse.json({ schedule: updated });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
