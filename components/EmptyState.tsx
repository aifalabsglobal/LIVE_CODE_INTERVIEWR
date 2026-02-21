"use client";

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon = "inbox",
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-slate-500">{icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
