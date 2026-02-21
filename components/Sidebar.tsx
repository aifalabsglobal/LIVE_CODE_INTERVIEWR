"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const PLATFORM_NAV: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Live Interviews", icon: "videocam", href: "/room" },
  { label: "Past Sessions", icon: "history", href: "/sessions" },
  { label: "Analytics & Trends", icon: "bar_chart", href: "/analytics" },
  { label: "Snippet Library", icon: "code_blocks", href: "/snippets" },
];

const ORG_NAV: NavItem[] = [
  { label: "Team Settings", icon: "settings", href: "#" },
  { label: "Templates", icon: "description", href: "#" },
];

interface SidebarProps {
  /** Currently logged-in user name */
  userName?: string;
  /** User role / title */
  userRole?: string;
}

export default function Sidebar({ userName = "Alex Rivera", userRole = "Senior Engineer" }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[240px] min-w-[240px] bg-surface-dark border-r border-border-dark flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <span className="material-symbols-outlined text-xl">terminal</span>
          </div>
          <div>
            <h2 className="text-white text-sm font-bold tracking-tight leading-tight">Live Code</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Interviewer</p>
          </div>
        </div>
      </div>

      {/* Platform Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 px-3 mb-3">Platform</p>
        <ul className="space-y-1">
          {PLATFORM_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 px-3 mb-3 mt-6">Organization</p>
        <ul className="space-y-1">
          {ORG_NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {userName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userRole}</p>
          </div>
          <button type="button" className="text-slate-500 hover:text-slate-300">
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
