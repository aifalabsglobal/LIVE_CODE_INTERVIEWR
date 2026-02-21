"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const CODE_STUB = `/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function invertTree(root: TreeNode | null): TreeNode | null {
    /* Your code here */

    return root;
};`;

const LINE_NUMBERS = CODE_STUB.split("\n").length;

export default function SnippetDetailPage() {
    const params = useParams();
    const snippetId = params.snippetId as string;
    const displayTitle = snippetId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    return (
        <div className="bg-background-dark text-slate-100 h-screen flex flex-col font-display overflow-hidden">
            {/* Top Nav */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border-dark bg-surface-dark">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl">terminal</span>
                        </div>
                        <div>
                            <h2 className="text-white text-sm font-bold tracking-tight leading-tight">Interview</h2>
                            <p className="text-[10px] text-slate-500 font-medium">Snippets</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-1">
                        {["Library", "Interviews", "Templates", "Analytics"].map((tab) => (
                            <Link
                                key={tab}
                                href={tab === "Library" ? "/snippets" : tab === "Analytics" ? "/analytics" : "#"}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "Library" ? "text-primary" : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                {tab}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-background-dark border border-border-dark rounded-lg px-3 py-1.5 w-48">
                        <span className="material-symbols-outlined text-sm text-slate-400">search</span>
                        <input type="text" placeholder="Search snippets..." className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-slate-500" />
                    </div>
                    <button type="button" className="px-4 py-2 border border-border-dark rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit Snippet
                    </button>
                    <button type="button" className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                        Use in Interview
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                    </div>
                </div>
            </header>

            {/* Breadcrumb + Status */}
            <div className="px-6 py-2.5 border-b border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/snippets" className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-300 transition-colors">Snippet Library</Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-xs uppercase tracking-widest font-bold text-white">{displayTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        STABLE
                    </span>
                    <span className="text-xs text-slate-500">Last modified 2 days ago</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left - Problem Description */}
                <div className="w-[420px] min-w-[420px] border-r border-border-dark overflow-y-auto p-8">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["Medium", "Trees", "Recursion", "DFS"].map((tag, i) => (
                            <span key={tag} className={`px-3 py-1 rounded-lg text-xs font-bold ${i === 0 ? "bg-warning text-white" : "bg-slate-800 border border-border-dark text-slate-300"}`}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-4">{displayTitle}</h1>

                    <div className="border-t border-border-dark my-4" />

                    {/* Metadata */}
                    <div className="flex items-center gap-8 mb-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Time Estimate</p>
                            <p className="text-sm font-bold text-white">20 Minutes</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Success Rate</p>
                            <p className="text-sm font-bold text-success">68%</p>
                        </div>
                    </div>

                    {/* Problem Statement */}
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                        Given the <code className="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono">root</code> of a binary tree, invert the tree, and return its root.
                    </p>

                    <h3 className="text-base font-bold text-white mb-4">Example 1:</h3>
                    {/* Example image placeholder */}
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-border-dark rounded-xl p-6 mb-4 flex items-center justify-center h-48">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-green-500/40">park</span>
                            <p className="text-xs text-slate-500 mt-2">Tree diagram</p>
                        </div>
                    </div>

                    <div className="bg-background-dark rounded-lg p-4 mb-6 border border-border-dark font-mono text-xs">
                        <p><span className="text-primary font-bold">Input:</span> <span className="text-slate-300">root = [4,2,7,1,3,6,9]</span></p>
                        <p><span className="text-primary font-bold">Output:</span> <span className="text-slate-300">[4,7,2,9,6,3,1]</span></p>
                    </div>

                    <h3 className="text-base font-bold text-white mb-4">Constraints:</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 bg-slate-500 rounded-full shrink-0" />
                            The number of nodes in the tree is in the range <code className="px-1 bg-slate-800 rounded text-xs font-mono">[0, 100]</code>.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 bg-slate-500 rounded-full shrink-0" />
                            <code className="px-1 bg-slate-800 rounded text-xs font-mono">-100 ≤ Node.val ≤ 100</code>.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 bg-slate-500 rounded-full shrink-0" />
                            Optimal time complexity: <code className="px-1 bg-slate-800 rounded text-xs font-mono text-primary">O(n)</code>.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 bg-slate-500 rounded-full shrink-0" />
                            Optimal space complexity: <code className="px-1 bg-slate-800 rounded text-xs font-mono text-primary">O(h)</code> where h is height.
                        </li>
                    </ul>
                </div>

                {/* Right - Code Editor */}
                <div className="flex-1 flex flex-col bg-editor-bg">
                    {/* Editor tabs */}
                    <div className="flex items-center justify-between border-b border-border-dark bg-background-dark/50">
                        <div className="flex">
                            <div className="flex items-center px-4 py-2.5 bg-editor-bg border-r border-border-dark border-t-2 border-t-primary">
                                <span className="material-symbols-outlined text-sm text-primary mr-2">code</span>
                                <span className="text-sm text-white font-medium">solution.ts</span>
                                <button type="button" className="ml-3 text-slate-500 hover:text-slate-300">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-border-dark rounded text-xs text-slate-400">
                                <span>TypeScript</span>
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                            <button type="button" className="p-1 text-slate-500 hover:text-slate-300">
                                <span className="material-symbols-outlined text-lg">settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Code content */}
                    <div className="flex-1 overflow-auto p-0 font-mono text-sm">
                        <div className="flex">
                            {/* Line numbers */}
                            <div className="py-4 px-4 text-right select-none">
                                {Array.from({ length: LINE_NUMBERS }).map((_, i) => (
                                    <div key={i} className="text-slate-600 text-xs leading-6">{i + 1}</div>
                                ))}
                            </div>
                            {/* Code */}
                            <pre className="py-4 pr-6 flex-1">
                                <code className="text-slate-300 text-xs leading-6 whitespace-pre">{CODE_STUB}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-4 py-1.5 border-t border-border-dark bg-surface-dark text-[10px]">
                        <div className="flex items-center gap-4 text-slate-500">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">source</span>
                                main*
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">sync</span>
                                0
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500">
                            <span>Spaces: 4</span>
                            <span>UTF-8</span>
                            <span>TypeScript JSX</span>
                        </div>
                    </div>
                </div>

                {/* Floating buttons */}
                <div className="absolute bottom-16 right-8 flex flex-col gap-2">
                    <button type="button" className="w-10 h-10 bg-surface-dark border border-border-dark rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 shadow-lg">
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button type="button" className="w-10 h-10 bg-surface-dark border border-border-dark rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 shadow-lg">
                        <span className="material-symbols-outlined text-lg">fullscreen</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
