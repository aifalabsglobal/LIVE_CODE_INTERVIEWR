import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/webhooks/clerk — Clerk webhook handler
 * Auto-creates local User record with CANDIDATE role when a new Clerk user signs up.
 *
 * In development: trusts the raw payload.
 * In production: install `svix` and set CLERK_WEBHOOK_SECRET for signature verification.
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();

        // Parse the event from the payload
        let event: unknown;
        try {
            event = JSON.parse(payload);
        } catch {
            return NextResponse.json(
                { error: "Invalid payload" },
                { status: 400 }
            );
        }

        const eventType = (event as { type: string }).type;

        if (eventType === "user.created") {
            const {
                id: clerkId,
                email_addresses,
                first_name,
                last_name,
                username,
            } = (event as {
                data: {
                    id: string;
                    email_addresses?: { email_address: string }[];
                    first_name?: string;
                    last_name?: string;
                    username?: string;
                }
            }).data;
            const email =
                email_addresses?.[0]?.email_address ?? "unknown@example.com";
            const name =
                `${first_name ?? ""} ${last_name ?? ""}`.trim() ||
                username ||
                "User";

            await prisma.user.upsert({
                where: { clerkId },
                update: { email, name },
                create: {
                    clerkId,
                    email,
                    name,
                    role: "CANDIDATE",
                    active: true,
                },
            });

            console.log(`[WEBHOOK] New candidate created: ${email}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("[WEBHOOK] Error:", err);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
}
