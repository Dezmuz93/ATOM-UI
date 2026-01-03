import { NextResponse } from "next/server";

// Silent placeholder audio so UI doesn't break
const silentAudio =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const ATOM_API =
  process.env.NEXT_PUBLIC_ATOM_API || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    let command = "";

    // Try JSON body first
    try {
      const body = await request.json();
      command = body?.command || "";
    } catch {
      // ignore json parse fail
    }

    // Also allow ?command=who
    if (!command) {
      const url = new URL(request.url);
      command = url.searchParams.get("command") || "";
    }

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    // ------------------------------------
    // 1️⃣ CALL REAL ATOM BACKEND CHAT
    // ------------------------------------
    const chatRes = await fetch(`${ATOM_API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });

    if (!chatRes.ok) throw new Error("ATOM chat offline");

    // Your backend sends StreamingResponse — we just grab full body
    const reader = chatRes.body?.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      accumulated += decoder.decode(value);
    }

    const parsed = JSON.parse(accumulated);
    const text = parsed.text ?? parsed;

    // ------------------------------------
    // 2️⃣ TRIGGER LOCAL SPEAKER TTS
    // ------------------------------------
    fetch(`${ATOM_API}/api/tts/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => {
      console.warn("TTS speak failed (but UI continues)");
    });

    // ------------------------------------
    // 3️⃣ RETURN RESPONSE TO FRONTEND
    // ------------------------------------
    // return NextResponse.json({
    //   text,
    //   audio: silentAudio, // Browser silent for now
    // });

    // 3️⃣ Fetch browser audio
    try {
  const ttsRes = await fetch(`${ATOM_API}/api/tts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const arrayBuffer = await ttsRes.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // serialize binary safely
  const audio = Array.from(bytes);

  return NextResponse.json({
    text,
    audio
  });

} catch (e) {
  console.warn("Browser TTS failed → fallback to silent");
  return NextResponse.json({
    text,
    audio: null
  });
}

  } catch (err) {
    console.warn("ATOM backend offline → MOCK MODE", err);

    // ------------------------------------
    // 4️⃣ MOCK FALLBACK
    // ------------------------------------
    return NextResponse.json({
      text: `This is a mock response to your command. (Backend offline)`,
      audio: silentAudio,
      mock: true,
    });
  }
}
