
"use client";

import { useState, useRef, useEffect } from "react";
import { CommandInput } from "./command-input";
import type { Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { StatusPanel } from "./status-panel";
import { AtomIcon } from "../icons";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AtomInterfaceProps {
  messages: Message[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsAssistantSpeaking: (isSpeaking: boolean) => void;
  setAudioUrl: (url: string | null) => void;
  audioRef: (node: HTMLAudioElement | null) => void;
}

export function AtomInterface({ messages, addMessage, setMessages, setIsAssistantSpeaking, setAudioUrl, audioRef }: AtomInterfaceProps) {
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
      console.warn("Browser TTS failed", err);
    }
  }

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
          playBrowserAudio(fullResponse);
        }

        if (json.error) {
          console.error("Stream error:", json.error);
        }

      } catch (err) {
        console.warn("Invalid NDJSON chunk:", line);
      }
    }
  }
}

      else {
  const data = await response.json();
  console.log("NON STREAMING CHAT MODE");

  if (data.text) {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: data.text }
          : msg
      )
    );
    console.log("ASSISTANT RAW RESPONSE(ATOM INTERFACE):", data.text);
    // 🎯 Play browser voice here
    playBrowserAudio(data.text);
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
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full w-full flex flex-col">
      {messages.length > 0 ? (
        <div className="flex-1 pb-28 pt-16 overflow-y-auto">
            <StatusPanel messages={messages} />
            <div ref={bottomRef} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full max-w-4xl mx-auto">
            <AtomIcon className="w-40 h-40 text-primary/80 mb-4" />
            <h1 className="text-2xl font-headline text-foreground">A.T.O.M</h1>
            <p className="text-muted-foreground">Autonomous Tool-Orchestrating Operation Machine</p>
        </div>
      )}
      
      <div className={cn(
        "fixed bottom-0 z-10 p-4 w-full max-w-4xl mx-auto",
        isMobile ? 'left-0' : 'left-16 right-0'
        )}>
          <CommandInput onCommand={handleCommand} />
      </div>
    </div>
  );
}
