"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
    userRole: string;
    userName: string;
}

const NAV_ITEMS: Record<string, { href: string; icon: string; label: string }[]> = {
    ADMIN: [
        { href: "/dashboard", icon: "dashboard", label: "Overview" },
        { href: "/dashboard/users", icon: "group", label: "Users" },
        { href: "/dashboard/schedules", icon: "calendar_month", label: "Schedules" },
        { href: "/dashboard/reports", icon: "assessment", label: "Reports" },
        { href: "/dashboard/activity", icon: "timeline", label: "Activity" },
    ],
    INTERVIEWER: [
        { href: "/dashboard", icon: "dashboard", label: "Overview" },
        { href: "/dashboard/schedules", icon: "calendar_month", label: "Schedules" },
        { href: "/dashboard/reports", icon: "assessment", label: "Reports" },
        { href: "/dashboard/activity", icon: "timeline", label: "Activity" },
    ],
    CANDIDATE: [
        { href: "/dashboard", icon: "dashboard", label: "Overview" },
        { href: "/dashboard/schedules", icon: "calendar_month", label: "My Interviews" },
        { href: "/dashboard/reports", icon: "assessment", label: "My Reports" },
    ],
};

const MODE_LINKS = [
    { href: "/meet", icon: "videocam", label: "Meet" },
    { href: "/interview", icon: "code", label: "Interview" },
    { href: "/ai-interview", icon: "smart_toy", label: "AI Mock" },
];

export default function DashboardSidebar({ userRole, userName }: SidebarProps) {
    const pathname = usePathname();
    const navItems = NAV_ITEMS[userRole] || NAV_ITEMS.CANDIDATE;

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <aside
            style={{
                width: "260px",
                minHeight: "100vh",
                backgroundColor: "#0d1117",
                borderRight: "1px solid #21262d",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: "20px 20px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderBottom: "1px solid #21262d",
                }}
            >
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            background: "#137fec",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: "18px" }}>
                            terminal
                        </span>
                    </div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>Live Code</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
                <div style={{ marginBottom: "24px" }}>
                    <p
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            color: "#484f58",
                            padding: "0 8px",
                            marginBottom: "8px",
                        }}
                    >
                        Dashboard
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: 500,
                                color: isActive(item.href) ? "#fff" : "#8b949e",
                                backgroundColor: isActive(item.href) ? "#137fec15" : "transparent",
                                transition: "all 0.15s",
                                marginBottom: "2px",
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: "20px",
                                    color: isActive(item.href) ? "#137fec" : "#8b949e",
                                }}
                            >
                                {item.icon}
                            </span>
                            {item.label}
                            {isActive(item.href) && (
                                <div
                                    style={{
                                        marginLeft: "auto",
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "#137fec",
                                    }}
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div>
                    <p
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            color: "#484f58",
                            padding: "0 8px",
                            marginBottom: "8px",
                        }}
                    >
                        Quick Start
                    </p>
                    {MODE_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "#8b949e",
                                transition: "all 0.15s",
                                marginBottom: "2px",
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* User card */}
            <div
                style={{
                    padding: "16px 16px",
                    borderTop: "1px solid #21262d",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#e2e8f0",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {userName}
                    </p>
                    <p
                        style={{
                            fontSize: "11px",
                            color: "#8b949e",
                            margin: 0,
                            textTransform: "capitalize",
                        }}
                    >
                        {userRole.toLowerCase()}
                    </p>
                </div>
            </div>
        </aside>
    );
}
