"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const CATEGORIES = [
    { label: "All Snippets", icon: "grid_view", count: 128 },
    { label: "Algorithms", icon: "functions", count: 45 },
    { label: "System Design", icon: "hub", count: 22 },
    { label: "Frontend", icon: "web", count: 31 },
    { label: "SQL & Data", icon: "storage", count: 18 },
];

const DIFFICULTY_COLORS = {
    EASY: "bg-success text-white",
    MEDIUM: "bg-warning text-white",
    HARD: "bg-error text-white",
};

const SNIPPETS = [
    {
        id: "invert-binary-tree",
        title: "Invert Binary Tree",
        difficulty: "EASY" as const,
        description: "Given the root of a binary tree, invert...",
        tags: ["#trees", "#recursion"],
        usageCount: 2,
    },
    {
        id: "design-rate-limiter",
        title: "Design Rate Limiter",
        difficulty: "HARD" as const,
        description: "Design a system to limit the number of...",
        tags: ["#system-design", "#scaling"],
        usageCount: 1,
    },
    {
        id: "debounce-function",
        title: "Debounce Function",
        difficulty: "MEDIUM" as const,
        description: "Implement a debounce functio...",
        tags: ["#javascript", "#frontend"],
        usageCount: 4,
    },
    {
        id: "lru-cache",
        title: "LRU Cache",
        difficulty: "MEDIUM" as const,
        description: "Design a data structure that...",
        tags: ["#data-structures", "#caching"],
        usageCount: 1,
    },
    {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "EASY" as const,
        description: "Determine if the input string is vali...",
        tags: ["#stack", "#strings"],
        usageCount: 1,
    },
];

const PREVIEW_CODE = `const invertTree = (root) => {
  if (!root) return null;

  // Swap children
  const temp = root.left;
  root.left = root.right;
  root.right = temp;

  // Recursively invert
  invertTree(root.left);
  invertTree(root.right);

  return root;
};`;

