"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
    user: { id: string; name: string; role: string };
}

export default function AdminOverview({ user }: Props) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSchedules: 0,
        totalReports: 0,
        totalAISessions: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/users?limit=1").then((r) => r.json()),
            fetch("/api/schedules?limit=5").then((r) => r.json()),
            fetch("/api/reports?limit=1").then((r) => r.json()),
            fetch("/api/ai-sessions?limit=1").then((r) => r.json()),
            fetch("/api/activity?limit=8").then((r) => r.json()),
        ]).then(([users, schedules, reports, aiSessions, activity]) => {
            setStats({
                totalUsers: users.total || 0,
                totalSchedules: schedules.total || 0,
                totalReports: reports.total || 0,
                totalAISessions: aiSessions.total || 0,
            });
            setUpcomingSchedules(schedules.schedules || []);
            setRecentActivity(activity.activities || []);
        }).catch(console.error);
    }, []);

    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: "group", color: "#137fec" },
        { label: "Interviews", value: stats.totalSchedules, icon: "calendar_month", color: "#22c55e" },
        { label: "Reports", value: stats.totalReports, icon: "assessment", color: "#f59e0b" },
        { label: "AI Sessions", value: stats.totalAISessions, icon: "smart_toy", color: "#8b5cf6" },
    ];

    const actionLabels: Record<string, string> = {
        SCHEDULE_CREATED: "Scheduled interview",
        SCHEDULE_CANCELLED: "Cancelled interview",
        REPORT_GENERATED: "Generated report",
        AI_MOCK_COMPLETED: "Completed AI mock",
    };

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                    Admin Dashboard
                </h1>
                <p style={{ fontSize: "14px", color: "#8b949e" }}>
                    Welcome back, {user.name}. Here&apos;s your system overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                {statCards.map((card) => (
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

            {/* Two-column layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Upcoming Interviews */}
                <div
                    style={{
                        backgroundColor: "#0d1117",
                        border: "1px solid #21262d",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #21262d",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>
                            Recent Interviews
                        </h2>
                        <Link href="/dashboard/schedules" style={{ fontSize: "12px", color: "#137fec", textDecoration: "none" }}>
                            View all →
                        </Link>
                    </div>
                    <div style={{ padding: "8px" }}>
                        {upcomingSchedules.length === 0 ? (
                            <p style={{ padding: "24px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>
                                No interviews yet
                            </p>
                        ) : (
                            upcomingSchedules.map((s: { id: string; scheduledAt: string; mode: string; status: string; candidate: { name: string | null } }) => (
                                <div
                                    key={s.id}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>
                                            {s.candidate?.name || "Unknown"}
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                            {s.mode} · {new Date(s.scheduledAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            backgroundColor:
                                                s.status === "COMPLETED" ? "#22c55e20" :
                                                    s.status === "CANCELLED" ? "#ef444420" : "#137fec20",
                                            color:
                                                s.status === "COMPLETED" ? "#22c55e" :
                                                    s.status === "CANCELLED" ? "#ef4444" : "#137fec",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {s.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div
                    style={{
                        backgroundColor: "#0d1117",
                        border: "1px solid #21262d",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #21262d",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>
                            Recent Activity
                        </h2>
                        <Link href="/dashboard/activity" style={{ fontSize: "12px", color: "#137fec", textDecoration: "none" }}>
                            View all →
                        </Link>
                    </div>
                    <div style={{ padding: "8px" }}>
                        {recentActivity.length === 0 ? (
                            <p style={{ padding: "24px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>
                                No activity yet
                            </p>
                        ) : (
                            recentActivity.map((a: { id: string; action: string; createdAt: string; metadata: any; user: { name: string | null } }) => (
                                <div
                                    key={a.id}
                                    style={{
                                        padding: "10px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "2px",
                                    }}
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontSize: "18px", color: "#484f58" }}
                                    >
                                        fiber_manual_record
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: "12px", color: "#e2e8f0", margin: 0 }}>
                                            <strong>{a.user?.name}</strong> {actionLabels[a.action] || a.action}
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                            {new Date(a.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
