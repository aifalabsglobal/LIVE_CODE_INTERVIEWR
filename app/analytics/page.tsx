"use client";

import Sidebar from "@/components/Sidebar";

const VOLUME_DATA = [10, 15, 12, 30, 35, 45, 50, 55, 60, 55, 65, 70];
const VOLUME_MAX = Math.max(...VOLUME_DATA);

const ROLE_PERFORMANCE = [
    { role: "Frontend Engineering", score: 88, color: "bg-primary" },
    { role: "Mobile (iOS/Android)", score: 79, color: "bg-purple-500" },
    { role: "Backend Engineering", score: 72, color: "bg-success" },
    { role: "DevOps & Infrastructure", score: 64, color: "bg-warning" },
];

const TOP_INTERVIEWERS = [
    { name: "Marcus T.", sessions: 42, rating: 9.8 },
    { name: "Sarah Jenkins", sessions: 38, rating: 9.6 },
    { name: "David Chen", sessions: 31, rating: 9.4 },
    { name: "Aisha Khan", sessions: 28, rating: 9.2 },
];

export default function AnalyticsPage() {
    return (
        <div className="bg-background-dark text-slate-100 h-screen flex font-display overflow-hidden">
            <Sidebar userName="Alex Rivera" userRole="Senior HR Manager" />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-8 py-4 border-b border-border-dark bg-surface-dark">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1 max-w-lg flex items-center gap-3 bg-background-dark border border-border-dark rounded-lg px-4 py-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                            <input type="text" placeholder="Search analytics, candidates, or reports..." className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-slate-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button type="button" className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export Report
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Page title */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Hiring Analytics & Trends</h1>
                            <p className="text-sm text-slate-400 mt-1">Real-time insights into your technical recruitment pipeline.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg">
                                <span className="material-symbols-outlined text-lg text-slate-400">calendar_today</span>
                                <span className="text-sm text-slate-300 font-medium">Last 30 Days</span>
                                <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
                            </div>
                            <button type="button" className="p-2 border border-border-dark rounded-lg hover:bg-slate-800 text-slate-400">
                                <span className="material-symbols-outlined text-lg">tune</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                </span>
                                <span className="text-xs font-semibold text-warning flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">trending_down</span>12%
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-3">Avg. Time-to-Hire</p>
                            <p className="text-3xl font-bold text-white">18 Days</p>
                            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">Industry Avg: 24 Days</p>
                        </div>
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-success">check_circle</span>
                                </span>
                                <span className="text-xs font-semibold text-green-400 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>5.4%
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-3">Interview Pass Rate</p>
                            <p className="text-3xl font-bold text-white">34.2%</p>
                            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: "34%" }} />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">Target: 30%</p>
                        </div>
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-warning">chat</span>
                                </span>
                                <span className="text-xs font-semibold text-green-400 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>18%
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-3">Total Interviews</p>
                            <p className="text-3xl font-bold text-white">1,240</p>
                            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-warning rounded-full" style={{ width: "83%" }} />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">Monthly Quota: 1,500</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {/* Line Chart - Interview Volume */}
                        <div className="col-span-2 bg-surface-dark border border-border-dark rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Interview Volume over Time</h3>
                                    <p className="text-xs text-slate-400 mt-1">Total sessions conducted across all departments.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        <span className="text-xs text-slate-400 font-medium">Total Sessions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                        <span className="text-xs text-slate-400 font-medium">Previous Period</span>
                                    </div>
                                </div>
                            </div>
                            {/* SVG Chart */}
                            <div className="h-48 relative">
                                <svg viewBox="0 0 480 160" className="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#135bec" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#135bec" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Grid lines */}
                                    {[0, 40, 80, 120].map((y) => (
                                        <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#30363d" strokeWidth="0.5" />
                                    ))}
                                    {/* Area fill */}
                                    <path
                                        d={`M0,${160 - (VOLUME_DATA[0] / VOLUME_MAX) * 140} ${VOLUME_DATA.map((v, i) => `L${(i * 480) / (VOLUME_DATA.length - 1)},${160 - (v / VOLUME_MAX) * 140}`).join(" ")} L480,160 L0,160 Z`}
                                        fill="url(#chartGrad)"
                                    />
                                    {/* Line */}
                                    <path
                                        d={`M0,${160 - (VOLUME_DATA[0] / VOLUME_MAX) * 140} ${VOLUME_DATA.map((v, i) => `L${(i * 480) / (VOLUME_DATA.length - 1)},${160 - (v / VOLUME_MAX) * 140}`).join(" ")}`}
                                        fill="none"
                                        stroke="#135bec"
                                        strokeWidth="2"
                                    />
                                    {/* Dots */}
                                    {VOLUME_DATA.map((v, i) => (
                                        <circle key={i} cx={(i * 480) / (VOLUME_DATA.length - 1)} cy={160 - (v / VOLUME_MAX) * 140} r="3" fill="#135bec" />
                                    ))}
                                </svg>
                            </div>
                            <div className="flex justify-between mt-2">
                                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m) => (
                                    <span key={m} className="text-[10px] text-slate-500 font-medium">{m}</span>
                                ))}
                            </div>
                        </div>

                        {/* AI Skill Gap */}
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-warning">psychology</span>
                                AI Skill Gap Analysis
                            </h3>
                            <p className="text-xs text-slate-400 mb-5">AI detected common weaknesses in the last 200 candidates.</p>
                            <div className="space-y-3 mb-5">
                                <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-error">Critical Gap</span>
                                        <span className="text-xs text-slate-400">62% of candidates</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white">System Design Patterns</p>
                                </div>
                                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-warning">Developing Gap</span>
                                        <span className="text-xs text-slate-400">45% of candidates</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white">Unit Testing Coverage</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {["Concurrency", "Memory Mgmt", "Graph Theory"].map((t) => (
                                    <span key={t} className="px-2.5 py-1 bg-slate-800 border border-border-dark rounded text-xs font-medium text-slate-400">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* Performance by Role */}
                        <div className="col-span-2 bg-surface-dark border border-border-dark rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6">Candidate Performance by Role</h3>
                            <div className="space-y-5">
                                {ROLE_PERFORMANCE.map((r) => (
                                    <div key={r.role}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-300">{r.role}</span>
                                            <span className="text-sm font-semibold text-primary">{r.score}% score</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${r.score}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Interviewers */}
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-5">Top Interviewers</h3>
                            <div className="space-y-4">
                                {TOP_INTERVIEWERS.map((person) => (
                                    <div key={person.name} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                            {person.name.split(" ").map((n) => n[0]).join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white">{person.name}</p>
                                            <p className="text-xs text-slate-500">{person.sessions} Sessions</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary">{person.rating}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rating</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="w-full mt-5 py-2.5 border border-border-dark rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors uppercase tracking-wider font-bold text-xs">
                                View Leaderboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
