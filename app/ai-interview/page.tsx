"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AIOnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("30");
  const [role, setRole] = useState("Full-Stack Developer");
  const [experience, setExperience] = useState("Intermediate");
  const [isStarting, setIsStarting] = useState(false);

  const [runtimes, setRuntimes] = useState<{ language: string, version: string }[]>([]);
  const [isLoadingRuntimes, setIsLoadingRuntimes] = useState(true);

  useEffect(() => {
    async function fetchRuntimes() {
      try {
        const res = await fetch("/api/runtimes");
        if (res.ok) {
          const data = await res.json();
          const uniqueLangs = Array.from(new Set(data.map((r: any) => r.language)));
          setRuntimes(uniqueLangs.map((l: any) => data.find((r: any) => r.language === l)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingRuntimes(false);
      }
    }
    fetchRuntimes();
  }, []);

  const generateSimpleId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      if (i === 4 || i === 8) result += "-";
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleStartInteraction = () => {
    if (!userName.trim()) return alert("Please enter your name");
    setIsStarting(true);
    const rid = generateSimpleId();
    const query = new URLSearchParams({
      userId: userName,
      lang: language,
      diff: difficulty,
      dur: duration,
      role: role,
      exp: experience
    }).toString();

    router.push(`/room/ai/${rid}?${query}`);
  };

  const colors = {
    bg: "#0d1117",
    surface: "#161b22",
    border: "#30363d",
    primary: "#8b5cf6", // Violet for AI
    text: "#e2e8f0",
    textMuted: "#8b949e",
    textLabel: "#c9d1d9",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ width: "100%", padding: "20px 32px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "white" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
          <span style={{ fontWeight: 600 }}>Back to Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined" style={{ color: colors.primary }}>smart_toy</span>
          <span style={{ fontWeight: 700, letterSpacing: "1px" }}>AI INTERVIEWER</span>
        </div>
      </header>

      <main style={{ maxWidth: "600px", margin: "24px auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Configure Mock Interview</h1>
          <p style={{ color: colors.textMuted }}>Customize the parameters for your AI-guided technical assessment.</p>
        </div>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.textLabel, marginBottom: "6px" }}>Candidate Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </div>

            {/* Target Role & Experience Level */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="sm:!flex-row">
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.textLabel, marginBottom: "6px" }}>Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                  <option value="General Software Engineer">General Software Engineer</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.textLabel, marginBottom: "6px" }}>Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Beginner">Beginner (0-1 years)</option>
                  <option value="Intermediate">Intermediate (2-4 years)</option>
                  <option value="Advanced">Advanced (5+ years)</option>
                </select>
              </div>
            </div>

            {/* Language & Difficulty */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="sm:!flex-row">
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.textLabel, marginBottom: "6px" }}>Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isLoadingRuntimes}
                  style={{ ...inputStyle, cursor: "pointer", opacity: isLoadingRuntimes ? 0.6 : 1 }}
                >
                  {isLoadingRuntimes ? <option>Loading...</option> : runtimes.map(r => (
                    <option key={r.language} value={r.language}>{r.language} ({r.version})</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.textLabel, marginBottom: "6px" }}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Easy">Easy (Intern/Entry)</option>
                  <option value="Medium">Medium (Mid-Level)</option>
                  <option value="Hard">Hard (Senior)</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.textLabel, marginBottom: "6px" }}>Session Duration (Minutes)</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {["15", "30", "45", "60"].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      backgroundColor: duration === d ? `${colors.primary}20` : colors.bg,
                      border: `1px solid ${duration === d ? colors.primary : colors.border}`,
                      color: duration === d ? colors.primary : colors.textMuted,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: duration === d ? 700 : 500,
                      transition: "all 0.2s"
                    }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartInteraction}
              disabled={isStarting || !userName.trim()}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "14px",
                backgroundColor: colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: isStarting || !userName.trim() ? "not-allowed" : "pointer",
                opacity: isStarting || !userName.trim() ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: `0 4px 14px ${colors.primary}40`,
                transition: "all 0.2s"
              }}
            >
              {isStarting ? "Initializing AI Environment..." : "Start Mock Interview"}
              {!isStarting && <span className="material-symbols-outlined">rocket_launch</span>}
            </button>
          </div>
        </div>
      </main>

      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "30%",
            height: "40%",
            backgroundColor: "rgba(139,92,246,0.08)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}
