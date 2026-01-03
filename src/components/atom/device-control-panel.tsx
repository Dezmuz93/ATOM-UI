"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDevices, toggleDevice } from "@/lib/home-assistant";
import type { Device } from "@/lib/types";
import { Lightbulb, Power, AlertCircle, Thermometer, WifiOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

const iconMap = {
  light: Lightbulb,
  switch: Power,
  sensor: Thermometer
};

export function DeviceControlPanel() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
    } catch (err: any) {
      setError(err.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleToggle = async (deviceId: string) => {
    // Optimistically update UI
    const originalDevices = [...devices];
    setDevices(prevDevices =>
      prevDevices.map(d =>
        d.id === deviceId && typeof d.state === 'boolean' ? { ...d, state: !d.state } : d
      )
    );

    try {
      await toggleDevice(deviceId);
    } catch (err: any) {
      // Revert UI on error
      setDevices(originalDevices);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to toggle device: ${err.message}`,
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-11" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-destructive gap-4">
          <WifiOff size={48} />
          <p className="font-semibold">{error}</p>
          <p className="text-sm text-muted-foreground">Please check your settings and network connection.</p>
          <Button onClick={fetchDevices} variant="secondary">Retry</Button>
        </div>
      );
    }

    if (devices.length === 0) {
      return <p className="text-muted-foreground col-span-full text-center h-60 flex items-center justify-center">No devices found.</p>
    }

    return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const Icon = iconMap[device.type] || AlertCircle;
            return (
              <div key={device.id} className="flex items-center justify-between p-4 rounded-lg bg-muted shadow-md">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="font-medium">{device.name}</span>
                </div>
                {device.type === 'light' || device.type === 'switch' ? (
                  <Switch
                    checked={!!device.state}
                    onCheckedChange={() => handleToggle(device.id)}
                  />
                ) : (
                  <span className="font-mono text-secondary">{String(device.state)}</span>
                )}
              </div>
            );
          })}
        </div>
    );
  };
  
  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-primary">Device Control</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
