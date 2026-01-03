"use client";

import { useState, useEffect } from "react";
import type { SystemStatus } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { useInterval } from "react-use";
import { api } from "@/lib/api";

const StatusIndicator = ({ status }: { status: string }) => {
  const isOnline = ['Running', 'Online', 'Connected', 'Listening'].includes(status);
  const isProcessing = ['Processing'].includes(status);

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isOnline ? "bg-green-500 animate-pulse" : 
          isProcessing ? "bg-yellow-500 animate-pulse" :
          "bg-red-500"
        )}
      />
      <span className={cn(
        "text-sm font-mono",
        isOnline ? "text-green-400" : 
        isProcessing ? "text-yellow-400" :
        "text-red-400"
      )}>
        {status}
      </span>
    </div>
  );
};


export function SystemHealthPanel() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setError(null);
    try {
      const response = await api('/api/health');
      if (!response.ok) {
        throw new Error("Failed to fetch system status");
      }
      const data: SystemStatus = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
      setStatus(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useInterval(fetchStatus, 5000);

  const renderContent = () => {
    if (!status && !error) {
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="p-4 text-destructive">{error}</p>;
    }

    if (status) {
      return (
        <div className="space-y-3 p-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">LLM Status</span>
            <StatusIndicator status={status.llmStatus} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Embeddings Server</span>
            <StatusIndicator status={status.embeddingsServer} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">ChromaDB</span>
            <StatusIndicator status={status.chromaDb} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Judge Model</span>
            <StatusIndicator status={status.judgeModel} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">TTS Mode</span>
             <span className="text-sm font-mono text-primary">{status.ttsMode}</span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-muted-foreground">STT</span>
            <StatusIndicator status={status.stt} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
      <div className="w-full">
          {renderContent()}
      </div>
  );
}
