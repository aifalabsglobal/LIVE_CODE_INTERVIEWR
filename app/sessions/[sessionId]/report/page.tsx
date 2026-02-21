"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const CODE_SNAPSHOTS = [
    { label: "Initial Boilerplate", time: "02:15", tech: "React, CSS Modules", icon: "code", color: "text-slate-400" },
    { label: "Logic Implementation", time: "15:40", tech: "Custom Hooks, API Integration", icon: "sync", color: "text-primary", highlight: true },
    { label: "Final Optimization", time: "42:10", tech: "Unit Tests, Accessibility", icon: "check_circle", color: "text-success" },
];

const TRANSCRIPT = [
    { speaker: "Interviewer", initials: "I", time: "15:35", text: `"That's a good approach. How would you handle state management if this application needed to scale to dozens of nested components?"`, color: "bg-primary/20 text-primary" },
    { speaker: "Alex Rivera", initials: "AR", time: "15:42", text: `"I'd likely look at the React Context API for simple prop-drilling issues, but for more complex state I'd implement Zustand or Redux Toolkit. Given the current scope, Context seems sufficient."`, color: "bg-green-500/20 text-green-400" },
    { speaker: "Interviewer", initials: "I", time: "16:10", text: `"Makes sense. Can you walk me through the optimization you just added to the useFetch hook?"`, color: "bg-primary/20 text-primary" },
    { speaker: "Alex Rivera", initials: "AR", time: "16:25", text: `"Certainly. I implemented a cleanup function to abort the fetch request if the component unmounts before the promise resolves. This prevents memory leaks and potential state updates on unmounted components."`, color: "bg-green-500/20 text-green-400" },
];

const KEY_TOPICS = ["React Hooks", "Performance", "State Management", "Data Fetching", "Clean Code"];

const ACTIONS = [
    { label: "Move to System Design round", checked: true },
    { label: "Share code snapshots with Tech Lead", checked: false },
    { label: "Verify references for 2021-2023 roles", checked: false },
];

export default function SessionReportPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen font-display">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-4 border-b border-border-dark bg-surface-dark">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-1.5 rounded-lg text-white">
                        <span className="material-symbols-outlined text-xl">terminal</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Interview Session #{sessionId}</h1>
                        <p className="text-xs text-slate-400">Candidate: Alex Rivera • Senior Frontend Engineer</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Copy Report
                    </button>
                    <button type="button" className="p-2 rounded-lg border border-border-dark hover:bg-slate-800 text-slate-400">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                    <button type="button" className="p-2 rounded-lg border border-border-dark hover:bg-slate-800 text-slate-400">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="px-8 py-3 border-b border-border-dark">
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/sessions" className="text-slate-500 hover:text-slate-300 transition-colors">Interviews</Link>
                    <span className="text-slate-600">›</span>
                    <span className="text-white font-medium">Session Report</span>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Video + Transcript */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Video Player */}
                        <div className="bg-surface-dark rounded-xl overflow-hidden border border-border-dark">
                            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=60')] bg-cover bg-center opacity-40" />
                                <button type="button" className="relative z-10 w-16 h-16 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                    <span className="material-symbols-outlined text-3xl text-white ml-1">play_arrow</span>
                                </button>
                            </div>
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-400 font-mono">15:40 / 45:00</span>
                                    <div className="flex-1 h-1 bg-slate-700 rounded-full w-64 relative">
                                        <div className="h-full bg-primary rounded-full" style={{ width: "34%" }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" className="p-1 text-slate-400 hover:text-white"><span className="material-symbols-outlined text-lg">volume_up</span></button>
                                    <button type="button" className="p-1 text-slate-400 hover:text-white"><span className="material-symbols-outlined text-lg">settings</span></button>
                                    <button type="button" className="p-1 text-slate-400 hover:text-white"><span className="material-symbols-outlined text-lg">fullscreen</span></button>
                                </div>
                            </div>
                        </div>

                        {/* Transcript */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">description</span>
                                    Transcript
                                </h2>
                                <div className="flex items-center gap-2 bg-background-dark border border-border-dark rounded-lg px-3 py-1.5">
                                    <span className="material-symbols-outlined text-sm text-slate-400">search</span>
                                    <input type="text" placeholder="Search keywords..." className="bg-transparent text-sm outline-none text-slate-300 w-32 placeholder:text-slate-500" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                {TRANSCRIPT.map((entry, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full ${entry.color} flex items-center justify-center text-xs font-bold shrink-0 mt-1`}>
                                            {entry.initials}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-white">{entry.speaker}</span>
                                                <span className="text-xs text-slate-500">{entry.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">{entry.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Analysis */}
                    <div className="space-y-6">
                        {/* Code Versions */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-slate-400">history</span>
                                    Saved Code Versions
                                </h3>
                                <span className="text-xs font-bold text-primary">{CODE_SNAPSHOTS.length} SNAPSHOTS</span>
                            </div>
                            <div className="space-y-3">
                                {CODE_SNAPSHOTS.map((snap, i) => (
                                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${snap.highlight ? "bg-primary/10 border border-primary/30" : ""}`}>
                                        <span className={`material-symbols-outlined text-lg ${snap.color} mt-0.5`}>{snap.icon}</span>
                                        <div>
                                            <p className={`text-sm font-semibold ${snap.highlight ? "text-primary" : "text-white"}`}>{snap.label}</p>
                                            <p className="text-xs text-slate-500">{snap.time} • {snap.tech}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="w-full mt-4 py-2.5 border border-border-dark rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">unfold_more</span>
                                View Full Code Diff
                            </button>
                        </div>

                        {/* AI Summary */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-lg text-primary">auto_awesome</span>
                                <span className="text-primary">AI Summary</span>
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Candidate demonstrated strong mastery of React patterns and state management. They effectively communicated their decision-making process and showed high awareness of performance bottlenecks and memory management.
                            </p>
                        </div>

                        {/* Key Topics */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-lg text-slate-400">label</span>
                                Key Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {KEY_TOPICS.map((t) => (
                                    <span key={t} className="px-3 py-1.5 bg-slate-800 border border-border-dark text-xs font-medium text-slate-300 rounded-lg">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Actions */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-lg text-success">task_alt</span>
                                Recommended Actions
                            </h3>
                            <div className="space-y-3">
                                {ACTIONS.map((a, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${a.checked ? "border-primary bg-primary" : "border-slate-600"}`}>
                                            {a.checked && <span className="material-symbols-outlined text-xs text-white">check</span>}
                                        </div>
                                        <span className="text-sm text-slate-300">{a.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Badge */}
                        <div className="bg-success/10 border border-success/30 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-success mb-1">Recommendation</p>
                                <p className="text-xl font-bold text-success">Strong Hire</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                <span className="text-lg font-bold text-success">A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border-dark mt-16 px-8 py-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">© 2024 Live Code Interviewer. All interview data is encrypted and secure.</p>
                <div className="flex items-center gap-4">
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Support</a>
                </div>
            </footer>
        </div>
    );
}
