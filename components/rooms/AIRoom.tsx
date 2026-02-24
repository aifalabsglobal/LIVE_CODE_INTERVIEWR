"use client";

import dynamic from "next/dynamic";
import { Suspense, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { editor } from "monaco-editor";
import { LiveblocksProvider, RoomProvider } from "@/lib/liveblocks";
import { LANGUAGE_VERSIONS } from "@/constants";
import { useEffect } from "react";
import type { OutputHandle } from "@/components/Output";
import { useBehaviorMonitor } from "@/hooks/useBehaviorMonitor";
import { useChat } from "@ai-sdk/react";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });
const Output = dynamic(() => import("@/components/Output"), { ssr: false });

function AIWorkspaceHeader({
    roomId,
    userId,
    language,
    onLanguageChange,
    onRunCode,
    isRunning,
    warnings,
}: {
    roomId: string;
    userId: string;
    language: string;
    onLanguageChange: (lang: string) => void;
    onRunCode: () => void;
    isRunning: boolean;
    warnings: number;
}) {
    const [runtimes, setRuntimes] = useState<Record<string, string>>(LANGUAGE_VERSIONS);
    const [isLoadingRuntimes, setIsLoadingRuntimes] = useState(true);

    useEffect(() => {
        async function fetchRuntimes() {
            try {
                const res = await fetch("/api/runtimes");
                if (!res.ok) throw new Error("Failed to fetch");
                const data: { language: string; version: string }[] = await res.json();

                const runtimeMap: Record<string, string> = {};
                data.forEach(pkg => {
                    if (!runtimeMap[pkg.language]) {
                        runtimeMap[pkg.language] = pkg.version;
                    }
                });

                if (Object.keys(runtimeMap).length > 0) {
                    setRuntimes(runtimeMap);
                    if (!runtimeMap[language]) {
                        onLanguageChange(Object.keys(runtimeMap)[0]);
                    }
                }
            } catch (e) {
                console.error("Using default language versions.", e);
            } finally {
                setIsLoadingRuntimes(false);
            }
        }
        fetchRuntimes();
    }, []);

    const handleEndSession = () => {
        if (confirm("End your AI practice session?")) {
            window.location.href = "/";
        }
    };

    return (
        <header className="flex items-center gap-8 px-6 py-2 border-b border-slate-800 bg-background-dark z-10">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-violet-500 text-xl">smart_toy</span>
                <span className="text-sm font-bold text-white tracking-widest uppercase">AI Interview</span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Language:</span>
                <div className="relative group">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        disabled={isLoadingRuntimes}
                        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 appearance-none cursor-pointer pr-8 disabled:opacity-50"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.25rem" }}
                    >
                        {isLoadingRuntimes ? (
                            <option>Loading...</option>
                        ) : (
                            Object.entries(runtimes).map(([lang, version]) => (
                                <option key={lang} value={lang}>
                                    {lang} ({version})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {warnings > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-bold border border-red-500/20 ml-4">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {3 - warnings} Chances Left
                    </div>
                )}

                <button
                    type="button"
                    onClick={onRunCode}
                    disabled={isRunning}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-bold transition-all disabled:opacity-60 ml-4 ${warnings > 0 ? 'border-red-500 text-red-500 hover:bg-red-500/10' : 'border-success text-success hover:bg-success/10'}`}
                >
                    Run Code
                </button>

                <button
                    onClick={handleEndSession}
                    className="ml-4 w-9 h-9 flex items-center justify-center rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white transition-all"
                    title="End Session"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        </header>
    );
}

function RoomContent({ roomId, userId }: { roomId: string, userId: string }) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const outputRef = useRef<OutputHandle>(null);
    const [language, setLanguage] = useState("javascript");
    const [isRunning, setIsRunning] = useState(false);

    const handleRunCode = async () => {
        setIsRunning(true);
        try {
            await outputRef.current?.runCode();
        } finally {
            setIsRunning(false);
        }
    };

    const { messages, sendMessage, status } = useChat();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }

    const onChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || status === 'streaming' || status === 'submitted') return;

        const codeContext = editorRef.current?.getValue() || "";

        // Append user message with code context
        sendMessage(
            { text: input },
            { body: { data: { code: codeContext } } }
        );

        setInput("");
    };

    const { warnings, showWarningOverlay, dismissWarning, isTerminated } = useBehaviorMonitor(3);

    return (
        <div className={`bg-[#0b0b1a] text-slate-100 h-screen overflow-hidden flex flex-col font-display relative`}>
            {showWarningOverlay && !isTerminated && (
                <div className="absolute inset-0 z-50 bg-red-900/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                    <span className="material-symbols-outlined text-6xl text-white mb-4">warning</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Attention Required</h2>
                    <p className="text-lg text-red-100 max-w-md">
                        Please keep this tab and window active. Navigating away ({warnings}/3 warnings used) will result in automatic session termination.
                    </p>
                    <button onClick={dismissWarning} className="mt-8 px-6 py-2 bg-white text-red-900 rounded-lg font-bold">I Understand</button>
                </div>
            )}

            {isTerminated && (
                <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4">cancel</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Session Terminated</h2>
                    <p className="text-lg text-slate-400 max-w-md">
                        Your interview session was terminated due to multiple focus violations.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg font-bold">Return Home</button>
                </div>
            )}

            <AIWorkspaceHeader
                roomId={roomId}
                userId={userId}
                language={language}
                onLanguageChange={setLanguage}
                onRunCode={handleRunCode}
                isRunning={isRunning}
                warnings={warnings}
            />

            <main className="flex-1 flex overflow-hidden min-h-0 relative">
                <div className="flex-1 flex overflow-hidden border-b border-slate-800 w-full relative">

                    {/* AI Interviewer Live Chat Sidebar */}
                    <div className="w-[30%] h-full border-r border-slate-800 bg-slate-900 flex flex-col hidden md:flex">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <span className="material-symbols-outlined text-violet-500">psychology</span>
                                AI Interviewer
                            </h2>
                            {(status === 'submitted' || status === 'streaming') && (
                                <span className="text-xs text-violet-400 animate-pulse">Thinking...</span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl">smart_toy</span>
                                    </div>
                                    <p className="text-center max-w-[250px]">
                                        Hi {userId}! I'm your AI technical interviewer. Write some code and ask me for hints!
                                    </p>
                                </div>
                            )}

                            {messages.map((m: any) => (
                                <div key={m.id} className={`flex flex-col max-w-[90%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${m.role === 'user' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {(status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-violet-600/20 flex flex-shrink-0 flex-col items-center justify-center mt-1">
                                        <span className="material-symbols-outlined text-violet-400 text-[18px]">smart_toy</span>
                                    </div>
                                    <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900">
                            <form onSubmit={onChatSubmit} className="relative">
                                <input
                                    value={input || ""}
                                    onChange={handleInputChange}
                                    placeholder="Type a message or ask for a hint..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder-slate-500"
                                    disabled={status === 'streaming' || status === 'submitted'}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'streaming' || status === 'submitted' || !(input || "").trim()}
                                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="w-1/2 md:w-2/4 h-full border-r border-slate-800">
                        <CodeEditor
                            roomId={roomId}
                            userId={userId}
                            layout="workspace"
                            editorRefOut={editorRef}
                            language={language}
                            onLanguageChange={setLanguage}
                        />
                    </div>

                    <div className="w-1/2 md:w-1/4 h-full bg-[#0b0b1a] relative">
                        <Output
                            ref={outputRef}
                            editorRef={editorRef}
                            language={language}
                            layout="side"
                        />
                    </div>

                </div>
            </main>
        </div>
    );
}

export default function AIRoom({ roomId, userId }: { roomId: string, userId: string }) {
    const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
    if (!publicKey) return <div className="text-white p-6">Configure LIVEBLOCKS_PUBLIC_KEY</div>;

    return (
        <LiveblocksProvider>
            <Suspense fallback={<div className="text-white p-6">Loading AI room...</div>}>
                <RoomProvider id={`ai-${roomId}`} initialPresence={{ cursor: null, userID: userId }} initialStorage={{}}>
                    <RoomContent roomId={roomId} userId={userId} />
                </RoomProvider>
            </Suspense>
        </LiveblocksProvider>
    );
}
