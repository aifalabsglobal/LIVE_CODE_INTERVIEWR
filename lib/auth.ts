import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type UserRole = "ADMIN" | "INTERVIEWER" | "CANDIDATE";

/**
 * Sync the current Clerk user into the local database and return the record.
 * Creates the user on first call; updates name/email on subsequent calls.
 * New users default to CANDIDATE role.
 */
export async function ensureUserSynced() {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email =
        clerkUser.emailAddresses?.[0]?.emailAddress ?? "unknown@example.com";
    const name =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        clerkUser.username ||
        "User";

    // Role from Clerk metadata (set by admin), default CANDIDATE
    const metaRole =
        (clerkUser.publicMetadata?.role as UserRole) || "CANDIDATE";

    const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: { email, name, role: metaRole },
        create: {
            clerkId: clerkUser.id,
            email,
            name,
            role: metaRole,
        },
    });

    return user;
}

/**
 * Get the current authenticated user (synced).
 * Returns null when not signed in.
 */
export async function getCurrentUser() {
    return ensureUserSynced();
}

/**
 * Require a specific role. Returns user or throws a Response.
 */
export async function requireRole(role: UserRole) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
        });
    }
    if (user.role !== role) {
        throw new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
        });
    }
    return user;
}

/**
 * Require any of the given roles. Returns user or throws a Response.
 */
export async function requireAnyRole(roles: UserRole[]) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
        });
    }
    if (!roles.includes(user.role as UserRole)) {
        throw new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
        });
    }
    return user;
}

/**
 * Helper: generate a room ID in the format XXXX-XXXX-XXXX
 */
export function generateRoomId(): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
        if (i === 4 || i === 8) result += "-";
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
