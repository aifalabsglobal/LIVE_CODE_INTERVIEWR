"use client";

import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

interface VideoRoomProps {
  roomId: string;
  participantIdentity: string;
}

const isLiveKitUrlConfigured = (url: string | undefined) => {
  if (!url?.trim()) return false;
  if (url.includes("xxx")) return false;
  return url.startsWith("wss://") || url.startsWith("https://");
};

/** Catches known LiveKit VideoConference bug */
class VideoConferenceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[VideoRoom] VideoConference error:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ color: "#a0aec0", padding: 16, background: "#1a1a2e", borderRadius: 8 }}>
          Video layout error. Refresh to retry.
        </div>
      );
    }
    return this.props.children;
  }
}

export function VideoTiles({ layout = "grid" }: { layout?: "grid" | "vertical" }) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true }
  ]);

  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1 place-items-center";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 place-items-center";
    if (count <= 4) return "grid-cols-2 place-items-center";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center";
  };

  return (
    <VideoConferenceErrorBoundary>
      <div
        className={`${layout === "grid"
          ? `grid ${getGridClass(tracks.length)} gap-4 w-full content-center`
          : "flex flex-col gap-3"
          } p-4 h-full overflow-y-auto custom-scrollbar ${layout === "grid" ? "bg-black" : ""}`}
      >
        {tracks.map((track) => (
          <ParticipantTile
            key={`${track.participant.identity}-${track.source}`}
            trackRef={track}
            className={`${layout === "grid" && tracks.length === 1 ? "max-w-5xl max-h-[85vh]" : ""} w-full h-auto aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-2xl border border-slate-800 object-contain`}
          />
        ))}
        {tracks.length === 0 && (
          <div className={`col-span-full flex items-center justify-center ${layout === "grid" ? "h-[50vh]" : "h-32"} text-slate-500 text-sm font-medium text-center p-4`}>
            Waiting for participants to join with camera...
          </div>
        )}
      </div>
    </VideoConferenceErrorBoundary>
  );
}

export default function VideoRoom({ roomId, participantIdentity }: VideoRoomProps) {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const liveKitReady = isLiveKitUrlConfigured(serverUrl);
  const token = useLiveKitToken(liveKitReady ? roomId : "", liveKitReady ? participantIdentity : "");

  useEffect(() => {
    const html = document.getElementsByTagName("html")?.[0];
    if (html) {
      html.removeAttribute("style");
      html.removeAttribute("data-theme");
    }
  }, []);

  if (!liveKitReady || !token || !serverUrl) {
    return (
      <div style={{ color: "white", padding: 16 }}>
        Video: Add credentials to .env to enable.
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: "100%" }}
      connect={true}
    >
      <VideoTiles />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// Client-side token fetch
export function useLiveKitToken(roomId: string, participantIdentity: string): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !participantIdentity) {
      setToken(null);
      return;
    }
    fetch("/api/livekit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, participantIdentity }),
    })
      .then((r) => (r.ok ? r.json() : { token: null }))
      .then((d) => setToken(d.token ?? null))
      .catch(() => setToken(null));
  }, [roomId, participantIdentity]);

  return token;
}
