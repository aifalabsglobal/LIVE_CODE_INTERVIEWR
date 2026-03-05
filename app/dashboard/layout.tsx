"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/users/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#0d1117",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b949e",
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "3px solid #21262d",
                            borderTopColor: "#137fec",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 16px",
                        }}
                    />
                    <p>Loading dashboard...</p>
                    <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#0d1117",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e2e8f0",
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                <p>Please sign in to access the dashboard.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0d1117" }}>
            <DashboardSidebar userRole={user.role} userName={user.name} />
            <main
                style={{
                    flex: 1,
                    overflow: "auto",
                    backgroundColor: "#010409",
                }}
            >
                {children}
            </main>
        </div>
    );
}
