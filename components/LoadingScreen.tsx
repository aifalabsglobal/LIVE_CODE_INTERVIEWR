"use client";

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center justify-center font-display gap-6">
            {/* Spinner */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-border-dark border-t-primary animate-spin" />
            </div>

            {/* Brand */}
            <div className="flex items-center gap-2">
                <div className="text-primary">
                    <span className="material-symbols-outlined text-2xl">terminal</span>
                </div>
                <span className="text-lg font-bold text-white">Live Code Interviewer</span>
            </div>

            {/* Message */}
            <p className="text-sm text-slate-400 animate-pulse">{message}</p>
        </div>
    );
}
