"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function getRecordings(roomId: string) {
  const res = await fetch(`/api/recordings?roomId=${roomId}`);
  if (!res.ok) throw new Error("Failed to fetch recordings");
  const data = await res.json();
  return data.recordings ?? [];
}

async function getTranscript(recordingId: string) {
  const res = await fetch(`/api/transcripts/${recordingId}`);
  if (!res.ok) throw new Error("Failed to fetch transcript");
  return res.json();
}

async function requestGenerateTranscript(recordingId: string) {
  const res = await fetch("/api/transcripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recordingId, language: "en-US" }),
  });
  if (!res.ok) throw new Error("Failed to request transcript");
  return res.json();
}

async function getReportData(recordingId: string, type: string) {
  const res = await fetch(`/api/report/${recordingId}/${type}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  return res.json();
}

function transformTranscriptIntoHumanFormat(transcriptBrute: { startTime: string; username: string; content: string }[]) {
  return transcriptBrute
    .map(
      (el) =>
        `${new Date(el.startTime).toUTCString()} - ${el.username}: ${el.content}`
    )
    .join("\n");
}

export default function InterviewReportComponent() {
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(
    searchParams.get("roomId")
  );
  const [recordId, setRecordId] = useState<string | null>(null);
  const [interviewsDataList, setInterviewsDataList] = useState<any[] | null>(null);
  const [selectedInterviewData, setSelectedInterviewData] = useState<any | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [codes, setCodes] = useState<any[] | null>(null);
  const [meetingTranscript, setMeetingTranscript] = useState<string>(
    "Waiting for transcription...(if it's the first time here, it could take up to 20 minutes). Try again later, reload the page or check the debug section."
  );
  const [actionItems, setActionItems] = useState([{ text: "Loading..." }]);
  const [followUps, setFollowUps] = useState([{ text: "Loading..." }]);
  const [questionsReport, setQuestionsReport] = useState([{ text: "Loading..." }]);
  const [topics, setTopics] = useState([{ text: "Loading..." }]);
  const [summary, setSummary] = useState([{ text: "Loading..." }]);

  const [videoStatus, setVideoStatus] = useState<string>("loading");
  const [codesStatus, setCodesStatus] = useState<string>("loading");
  const [transcriptStatus, setTranscriptStatus] = useState<string>("running");
  const [actionItemsStatus, setActionItemsStatus] = useState<string>("running");
  const [followUpsStatus, setFollowUpsStatus] = useState<string>("running");
  const [questionsStatus, setQuestionsStatus] = useState<string>("running");
  const [topicsStatus, setTopicsStatus] = useState<string>("running");
  const [summaryStatus, setSummaryStatus] = useState<string>("running");

  useEffect(() => {
    setRoomId(searchParams.get("roomId"));
  }, [searchParams]);

  useEffect(() => {
    if (!roomId) return;

    getRecordings(roomId)
      .then((recordings) => {
        const filtered = recordings.filter((r: any) => r.roomId === roomId);
        setInterviewsDataList(filtered);
        setVideoStatus(filtered.length > 0 ? "success" : "failed");
      })
      .catch(() => setVideoStatus("failed"));

    const getCodes = async () => {
      if (!firestore) {
        setCodesStatus("failed");
        return;
      }
      try {
        const colRef = collection(firestore, `codes/${roomId}/versions`);
        const snapshot = await getDocs(colRef);
        const codesData = snapshot.docs.map((d) => d.data());
        setCodes(codesData);
        setCodesStatus("success");
      } catch {
        setCodesStatus("failed");
      }
    };
    getCodes();
  }, [roomId]);

  useEffect(() => {
    if (!interviewsDataList || interviewsDataList.length === 0) return;
    setSelectedInterviewData(interviewsDataList[0]);
  }, [interviewsDataList]);

  useEffect(() => {
    if (!selectedInterviewData) return;
    setRecordId(selectedInterviewData.uuid);
    setVideoURL(selectedInterviewData.url);
  }, [selectedInterviewData]);

  useEffect(() => {
    if (!recordId || !interviewsDataList) return;

    interviewsDataList.forEach((interview: any) => {
      getTranscript(interview.uuid)
        .then((transcript) => {
          if (interview.uuid === recordId) {
            const arr = Array.isArray(transcript) ? transcript : transcript.segments ?? [];
            setMeetingTranscript(transformTranscriptIntoHumanFormat(arr));
            setTranscriptStatus("success");
          }
        })
        .catch(() => {
          setTranscriptStatus("failed");
          requestGenerateTranscript(interview.uuid).catch((err) => {
            if (err.message?.includes("409")) {
              console.warn("Transcript already requested. Wait up to 20 minutes.");
            }
          });
        });
    });

    getReportData(recordId, "action-items")
      .then(setActionItems)
      .then(() => setActionItemsStatus("success"))
      .catch(() => setActionItemsStatus("failed"));

    getReportData(recordId, "follow-ups")
      .then(setFollowUps)
      .then(() => setFollowUpsStatus("success"))
      .catch(() => setFollowUpsStatus("failed"));

    getReportData(recordId, "questions")
      .then(setQuestionsReport)
      .then(() => setQuestionsStatus("success"))
      .catch(() => setQuestionsStatus("failed"));

    getReportData(recordId, "topics")
      .then(setTopics)
      .then(() => setTopicsStatus("success"))
      .catch(() => setTopicsStatus("failed"));

    getReportData(recordId, "summary")
      .then(setSummary)
      .then(() => setSummaryStatus("success"))
      .catch(() => setSummaryStatus("failed"));
  }, [recordId, interviewsDataList]);

  const sessionLabel = roomId ? `#${roomId}` : "#—";
  const copyReport = () => {
    const text = [
      `Session ${sessionLabel}`,
      `Summary: ${summary.map((s: any) => s.text).join(" ")}`,
      `Topics: ${topics.map((t: any) => t.text).join(", ")}`,
      `Actions: ${actionItems.map((a: any) => a.text).join("; ")}`,
      `Transcript: ${meetingTranscript.slice(0, 500)}...`,
    ].join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-background-dark/80 backdrop-blur-md px-6 md:px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="text-primary">
            <span className="material-symbols-outlined text-3xl">terminal</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight">
              Interview Session {sessionLabel}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="text"
                value={roomId ?? ""}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 w-40"
              />
              {interviewsDataList && interviewsDataList.length > 0 && (
                <select
                  onChange={(e) => {
                    const next = interviewsDataList.find((i) => i.uuid === e.target.value);
                    if (next) setSelectedInterviewData(next);
                  }}
                  value={recordId ?? ""}
                  className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 max-w-[200px]"
                >
                  <option value="">Select recording</option>
                  {interviewsDataList.map((interview) => (
                    <option key={interview.uuid} value={interview.uuid}>
                      {new Date(interview.createdAt).toLocaleString()} — {interview.uuid.slice(0, 8)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyReport}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Copy Report
          </button>
          <button
            type="button"
            className="hidden sm:flex cursor-pointer items-center justify-center rounded-lg h-10 bg-slate-800 text-slate-100 px-3 hover:bg-slate-700 transition-colors"
            aria-label="Download"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
          <button
            type="button"
            className="hidden sm:flex cursor-pointer items-center justify-center rounded-lg h-10 bg-slate-800 text-slate-100 px-3 hover:bg-slate-700 transition-colors"
            aria-label="Share"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-10 py-6 max-w-[1400px] mx-auto w-full">
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/" className="text-slate-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
          <span className="text-slate-100 font-medium">Session Report</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative group bg-black aspect-video rounded-xl overflow-hidden shadow-xl border border-slate-800">
              {videoURL ? (
                <video
                  className="w-full h-full object-cover"
                  controls
                  src={videoURL}
                  poster=""
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500">
                  {videoStatus === "loading" && "Loading video…"}
                  {videoStatus === "failed" && "Video not available"}
                  {videoStatus === "success" && !videoURL && "No URL"}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
                <div className="flex items-center justify-between text-white text-xs font-medium">
                  <span>Session recording</span>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-sm cursor-pointer">volume_up</span>
                    <span className="material-symbols-outlined text-sm cursor-pointer">fullscreen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                <span className="material-symbols-outlined text-primary">history</span>
                Saved Code Versions
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold tracking-wider">
                {codes?.length ?? 0} SNAPSHOTS
              </span>
            </div>
            <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
              {codesStatus === "loading" && (
                <p className="text-sm text-slate-400">Loading code snapshots…</p>
              )}
              {codesStatus === "failed" && (
                <p className="text-sm text-slate-400">Code snapshots unavailable.</p>
              )}
              {codes && codes.length > 0 &&
                codes.map((c: any, i: number) => (
                  <div key={i} className="relative pl-10 group cursor-pointer">
                    <div
                      className={`absolute left-0 top-1.5 size-10 flex items-center justify-center rounded-full border-4 border-background-dark z-10 ${
                        i === 0 ? "bg-primary text-white" : "bg-slate-800 group-hover:bg-primary/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">code</span>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <p className="font-bold text-sm text-slate-200">Snapshot {i + 1}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {c.code?.slice(0, 40)}…
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <button
              type="button"
              className="mt-auto w-full py-3 text-sm font-bold border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">unfold_more</span>
              View Full Code Diff
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/30 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="font-bold flex items-center gap-2 text-slate-100">
                <span className="material-symbols-outlined text-primary">description</span>
                Transcript
              </h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search keywords…"
                  className="pl-9 pr-4 py-1.5 text-xs bg-slate-800 border-none rounded-full focus:ring-1 focus:ring-primary w-48 text-slate-200"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                {transcriptStatus === "running" && "Loading transcript…"}
                {transcriptStatus === "failed" && "Transcript unavailable or still generating."}
                {transcriptStatus === "success" && meetingTranscript}
              </pre>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                AI Summary
              </h3>
              <div className="text-sm leading-relaxed text-slate-300">
                {summaryStatus === "running" && "Loading…"}
                {summaryStatus === "failed" && "Summary unavailable."}
                {summaryStatus === "success" && summary.map((s: any, i: number) => (
                  <p key={i} className="mb-2">{s.text}</p>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-100">
                <span className="material-symbols-outlined text-lg">label</span>
                Key Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {topicsStatus === "running" && <span className="text-slate-400 text-sm">Loading…</span>}
                {topicsStatus === "success" &&
                  topics.map((t: any, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs font-medium text-slate-300"
                    >
                      {t.text}
                    </span>
                  ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 grow">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-100">
                <span className="material-symbols-outlined text-lg">task_alt</span>
                Recommended Actions
              </h3>
              <ul className="space-y-3">
                {actionItemsStatus === "running" && (
                  <li className="text-sm text-slate-400">Loading…</li>
                )}
                {actionItemsStatus === "success" &&
                  actionItems.map((a: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 size-4 rounded-full border border-primary flex items-center justify-center shrink-0">
                        <div className="size-2 bg-primary rounded-full" />
                      </div>
                      <span className="text-sm text-slate-300">{a.text}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  Recommendation
                </span>
                <span className="text-lg font-bold text-emerald-500">
                  {summaryStatus === "success" && summary.length > 0 ? "Review" : "—"}
                </span>
              </div>
              <div className="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl">
                —
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto px-10 py-6 border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Interview data is encrypted and secure.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/interview-report" className="hover:text-primary transition-colors">Reports</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
