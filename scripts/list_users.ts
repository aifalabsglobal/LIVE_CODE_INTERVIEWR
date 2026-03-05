import "dotenv/config";
import { createClient } from "@clerk/backend";

const clerk = createClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
    console.log("Fetching Clerk users...");
    const users = await clerk.users.getUserList();

    if (users.data.length === 0) {
        console.log("No users found in Clerk.");
        return;
    }

    console.log("Found users:");
    users.data.forEach((u, i) => {
        const email = u.emailAddresses[0]?.emailAddress ?? "N/A";
        console.log(`${i + 1}. ID: ${u.id}, Email: ${email}`);
    });

}

main().catch(console.error);
