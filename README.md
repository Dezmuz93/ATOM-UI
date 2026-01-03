# 🌌 ATOM Frontend — Cinematic Web Interface

This repository contains the **React + Next.js frontend** for **A.T.O.M**, a local-first AI assistant with memory, tools, and embodied capabilities.

The frontend provides a **cinematic 3D interface** for interacting with the ATOM backend, visualizing system state, and observing tool execution in real time.

👉 **Main project:** https://github.com/AtifUsmani/A.T.O.M

---

## ✨ Features

- Interactive **3D planetary visualization** of ATOM state
- Focused **chat interface** for voice/text interaction
- Live **tool activity visualization**
- System health panels (CPU / RAM / GPU)
- Weather & news panels
- Designed for fullscreen / immersive use

The frontend is **UI-only** and does not contain any AI logic.

---

## 🧱 Tech Stack

- **Next.js**
- **React**
- **React Three Fiber** (3D rendering)
- **Tailwind CSS**
- **ShadCN UI**

---

## 🚀 Running the Frontend

### Prerequisites
- Node.js 18+
- Running ATOM backend (FastAPI)
- Running Embedding Server

### Install
```bash
npm install
```

Start Dev Server
```bash
npm run dev
```
The UI will prompt you for the ATOM backend API URL on first launch.


---

🔌 Backend Connection

This frontend communicates with ATOM via:

- REST APIs

- Streaming endpoints (for chat / STT / TTS)


Make sure the backend is running:

```bash
uvicorn api.server:app --host 0.0.0.0 --port 8000
```

---

🔐 Privacy Notes

The frontend itself runs fully locally.

Disable Next.js telemetry if desired:

```bash
npx next telemetry disable
```
Any cloud interaction (e.g., Edge-TTS) is controlled entirely by the backend configuration, not the UI.


---

⚠️ Status

This frontend is an early-stage UI focused on:

- Interaction design

- System visualization

- Tool-state feedback


Some components may be experimental or hardware-dependent.


---

📄 License

This repository follows the same license as the main ATOM project.