"use client";

import { useEffect, useState } from "react";
import AdminOverview from "@/components/dashboard/AdminOverview";
import InterviewerOverview from "@/components/dashboard/InterviewerOverview";
import CandidateOverview from "@/components/dashboard/CandidateOverview";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch("/api/users/me")
            .then((r) => r.json())
            .then((d) => setUser(d.user))
            .catch(() => { });
    }, []);

    if (!user) return null;

    switch (user.role) {
        case "ADMIN":
            return <AdminOverview user={user} />;
        case "INTERVIEWER":
            return <InterviewerOverview user={user} />;
        case "CANDIDATE":
        default:
            return <CandidateOverview user={user} />;
    }
}
