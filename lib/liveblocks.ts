import { createClient } from "@liveblocks/client";
import { createLiveblocksContext, createRoomContext } from "@liveblocks/react";

const publicApiKey =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
    : undefined;

const client = createClient({
  publicApiKey: publicApiKey || "pk_development_placeholder",
});

type Presence = {
  cursor: { x: number; y: number } | null;
  userID: string;
};

const liveblocksBundle = createLiveblocksContext(client);
const roomBundle = createRoomContext<Presence>(client);

export const LiveblocksProvider = liveblocksBundle.LiveblocksProvider;
export const {
  RoomProvider,
  useRoom,
  useOthers,
  useSelf,
  useMutation,
} = roomBundle;
