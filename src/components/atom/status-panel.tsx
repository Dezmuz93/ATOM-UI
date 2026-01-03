"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AtomIcon } from "../icons";
import { User } from "lucide-react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StatusPanelProps {
  messages: Message[];
}

export function StatusPanel({ messages }: StatusPanelProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

  return (
    <ScrollArea className="h-full w-full" ref={scrollAreaRef} viewportRef={viewportRef}>
        <div className="space-y-4 p-4">
        {messages.map((message, index) => (
            <div
            key={message.id || index}
            className={cn(
                "flex items-start gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
            )}
            >
            {message.role === 'assistant' && <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0"><AtomIcon className="w-4 h-4"/></div>}
            <div
                className={cn(
                "max-w-[75%] rounded-lg p-3 text-sm shadow-md",
                message.role === "user"
                    ? "bg-primary/90 text-primary-foreground"
                    : "bg-muted"
                )}
            >
                <div className="prose prose-invert max-w-none text-sm">
                    <div className="overflow-x-auto">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* {message.isStreaming && <span className="animate-ping">_</span>} */}


                {message.isStreaming && (
//   <span className="animate-ping inline-block ml-1">_</span>
<span className="opacity-70 animate-pulse ml-1">▍</span>
)}


                <p className="text-xs text-right text-muted-foreground/80 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            {message.role === 'user' && <div className="p-2 rounded-full bg-accent/20 text-accent flex-shrink-0"><User className="w-4 h-4"/></div>}
            </div>
        ))}
        </div>
    </ScrollArea>
  );
}