"use client";

import { useEffect, useState } from "react";

interface Schedule {
    id: string;
    roomId: string;
    mode: string;
    scheduledAt: string;
    status: string;
    notes: string | null;
    interviewer: { id: string; name: string; email: string };
    candidate: { id: string; name: string; email: string };
}

interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        candidateEmail: "",
        mode: "INTERVIEW",
        scheduledAt: "",
        notes: "",
    });
    const [creating, setCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetch("/api/users/me").then((r) => r.json()).then((d) => setCurrentUser(d.user)).catch(() => { });
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [statusFilter]);

    async function fetchSchedules() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`/api/schedules?${params}`);
            if (res.ok) {
                const data = await res.json();
                setSchedules(data.schedules || []);
                setTotal(data.total || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function openCreateModal() {
        // Default to tomorrow at 10 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        setForm({
            candidateEmail: "",
            mode: "INTERVIEW",
            scheduledAt: tomorrow.toISOString().slice(0, 16),
            notes: "",
        });
        setShowModal(true);
    }

    async function handleCreate() {
        if (!form.candidateEmail || !form.scheduledAt) return;
        setCreating(true);
        try {
            const res = await fetch("/api/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setShowModal(false);
                fetchSchedules();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    }

    async function cancelSchedule(id: string) {
        try {
            await fetch(`/api/schedules/${id}`, { method: "DELETE" });
            fetchSchedules();
        } catch (err) {
            console.error(err);
        }
    }

    const canCreate = currentUser?.role === "ADMIN" || currentUser?.role === "INTERVIEWER";

    const modeLabels: Record<string, string> = {
        MEET: "Meet",
        INTERVIEW: "Interview",
        AI_MOCK: "AI Mock",
    };

    const statusColors: Record<string, string> = {
        SCHEDULED: "#137fec",
        IN_PROGRESS: "#f59e0b",
        COMPLETED: "#22c55e",
        CANCELLED: "#ef4444",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        backgroundColor: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box" as const,
    };

    return (
        <div style={{ padding: "32px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                        {currentUser?.role === "CANDIDATE" ? "My Interviews" : "Interview Schedules"}
                    </h1>
                    <p style={{ fontSize: "14px", color: "#8b949e" }}>{total} total</p>
                </div>
                {canCreate && (
                    <button
                        onClick={openCreateModal}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "10px 18px",
                            backgroundColor: "#137fec",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                        Schedule Interview
                    </button>
                )}
            </div>

            {/* Filter */}
            <div style={{ marginBottom: "20px" }}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: "8px 16px", backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}
                >
                    <option value="">All Status</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #21262d" }}>
                            {["Room ID", "Mode", "Candidate", "Interviewer", "Date & Time", "Status", "Actions"].map((h) => (
                                <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#484f58", textAlign: "left" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>Loading...</td></tr>
                        ) : schedules.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>No interviews found</td></tr>
                        ) : (
                            schedules.map((s) => (
                                <tr key={s.id} style={{ borderBottom: "1px solid #21262d" }}>
                                    <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "monospace", color: "#8b949e", letterSpacing: "1px" }}>
                                        {s.roomId}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#e2e8f0" }}>
                                        {modeLabels[s.mode] || s.mode}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#e2e8f0" }}>
                                        {s.candidate?.name}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8b949e" }}>
                                        {s.interviewer?.name}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#8b949e" }}>
                                        {new Date(s.scheduledAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            backgroundColor: `${statusColors[s.status] || "#484f58"}20`,
                                            color: statusColors[s.status] || "#484f58",
                                            textTransform: "uppercase",
                                        }}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            {s.status === "SCHEDULED" && (
                                                <>
                                                    <a
                                                        href={`/${s.mode === "MEET" ? "meet" : s.mode === "AI_MOCK" ? "ai-interview" : "interview"}?roomId=${s.roomId}`}
                                                        style={{
                                                            padding: "5px 10px",
                                                            backgroundColor: "#137fec",
                                                            borderRadius: "6px",
                                                            color: "#fff",
                                                            fontSize: "11px",
                                                            fontWeight: 600,
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        Join
                                                    </a>
                                                    {canCreate && (
                                                        <button
                                                            onClick={() => cancelSchedule(s.id)}
                                                            style={{
                                                                padding: "5px 10px",
                                                                border: "1px solid #21262d",
                                                                borderRadius: "6px",
                                                                backgroundColor: "transparent",
                                                                color: "#ef4444",
                                                                fontSize: "11px",
                                                                fontWeight: 600,
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div
                    style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "90vw" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>Schedule Interview</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>Candidate Email</label>
                                <input
                                    type="email"
                                    value={form.candidateEmail}
                                    onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                                    placeholder="candidate@example.com"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>Mode</label>
                                <select
                                    value={form.mode}
                                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                                    style={{ ...inputStyle, cursor: "pointer" }}
                                >
                                    <option value="INTERVIEW">Live Interview</option>
                                    <option value="MEET">Meet</option>
                                    <option value="AI_MOCK">AI Mock</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={form.scheduledAt}
                                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>Notes (optional)</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Any notes for this interview..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: "10px", backgroundColor: "#21262d", border: "1px solid #30363d", borderRadius: "8px", color: "#c9d1d9", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={creating || !form.candidateEmail || !form.scheduledAt}
                                    style={{ flex: 1, padding: "10px", backgroundColor: "#137fec", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.6 : 1 }}
                                >
                                    {creating ? "Creating..." : "Schedule"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
