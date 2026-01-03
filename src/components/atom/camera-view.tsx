"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function CameraView() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setHasCameraPermission(null);
  };

  const getCameraPermission = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      const perm = await navigator.permissions
        ?.query({ name: "camera" as PermissionName })
        .catch(() => null);

      if (perm && perm.state === "denied") {
        throw new Error("Camera permission previously denied");
      }

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play().catch(() => {});
      }
    } catch (error: any) {
      console.error("Camera Error:", error);
      setHasCameraPermission(false);

      let message = "Unknown error occurred";

      if (error?.name === "NotAllowedError") {
        message = "Camera access denied. Enable permissions in browser settings.";
      } else if (error?.name === "NotFoundError") {
        message = "No camera detected on this device.";
      } else if (error?.name === "NotReadableError") {
        message = "Camera is already in use by another app.";
      } else if (window.location.protocol !== "https:") {
        message = "Camera requires HTTPS. Run on https:// or localhost.";
      }

      toast({
        variant: "destructive",
        title: "Camera Error",
        description: message,
      });
    }
  };

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="p-2">
        <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center relative overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="m-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}

          {hasCameraPermission === null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Video className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Camera feed is off</p>
              <Button onClick={getCameraPermission}>Enable Camera</Button>
            </div>
          )}

          {hasCameraPermission === true && (
            <div className="absolute top-3 right-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={stopCamera}
                className="flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Stop Camera
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}