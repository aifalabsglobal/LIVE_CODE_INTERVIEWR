"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface User {
    id: string;
    clerkId: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
    createdAt: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ password: "", email: "", name: "" });
    const [creating, setCreating] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetch("/api/users/me").then(r => r.json()).then(d => setCurrentUser(d.user)).catch(() => { });
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.set("role", roleFilter);
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setTotal(data.total || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!form.password || !form.email || !form.name) return;
        setCreating(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setShowModal(false);
                setForm({ password: "", email: "", name: "" });
                toast.success("Interviewer created successfully");
                fetchUsers();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create interviewer");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    }

    async function toggleActive(userId: string, active: boolean) {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !active }),
            });
            if (res.ok) {
                toast.success(`User ${active ? "deactivated" : "activated"} successfully`);
                fetchUsers();
            } else {
                toast.error("Failed to update user status");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        }
    }

    if (currentUser?.role !== "ADMIN") {
        return (
            <div style={{ padding: "64px", textAlign: "center", color: "#8b949e", fontFamily: "'Inter', sans-serif" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "16px", display: "block" }}>lock</span>
                <h2 style={{ color: "#e2e8f0" }}>Access Denied</h2>
                <p>Only admins can manage users.</p>
            </div>
        );
    }

    const roleBadgeColor: Record<string, string> = {
        ADMIN: "#ef4444",
        INTERVIEWER: "#137fec",
        CANDIDATE: "#22c55e",
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
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>User Management</h1>
                    <p style={{ fontSize: "14px", color: "#8b949e" }}>{total} users registered</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
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
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
                    Create Interviewer
                </button>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: "20px" }}>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#0d1117",
                        border: "1px solid #21262d",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                        fontSize: "13px",
                        outline: "none",
                    }}
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="INTERVIEWER">Interviewer</option>
                    <option value="CANDIDATE">Candidate</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #21262d" }}>
                            {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                                <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#484f58", textAlign: "left" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#484f58" }}>No users found</td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} style={{ borderBottom: "1px solid #21262d" }}>
                                    <td style={{ padding: "12px 16px" }}>
                                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{u.name}</p>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8b949e" }}>{u.email}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            backgroundColor: `${roleBadgeColor[u.role] || "#484f58"}20`,
                                            color: roleBadgeColor[u.role] || "#484f58",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            backgroundColor: u.active ? "#22c55e20" : "#ef444420",
                                            color: u.active ? "#22c55e" : "#ef4444",
                                            textTransform: "uppercase",
                                        }}>
                                            {u.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#484f58" }}>
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <button
                                            onClick={() => toggleActive(u.id, u.active)}
                                            style={{
                                                padding: "6px 12px",
                                                border: "1px solid #21262d",
                                                borderRadius: "6px",
                                                backgroundColor: "transparent",
                                                color: u.active ? "#ef4444" : "#22c55e",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {u.active ? "Deactivate" : "Activate"}
                                        </button>
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
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "#161b22",
                            border: "1px solid #30363d",
                            borderRadius: "16px",
                            padding: "28px",
                            width: "420px",
                            maxWidth: "90vw",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
                            Create Interviewer
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>
                                    Password
                                </label>
                                <input
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    type="password"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>
                                    Full Name
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Jane Doe"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#c9d1d9", marginBottom: "6px" }}>
                                    Email
                                </label>
                                <input
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="jane@example.com"
                                    type="email"
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        backgroundColor: "#21262d",
                                        border: "1px solid #30363d",
                                        borderRadius: "8px",
                                        color: "#c9d1d9",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={creating || !form.password || !form.email || !form.name}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        backgroundColor: "#137fec",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        cursor: creating ? "not-allowed" : "pointer",
                                        opacity: creating ? 0.6 : 1,
                                    }}
                                >
                                    {creating ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
