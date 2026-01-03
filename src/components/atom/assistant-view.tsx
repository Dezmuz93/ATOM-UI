
"use client";

import { useState, useRef, Suspense } from "react";
import type { Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Button } from "../ui/button";
import { Mic, Square, Loader, ChevronsUp, ChevronsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { StatusPanel } from "./status-panel";
import { CommandInput } from "./command-input";
import dynamic from 'next/dynamic';
import { AtomLogoVisualizer } from "./atom-logo-visualizer";
import { useEffect } from "react";
import { connectSpeechEvents } from "@/lib/speech-stream";

const MicVisualizer = dynamic(
  () => import('./mic-visualizer').then(mod => mod.MicVisualizer),
  { ssr: false }
);

const SciFiGlobe = dynamic(
  () => import('./sci-fi-globe').then(mod => mod.SciFiGlobe),
  {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center"><Loader className="h-16 w-16 animate-spin text-primary" /></div>
  }
);


interface AssistantViewProps {
  isAssistantSpeaking: boolean;
  audioNode: HTMLAudioElement | null;
  messages: Message[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsAssistantSpeaking: (isSpeaking: boolean) => void;
  setAudioUrl: (url: string | null) => void;
}

export function AssistantView({
  isAssistantSpeaking,
  audioNode,
  messages,
  addMessage,
  setMessages,
  setIsAssistantSpeaking,
  setAudioUrl,
}: AssistantViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechQueue = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  async function playBrowserAudio(text: string) {
    try {
      const api = localStorage.getItem("atom_api_url") || "http://localhost:8000";

      const res = await fetch(`${api}/api/tts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err) {
      console.warn("Browser TTS failed in AssistantView", err);
    }
  }

  const handleCommand = async (command: string) => {
    addMessage("user", command);
    setIsAssistantSpeaking(true);

    try {
      const assistantMessageId = `${Date.now()}-${Math.random()}`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: new Date(), id: assistantMessageId, isStreaming: true },
      ]);

      // const useStreaming = localStorage.getItem('tts_streaming_enabled') === 'true';
      const useStreaming = localStorage.getItem("tts_streaming_enabled") !== "false";
      const endpoint = useStreaming ? "/api/chat/stream" : "/api/chat";

      const response = await api(endpoint, {
        method: "POST",
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error("API responded with an error");
      }

      if (!response.body) {
        throw new Error("Response has no body");
      }

      if (useStreaming) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line) continue;

            try {
              const json = JSON.parse(line);

              if (json.audio) {
                setAudioUrl(json.audio);
              }

              if (json.text) {
                fullResponse = json.text;

                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullResponse }
                      : msg
                  )
                );
              }

              if (json.done) {
                // 🔥 Only speak once final result known
                // playBrowserAudio(fullResponse);
              }

            } catch (err) {
              console.warn("Invalid NDJSON line:", line);
            }
          }
        }
      }


      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );

    } catch (error) {
      console.error("API error:", error);
      const errorMessage = "Sorry, I encountered an error. The backend may be offline.";
      addMessage("assistant", errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Could not process the command.",
      });
      setIsAssistantSpeaking(false);
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
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
        gain.gain.value = 6; // ⚠️ adjust slowly
        src.connect(gain);
        const dest = audioCtx.createMediaStreamDestination();

        mediaRecorderRef.current = new MediaRecorder(dest.stream);

        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", async () => {
          const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          console.log("🎤 MIME:", mimeType);
          console.log("🎤 SIZE:", audioBlob.size);
          console.log("🎤 CHUNKS:", audioChunksRef.current.map(c => c.size));


          // ⛔ reject garbage recordings
          if (audioBlob.size < 4000) {
            toast({
              variant: "destructive",
              title: "No usable speech detected",
              description: "Try speaking for at least half a second."
            });

            stream.getTracks().forEach(track => track.stop());
            return;
          }

          // // ===== SAVE DEBUG COPY LOCALLY =====
          // try {
          //   const url = URL.createObjectURL(audioBlob);
          //   const a = document.createElement("a");
          //   a.href = url;

          //   const ext =
          //     mimeType.includes("webm") ? "webm" :
          //     mimeType.includes("ogg") ? "ogg" :
          //     mimeType.includes("wav") ? "wav" :
          //     "dat";

          //   a.download = `ATOM-STT-${Date.now()}.${ext}`;

          //   document.body.appendChild(a);
          //   a.click();
          //   document.body.removeChild(a);

          //   console.log("💾 Saved recording locally");
          // } catch (err) {
          //   console.warn("Failed to save debug recording", err);
          // }

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            transcribeAudio(base64Audio);
          };
          stream.getTracks().forEach(track => track.stop());
        });

        mediaRecorderRef.current.start();
        // small delay improves reliability on some browsers
        setTimeout(() => setIsRecording(true), 300);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
          variant: "destructive",
          title: "Microphone Error",
          description: "Could not access the microphone. Please check your browser permissions.",
        });
      }
    }
  };

  const transcribeAudio = async (base64Audio: string) => {
    toast({ title: "Transcribing audio..." });
    try {
      const response = await api("/api/stt", {
        method: "POST",
        body: JSON.stringify({
          audio: base64Audio,
          useStreaming: localStorage.getItem('stt_streaming_enabled') === 'true'
        }),
      });

      if (!response.ok) {
        throw new Error("STT API responded with an error");
      }

      const data = await response.json();
      if (data.text) {
        toast({ title: "Transcription complete", description: `"${data.text}"` });
        handleCommand(data.text);
        console.log("USER RAW RESPONSE(ASSISTANT VIEW):", data.text);
      } else {
        throw new Error("No text in STT response");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        variant: "destructive",
        title: "Transcription Error",
        description: (error as Error).message || "Could not process the audio.",
      });
    }
  };

  useEffect(() => {
    const disconnect = connectSpeechEvents(
      (text) => {
        console.log("SSE SPEAK RECEIVED:", text);

        // 🚀 DO NOT DO TTS HERE
        // Just push text into playback queue controlled in page.tsx
        if ((window as any).ATOM_SPEECH_QUEUE) {
          (window as any).ATOM_SPEECH_QUEUE.add(text);
        }
      },

      () => {
        console.log("SSE SILENCE");
        audioNode?.pause?.();
      }
    );

    return disconnect;
  }, [audioNode]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SciFiGlobe />
      </div>
      {/* <AtomLogoVisualizer isSpeaking={isAssistantSpeaking} audioNode={audioNode} sensitivity={100} /> */}

      <div className="flex-1" />

      <div className="h-24 w-full max-w-3xl relative z-10">
        {isRecording && <MicVisualizer isRecording={isRecording} />}
      </div>

      <div className="w-full flex flex-col items-center z-10">
        {!isChatVisible && (
          <div className="pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatVisible(true)}
              className="text-muted-foreground/50 hover:text-muted-foreground hover:bg-black/20"
            >
              <ChevronsUp />
              <span className="sr-only">Show Chat</span>
            </Button>
          </div>
        )}
        <div className="p-4 pb-8">
          <Button
            onClick={handleMicToggle}
            size="icon"
            className={cn(
              "w-20 h-20 rounded-full text-white shadow-lg transition-all duration-300",
              isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-primary/90"
            )}
          >
            {isRecording ? <Square size={32} /> : <Mic size={32} />}
            <span className="sr-only">{isRecording ? "Stop Recording" : "Start Recording"}</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isChatVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            // change transparency here 
            className="absolute inset-0 z-20 bg-background/50 backdrop-blur-md flex flex-col"
          >
            <div className="flex-shrink-0 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatVisible(false)}
                className="text-muted-foreground/50 hover:text-muted-foreground hover:bg-black/20"
              >
                <ChevronsDown />
                <span className="sr-only">Hide Chat</span>
              </Button>
            </div>
            <div className="flex-1 pt-4 overflow-y-auto">
              <StatusPanel messages={messages} />
            </div>
            <div className="p-4 bg-transparent shrink-0">
              <CommandInput onCommand={handleCommand} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
