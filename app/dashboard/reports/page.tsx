"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Report {
    id: string;
    mode: string;
    durationMinutes: number | null;
    performanceSummary: string | null;
    feedback: string | null;
    createdAt: string;
    interviewer: { id: string; name: string; email: string };
    candidate: { id: string; name: string; email: string };
    schedule: { id: string; roomId: string; mode: string; scheduledAt: string } | null;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await fetch("/api/reports");
                if (res.ok) {
                    const data = await res.json();
                    setReports(data.reports || []);
                    setTotal(data.total || 0);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    const modeLabels: Record<string, string> = {
        MEET: "Meet",
        INTERVIEW: "Interview",
        AI_MOCK: "AI Mock",
    };

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Interview Reports</h1>
                <p style={{ fontSize: "14px", color: "#8b949e" }}>{total} reports</p>
            </div>

            <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #21262d" }}>
                            {["Candidate", "Interviewer", "Mode", "Duration", "Date", ""].map((h) => (
                                <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#484f58", textAlign: "left" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>Loading...</td></tr>
                        ) : reports.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>No reports yet</td></tr>
                        ) : (
                            reports.map((r) => (
                                <tr key={r.id} style={{ borderBottom: "1px solid #21262d" }}>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500, color: "#e2e8f0" }}>{r.candidate?.name}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8b949e" }}>{r.interviewer?.name}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#e2e8f0" }}>{modeLabels[r.mode] || r.mode}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8b949e" }}>
                                        {r.durationMinutes ? `${r.durationMinutes} min` : "—"}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#484f58" }}>
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <Link
                                            href={`/dashboard/reports/${r.id}`}
                                            style={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                color: "#137fec",
                                                textDecoration: "none",
                                            }}
                                        >
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
