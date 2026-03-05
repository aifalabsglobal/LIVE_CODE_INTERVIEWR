"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
    user: { id: string; name: string; role: string };
}

export default function CandidateOverview({ user }: Props) {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [aiSessions, setAiSessions] = useState<any[]>([]);
    const [totalSchedules, setTotalSchedules] = useState(0);
    const [totalReports, setTotalReports] = useState(0);
    const [totalAISessions, setTotalAISessions] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch("/api/schedules?limit=5").then((r) => r.json()),
            fetch("/api/reports?limit=5").then((r) => r.json()),
            fetch("/api/ai-sessions?limit=5").then((r) => r.json()),
        ]).then(([sched, rep, ai]) => {
            setSchedules(sched.schedules || []);
            setTotalSchedules(sched.total || 0);
            setReports(rep.reports || []);
            setTotalReports(rep.total || 0);
            setAiSessions(ai.sessions || []);
            setTotalAISessions(ai.total || 0);
        }).catch(console.error);
    }, []);

    const upcoming = schedules.filter((s) => s.status === "SCHEDULED");

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                    Welcome, {user.name}
                </h1>
                <p style={{ fontSize: "14px", color: "#8b949e" }}>
                    Your interviews, reports, and AI practice sessions.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
                {[
                    { label: "Scheduled Interviews", value: totalSchedules, icon: "calendar_month", color: "#137fec" },
                    { label: "My Reports", value: totalReports, icon: "assessment", color: "#22c55e" },
                    { label: "AI Mock Sessions", value: totalAISessions, icon: "smart_toy", color: "#8b5cf6" },
                ].map((card) => (
                    <div
                        key={card.label}
                        style={{
                            backgroundColor: "#0d1117",
                            border: "1px solid #21262d",
                            borderRadius: "12px",
                            padding: "20px",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "13px", color: "#8b949e" }}>{card.label}</span>
                            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: card.color }}>{card.icon}</span>
                        </div>
                        <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Upcoming Interviews */}
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>Upcoming Interviews</h2>
                        <Link href="/dashboard/schedules" style={{ fontSize: "12px", color: "#137fec", textDecoration: "none" }}>View all →</Link>
                    </div>
                    <div style={{ padding: "8px" }}>
                        {upcoming.length === 0 ? (
                            <p style={{ padding: "24px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>No upcoming interviews</p>
                        ) : (
                            upcoming.map((s: { id: string; scheduledAt: string; mode: string; roomId: string; interviewer: { name: string | null } }) => (
                                <div key={s.id} style={{ padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>
                                            {s.mode === "MEET" ? "Meet" : s.mode === "INTERVIEW" ? "Live Interview" : "AI Mock"}
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                            {new Date(s.scheduledAt).toLocaleString()} · Room: {s.roomId}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/${s.mode === "MEET" ? "meet" : s.mode === "INTERVIEW" ? "interview" : "ai-interview"}?roomId=${s.roomId}`}
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            backgroundColor: "#137fec",
                                            color: "#fff",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Join
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Mock History */}
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>AI Mock History</h2>
                        <Link href="/ai-interview" style={{ fontSize: "12px", color: "#8b5cf6", textDecoration: "none" }}>Start new →</Link>
                    </div>
                    <div style={{ padding: "8px" }}>
                        {aiSessions.length === 0 ? (
                            <p style={{ padding: "24px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>No AI mock sessions yet</p>
                        ) : (
                            aiSessions.map((s: { id: string; createdAt: string; language: string; difficulty: string; role: string; duration: string }) => (
                                <div key={s.id} style={{ padding: "12px", borderRadius: "8px", marginBottom: "4px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>
                                            {s.role} · {s.language}
                                        </p>
                                        <span style={{ fontSize: "11px", color: "#8b5cf6" }}>{s.difficulty}</span>
                                    </div>
                                    <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                        {s.duration}min · {new Date(s.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Reports section */}
            {reports.length > 0 && (
                <div style={{ marginTop: "24px", backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>My Reports</h2>
                        <Link href="/dashboard/reports" style={{ fontSize: "12px", color: "#137fec", textDecoration: "none" }}>View all →</Link>
                    </div>
                    <div style={{ padding: "8px" }}>
                        {reports.map((r: { id: string; createdAt: string; mode: string; interviewer: { name: string | null } }) => (
                            <Link
                                key={r.id}
                                href={`/dashboard/reports/${r.id}`}
                                style={{ textDecoration: "none", display: "block", padding: "12px", borderRadius: "8px", marginBottom: "4px" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>
                                            {r.mode === "MEET" ? "Meet" : r.mode === "INTERVIEW" ? "Live Interview" : "AI Mock"}
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                            Interviewer: {r.interviewer?.name} · {new Date(r.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#484f58" }}>chevron_right</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
