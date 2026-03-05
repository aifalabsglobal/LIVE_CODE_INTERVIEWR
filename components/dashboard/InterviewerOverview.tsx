"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
    user: { id: string; name: string; role: string };
}

export default function InterviewerOverview({ user }: Props) {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [totalSchedules, setTotalSchedules] = useState(0);
    const [totalReports, setTotalReports] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch("/api/schedules?limit=6").then((r) => r.json()),
            fetch("/api/reports?limit=5").then((r) => r.json()),
        ]).then(([sched, rep]) => {
            setSchedules(sched.schedules || []);
            setTotalSchedules(sched.total || 0);
            setReports(rep.reports || []);
            setTotalReports(rep.total || 0);
        }).catch(console.error);
    }, []);

    const upcoming = schedules.filter((s) => s.status === "SCHEDULED");
    const completed = schedules.filter((s) => s.status === "COMPLETED");

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                        Interviewer Dashboard
                    </h1>
                    <p style={{ fontSize: "14px", color: "#8b949e" }}>
                        Welcome back, {user.name}. Manage your interviews and evaluations.
                    </p>
                </div>
                <Link
                    href="/dashboard/schedules"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 18px",
                        backgroundColor: "#137fec",
                        color: "#fff",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Schedule Interview
                </Link>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "32px",
                }}
            >
                {[
                    { label: "Total Interviews", value: totalSchedules, icon: "calendar_month", color: "#137fec" },
                    { label: "Upcoming", value: upcoming.length, icon: "schedule", color: "#22c55e" },
                    { label: "Reports Created", value: totalReports, icon: "assessment", color: "#f59e0b" },
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
                            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: card.color }}>
                                {card.icon}
                            </span>
                        </div>
                        <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Two columns */}
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
                            upcoming.map((s: { id: string; scheduledAt: string; mode: string; status: string; candidate: { name: string | null } }) => (
                                <div key={s.id} style={{ padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{s.candidate?.name}</p>
                                        <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                            {s.mode} · {new Date(s.scheduledAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "4px", backgroundColor: "#137fec20", color: "#137fec", textTransform: "uppercase" }}>
                                        {s.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Reports */}
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>Recent Reports</h2>
                        <Link href="/dashboard/reports" style={{ fontSize: "12px", color: "#137fec", textDecoration: "none" }}>View all →</Link>
                    </div>
                    <div style={{ padding: "8px" }}>
                        {reports.length === 0 ? (
                            <p style={{ padding: "24px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>No reports yet</p>
                        ) : (
                            reports.map((r: { id: string; createdAt: string; mode: string; candidate: { name: string | null } }) => (
                                <Link
                                    key={r.id}
                                    href={`/dashboard/reports/${r.id}`}
                                    style={{ textDecoration: "none", display: "block", padding: "12px", borderRadius: "8px", marginBottom: "4px" }}
                                >
                                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{r.candidate?.name}</p>
                                    <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                        {r.mode} · {new Date(r.createdAt).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
