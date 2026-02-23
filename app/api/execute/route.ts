import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_VERSIONS: Record<string, string> = {
  javascript: "20.11.1",
  typescript: "5.0.3",
  python: "3.12.0",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3",
};

const PISTON_BASE = (process.env.PISTON_BASE_URL || "https://emkc.org/api/v2/piston").replace(/\/$/, "");
const PISTON_API_KEY = process.env.PISTON_API_KEY?.trim();

export async function POST(request: NextRequest) {
  let body: { language?: string; sourceCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { language, sourceCode } = body;
  if (!language || typeof sourceCode !== "string") {
    return NextResponse.json(
      { error: "language and sourceCode are required" },
      { status: 400 }
    );
  }

  const version = LANGUAGE_VERSIONS[language];
  if (!version) {
    return NextResponse.json(
      { error: `Unsupported language: ${language}` },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (PISTON_API_KEY && PISTON_API_KEY !== "xxx") {
    headers["Authorization"] = `Bearer ${PISTON_API_KEY}`;
    headers["X-API-Key"] = PISTON_API_KEY;
  }

  const url = `${PISTON_BASE}/execute`;
  const payload = {
    language,
    version,
    files: [{ content: sourceCode }],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      return NextResponse.json(
        {
          error:
            "Code execution returned 401 (Unauthorized). The public Piston API may now require an API key. Add PISTON_API_KEY to your .env, or set PISTON_BASE_URL to a self-hosted Piston instance (see https://github.com/engineer-man/piston).",
        },
        { status: 503 }
      );
    }

    if (!res.ok) {
      const msg = (data as { message?: string }).message || data?.error || res.statusText;
      return NextResponse.json(
        { error: `Code execution failed: ${msg}` },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: `Code execution failed: ${message}` },
      { status: 502 }
    );
  }
}
