"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const TOOLS = [
    { icon: "near_me", label: "Select", active: true },
    { icon: "edit", label: "Pen" },
    { icon: "square", label: "Rectangle" },
    { icon: "circle", label: "Circle" },
    { icon: "arrow_forward", label: "Arrow" },
    { icon: "title", label: "Text" },
    { icon: "ink_eraser", label: "Eraser" },
    { icon: "change_history", label: "Shapes" },
];

export default function WhiteboardPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const [activeTool, setActiveTool] = useState("Select");
    const [zoom, setZoom] = useState(100);

    return (
        <div className="bg-white text-slate-900 h-screen flex flex-col font-display overflow-hidden">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl text-primary">draw</span>
                        <h1 className="text-lg font-bold text-slate-900">System Design Board</h1>
                    </div>
                    <div className="h-5 w-px bg-slate-300" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interview Room:</span>
                        <span className="text-sm font-bold text-slate-800">Live Session #{roomId?.slice(0, 3) ?? "842"}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/room/${roomId}`}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">code</span>
                        Back to Editor
                    </Link>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">delete_sweep</span>
                        Clear Canvas
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">share</span>
                        Share
                    </button>
                </div>
            </header>

            {/* Main canvas area */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Toolbar */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex flex-col gap-1 z-10">
                    {TOOLS.map((tool) => (
                        <button
                            key={tool.label}
                            type="button"
                            onClick={() => setActiveTool(tool.label)}
                            className={`p-2.5 rounded-lg transition-colors ${activeTool === tool.label
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                            title={tool.label}
                        >
                            <span className="material-symbols-outlined text-xl">{tool.icon}</span>
                        </button>
                    ))}
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
                    {/* Demo shapes */}
                    <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-xl">near_me</span>
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded font-medium">Alex (Interviewer)</span>
                        </div>
                        <div className="w-48 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-white/50">
                            <span className="text-slate-400 text-sm font-medium">Load Balancer</span>
                        </div>
                    </div>
                    <div className="absolute top-1/3 left-1/3 transform translate-y-40 -translate-x-1/2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">arrow_downward</span>
                    </div>
                    <div className="absolute top-2/3 left-1/4 flex gap-6">
                        <div className="w-36 h-24 border border-slate-300 rounded-lg flex items-center justify-center bg-white/50">
                            <span className="text-slate-400 text-sm font-medium">App Server 1</span>
                        </div>
                        <div className="w-36 h-24 border border-slate-300 rounded-lg flex items-center justify-center bg-white/50">
                            <span className="text-slate-400 text-sm font-medium">App Server 2</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Participants */}
                <div className="w-[280px] bg-white border-l border-slate-200 flex flex-col">
                    <div className="p-4 space-y-3">
                        {/* Participant 1 */}
                        <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                            <div className="aspect-video bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-white/30">person</span>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full" />
                                ALEX (YOU)
                            </div>
                        </div>
                        {/* Participant 2 */}
                        <div className="relative rounded-xl overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-white/30">person</span>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                                JORDAN DOE
                            </div>
                            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                                <span className="material-symbols-outlined text-sm">mic_off</span>
                            </div>
                        </div>
                    </div>
                    {/* Live Chat */}
                    <div className="mt-auto p-4 border-t border-slate-200">
                        <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">chat</span>
                                <span className="text-sm font-semibold text-slate-800">Live Chat</span>
                            </div>
                            <span className="bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <footer className="border-t border-slate-200 bg-white px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <button type="button" onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1 text-slate-500 hover:text-slate-800">
                        <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="text-sm font-medium text-slate-700 w-12 text-center">{zoom}%</span>
                    <button type="button" onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1 text-slate-500 hover:text-slate-800">
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200" />
                    <button type="button" onClick={() => setZoom(100)} className="p-1 text-slate-500 hover:text-slate-800">
                        <span className="material-symbols-outlined text-lg">fit_screen</span>
                    </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2 w-80">
                    <span className="material-symbols-outlined text-lg text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search in canvas..."
                        className="bg-transparent text-sm text-slate-700 outline-none flex-1 placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-500">CMD</kbd>
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-500">K</kbd>
                    </div>
                </div>
            </footer>
        </div>
    );
}
