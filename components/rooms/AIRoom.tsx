"use client";

import dynamic from "next/dynamic";
import { Suspense, useRef, useState, useCallback, useEffect } from "react";
import type { editor } from "monaco-editor";
import { LiveblocksProvider, RoomProvider } from "@/lib/liveblocks";
import { LANGUAGE_VERSIONS } from "@/constants";
import type { OutputHandle } from "@/components/Output";
import { useBehaviorMonitor } from "@/hooks/useBehaviorMonitor";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });
const Output = dynamic(() => import("@/components/Output"), { ssr: false });

// ─── Helper: extract text from v3 UIMessage ──────────────────────────────────
function getMsgText(m: any): string {
    if (m.parts && Array.isArray(m.parts)) {
        const t = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
        if (t) return t;
    }
    if (typeof m.content === 'string' && m.content) return m.content;
    if (Array.isArray(m.content)) {
        return m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return '';
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text, variant = 'inline' }: { text: string; variant?: 'inline' | 'icon' }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy full response'}
                className="mt-1 w-6 h-6 flex items-center justify-center rounded bg-slate-700/60 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
            >
                <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleCopy}
            title="Copy code"
            className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
        >
            <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function ChatMarkdown({ text }: { text: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-violet-300">{children}</strong>,
                em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-bold text-white mt-3 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-3 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wide mt-3 mb-1">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 pl-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 pl-2">{children}</ol>,
                li: ({ children }) => <li className="text-slate-200 leading-relaxed">{children}</li>,
                code: ({ children, className }) => {
                    const isBlock = className?.includes('language-');
                    if (isBlock) {
                        const codeText = String(children).replace(/\n$/, '');
                        return (
                            <div className="relative group my-2">
                                <CopyButton text={codeText} />
                                <code className={`block bg-[#0d1117] text-green-300 text-xs font-mono p-3 pt-8 rounded-lg overflow-x-auto border border-slate-700 whitespace-pre ${className}`}>
                                    {children}
                                </code>
                            </div>
                        );
                    }
                    return <code className="bg-slate-900 text-violet-300 text-xs font-mono px-1.5 py-0.5 rounded border border-slate-700">{children}</code>;
                },
                pre: ({ children }) => <pre className="my-0 overflow-x-auto rounded-lg">{children}</pre>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-violet-500 pl-3 my-2 text-slate-400 italic">{children}</blockquote>
                ),
                hr: () => <hr className="border-slate-700 my-3" />,
            }}
        >
            {text}
        </ReactMarkdown>
    );
}

