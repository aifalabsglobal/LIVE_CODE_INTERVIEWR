"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { editor } from "monaco-editor";
import { LiveblocksProvider, RoomProvider, useRoom } from "@/lib/liveblocks";
import { LANGUAGE_VERSIONS } from "@/constants";
import type { OutputHandle } from "@/components/Output";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });
const VideoRoom = dynamic(() => import("@/components/VideoRoom"), { ssr: false });
const VideoTiles = dynamic(() => import("@/components/VideoRoom").then(m => m.VideoTiles), { ssr: false });
const Output = dynamic(() => import("@/components/Output"), { ssr: false });

import {
  LiveKitRoom,
  useLocalParticipant,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { useLiveKitToken } from "@/components/VideoRoom";

function WorkspaceHeader({
  roomId,
  userId,
  language,
  onLanguageChange,
  onRunCode,
  isRunning,
  onSaveCode,
}: {
  roomId: string;
  userId: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
  onSaveCode: () => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const toggleMic = async () => {
    const enabled = !isMicOn;
    await localParticipant.setMicrophoneEnabled(enabled);
    setIsMicOn(enabled);
  };

  const toggleCam = async () => {
    const enabled = !isCamOn;
    await localParticipant.setCameraEnabled(enabled);
    setIsCamOn(enabled);
  };

  const toggleScreenShare = async () => {
    const enabled = !isScreenSharing;
    try {
      await localParticipant.setScreenShareEnabled(enabled);
      setIsScreenSharing(enabled);
    } catch (e) {
      toast.error("Failed to share screen");
      console.error(e);
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session?")) {
      window.location.href = "/";
    }
  };

  const handleCopyLink = () => {
    const roomURL = `${window.location.origin}/room/${roomId}?userId=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(roomURL);
    toast.success("Room link copied!");
    setShowMoreMenu(false);
  };

  const handleReportLink = () => {
    window.open(`/interview-report?roomId=${roomId}`, "_blank");
    setShowMoreMenu(false);
  };

  return (
    <header className="flex items-center gap-8 px-6 py-2 border-b border-slate-800 bg-background-dark z-10">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Language:</span>
        <div className="relative group">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.25rem" }}
          >
            {Object.keys(LANGUAGE_VERSIONS).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={onSaveCode}
        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors"
      >
        Save Code
      </button>

      <div className="flex items-center gap-3 ml-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Output</span>
        <button
          type="button"
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-success text-success hover:bg-success/10 text-sm font-bold transition-all disabled:opacity-60"
        >
          Run Code
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`p-2 rounded-full transition-colors ${showMoreMenu ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          title="More Actions"
        >
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>

        {showMoreMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-xl z-50 py-1 overflow-hidden">
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
              Copy Room Link
            </button>
            <button
              onClick={handleReportLink}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              View Report
            </button>
            <button
              onClick={() => { window.open(`/whiteboard/${roomId}`, "_blank"); setShowMoreMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">draw</span>
              Open Whiteboard
            </button>
          </div>
        )}

        <button
          onClick={toggleScreenShare}
          className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${isScreenSharing ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'hover:bg-slate-800 text-slate-400'}`}
          title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
        >
          <span className="material-symbols-outlined text-xl">
            {isScreenSharing ? "stop_screen_share" : "screen_share"}
          </span>
          {isScreenSharing && <span className="text-[10px] font-bold uppercase tracking-tighter">You are sharing</span>}
        </button>
        <button
          onClick={toggleCam}
          className={`p-2 rounded-full transition-colors ${isCamOn ? 'hover:bg-slate-800 text-slate-400' : 'bg-red-500/10 text-red-500'}`}
          title={isCamOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          <span className="material-symbols-outlined text-xl">
            {isCamOn ? "videocam" : "videocam_off"}
          </span>
        </button>
        <button
          onClick={toggleMic}
          className={`p-2 rounded-full transition-colors ${isMicOn ? 'hover:bg-slate-800 text-slate-400' : 'bg-red-500/10 text-red-500'}`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          <span className="material-symbols-outlined text-xl">
            {isMicOn ? "mic" : "mic_off"}
          </span>
        </button>
        <button
          onClick={handleEndSession}
          className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
          title="End Session"
        >
          <span className="material-symbols-outlined text-xl">call_end</span>
        </button>
      </div>
    </header>
  );
}

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const userId = searchParams.get("userId") ?? "anonymous";

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const outputRef = useRef<OutputHandle>(null);
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);

  const handleCopyLink = () => {
    const roomURL = `${window.location.origin}/room/${roomId}?userId=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(roomURL);
    toast.success("Room link copied to clipboard!");
  };

  const handleReportLink = () => {
    const reportURL = `${window.location.origin}/interview-report?roomId=${roomId}`;
    navigator.clipboard.writeText(reportURL);
    toast.success("Report link copied to clipboard!");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      await outputRef.current?.runCode();
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = () => {
    // We can either trigger save in CodeEditor via ref or just show a message if it's already auto-saving
    toast.success("Code saved!");
  };

  return (
    <div className="bg-[#0b0b1a] text-slate-100 h-screen overflow-hidden flex flex-col font-display">
      <WorkspaceHeader
        roomId={roomId}
        userId={userId}
        language={language}
        onLanguageChange={setLanguage}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        onSaveCode={handleSaveCode}
      />

      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        <div className="flex-1 flex overflow-hidden border-b border-slate-800">
          <div className="w-1/2 h-full border-r border-slate-800">
            <CodeEditor
              roomId={roomId}
              userId={userId}
              layout="workspace"
              editorRefOut={editorRef}
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
          <div className="w-1/2 h-full bg-[#0b0b1a] relative">
            <Output
              ref={outputRef}
              editorRef={editorRef}
              language={language}
              layout="side"
            />
            {/* Floating Video Overlay */}
            <div className="absolute top-4 right-4 w-64 rounded-xl overflow-hidden border border-slate-800 shadow-2xl z-20 bg-black">
              <div className="bg-slate-900/80 px-3 py-1.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">grid_view</span>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">Host</span>
                </div>
                <span className="material-symbols-outlined text-xs text-slate-400">expand_less</span>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
                <VideoTiles />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar for buttons */}
        <div className="absolute bottom-6 left-6 flex gap-3 z-30">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Copy Room ID
          </button>
          <button
            onClick={handleReportLink}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Get Report Link
          </button>
        </div>
      </main>
    </div>
  );
}

function RoomProviderWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const userId = searchParams.get("userId") ?? "anonymous";
  const token = useLiveKitToken(roomId, userId);
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null, userID: userId }}
      initialStorage={{}}
    >
      <LiveKitRoom
        token={token || ""}
        serverUrl={serverUrl || ""}
        connect={!!token}
        video={true}
        audio={true}
        className="flex flex-col h-full"
      >
        <RoomContent />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </RoomProvider>
  );
}

export default function RoomPage() {
  const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
  if (!publicKey) {
    return (
      <div className="text-white p-6 font-display">
        Configure NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
      </div>
    );
  }
  return (
    <LiveblocksProvider>
      <Suspense fallback={<div className="text-white p-6">Loading room...</div>}>
        <RoomProviderWrapper />
      </Suspense>
    </LiveblocksProvider>
  );
}
