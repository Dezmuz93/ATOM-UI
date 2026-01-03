
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelLeftOpen, PanelRightOpen, HardDrive, Camera, ListTree, HeartPulse, Loader, AlertCircle, MessageSquare, LayoutGrid, BrainCircuit } from "lucide-react";
import { CameraView } from "./camera-view";
import { ScrollArea } from "../ui/scroll-area";
import { SystemHealthPanel } from "./system-health-panel";
import type { Tool, MemoryItem } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { api } from "@/lib/api";
import { useSession, type ViewMode } from "@/app/session-provider";

const MemoryPanel = () => {
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api('/api/memory');
        if (!res.ok) throw new Error('Failed to fetch memory data.');
        const data = await res.json();
        setMemory(data.memory);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMemory();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin text-primary" /></div>;
  if (error) return <div className="p-4 text-destructive flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>;

  return (
    <div className="p-2 md:p-4 space-y-2">
      {memory.map((item, index) => (
        <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
          <p className="font-semibold text-foreground">{item.content}</p>
          <p className="text-muted-foreground text-xs mt-1">{new Date(item.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

const ToolsPanel = () => {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    setError(null);
    try {
      const res = await api("/api/tools/usage");
      if (!res.ok) throw new Error("Failed to fetch tool usage logs.");

      const data = await res.json();
      setUsage(Array.isArray(data?.usage) ? data.usage : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader className="animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-destructive flex items-center gap-2 text-sm">
        <AlertCircle className="w-4 h-4" /> {error}
      </div>
    );

  if (usage.length === 0)
    return (
      <div className="p-6 text-center text-muted-foreground">
        No tool activity yet.
      </div>
    );

  const getStatus = (entry: any): "success" | "error" | "unknown" => {
      const meta = entry.metadata || {};
      if (typeof meta.success === 'boolean') {
          return meta.success ? "success" : "error";
      }
      return "unknown";
  }

  const StatusBadge = ({ status }: { status: "success" | "error" | "unknown" }) => {
    if (status === "success")
      return (
        <Badge variant="outline" className="border-green-500/60 text-green-400">SUCCESS</Badge>
      );

    if (status === "error")
      return (
        <Badge variant="destructive">FAILED</Badge>
      );

    return (
        <Badge variant="secondary">UNKNOWN</Badge>
    );
  };

  return (
    <Accordion type="multiple" className="p-2 md:p-4 space-y-2">
      {usage.map((entry, index) => {
        const status = getStatus(entry);
        return (
          <AccordionItem value={`item-${index}`} key={index} className="bg-muted/40 rounded-lg border px-4">
             <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-sm font-semibold text-primary truncate">{entry.tool}</span>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        <span className="text-xs text-muted-foreground hidden md:inline">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
             </AccordionTrigger>
             <AccordionContent>
                <Separator className="my-2 bg-border/50"/>
                <pre className="text-xs bg-background/50 mt-2 p-2 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(entry.metadata, null, 2)}
                </pre>
             </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );
};

interface ViewSwitcherProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const ViewSwitcher = ({ viewMode, setViewMode }: ViewSwitcherProps) => {
    return (
        <div className="flex flex-col gap-2 p-4">
             <h4 className="font-headline text-sm font-semibold text-muted-foreground px-2">View Mode</h4>
            <Button
                variant={viewMode === 'focused' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('focused')}
                className="justify-start"
            >
                <MessageSquare className="mr-2 h-4 w-4" />
                Focused
            </Button>
            <Button
                variant={viewMode === 'assistant' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('assistant')}
                className="justify-start"
            >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Assistant
            </Button>
            <Button
                variant={viewMode === 'tactical' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('tactical')}
                className="justify-start"
            >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Tactical
            </Button>
        </div>
    )
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { viewMode, setViewMode } = useSession();

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
         <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-primary hover:text-accent-foreground hover:bg-accent/50">
            {isOpen ? <PanelLeftOpen /> : <PanelRightOpen />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm md:w-[400px] bg-card/50 backdrop-blur-xl border-r p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
             <SheetTitle className="font-headline text-foreground">System Interface</SheetTitle>
          </SheetHeader>
          <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
          <Separator />
          <Tabs defaultValue="health" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 mt-2 h-auto px-4">
                <TabsTrigger value="health" className="text-xs md:text-sm gap-1 md:gap-2"><HeartPulse className="h-4 w-4" /> Health</TabsTrigger>
                <TabsTrigger value="camera" className="text-xs md:text-sm gap-1 md:gap-2"><Camera className="h-4 w-4"/> Camera</TabsTrigger>
                <TabsTrigger value="tools" className="text-xs md:text-sm gap-1 md:gap-2"><ListTree className="h-4 w-4"/> Tools</TabsTrigger>
                <TabsTrigger value="memory" className="text-xs md:text-sm gap-1 md:gap-2"><HardDrive className="h-4 w-4"/> Memory</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
                <TabsContent value="health" className="m-0">
                <SystemHealthPanel />
                </TabsContent>
                <TabsContent value="camera" className="m-0 p-2 md:p-4">
                <CameraView />
                </TabsContent>
                <TabsContent value="tools" className="m-0">
                    <ToolsPanel />
                </TabsContent>
                <TabsContent value="memory" className="m-0">
                    <MemoryPanel />
                </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