export default function SnippetLibraryPage() {
    const [activeCategory, setActiveCategory] = useState("All Snippets");
    const [activeDifficulty, setActiveDifficulty] = useState<string>("ALL");
    const [selectedSnippet, setSelectedSnippet] = useState(SNIPPETS[0]);

    const filtered = SNIPPETS.filter((s) => {
        if (activeDifficulty !== "ALL" && s.difficulty !== activeDifficulty) return false;
        return true;
    });

    return (
        <div className="bg-background-dark text-slate-100 h-screen flex font-display overflow-hidden">
            {/* Custom Sidebar for Snippet Vault */}
            <aside className="w-[240px] min-w-[240px] bg-surface-dark border-r border-border-dark flex flex-col h-full">
                {/* Brand */}
                <div className="px-5 py-5 border-b border-border-dark">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl">terminal</span>
                        </div>
                        <div>
                            <h2 className="text-white text-sm font-bold tracking-tight leading-tight">Snippet Vault</h2>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Interview Prep</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {CATEGORIES.map((cat) => (
                            <li key={cat.label}>
                                <button
                                    type="button"
                                    onClick={() => setActiveCategory(cat.label)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.label ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 px-3 mb-3 mt-6">My Collections</p>
                    <ul className="space-y-1">
                        <li>
                            <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-xl text-yellow-500">star</span>
                                Favorites
                            </button>
                        </li>
                        <li>
                            <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-xl">history</span>
                                Recently Used
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="px-4 py-4 border-t border-border-dark">
                    <p className="text-xs text-slate-500 mb-2">Platform usage</p>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: "64%" }} />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">128/200 Snippets Used</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-border-dark bg-surface-dark">
                    <div className="flex items-center gap-3 flex-1 max-w-lg">
                        <div className="flex-1 flex items-center gap-2 bg-background-dark border border-border-dark rounded-lg px-3 py-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                            <input type="text" placeholder="Search snippets (Ctrl+K)" className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-slate-500" />
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-border-dark rounded text-[10px] font-bold text-slate-500">CTRL K</kbd>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">add</span>
                            Create Snippet
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Cards area */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white">Snippet Library</h1>
                            <p className="text-sm text-slate-400 mt-1">Manage and preview your common technical interview coding questions.</p>
                        </div>

                        {/* Difficulty filter */}
                        <div className="flex items-center gap-2 mb-6">
                            {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setActiveDifficulty(d)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDifficulty === d ? "bg-white text-slate-900" : "text-slate-400 hover:bg-slate-800"
                                        } flex items-center gap-2`}
                                >
                                    {d !== "ALL" && <span className={`w-2 h-2 rounded-full ${d === "EASY" ? "bg-success" : d === "MEDIUM" ? "bg-warning" : "bg-error"}`} />}
                                    {d === "ALL" ? "All Questions" : d.charAt(0) + d.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        {/* Card Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((snippet) => (
                                <button
                                    key={snippet.id}
                                    type="button"
                                    onClick={() => setSelectedSnippet(snippet)}
                                    className={`text-left bg-surface-dark border rounded-xl p-5 transition-all hover:border-primary/50 ${selectedSnippet?.id === snippet.id ? "border-primary" : "border-border-dark"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded ${DIFFICULTY_COLORS[snippet.difficulty]}`}>
                                            {snippet.difficulty}
                                        </span>
                                        <button type="button" className="text-slate-500 hover:text-slate-300">
                                            <span className="material-symbols-outlined text-lg">more_vert</span>
                                        </button>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{snippet.title}</h3>
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{snippet.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {snippet.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 bg-slate-800 border border-border-dark text-[10px] font-medium text-slate-400 rounded">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-1.5">
                                            {Array.from({ length: Math.min(snippet.usageCount, 3) }).map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-surface-dark" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">visibility</span> Preview
                                        </span>
                                    </div>
                                </button>
                            ))}
                            {/* New Snippet card */}
                            <button
                                type="button"
                                className="border-2 border-dashed border-border-dark rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-primary/50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl text-slate-500">add_circle_outline</span>
                                <span className="text-sm font-medium text-slate-400">New Snippet</span>
                            </button>
                        </div>
                    </div>

                    {/* Live Preview Panel */}
                    <div className="w-[380px] bg-surface-dark border-l border-border-dark flex flex-col overflow-y-auto">
                        <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between">
                            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Live Preview</span>
                            <div className="flex items-center gap-2">
                                <button type="button" className="text-slate-500 hover:text-slate-300"><span className="material-symbols-outlined text-lg">content_copy</span></button>
                                <button type="button" className="text-slate-500 hover:text-slate-300"><span className="material-symbols-outlined text-lg">edit</span></button>
                            </div>
                        </div>
                        {selectedSnippet && (
                            <div className="p-6 space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-2">{selectedSnippet.title}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded ${DIFFICULTY_COLORS[selectedSnippet.difficulty]}`}>
                                            {selectedSnippet.difficulty}
                                        </span>
                                        <span className="text-xs text-slate-500">LeetCode 226</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Given the <code className="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono">root</code> of a binary tree, invert the tree, and return its root.
                                </p>
                                {/* Code block */}
                                <div className="bg-background-dark rounded-xl overflow-hidden border border-border-dark">
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border-dark">
                                        <div className="flex gap-1.5">
                                            <span className="w-3 h-3 rounded-full bg-error" />
                                            <span className="w-3 h-3 rounded-full bg-warning" />
                                            <span className="w-3 h-3 rounded-full bg-success" />
                                        </div>
                                        <span className="text-xs text-slate-500 ml-2">solution.js</span>
                                    </div>
                                    <pre className="p-4 text-xs leading-relaxed overflow-x-auto">
                                        <code className="text-slate-300 font-mono">{PREVIEW_CODE}</code>
                                    </pre>
                                </div>
                                {/* Complexity */}
                                <div className="bg-background-dark rounded-xl border border-border-dark p-4">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Complexity Analysis</p>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-300">Time Complexity:</span>
                                        <span className="text-sm font-bold text-primary font-mono">O(n)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Space Complexity:</span>
                                        <span className="text-sm font-bold text-primary font-mono">O(h)</span>
                                    </div>
                                </div>
                                {/* Run in Interview */}
                                <Link
                                    href="/"
                                    className="w-full py-3 bg-surface-dark border border-border-dark rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                                    Run in Interview
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
