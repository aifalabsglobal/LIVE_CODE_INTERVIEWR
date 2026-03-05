"use client";

import { useEffect, useState } from "react";

interface Activity {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    metadata: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string; role: string };
}

const actionConfig: Record<string, { label: string; icon: string; color: string }> = {
    SCHEDULE_CREATED: { label: "Scheduled interview", icon: "calendar_month", color: "#137fec" },
    SCHEDULE_CANCELLED: { label: "Cancelled interview", icon: "event_busy", color: "#ef4444" },
    REPORT_GENERATED: { label: "Generated report", icon: "assessment", color: "#22c55e" },
    AI_MOCK_COMPLETED: { label: "Completed AI mock", icon: "smart_toy", color: "#8b5cf6" },
    MEETING_STARTED: { label: "Started meeting", icon: "videocam", color: "#f59e0b" },
};

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                const res = await fetch("/api/activity?limit=50");
                if (res.ok) {
                    const data = await res.json();
                    setActivities(data.activities || []);
                    setTotal(data.total || 0);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchActivity();
    }, []);

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Activity Feed</h1>
                <p style={{ fontSize: "14px", color: "#8b949e" }}>{total} activities</p>
            </div>

            <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                {loading ? (
                    <p style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>Loading...</p>
                ) : activities.length === 0 ? (
                    <p style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>No activity yet</p>
                ) : (
                    <div style={{ padding: "8px" }}>
                        {activities.map((a, i) => {
                            const config = actionConfig[a.action] || { label: a.action, icon: "circle", color: "#484f58" };
                            return (
                                <div
                                    key={a.id}
                                    style={{
                                        padding: "14px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        borderBottom: i < activities.length - 1 ? "1px solid #21262d" : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            backgroundColor: `${config.color}15`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: config.color }}>
                                            {config.icon}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0 }}>
                                            <strong>{a.user?.name}</strong>{" "}
                                            <span style={{ color: "#8b949e" }}>{config.label}</span>
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#484f58", margin: "2px 0 0 0" }}>
                                            {new Date(a.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            backgroundColor: `${config.color}20`,
                                            color: config.color,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {a.action.replace(/_/g, " ")}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
