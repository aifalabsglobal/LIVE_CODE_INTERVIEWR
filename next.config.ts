import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@liveblocks/react", "@liveblocks/yjs", "yjs", "y-monaco", "monaco-editor"],
};

export default nextConfig;
