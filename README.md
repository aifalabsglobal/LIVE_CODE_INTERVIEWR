# 📋 Live Code Interviewer

Live Code Interviewer is a comprehensive, real-time collaboration platform designed for conducting high-stakes technical interviews. It goes beyond simple code sharing by providing a managed environment for scheduling, conducting, and reporting on the entire interview lifecycle.

---

## 🚀 Key Features

### 💻 Live Collaboration Workspace
*   **Keystroke Sync:** Powered by **Monaco Editor** and **Yjs**, ensuring zero-latency code synchronization.
*   **Video & Audio:** Integrated **LiveKit** conferencing with ultra-high-quality screen sharing (7 Mbps bitrate caps for pixel-perfect code clarity).
*   **Secure Environment:** Keystrokes and presence are managed through **Liveblocks** for robust multi-user collaboration.

### ⚙️ Multi-Language Execution
*   **Sandbox Security:** Execute code in isolated **Piston** containers with restricted cgroups.
*   **Dynamic Runtimes:** Automatically detects and configures language runtimes (Python, Node, C++, etc.) based on the execution engine's status.

### 📊 Management & Scheduling
*   **Admin Dashboard:** Role-based access control (ADMIN, INTERVIEWER, CANDIDATE) to manage users and view platform-wide activity.
*   **Flexible Scheduling:** Schedule sessions using just a candidate's email; the system automatically handles placeholder profiles and sends branded invitations.
*   **Email Invitations:** Integrated with **Resend** to deliver meeting links and Room IDs directly to participants.

---

## 🛠 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19 |
| **Database** | SQLite via Prisma ORM |
| **Auth** | Clerk (Role-based Public Metadata) |
| **Collaboration** | Liveblocks, Yjs |
| **Video/WebRTC** | LiveKit |
| **Execution** | Piston Code Engine (Docker) |
| **Styling** | Vanilla CSS & Tailwind CSS |

---

## 📂 Project Structure

*   `/app/dashboard`: Administrative tools for user management and interview schedules.
*   `/app/interview`: The core live collaborative environment.
*   `/app/ai-interview`: AI-led interview simulations.
*   `/lib/auth.ts`: Centralized role enforcement and Clerk synchronization logic.
*   `/lib/email.ts`: Template mapping and Resend dispatch logic.
*   `/prisma/schema.prisma`: Relational data models for users, schedules, and reports.

---

## ⚙️ Quick Start

### 1. Environment Configuration
Copy `.env.example` to `.env`. Ensure you have keys for **Clerk**, **Liveblocks**, **LiveKit**, and optionally **Resend** for email features.

### 2. Execution Engine (Docker)
```bash
docker run -d -p 2000:2000 --privileged --name piston ghcr.io/engineer-man/piston:latest
```

### 3. Application Setup
```bash
npm install
npx prisma migrate dev
npm run dev
```

---
*Built to streamline technical interviewing with zero-friction collaboration.*
