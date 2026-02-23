"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomID, setRoomID] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [roomFocused, setRoomFocused] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRoomId = params.get("roomId") ?? "";
      setRoomID(urlRoomId);
      console.log("Initial roomID from URL:", urlRoomId);
    }
  }, []);

  useEffect(() => {
    console.log("Current roomID state:", roomID);
  }, [roomID]);

  const generateSimpleId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      if (i === 4 || i === 8) result += "-";
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateId = () => setRoomID(generateSimpleId());

  const handleJoinSession = () => {
    if (!name.trim()) {
      setNameError("Please enter your name");
      return;
    }
    setNameError("");
    setIsJoining(true);
    const uid = name.trim();
    const rid = roomID.trim() || generateSimpleId();
    if (!roomID.trim()) setRoomID(rid);
    router.push(`/room/meet/${rid}?userId=${encodeURIComponent(uid)}`);
  };

  const handleCreateNewRoom = () => {
    const newId = generateSimpleId();
    setRoomID(newId);
  };

  /* ── Inline styles to avoid Chakra UI CSS reset overrides ── */
  const colors = {
    bg: "#0d1117",
    surface: "#161b22",
    border: "#30363d",
    primary: "#135bec",
    primaryHover: "#1d4ed8",
    text: "#e2e8f0",
    textMuted: "#8b949e",
    textLabel: "#c9d1d9",
    error: "#da3633",
    btnSecondary: "#21262d",
  };

  const getInputStyle = (focused: boolean, hasError?: boolean): React.CSSProperties => ({
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px 12px 42px",
    backgroundColor: colors.bg,
    border: `1px solid ${hasError ? colors.error : focused ? colors.primary : colors.border}`,
    borderRadius: "8px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? "0 0 0 3px rgba(19,91,236,0.25)" : "none",
    fontFamily: "'Inter', sans-serif",
  });

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: colors.textMuted,
    fontSize: "20px",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          width: "100%",
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          padding: "10px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="material-symbols-outlined"
                style={{ color: colors.primary, fontSize: "28px" }}
              >
                terminal
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Live Code Interviewer
              </span>
            </div>
            <nav style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "8px" }}>
              {[
                { href: "/sessions", label: "Sessions" },
                { href: "/analytics", label: "Analytics" },
                { href: "/snippets", label: "Snippets" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: colors.textMuted,
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              style={{ padding: "8px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer" }}
              aria-label="Help"
            >
              <span className="material-symbols-outlined" style={{ color: colors.textMuted, fontSize: "22px" }}>
                help_outline
              </span>
            </button>
            <button
              type="button"
              style={{ padding: "8px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer" }}
              aria-label="Settings"
            >
              <span className="material-symbols-outlined" style={{ color: colors.textMuted, fontSize: "22px" }}>
                settings
              </span>
            </button>
            <button
              type="button"
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                backgroundColor: colors.primary,
                border: "none",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 8px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* Card */}
          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
          >
            {/* Blue accent bar */}
            <div
              style={{
                height: "3px",
                width: "100%",
                background: `linear-gradient(90deg, ${colors.primary} 0%, #60a5fa 100%)`,
              }}
            />

            <div style={{ padding: "20px 24px" }}>
              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h1
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 4px 0",
                  }}
                >
                  Join Meet Room
                </h1>
                <p style={{ color: colors.textMuted, fontSize: "13px", margin: 0 }}>
                  Real-time video collaboration for developers.
                </p>
              </div>

              {/* Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name-input"
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: colors.textLabel,
                      marginBottom: "4px",
                    }}
                  >
                    Your Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <span className="material-symbols-outlined" style={iconStyle}>
                      person
                    </span>
                    <input
                      id="name-input"
                      type="text"
                      placeholder="e.g., Jane Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      style={getInputStyle(nameFocused, !!nameError)}
                    />
                  </div>
                  {nameError && (
                    <p style={{ color: colors.error, fontSize: "12px", margin: "6px 0 0 0" }}>
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Room ID */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <label
                      htmlFor="room-input"
                      style={{ fontSize: "14px", fontWeight: 500, color: colors.textLabel }}
                    >
                      Room ID
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Generate ID clicked");
                        handleGenerateId();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: colors.primary,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                        marginRight: "-8px",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(19,91,236,0.1)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        refresh
                      </span>
                      Generate ID
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span className="material-symbols-outlined" style={iconStyle}>
                      key
                    </span>
                    <input
                      id="room-input"
                      type="text"
                      placeholder="XXXX - XXXX - XXXX"
                      value={roomID}
                      onChange={(e) => setRoomID(e.target.value)}
                      onFocus={() => setRoomFocused(true)}
                      onBlur={() => setRoomFocused(false)}
                      style={{
                        ...getInputStyle(roomFocused),
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        letterSpacing: "1.5px",
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ paddingTop: "2px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleJoinSession}
                    disabled={isJoining}
                    style={{
                      width: "100%",
                      padding: "10px 20px",
                      backgroundColor: colors.primary,
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: isJoining ? "not-allowed" : "pointer",
                      opacity: isJoining ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(19,91,236,0.35)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {isJoining ? "Connecting..." : "Join Session"}
                    {!isJoining && (
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        arrow_forward
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateNewRoom}
                    style={{
                      width: "100%",
                      padding: "10px 20px",
                      backgroundColor: colors.btnSecondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      color: colors.textLabel,
                      fontSize: "15px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                      add_box
                    </span>
                    Create New Room
                  </button>
                </div>
              </div>

              {/* Footer info */}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: colors.textMuted, fontSize: "16px", marginTop: "1px", flexShrink: 0 }}
                  >
                    info
                  </span>
                  <p style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.5, margin: 0 }}>
                    Share the Room ID with your candidate or interviewer to begin. All sessions
                    include real-time video, code execution, and pair programming tools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom badges */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "24px",
              opacity: 0.4,
            }}
          >
            {[
              { icon: "verified_user", label: "SECURE" },
              { icon: "code", label: "SANDBOX" },
              { icon: "history", label: "AUTO-SAVE" },
            ].map((badge) => (
              <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  {badge.icon}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontWeight: 700,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            ))}
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
            top: "-10%",
            left: "-10%",
            width: "40%",
            height: "40%",
            backgroundColor: "rgba(19,91,236,0.08)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "30%",
            height: "30%",
            backgroundColor: "rgba(96,165,250,0.04)",
            filter: "blur(100px)",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}
