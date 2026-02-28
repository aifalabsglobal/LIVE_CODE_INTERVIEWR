"use client";

import { use, Suspense } from "react";
import InterviewRoom from "@/components/rooms/InterviewRoom";
import { useSearchParams } from "next/navigation";

function InnerPage({ roomId }: { roomId: string }) {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") ?? "anonymous";

    return <InterviewRoom roomId={roomId} userId={userId} />;
}

export default function Page({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const { roomId } = use(params);

    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0b0b1a] text-slate-400">Loading Interview...</div>}>
            <InnerPage roomId={roomId} />
        </Suspense>
    );
}
