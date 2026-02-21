"use client";

import { Suspense } from "react";
import InterviewReportComponent from "@/components/InterviewReportComponent";

export default function InterviewReportPage() {
  return (
    <Suspense fallback={<div className="bg-background-dark text-slate-100 min-h-screen flex items-center justify-center font-display">Loading report…</div>}>
      <InterviewReportComponent />
    </Suspense>
  );
}
