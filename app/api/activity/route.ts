import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/activity — Get activity feed (role-filtered)
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "30");

        const where: Record<string, unknown> = {};

        // Non-admins only see their own activity
        if (user.role !== "ADMIN") {
            where.userId = user.id;
        }

        const [activities, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.activityLog.count({ where }),
        ]);

        return NextResponse.json({ activities, total, page, limit });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
