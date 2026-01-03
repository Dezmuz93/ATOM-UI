
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSession, type ViewMode } from "../session-provider";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [haBaseUrl, setHaBaseUrl] = useState("");
  const [haToken, setHaToken] = useState("");
  const [atomApiUrl, setAtomApiUrl] = useState("");
  const [showFps, setShowFps] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState([1]);
  const [defaultViewMode, setDefaultViewMode] = useState<ViewMode>("focused");
  const [ttsStreaming, setTtsStreaming] = useState(true);
  const [sttStreaming, setSttStreaming] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { logout } = useSession();

  useEffect(() => {
    const savedHaBaseUrl = localStorage.getItem("home_assistant_base_url") || "";
    const savedHaToken = localStorage.getItem("home_assistant_token") || "";
    const savedAtomApiUrl = localStorage.getItem("atom_api_url") || "";
    const savedShowFps = localStorage.getItem("show_fps_counter") === "true";
    const savedRotationSpeed = localStorage.getItem("atom_model_rotation_speed") || "1";
    const savedDefaultView = localStorage.getItem("atom_default_view_mode") as ViewMode | null;
    const savedTtsStreaming = localStorage.getItem("tts_streaming_enabled") !== "false"; // default true
    const savedSttStreaming = localStorage.getItem("stt_streaming_enabled") === "true"; // default false

    setHaBaseUrl(savedHaBaseUrl);
    setHaToken(savedHaToken);
    setAtomApiUrl(savedAtomApiUrl);
    setShowFps(savedShowFps);
    setRotationSpeed([parseFloat(savedRotationSpeed)]);
    if (savedDefaultView) setDefaultViewMode(savedDefaultView);
    setTtsStreaming(savedTtsStreaming);
    setSttStreaming(savedSttStreaming);

  }, []);

  const handleSaveHa = () => {
    localStorage.setItem("home_assistant_base_url", haBaseUrl);
    localStorage.setItem("home_assistant_token", haToken);
    toast({
      title: "Home Assistant Settings Saved",
    });
  };

  const handleSaveInterface = () => {
    localStorage.setItem("show_fps_counter", String(showFps));
    localStorage.setItem("atom_model_rotation_speed", String(rotationSpeed[0]));
    localStorage.setItem("atom_default_view_mode", defaultViewMode);
    // This is needed to trigger a storage event for other tabs to update.
    window.dispatchEvent(new Event("storage"));
    toast({
      title: "Interface Settings Saved",
    });
  };

  const handleSaveBackend = () => {
    localStorage.setItem("tts_streaming_enabled", String(ttsStreaming));
    localStorage.setItem("stt_streaming_enabled", String(sttStreaming));
    toast({
      title: "Backend Feature Settings Saved",
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary hover:text-accent hover:bg-transparent">
                <ArrowLeft />
             </Button>
            <CardTitle className="text-2xl font-headline">A.T.O.M Settings</CardTitle>
          </div>
          <CardDescription>Manage your integrations and interface preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary">A.T.O.M Backend</h3>
            <div className="space-y-2">
              <Label htmlFor="atom-api-url">API Server URL</Label>
              <Input
                id="atom-api-url"
                type="url"
                value={atomApiUrl}
                disabled
                className="bg-background/50"
              />
            </div>
             <Button onClick={logout} variant="outline" className="w-full">
              Log Out & Change API URL
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary">Backend Features</h3>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
              <div className="space-y-0.5">
                <Label htmlFor="tts-streaming">Streaming TTS</Label>
                <p className="text-xs text-muted-foreground">
                  Receive audio as it's generated for lower latency.
                </p>
              </div>
              <Switch
                id="tts-streaming"
                checked={ttsStreaming}
                onCheckedChange={setTtsStreaming}
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
              <div className="space-y-0.5">
                <Label htmlFor="stt-streaming">Streaming STT</Label>
                <p className="text-xs text-muted-foreground">
                  Get faster, incremental transcription results. (Requires capable backend)
                </p>
              </div>
              <Switch
                id="stt-streaming"
                checked={sttStreaming}
                onCheckedChange={setSttStreaming}
              />
            </div>
             <Button onClick={handleSaveBackend} className="w-full bg-primary/90 hover:bg-primary text-primary-foreground">
              Save Backend Settings
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary">Home Assistant</h3>
            <div className="space-y-2">
              <Label htmlFor="base-url">Home Assistant URL</Label>
              <Input
                id="base-url"
                type="url"
                placeholder="http://homeassistant.local:8123"
                value={haBaseUrl}
                onChange={(e) => setHaBaseUrl(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Long-Lived Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your token"
                value={haToken}
                onChange={(e) => setHaToken(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <Button onClick={handleSaveHa} className="w-full bg-primary/90 hover:bg-primary text-primary-foreground">
              Save Home Assistant Settings
            </Button>
          </div>
          <Separator />
           <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary">Interface & Debug</h3>
            <div className="space-y-3 rounded-lg border p-3 shadow-sm bg-background/50">
                <div className="space-y-0.5">
                    <Label htmlFor="default-view">Default View Mode</Label>
                    <p className="text-xs text-muted-foreground">
                        Choose the screen that appears after startup.
                    </p>
                </div>
                 <Select value={defaultViewMode} onValueChange={(value: ViewMode) => setDefaultViewMode(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a view mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="focused">Focused</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="tactical">Tactical</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
              <div className="space-y-0.5">
                <Label htmlFor="fps-counter">Show FPS Counter</Label>
                <p className="text-xs text-muted-foreground">
                  Display the frames-per-second counter.
                </p>
              </div>
              <Switch
                id="fps-counter"
                checked={showFps}
                onCheckedChange={(checked) => setShowFps(checked)}
              />
            </div>
            <div className="space-y-3 rounded-lg border p-3 shadow-sm bg-background/50">
                <div className="space-y-0.5">
                    <Label htmlFor="rotation-speed">Model Rotation Speed</Label>
                    <p className="text-xs text-muted-foreground">
                        Control the animation speed of the 3D assistant model.
                    </p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                   <Slider
                    id="rotation-speed"
                    min={0}
                    max={5}
                    step={0.1}
                    value={rotationSpeed}
                    onValueChange={setRotationSpeed}
                    />
                    <span className="text-sm font-mono text-muted-foreground w-12 text-center">{rotationSpeed[0].toFixed(1)}x</span>
                </div>
            </div>
             <Button onClick={handleSaveInterface} className="w-full bg-primary/90 hover:bg-primary text-primary-foreground">
              Save Interface Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
