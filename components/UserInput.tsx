"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserInputProps {
  onStart: (userId: string, roomId: string) => void;
}

export default function UserInput({ onStart }: UserInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [roomID, setInputRoomID] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setInputRoomID(params.get("roomId")?.toString() ?? "");
    }
  }, []);

  const generateSimpleId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleGenerateRoomID = () => setInputRoomID(generateSimpleId());

  const handleSubmit = () => {
    const uid = inputValue.trim() || "anonymous";
    const rid = roomID.trim() || generateSimpleId();
    if (!roomID.trim()) setInputRoomID(rid);
    onStart(uid, rid);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
  };

  const btnStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    backgroundColor: "#21262d",
    color: "#e2e8f0",
    fontSize: "14px",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>
      <h2 style={{ color: "white", fontSize: 24, margin: 0 }}>Live Code Interviewer</h2>
      <input
        type="text"
        placeholder="Name"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Unique Room ID"
        value={roomID}
        onChange={(e) => setInputRoomID(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={handleSubmit} style={{ ...btnStyle, backgroundColor: "#135bec", border: "none", color: "#fff" }}>
          Start
        </button>
        <button type="button" onClick={handleGenerateRoomID} style={btnStyle}>
          Generate Room ID
        </button>
        <Link href={`/interview-report?roomId=${roomID}`}>
          <button type="button" style={btnStyle}>Interview Reports</button>
        </Link>
      </div>
    </div>
  );
}
