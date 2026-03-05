import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/reports/[id] — Get a single report (role-authorized)
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const report = await prisma.interviewReport.findUnique({
            where: { id },
            include: {
                interviewer: { select: { id: true, name: true, email: true } },
                candidate: { select: { id: true, name: true, email: true } },
                schedule: {
                    select: {
                        id: true,
                        roomId: true,
                        mode: true,
                        scheduledAt: true,
                        status: true,
                    },
                },
            },
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // Authorization check
        if (user.role === "INTERVIEWER" && report.interviewerId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (user.role === "CANDIDATE" && report.candidateId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ report });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
