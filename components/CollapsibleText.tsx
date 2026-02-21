"use client";

import { ReactNode, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface CollapsibleTextProps {
  title: string;
  log?: string;
  status?: string;
  children?: ReactNode;
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "success":
      return <FaCheckCircle color="green" />;
    case "running":
      return <FaExclamationCircle color="orange" />;
    case "failed":
      return <FaTimesCircle color="red" />;
    default:
      return null;
  }
}

export default function CollapsibleText({
  title,
  log,
  status,
  children,
}: CollapsibleTextProps) {
  const [isOpen, setIsOpen] = useState(process.env.NODE_ENV === "development");

  return (
    <div
      style={{
        color: "#fff",
        backgroundColor: "#0f0a19",
        padding: 16,
        margin: 16,
        borderRadius: 6,
        border: "1px solid #d1d5da",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {getStatusIcon(status)}
          <span style={{ marginLeft: 8, fontWeight: 600 }}>{title}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#0366d6",
            display: "flex",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          {isOpen ? "Hide logs" : "Show logs"}{" "}
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isOpen && (log || children || status) && (
        <div
          style={{
            padding: "12px 0",
            borderTop: "1px solid #e1e4e8",
            marginTop: 12,
          }}
        >
          {children}
          {log && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f6f8fa",
                padding: 12,
                borderRadius: 6,
              }}
            >
              {log}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
