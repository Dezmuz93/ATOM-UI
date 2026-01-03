
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { BootSequence } from '@/components/atom/boot-sequence';
import { AtomInterface } from '@/components/atom/atom-interface';
import { Header } from '@/components/atom/header';
import { Sidebar } from '@/components/atom/sidebar';
import { SystemLoadChart } from '@/components/atom/system-load-chart';
import { NewsFeed } from '@/components/atom/news-feed';
import { FpsCounter } from '@/components/atom/fps-counter';
import { useSession } from './session-provider';
import { DeviceControlPanel } from '@/components/atom/device-control-panel';
import { LoginScreen } from '@/components/atom/login-screen';
import { AssistantView } from '@/components/atom/assistant-view';
import type { ViewMode } from './session-provider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ToolUsageAnimator } from '@/components/atom/tool-usage-animator';
import { WeatherWidget } from '@/components/atom/weather-widget';

export default function Home() {
  const { isLoggedIn, isBooting, setHasBooted, login, logout, viewMode } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFps, setShowFps] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialLoadRef = useRef(true);
  const isMobile = useIsMobile();
  const speechQueue = useRef<string[]>([]);
const isPlayingRef = useRef(false);

async function playNextQueuedSpeech() {
  if (isPlayingRef.current) return;
  if (speechQueue.current.length === 0) return;

  isPlayingRef.current = true;

  const text = speechQueue.current.shift()!;
  console.log("🎤 Playing:", text);

  try {
    const api =
      localStorage.getItem("atom_api_url") || "http://localhost:8000";

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
    console.warn("TTS queue failed", err);
    isPlayingRef.current = false;
    playNextQueuedSpeech();
  }
}

    useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).ATOM_SPEECH_QUEUE = {
      add(text: string) {
        speechQueue.current.push(text);
        playNextQueuedSpeech();
      }
    };
  }, []);

  useEffect(() => {
    // Load Tone.js dynamically on the client
    const loadTone = async () => {
      if (typeof window !== 'undefined' && !(window as any).Tone) {
        const Tone = await import('tone');
        (window as any).Tone = Tone;
      }
    };
    loadTone();
  }, []);

  useEffect(() => {
    // Load chat history from localStorage on initial load
    try {
      const savedMessages = localStorage.getItem('atom_chat_history');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp), // Re-hydrate Date objects
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
    initialLoadRef.current = false;
  }, []);

  useEffect(() => {
    // Save chat history to localStorage whenever it changes
    if (!initialLoadRef.current && messages.length > 0) {
       try {
        localStorage.setItem('atom_chat_history', JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
      }
    }
     if (messages.length === 0 && !initialLoadRef.current) {
      localStorage.removeItem('atom_chat_history');
    }
  }, [messages]);


  useEffect(() => {
    const fpsSetting = localStorage.getItem('show_fps_counter') === 'true';
    setShowFps(fpsSetting);

    const handleStorageChange = () => {
        const updatedFpsSetting = localStorage.getItem('show_fps_counter') === 'true';
        setShowFps(updatedFpsSetting);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
   useEffect(() => {
    console.log("HOME AUDIO URL UPDATE", audioUrl);
    if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        setAudioUrl(null); 
    }
  }, [audioUrl]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      { role, content, timestamp: new Date(), id: Date.now() },
    ]);
  };
  
  const handleSetAudioRef = (node: HTMLAudioElement | null) => {
    if (node) {
      audioRef.current = node;
    }
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }

  if (isBooting) {
    return <BootSequence onComplete={() => setHasBooted()} onReset={logout} />;
  }
  const renderMainContent = () => {
    switch(viewMode) {
      case 'focused':
        return (
          <AtomInterface
            messages={messages}
            addMessage={addMessage}
            setMessages={setMessages}
            setIsAssistantSpeaking={setIsAssistantSpeaking}
            setAudioUrl={setAudioUrl}
            audioRef={handleSetAudioRef}
          />
        );
      case 'tactical':
        return (
          <div className="grid h-full grid-cols-1 grid-rows-4 gap-4 p-4 lg:grid-cols-2 lg:grid-rows-2">
            <div className="h-full overflow-hidden"><DeviceControlPanel /></div>
            <div className="h-full overflow-hidden"><SystemLoadChart /></div>
            <div className="h-full overflow-hidden"><NewsFeed /></div>
            <div className="h-full overflow-hidden"><WeatherWidget /></div>
          </div>
        );
      case 'assistant':
        return (
           <AssistantView
            isAssistantSpeaking={isAssistantSpeaking}
            audioNode={audioRef.current}
            messages={messages}
            addMessage={addMessage}
            setMessages={setMessages}
            setIsAssistantSpeaking={setIsAssistantSpeaking}
            setAudioUrl={setAudioUrl}
          />
        );
      default:
        return (
          <div className="flex-1 w-full h-full flex items-center justify-center">
            <p>Unknown View</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <Header>
        {showFps && <FpsCounter />}
      </Header>
      
      <div className={cn(
        "flex-1 flex flex-col h-full overflow-y-auto w-full relative",
        !isMobile && "ml-16"
      )}>
        {viewMode === 'assistant' && <ToolUsageAnimator />}
        <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
          {renderMainContent()}
        </main>
      </div>

      <audio
  ref={handleSetAudioRef}
  className="hidden"
  onPlay={() => setIsAssistantSpeaking(true)}
  onEnded={() => {
    setIsAssistantSpeaking(false);
    isPlayingRef.current = false;
    playNextQueuedSpeech();
  }}
  crossOrigin="anonymous"
/>
    </div>
  );
}
