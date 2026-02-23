# Live Code Interviewer

Live Code Interviewer is a comprehensive, real-time collaboration platform designed specifically for conducting remote technical interviews. It seamlessly integrates a collaborative code editor, a powerful remote code execution engine, and high-quality video/audio communication into a single, cohesive web application.

## 🚀 Key Features

* **Real-time Collaborative Code Editing:**
  * Powered by the industry-standard **Monaco Editor** (the same editor powering VS Code).
  * Real-time synchronization handled by **Liveblocks** and **Yjs**, ensuring zero latency and perfectly synced keystrokes between interviewer and candidate.
  * Syntax highlighting, auto-completion, and standard IDE features out-of-the-box.

* **Dynamic Code Execution (Piston):**
  * Execute code directly within the browser using a secure backend **Piston container sandbox**.
  * Dynamically fetches installed language runtimes via a custom Next.js API route (`/api/runtimes`), adapting instantly to whatever languages are configured on the deployment server (e.g., Python, JavaScript, TypeScript, etc.).
  * Real-time output terminal displaying stdout, stderr, and execution exit codes.

* **Integrated Video & Audio Conferencing:**
  * Powered by **LiveKit** for highly scalable WebRTC streaming.
  * Individual participant camera tiles with microphone and video toggling.
  * **Ultra High-Quality Screen Sharing:** Specifically configured with `ScreenSharePresets.original` and `7 Mbps` bitrate limits to guarantee crystal clear, point-for-pixel broadcasting of text and code editors.
  * "Microsoft Teams" style layout: When a participant screenshares, their screen dominates the primary view, while other participants neatly dock into a scrollable sidebar.

* **Authentication & Room Management:**
  * Secure user authentication and session management handled by **Clerk**.
  * Unique, secure UUID-based room links that can be instantly generated and shared with candidates.
  * Ability to extract detailed interview reports post-session.

## 🛠 Technology Stack

### Frontend Hub
* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** Material Symbols & Lucide React
* **Authentication:** [@clerk/nextjs](https://clerk.com/)
* **Code Editor:** [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) & [y-monaco](https://docs.yjs.dev/ecosystem/editor-bindings/monaco)

### Collaboration & Streaming Backend
* **Real-time State Sync:** [Liveblocks](https://liveblocks.io/) & [Yjs](https://yjs.dev/)
* **WebRTC Video/Audio Provider:** [LiveKit Components React](https://github.com/livekit/components-react) & `livekit-server-sdk`

### Code Execution Backend
* **Engine:** [Piston API](https://github.com/engineer-man/piston)
* **Hosting:** Docker containerized Piston engine running locally or remotely, securely executing arbitrary code in restricted cgroups.

## ⚙️ Local Development Setup

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in the required keys:
```bash
cp .env.example .env
```
You will need API keys and secrets for:
* **Clerk** (Authentication)
* **Liveblocks** (Real-time sync)
* **LiveKit** (Video/Audio streaming)
* **Piston** (Code execution endpoint, e.g., `http://localhost:2000/api/v2`)

### 2. Start the Piston Code Execution Engine
You must have Docker installed. Start the Piston engine locally:
```bash
docker run -d -p 2000:2000 --privileged --name piston \
  -v piston_data:/piston/data \
  -v piston_packages:/piston/packages \
  -v /sys/fs/cgroup:/sys/fs/cgroup:ro \
  ghcr.io/engineer-man/piston:latest
```

Install the languages you intend to use via the Piston API:
```bash
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d '{"language": "python", "version": "3.12.0"}'
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d '{"language": "javascript", "version": "20.11.1"}'
```

### 3. Install & Run Next.js
```bash
npm install
npm run dev
```

*Note: For local screen sharing to work without `DeviceUnsupportedError`, you might need to run the dev server with HTTPS enabled (`npm run dev -- --experimental-https`)*

## 📂 Project Structure Snapshot
* `app/page.tsx`: The landing dashboard to create/join rooms.
* `app/room/[roomId]/page.tsx`: The core interview workspace, orchestrating the Editor, Video tracks, and layout states.
* `app/api/`: Next.js Serverless functions (Execution bridge, LiveKit Token generation, Runtime discovery).
* `components/CodeEditor.tsx`: The Monaco editor bound to Yjs and Liveblocks presence.
* `components/Output.tsx`: The terminal display for execution results.
* `components/VideoRoom.tsx`: The LiveKit wrapper managing participant camera tiles.

---
*Built to streamline the technical interviewing process with an emphasis on developer experience and zero-friction collaboration.*
