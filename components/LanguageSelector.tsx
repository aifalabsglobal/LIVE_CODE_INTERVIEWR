"use client";

import { useEffect, useState } from "react";
import { LANGUAGE_VERSIONS } from "@/constants";

interface LanguageSelectorProps {
  language: string;
  onSelect: (language: string) => void;
}

export default function LanguageSelector({ language, onSelect }: LanguageSelectorProps) {
  const [runtimes, setRuntimes] = useState<Record<string, string>>(LANGUAGE_VERSIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRuntimes() {
      try {
        const res = await fetch("/api/runtimes");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: { language: string; version: string }[] = await res.json();

        const runtimeMap: Record<string, string> = {};
        data.forEach(pkg => {
          if (!runtimeMap[pkg.language]) {
            runtimeMap[pkg.language] = pkg.version;
          }
        });

        if (Object.keys(runtimeMap).length > 0) {
          setRuntimes(runtimeMap);
        }
      } catch (e) {
        console.error("Using default language versions.", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRuntimes();
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "14px", color: "#8b949e" }}>Language:</span>
      <select
        value={language}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading}
        style={{
          backgroundColor: "#21262d",
          border: "1px solid #30363d",
          borderRadius: "6px",
          color: "#e2e8f0",
          fontSize: "14px",
          padding: "4px 8px",
          cursor: isLoading ? "not-allowed" : "pointer",
          outline: "none",
          opacity: isLoading ? 0.5 : 1
        }}
      >
        {isLoading ? (
          <option>Loading...</option>
        ) : (
          Object.entries(runtimes).map(([lang, version]) => (
            <option key={lang} value={lang}>
              {lang} ({version})
            </option>
          ))
        )}
      </select>
    </div>
  );
}
