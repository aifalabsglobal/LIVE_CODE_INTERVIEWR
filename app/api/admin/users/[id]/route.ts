import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * PATCH /api/admin/users/[id] — Activate/deactivate a user (admin only)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole("ADMIN");
        const { id } = await params;

        const body = await req.json();
        const { active, role } = body;

        const updateData: Record<string, unknown> = {};
        if (typeof active === "boolean") updateData.active = active;
        if (role && ["ADMIN", "INTERVIEWER", "CANDIDATE"].includes(role)) {
            updateData.role = role;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        // Sync role to Clerk if changed
        if (role) {
            try {
                const clerk = await clerkClient();
                await clerk.users.updateUserMetadata(user.clerkId, {
                    publicMetadata: { role },
                });
            } catch (clerkErr) {
                console.error("[ADMIN] Failed to update Clerk metadata:", clerkErr);
            }
        }

        return NextResponse.json({ user });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
