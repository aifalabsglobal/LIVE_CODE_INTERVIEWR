"use client";

import { LANGUAGE_VERSIONS } from "@/constants";

interface LanguageSelectorProps {
  language: string;
  onSelect: (language: string) => void;
}

const languages = Object.entries(LANGUAGE_VERSIONS);

export default function LanguageSelector({ language, onSelect }: LanguageSelectorProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "14px", color: "#8b949e" }}>Language:</span>
      <select
        value={language}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          backgroundColor: "#21262d",
          border: "1px solid #30363d",
          borderRadius: "6px",
          color: "#e2e8f0",
          fontSize: "14px",
          padding: "4px 8px",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {languages.map(([lang, version]) => (
          <option key={lang} value={lang}>
            {lang} {version}
          </option>
        ))}
      </select>
    </div>
  );
}
