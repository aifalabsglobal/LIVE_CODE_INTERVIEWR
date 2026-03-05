import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Check if any admin exists
    const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
    });

    if (existingAdmin) {
        console.log(`✅ Admin already exists: ${existingAdmin.email} (${existingAdmin.name})`);
        return;
    }

    // Create a default admin user
    // The clerkId should match the actual Clerk user for the admin
    // Update these values with your actual admin's Clerk ID and email
    const admin = await prisma.user.create({
        data: {
            clerkId: "default-admin-clerk-id", // Replace with actual Clerk user ID
            email: "admin@livecode.dev",       // Replace with actual admin email
            name: "System Admin",
            role: "ADMIN",
            active: true,
        },
    });

    console.log(`🔑 Default admin created: ${admin.email}`);
    console.log(`   ⚠️  Update the clerkId to match your actual Clerk user ID`);
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
