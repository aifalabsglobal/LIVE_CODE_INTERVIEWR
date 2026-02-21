import { NextRequest } from "next/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { room, userId, userInfo } = body;

  const uid = userId ?? `user-${Date.now()}`;

  const session = liveblocks.prepareSession(uid, {
    userInfo: userInfo ?? { name: uid },
  });

  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  const { status, body: resBody } = await session.authorize();
  return new Response(resBody, { status });
}
