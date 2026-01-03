"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandInputProps {
  onCommand: (command: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

export function CommandInput({ onCommand, onRecordingChange }: CommandInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onCommand(inputValue.trim());
      setInputValue("");
    }
  };

  // const stopRecording = async () => {
  //   setIsRecording(false);
  //   onRecordingChange?.(false);

  //   mediaRecorderRef.current?.stop();
  // };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
        }
      });

      const audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);
      const gain = audioCtx.createGain();
      gain.gain.value = 6; // adjust if too loud
      src.connect(gain);

      const dest = audioCtx.createMediaStreamDestination();
      gain.connect(dest);
      
      // IMPORTANT — keeps Chrome from suspending the graph
      // gain.connect(audioCtx.destination);
      const keepAlive = audioCtx.createGain();
      keepAlive.gain.value = 0;      // muted but keeps pipeline active
      gain.connect(keepAlive);
      keepAlive.connect(audioCtx.destination);

      await audioCtx.resume();

      chunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(dest.stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        chunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        console.log("🎤 MIME:", mimeType);
        console.log("🎤 SIZE:", audioBlob.size);
        console.log("🎤 CHUNKS:", chunksRef.current.map(c => c.size));

        if (audioBlob.size < 4000) {
          onCommand("Sorry, I couldn't hear anything. Please try again.");
          stream.getTracks().forEach(track => track.stop());
          audioCtx.close();
          return;
        }

        // // ===== SAVE DEBUG COPY LOCALLY =====
        // try {
        //   const url = URL.createObjectURL(audioBlob);
        //   const a = document.createElement("a");
        //   a.href = url;

        //   const ext =
        //     mimeType.includes("webm") ? "webm" :
        //       mimeType.includes("ogg") ? "ogg" :
        //         mimeType.includes("wav") ? "wav" :
        //           "dat";

        //   a.download = `ATOM-STT-${Date.now()}.${ext}`;

        //   document.body.appendChild(a);
        //   a.click();
        //   document.body.removeChild(a);

        //   console.log("💾 Saved recording locally");
        // } catch (err) {
        //   console.warn("Failed to save debug recording", err);
        // }

        const base64Audio = await blobToBase64(audioBlob);

        try {
          const api = localStorage.getItem("atom_api_url") || "http://localhost:8000";

          const res = await fetch(`${api}/api/stt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio: base64Audio,
              useStreaming: localStorage.getItem("stt_streaming_enabled") === "true"
            }),
          });

          const data = await res.json();

          if (data?.text) onCommand(data.text);
          else onCommand("Sorry, I couldn't understand that.");
        } catch (err) {
          console.error("STT Error", err);
          onCommand("Speech recognition failed. Please try again.");
        }

        stream.getTracks().forEach(track => track.stop());
        audioCtx.close();
      });

      mediaRecorderRef.current.start();
      setTimeout(() => setIsRecording(true), 300);
      onRecordingChange?.(true);

    } catch (err) {
      console.error("Mic error", err);
      onCommand("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    onRecordingChange?.(false);
  };



  const handleMicClick = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2 p-2 rounded-full bg-card/50 border backdrop-blur-sm"
    >
      <Input
        type="text"
        placeholder="Type a command or ask a question..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
      />

      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="text-primary hover:text-accent-foreground hover:bg-accent/50"
        disabled={!inputValue.trim()}
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleMicClick}
        className={cn(
          "text-primary hover:text-accent-foreground hover:bg-accent/50",
          isRecording && "bg-destructive/50 text-white animate-pulse"
        )}
      >
        <Mic className="h-5 w-5" />
        <span className="sr-only">Use Microphone</span>
      </Button>
    </form>
  );
}

/* helper */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result as string);
  });
}
