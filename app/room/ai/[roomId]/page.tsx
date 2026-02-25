"use client";

import { use, Suspense } from "react";
import AIRoom from "@/components/rooms/AIRoom";
import { useSearchParams } from "next/navigation";

function InnerPage({ roomId }: { roomId: string }) {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") ?? "anonymous";
    const lang = searchParams.get("lang") ?? "javascript";
    const diff = searchParams.get("diff") ?? "Medium";
    const cat = searchParams.get("cat") ?? "Data Structures & Algorithms";
    const dur = searchParams.get("dur") ?? "30";
    const role = searchParams.get("role") ?? "General Software Engineer";
    const exp = searchParams.get("exp") ?? "Intermediate";

    const onboarding = { language: lang, difficulty: diff, category: cat, duration: dur, role, exp };

    return <AIRoom roomId={roomId} userId={userId} onboarding={onboarding} />;
}

export default function Page({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const { roomId } = use(params);

    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0b0b1a] text-slate-400">Loading AI Room...</div>}>
            <InnerPage roomId={roomId} />
        </Suspense>
    );
}
