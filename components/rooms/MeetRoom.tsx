"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useLiveKitToken } from "@/components/VideoRoom";

const VideoRoom = dynamic(() => import("@/components/VideoRoom"), { ssr: false });
const VideoTiles = dynamic(() => import("@/components/VideoRoom").then(m => m.VideoTiles), { ssr: false });

import {
  LiveKitRoom,
  useLocalParticipant,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track, ScreenSharePresets, VideoPresets } from "livekit-client";

function MeetHeader({ roomId, userId }: { roomId: string, userId: string }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled } = useLocalParticipant();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const toggleCam = async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
        resolution: ScreenSharePresets.original,
      });
    } catch (e) {
      toast.error("Failed to share screen");
      console.error(e);
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this meet session?")) {
      window.location.href = "/";
    }
  };

  const handleCopyLink = () => {
    const roomURL = `${window.location.origin}/room/meet/${roomId}?userId=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(roomURL);
    toast.success("Meet link copied!");
    setShowMoreMenu(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        toast.loading("Starting local recording...", { id: "record-toast" });

        // 1. Get the screen/tab selection (including audio for remote participants)
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // 2. Get the user's local microphone
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // 3. Mix the audio using Web Audio API so BOTH are captured
        const audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();

        if (displayStream.getAudioTracks().length > 0) {
          const displaySource = audioContext.createMediaStreamSource(displayStream);
          displaySource.connect(dest);
        }

        if (micStream.getAudioTracks().length > 0) {
          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(dest);
        }

        // 4. Combine the screen's video track with the mixed audio track
        const tracks = [
          ...displayStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ];
        const mixedStream = new MediaStream(tracks);

        const recorder = new MediaRecorder(mixedStream, { mimeType: 'video/webm' });
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          a.download = `meeting-recording-${timestamp}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);

          displayStream.getTracks().forEach((track) => track.stop());
          micStream.getTracks().forEach((track) => track.stop());
          audioContext.close();

          setIsRecording(false);
          toast.success("Recording saved to your local PC!", { id: "record-toast" });
        };

        // If the user clicks "Stop Sharing" on the browser's floating bar
        displayStream.getVideoTracks()[0].onended = () => {
          if (recorder.state === 'recording') recorder.stop();
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
        toast.success("Recording started. Make sure to share Tab Audio!", { id: "record-toast" });
      } catch (err: any) {
        toast.error(`Failed to start recording`, { id: "record-toast" });
        console.error(err);
      }
    }
  };

  return (
    <header className="flex items-center gap-2 md:gap-8 px-3 md:px-6 py-2 md:py-3 border-b border-slate-800 bg-background-dark z-10 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-emerald-500 text-2xl">groups</span>
        <span className="text-sm font-bold text-white tracking-widest">Team Meet</span>
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
              Copy Meet Link
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
          className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${isScreenShareEnabled ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'hover:bg-slate-800 text-slate-400'}`}
          title={isScreenShareEnabled ? "Stop Sharing" : "Share Screen"}
        >
          <span className="material-symbols-outlined text-xl">
            {isScreenShareEnabled ? "stop_screen_share" : "screen_share"}
          </span>
          {isScreenShareEnabled && <span className="text-[10px] font-bold uppercase tracking-tighter">You are sharing</span>}
        </button>
        <div className="relative group flex items-center">
          {isRecording && (
            <div className="mr-2 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              {formatTime(recordingTime)}
            </div>
          )}
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'hover:bg-slate-800 text-slate-400'}`}
            title={isRecording ? "Stop Recording (Saving to your PC)" : "Record Meeting Locally"}
          >
            <span className="material-symbols-outlined text-xl">
              {isRecording ? "stop_circle" : "radio_button_checked"}
            </span>
          </button>
        </div>
        <button
          onClick={toggleCam}
          className={`p-2 rounded-full transition-colors ${isCameraEnabled ? 'hover:bg-slate-800 text-slate-400' : 'bg-red-500/10 text-red-500'}`}
          title={isCameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
        >
          <span className="material-symbols-outlined text-xl">
            {isCameraEnabled ? "videocam" : "videocam_off"}
          </span>
        </button>
        <button
          onClick={toggleMic}
          className={`p-2 rounded-full transition-colors ${isMicrophoneEnabled ? 'hover:bg-slate-800 text-slate-400' : 'bg-red-500/10 text-red-500'}`}
          title={isMicrophoneEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          <span className="material-symbols-outlined text-xl">
            {isMicrophoneEnabled ? "mic" : "mic_off"}
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

function RoomContent({ roomId, userId }: { roomId: string, userId: string }) {
  const handleCopyLink = () => {
    const roomURL = `${window.location.origin}/room/meet/${roomId}?userId=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(roomURL);
    toast.success("Meet link copied to clipboard!");
  };

  // --- LiveKit Screen Share Detection ---
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  const activeScreenShare = screenShareTracks.find(t => t.participant.identity);
  const isLocalSharing = activeScreenShare?.participant.isLocal;
  const isRemoteSharing = activeScreenShare && !isLocalSharing;

  return (
    <div className={`bg-[#0b0b1a] text-slate-100 h-screen overflow-hidden flex flex-col font-display`}>
      <MeetHeader roomId={roomId} userId={userId} />

      <main className="flex-1 flex overflow-hidden min-h-0 relative p-4 bg-black">
        {isRemoteSharing ? (
          // --- VIEWING SHARED SCREEN ---
          <div className="flex-1 flex bg-black w-full h-full rounded-xl overflow-hidden border border-slate-800">
            {/* Main Screen Share Area */}
            <div className="flex-1 flex items-center justify-center bg-[#0b0b1a]">
              <div className="w-full h-full object-contain">
                <VideoTrack
                  trackRef={activeScreenShare as any}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right Sidebar for Cameras */}
            <div className="w-48 md:w-64 h-full border-l border-slate-800 bg-slate-900 flex flex-col">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Participants</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <VideoTiles layout="vertical" />
              </div>
            </div>
          </div>
        ) : (
          // --- DEFAULT GALLERY VIEW ---
          <div className="flex-1 flex items-center justify-center bg-[#0b0b1a] rounded-xl border border-slate-800 overflow-hidden relative">
            <div className="w-full h-full p-4">
              <VideoTiles layout="grid" />
            </div>
            {isLocalSharing && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                You are currently sharing your screen
              </div>
            )}
          </div>
        )}

        {/* Bottom Bar for buttons */}
        <div className="absolute bottom-10 left-10 flex gap-3 z-30">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors backdrop-blur-sm shadow-xl flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            Copy Meet Link
          </button>
        </div>
      </main>
    </div>
  );
}

function RoomProviderWrapper({ roomId, userId }: { roomId: string, userId: string }) {
  const token = useLiveKitToken(roomId, userId);
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  return (
    <LiveKitRoom
      token={token || ""}
      serverUrl={serverUrl || ""}
      connect={!!token}
      video={true}
      audio={true}
      className="flex flex-col h-full"
      options={{
        publishDefaults: {
          screenShareEncoding: {
            maxBitrate: 8000000,
            maxFramerate: 60,
          },
          videoEncoding: {
            maxBitrate: 3000000,
            maxFramerate: 30,
          }
        },
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
          channelCount: 2,
        },
        videoCaptureDefaults: {
          resolution: VideoPresets.h1080.resolution,
        }
      }}
    >
      <RoomContent roomId={roomId} userId={userId} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export default function MeetRoom({ roomId, userId }: { roomId: string, userId: string }) {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading meet...</div>}>
      <RoomProviderWrapper roomId={roomId} userId={userId} />
    </Suspense>
  );
}
