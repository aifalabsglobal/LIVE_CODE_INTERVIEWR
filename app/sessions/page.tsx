"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import EmptyState from "@/components/EmptyState";

const MOCK_SESSIONS = [
    {
        id: "INT-8842-X",
        candidate: "Sarah Chen",
        role: "Full Stack Engineer",
        date: "Oct 24, 2023",
        interviewer: "David Miller",
        interviewerInitials: "DM",
        status: "COMPLETED" as const,
        score: 85,
    },
    {
        id: "INT-8841-B",
        candidate: "Alex Rivera",
        role: "DevOps Specialist",
        date: "Oct 23, 2023",
        interviewer: "Sarah Chen",
        interviewerInitials: "SC",
        status: "IN-PROGRESS" as const,
        score: null,
    },
    {
        id: "INT-8840-C",
        candidate: "Jordan Smith",
        role: "Backend Lead",
        date: "Oct 22, 2023",
        interviewer: "Michael Kim",
        interviewerInitials: "MK",
        status: "COMPLETED" as const,
        score: 92,
    },
    {
        id: "INT-8839-D",
        candidate: "Taylor Wong",
        role: "Junior Developer",
        date: "Oct 21, 2023",
        interviewer: "David Miller",
        interviewerInitials: "DM",
        status: "CANCELLED" as const,
        score: 0,
    },
];

const STATUS_STYLES = {
    COMPLETED: "bg-success/20 text-green-400",
    "IN-PROGRESS": "bg-primary/20 text-blue-400",
    CANCELLED: "bg-error/20 text-red-400",
};

export default function PastSessionsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = MOCK_SESSIONS.filter((s) => {
        const matchesSearch = s.candidate.toLowerCase().includes(search.toLowerCase()) || s.interviewer.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-background-dark text-slate-100 h-screen flex font-display overflow-hidden">
            <Sidebar userName="David Miller" userRole="Senior Architect" />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-8 py-4 border-b border-border-dark bg-surface-dark">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-white">Past Sessions</h1>
                        <span className="px-2 py-0.5 bg-slate-800 text-[10px] uppercase tracking-widest font-bold text-slate-400 rounded">Historical</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <Link href="/" className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Session
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-400">Total Interviews</span>
                                <span className="material-symbols-outlined text-2xl text-primary">group</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-white">1,248</span>
                                <span className="text-xs font-semibold text-green-400 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>12%
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Historical count since launch</p>
                        </div>
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-400">Pass Rate</span>
                                <span className="material-symbols-outlined text-2xl text-success">check_circle</span>
                            </div>
                            <span className="text-3xl font-bold text-white">64%</span>
                            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: "64%" }} />
                            </div>
                        </div>
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-400">Average Score</span>
                                <span className="material-symbols-outlined text-2xl text-warning">star</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">7.8</span>
                                <span className="text-lg text-slate-500">/10</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Based on code and soft skills</p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 flex items-center gap-3 bg-surface-dark border border-border-dark rounded-lg px-4 py-2.5">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search candidates or interviewers..."
                                className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-slate-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-slate-300 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="IN-PROGRESS">In Progress</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button type="button" className="px-4 py-2.5 border border-border-dark rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export
                        </button>
                    </div>

                    {/* Data Table */}
                    {filtered.length === 0 ? (
                        <EmptyState
                            icon="event_busy"
                            title="No Sessions Found"
                            description="No interview sessions match your current filters. Try adjusting your search or create a new session."
                            actionLabel="New Session"
                            onAction={() => (window.location.href = "/")}
                        />
                    ) : (
                        <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border-dark">
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">Candidate Name</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">Date</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">Interviewer</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</th>
                                        <th className="text-center px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">Final Score</th>
                                        <th className="text-right px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((session) => (
                                        <tr key={session.id} className="border-b border-border-dark last:border-b-0 hover:bg-surface-dark-hover transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                        {session.candidate.split(" ").map((n) => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{session.candidate}</p>
                                                        <p className="text-xs text-slate-500">{session.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{session.date}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {session.interviewerInitials}
                                                    </span>
                                                    <span className="text-sm text-slate-300">{session.interviewer}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${STATUS_STYLES[session.status]}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-lg font-bold text-white">{session.score ?? "--"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {session.status === "COMPLETED" ? (
                                                    <Link href={`/sessions/${session.id}/report`} className="text-sm font-medium text-primary hover:text-blue-400 transition-colors">
                                                        View Report
                                                    </Link>
                                                ) : session.status === "IN-PROGRESS" ? (
                                                    <Link href="/" className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors">
                                                        Resume Session
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-slate-500">View Details</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-border-dark">
                                <p className="text-xs text-slate-500">Showing <strong className="text-white">1-4</strong> of <strong className="text-white">1,248</strong> sessions</p>
                                <div className="flex items-center gap-1">
                                    <button type="button" className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    {[1, 2, 3].map((p) => (
                                        <button key={p} type="button" className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${p === 1 ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-800"}`}>
                                            {p}
                                        </button>
                                    ))}
                                    <span className="text-slate-500 text-xs px-1">...</span>
                                    <button type="button" className="w-8 h-8 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 flex items-center justify-center">312</button>
                                    <button type="button" className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