// ─── Typewriter Animation for AI Messages ─────────────────────────────────────
// Animates text character by character for a ChatGPT-like feel,
// regardless of how large the incoming chunks are from the model.
function TypewriterMarkdown({ text, id }: { text: string; id: string }) {
    const [displayed, setDisplayed] = useState('');
    const displayedLenRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textRef = useRef(text);

    // Keep textRef in sync with the latest full text
    useEffect(() => { textRef.current = text; }, [text]);

    useEffect(() => {
        // Reset when message ID changes (new message)
        displayedLenRef.current = 0;
        setDisplayed('');
        if (timerRef.current) clearTimeout(timerRef.current);

        const animate = () => {
            const current = textRef.current;
            if (displayedLenRef.current >= current.length) {
                timerRef.current = null;
                return;
            }
            // Speed: 3 chars/tick when far behind, 1 char/tick when close
            const behind = current.length - displayedLenRef.current;
            const step = behind > 80 ? 5 : behind > 30 ? 3 : 1;
            displayedLenRef.current = Math.min(displayedLenRef.current + step, current.length);
            setDisplayed(current.slice(0, displayedLenRef.current));
            timerRef.current = setTimeout(animate, 12);
        };

        animate();
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [id]); // re-run only when message id changes

    // When new text chunks arrive mid-stream, kick the animator if it stopped
    useEffect(() => {
        if (text.length > displayedLenRef.current && !timerRef.current) {
            const animate = () => {
                const current = textRef.current;
                if (displayedLenRef.current >= current.length) { timerRef.current = null; return; }
                const behind = current.length - displayedLenRef.current;
                const step = behind > 80 ? 5 : behind > 30 ? 3 : 1;
                displayedLenRef.current = Math.min(displayedLenRef.current + step, current.length);
                setDisplayed(current.slice(0, displayedLenRef.current));
                timerRef.current = setTimeout(animate, 12);
            };
            animate();
        }
    }, [text]);

    if (!displayed) return <span className="inline-block w-2 h-3.5 bg-violet-400 rounded-sm animate-pulse ml-0.5 align-middle" />;
    return (
        <>
            <ChatMarkdown text={displayed} />
            {/* Blinking cursor while animating */}
            {displayed.length < text.length && (
                <span className="inline-block w-1.5 h-3.5 bg-violet-400 rounded-sm animate-pulse ml-0.5 align-middle" />
            )}
        </>
    );
}

// ─── Drag-to-Resize Hook ──────────────────────────────────────────────────────
function useDragResize(initial: [number, number, number]) {
    const [widths, setWidths] = useState(initial);
    const dragging = useRef<null | { divider: 0 | 1; startX: number; startWidths: [number, number, number] }>(null);

    const onMouseDown = useCallback((divider: 0 | 1) => (e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = { divider, startX: e.clientX, startWidths: [...widths] as [number, number, number] };

        const onMove = (ev: MouseEvent) => {
            if (!dragging.current) return;
            const dx = ev.clientX - dragging.current.startX;
            const totalPx = window.innerWidth;
            const dPct = (dx / totalPx) * 100;
            const [a, b, c] = dragging.current.startWidths;

            let newA = a, newB = b, newC = c;
            if (dragging.current.divider === 0) {
                newA = Math.max(15, Math.min(50, a + dPct));
                newB = Math.max(20, a + b - newA);
                newC = 100 - newA - newB;
            } else {
                newB = Math.max(20, Math.min(65, b + dPct));
                newC = Math.max(10, a + b + c - newA - newB);
                newA = 100 - newB - newC;
            }
            if (newA > 0 && newB > 0 && newC > 0) setWidths([newA, newB, newC]);
        };

        const onUp = () => {
            dragging.current = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [widths]);

    return { widths, onMouseDown };
}

// ─── Header ───────────────────────────────────────────────────────────────────
function AIWorkspaceHeader({
    language,
    onLanguageChange,
    onRunCode,
    onComplete,
    onEndSession,
    isRunning,
    isSubmitting,
    warnings,
    timeLeftFormatted,
    isTimeLow,
}: {
    language: string;
    onLanguageChange: (lang: string) => void;
    onRunCode: () => void;
    onComplete: () => void;
    onEndSession: () => void;
    isRunning: boolean;
    isSubmitting: boolean;
    warnings: number;
    timeLeftFormatted: string;
    isTimeLow: boolean;
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
                data.forEach(pkg => { if (!runtimeMap[pkg.language]) runtimeMap[pkg.language] = pkg.version; });
                if (Object.keys(runtimeMap).length > 0) {
                    setRuntimes(runtimeMap);
                    if (!runtimeMap[language]) onLanguageChange(Object.keys(runtimeMap)[0]);
                }
            } catch (e) {
                console.error("Using default language versions.", e);
            } finally { setIsLoadingRuntimes(false); }
        }
        fetchRuntimes();
    }, []);

    return (
        <header className="flex items-center gap-2 md:gap-8 px-3 md:px-6 py-2 border-b border-slate-800 bg-background-dark z-10 flex-wrap">
            <div className="flex items-center gap-2 md:gap-3 bg-white px-2 py-1 rounded">
                <img src="/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fmoma-gemini-antigravity-media-outputs%2F01777b7d-30e4-41d3-bedd-14aebac068bf.jpg&w=256&q=75" alt="Aim Technologies" className="h-6 md:h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <span className="hidden text-xs md:text-sm font-bold text-slate-800 tracking-widest uppercase">Aim Technologies</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Language:</span>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    disabled={isLoadingRuntimes}
                    className="flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs md:text-sm font-medium text-slate-200 appearance-none cursor-pointer pr-7 md:pr-8 disabled:opacity-50"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.25rem" }}
                >
                    {isLoadingRuntimes ? <option>Loading...</option> : Object.entries(runtimes).map(([lang, version]) => (
                        <option key={lang} value={lang}>{lang} ({version})</option>
                    ))}
                </select>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${isTimeLow ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300'}`} title="Time Remaining">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    {timeLeftFormatted}
                </div>
                {warnings > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-bold border border-red-500/20">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {3 - warnings} Left
                    </div>
                )}
                <button
                    type="button"
                    onClick={onRunCode}
                    disabled={isRunning || isSubmitting}
                    className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-lg border text-xs md:text-sm font-bold transition-all disabled:opacity-60 ${warnings > 0 ? 'border-red-500 text-red-500 hover:bg-red-500/10' : 'border-success text-success hover:bg-success/10'}`}
                >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    Run
                </button>

                {/* Submit to AI button */}
                <button
                    type="button"
                    onClick={onComplete}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-lg border border-violet-500 text-violet-400 hover:bg-violet-500/20 text-xs md:text-sm font-bold transition-all disabled:opacity-60"
                    title="Submit your code to the AI for review"
                >
                    <span className="material-symbols-outlined text-[16px]">{isSubmitting ? 'hourglass_empty' : 'send'}</span>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>

                <button
                    onClick={onEndSession}
                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:scale-105"
                    title="End Session"
                >
                    <span className="material-symbols-outlined text-[18px] md:text-[22px]">call_end</span>
                </button>
            </div>
        </header>
    );
}

// ─── Room Content ─────────────────────────────────────────────────────────────
function RoomContent({ roomId, userId, onboarding }: {
    roomId: string;
    userId: string;
    onboarding: { language: string; difficulty: string; category: string; duration: string; role: string; exp: string };
}) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const outputRef = useRef<OutputHandle>(null);
    const [language, setLanguage] = useState(onboarding.language || "javascript");
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [mobileTab, setMobileTab] = useState<'chat' | 'editor' | 'output'>('editor');
    const lastOutputRef = useRef<string>(''); // stores last run output for Submit

    // ── Timer Logic ──
    const initialMinutes = parseInt(onboarding.duration) || 30; // default to 30 if parsing fails
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const isTimeLow = timeLeft > 0 && timeLeft <= 180; // <= 3 minutes
    const isTimeUp = timeLeft <= 0;

    // ── Resizable panels ──
    const { widths, onMouseDown } = useDragResize([28, 46, 26]);

    // ── Chat ──
    const { messages, sendMessage, status } = useChat({
        onError: (err) => console.error('[useChat] error:', err),
    }) as any;
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Auto-start interview (guarded against React Strict Mode double-invoke)
    useEffect(() => {
        if (hasStartedRef.current) return;
        if (messages.length === 0 && status !== 'streaming' && status !== 'submitted') {
            hasStartedRef.current = true;
            sendMessage({ text: 'I am ready to start my mock interview!' }, { body: { data: { onboarding } } });
        }
    }, [messages.length, status, sendMessage, onboarding]);

    // Run button — just executes code, no AI involvement
    const handleRunCode = async () => {
        setIsRunning(true);
        try {
            const outLines = await outputRef.current?.runCode();
            if (outLines) lastOutputRef.current = outLines; // store for Submit
        } finally { setIsRunning(false); }
    };

    // Submit button — sends code + last output to AI for review
    const handleSubmit = async () => {
        const codeContext = editorRef.current?.getValue() || '';
        if (!codeContext.trim()) return;
        setIsSubmitting(true);
        try {
            // Run fresh to get latest output before sending
            const freshOutput = await outputRef.current?.runCode();
            const output = freshOutput || lastOutputRef.current || 'No output';
            lastOutputRef.current = output;
            sendMessage({
                text: `Here is my code:\n\n\`\`\`${language}\n${codeContext}\n\`\`\`\n\nHere is the output:\n\n\`\`\`\n${output}\n\`\`\`\n\nPlease review my code and the output.`
            }, { body: { data: { code: codeContext, onboarding } } });
        } finally { setIsSubmitting(false); }
    };

    const onChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || status === 'streaming' || status === 'submitted') return;
        const codeContext = editorRef.current?.getValue() || "";
        sendMessage({ text: input }, { body: { data: { code: codeContext, onboarding } } });
        setInput("");
    };

    const { warnings, showWarningOverlay, dismissWarning, isTerminated } = useBehaviorMonitor(3);

    return (
        <div className="bg-[#0b0b1a] text-slate-100 h-screen overflow-hidden flex flex-col font-display relative">
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
            {isTerminated && !isTimeUp && (
                <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4">cancel</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Session Terminated</h2>
                    <p className="text-lg text-slate-400 max-w-md">Your interview session was terminated due to multiple focus violations.</p>
                    <button onClick={() => window.location.href = '/'} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg font-bold">Return Home</button>
                </div>
            )}
            {isTimeUp && (
                <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
                    <span className="material-symbols-outlined text-6xl text-violet-500 mb-4">timer</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
                    <p className="text-lg text-slate-400 max-w-md">Your mock interview session has concluded.</p>
                    <button onClick={() => window.location.href = '/'} className="mt-8 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold">Return Home</button>
                </div>
            )}

            {/* Custom End Session Confirm Modal */}
            {showEndConfirm && !isTerminated && !isTimeUp && (
                <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">logout</span>
                        <h2 className="text-2xl font-bold text-white mb-2">End Session?</h2>
                        <p className="text-slate-400 mb-8">Are you sure you want to end your AI practice session early? Your progress will not be saved.</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="px-6 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-2.5 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-colors"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AIWorkspaceHeader
                language={language}
                onLanguageChange={setLanguage}
                onRunCode={handleRunCode}
                onComplete={handleSubmit}
                onEndSession={() => setShowEndConfirm(true)}
                isRunning={isRunning || isTimeUp}
                isSubmitting={isSubmitting || isTimeUp}
                warnings={warnings}
                timeLeftFormatted={formatTime(timeLeft)}
                isTimeLow={isTimeLow}
            />

            <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
                {/* Mobile Tab Bar */}
                <div className="flex md:hidden border-b border-slate-800 bg-slate-900">
                    {(['chat', 'editor', 'output'] as const).map(tab => (
                        <button key={tab} onClick={() => setMobileTab(tab)}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${mobileTab === tab ? 'text-violet-400 border-b-2 border-violet-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}>
                            {tab === 'chat' ? '💬 Chat' : tab === 'editor' ? '📝 Code' : '▶ Output'}
                        </button>
                    ))}
                </div>

                {/* Desktop 3-column resizable layout */}
                <div className="flex-1 flex overflow-hidden border-b border-slate-800 w-full relative select-none">

                    {/* ── Chat Panel ── */}
                    <div
                        className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex h-full bg-slate-900 flex-col min-w-0`}
                        style={{ width: `${widths[0]}%` }}
                    >
                        <div className="p-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <span className="material-symbols-outlined text-violet-500 text-base">psychology</span>
                                AI Interviewer
                            </h2>
                            {(status === 'submitted' || status === 'streaming') && (
                                <span className="text-xs text-violet-400 animate-pulse font-medium">Thinking...</span>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">smart_toy</span>
                                    </div>
                                    <p className="text-center text-sm max-w-[220px]">Hi {userId}! Starting your interview session...</p>
                                </div>
                            )}

                            {messages.map((m: any) => {
                                const text = getMsgText(m);
                                if (m.role === 'user' && !text) return null;
                                const isUser = m.role === 'user';
                                return (
                                    <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                        {/* Role label */}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isUser ? 'text-violet-400' : 'text-slate-500'}`}>
                                            {isUser ? 'You' : 'AI Interviewer'}
                                        </span>
                                        <div className={`max-w-[95%] px-3 py-2.5 rounded-2xl text-sm ${isUser
                                            ? 'bg-violet-600 text-white rounded-br-sm'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'
                                            }`}>
                                            {isUser ? (
                                                <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                                            ) : (
                                                <TypewriterMarkdown text={text || ''} id={m.id} />
                                            )}
                                        </div>
                                        {/* Small square copy-all button below AI bubble */}
                                        {!isUser && text && (
                                            <CopyButton text={text} variant="icon" />
                                        )}
                                    </div>
                                );
                            })}

                            {/* Bouncing dots while AI is thinking */}
                            {(status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.role === 'user' && (
                                <div className="flex items-start gap-2">
                                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-800 bg-slate-900 shrink-0">
                            <form onSubmit={onChatSubmit} className="relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message or ask for a hint..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder-slate-500"
                                    disabled={status === 'streaming' || status === 'submitted'}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'streaming' || status === 'submitted' || !input.trim()}
                                    className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Drag Handle 1 ── */}
                    <div
                        className="hidden md:flex w-1 bg-slate-800 hover:bg-violet-600/60 active:bg-violet-500 cursor-col-resize items-center justify-center transition-colors shrink-0 group"
                        onMouseDown={onMouseDown(0)}
                    >
                        <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-violet-400 rounded-full transition-colors" />
                    </div>

                    {/* ── Code Editor Panel ── */}
                    <div
                        className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex h-full flex-col min-w-0`}
                        style={{ width: `${widths[1]}%` }}
                    >
                        <CodeEditor
                            roomId={roomId}
                            userId={userId}
                            layout="workspace"
                            editorRefOut={editorRef}
                            language={language}
                            onLanguageChange={setLanguage}
                        />
                    </div>

                    {/* ── Drag Handle 2 ── */}
                    <div
                        className="hidden md:flex w-1 bg-slate-800 hover:bg-violet-600/60 active:bg-violet-500 cursor-col-resize items-center justify-center transition-colors shrink-0 group"
                        onMouseDown={onMouseDown(1)}
                    >
                        <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-violet-400 rounded-full transition-colors" />
                    </div>

                    {/* ── Output Panel ── */}
                    <div
                        className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex h-full bg-[#0b0b1a] flex-col min-w-0`}
                        style={{ width: `${widths[2]}%` }}
                    >
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

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function AIRoom({ roomId, userId, onboarding }: { roomId: string; userId: string; onboarding: any }) {
    const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
    if (!publicKey) return <div className="text-white p-6">Configure LIVEBLOCKS_PUBLIC_KEY</div>;

    return (
        <LiveblocksProvider>
            <Suspense fallback={<div className="text-white p-6">Loading AI room...</div>}>
                <RoomProvider id={`ai-${roomId}`} initialPresence={{ cursor: null, userID: userId }} initialStorage={{}}>
                    <RoomContent roomId={roomId} userId={userId} onboarding={onboarding} />
                </RoomProvider>
            </Suspense>
        </LiveblocksProvider>
    );
}
