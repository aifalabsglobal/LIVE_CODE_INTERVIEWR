import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * GET /api/admin/users — List all users (admin only)
 */
export async function GET(req: NextRequest) {
    try {
        await requireRole("ADMIN");

        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: Record<string, unknown> = {};
        if (role) where.role = role;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({ users, total, page, limit });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/**
 * POST /api/admin/users — Create an interviewer (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        await requireRole("ADMIN");

        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "email, password, and name are required" },
                { status: 400 }
            );
        }

        const clerk = await clerkClient();

        // 1. Create user in Clerk
        let clerkUser;
        try {
            clerkUser = await clerk.users.createUser({
                emailAddress: [email],
                password: password,
                firstName: name.split(" ")[0] || name,
                lastName: name.includes(" ") ? name.split(" ").slice(1).join(" ") : "",
                publicMetadata: { role: "INTERVIEWER" },
                skipPasswordChecks: false,
                skipPasswordRequirement: false,
            });
        } catch (clerkErr: any) {
            console.error("[ADMIN] Failed to create user in Clerk. Error details:", JSON.stringify(clerkErr, null, 2));

            // Extract the most descriptive error message
            const clerkError = clerkErr?.errors?.[0];
            const message = clerkError?.longMessage || clerkError?.message || clerkErr?.message || "Failed to create user in Clerk";

            return NextResponse.json({ error: message }, { status: 400 });
        }

        const clerkId = clerkUser.id;

        // 2. Create local user
        const user = await prisma.user.upsert({
            where: { clerkId },
            update: { role: "INTERVIEWER", name, email },
            create: {
                clerkId,
                email,
                name,
                role: "INTERVIEWER",
                active: true,
            },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("[ADMIN] POST error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
