"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Report {
    id: string;
    mode: string;
    durationMinutes: number | null;
    performanceSummary: string | null;
    feedback: string | null;
    codeSnapshot: string | null;
    recordingRef: string | null;
    createdAt: string;
    interviewer: { id: string; name: string; email: string };
    candidate: { id: string; name: string; email: string };
    schedule: { id: string; roomId: string; mode: string; scheduledAt: string; status: string } | null;
}

export default function ReportDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch(`/api/reports/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReport(data.report);
                } else {
                    setError("Report not found or access denied.");
                }
            } catch {
                setError("Failed to load report.");
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: "64px", textAlign: "center", color: "#8b949e", fontFamily: "'Inter', sans-serif" }}>
                Loading report...
            </div>
        );
    }

    if (error || !report) {
        return (
            <div style={{ padding: "64px", textAlign: "center", color: "#8b949e", fontFamily: "'Inter', sans-serif" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "16px", display: "block" }}>error</span>
                <p>{error || "Report not found"}</p>
                <Link href="/dashboard/reports" style={{ color: "#137fec", textDecoration: "none", fontSize: "14px" }}>← Back to Reports</Link>
            </div>
        );
    }

    const modeLabels: Record<string, string> = { MEET: "Meet", INTERVIEW: "Interview", AI_MOCK: "AI Mock" };

    const sections = [
        { label: "Mode", value: modeLabels[report.mode] || report.mode, icon: "category" },
        { label: "Duration", value: report.durationMinutes ? `${report.durationMinutes} minutes` : "Not recorded", icon: "timer" },
        { label: "Date", value: new Date(report.createdAt).toLocaleString(), icon: "calendar_today" },
        ...(report.schedule ? [{ label: "Room ID", value: report.schedule.roomId, icon: "key" }] : []),
    ];

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0", maxWidth: "800px" }}>
            {/* Back link */}
            <Link
                href="/dashboard/reports"
                style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8b949e", textDecoration: "none", fontSize: "13px", marginBottom: "24px" }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                All Reports
            </Link>

            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                    Interview Report
                </h1>
                <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: "#8b949e" }}>
                    <span>Candidate: <strong style={{ color: "#e2e8f0" }}>{report.candidate?.name}</strong></span>
                    <span>Interviewer: <strong style={{ color: "#e2e8f0" }}>{report.interviewer?.name}</strong></span>
                </div>
            </div>

            {/* Info cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "32px" }}>
                {sections.map((s) => (
                    <div
                        key={s.label}
                        style={{
                            backgroundColor: "#0d1117",
                            border: "1px solid #21262d",
                            borderRadius: "10px",
                            padding: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#484f58" }}>{s.icon}</span>
                        <div>
                            <p style={{ fontSize: "11px", color: "#484f58", margin: "0 0 2px 0", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>{s.label}</p>
                            <p style={{ fontSize: "14px", color: "#e2e8f0", margin: 0, fontWeight: 500 }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Summary */}
            {report.performanceSummary && (
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#22c55e" }}>insights</span>
                        Performance Summary
                    </h3>
                    <p style={{ fontSize: "14px", color: "#c9d1d9", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                        {report.performanceSummary}
                    </p>
                </div>
            )}

            {/* Feedback */}
            {report.feedback && (
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#f59e0b" }}>rate_review</span>
                        Evaluation Feedback
                    </h3>
                    <p style={{ fontSize: "14px", color: "#c9d1d9", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                        {report.feedback}
                    </p>
                </div>
            )}

            {/* Code Snapshot */}
            {report.codeSnapshot && (
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#137fec" }}>code</span>
                        Code Snapshot
                    </h3>
                    <pre style={{
                        backgroundColor: "#010409",
                        border: "1px solid #21262d",
                        borderRadius: "8px",
                        padding: "16px",
                        fontSize: "13px",
                        color: "#c9d1d9",
                        overflow: "auto",
                        maxHeight: "400px",
                        fontFamily: "'JetBrains Mono', monospace",
                        lineHeight: 1.5,
                        margin: 0,
                    }}>
                        {report.codeSnapshot}
                    </pre>
                </div>
            )}
        </div>
    );
}
