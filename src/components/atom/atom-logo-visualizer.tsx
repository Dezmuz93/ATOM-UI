
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// We will use a global Tone instance attached to window to avoid import issues
type ToneAnalyser = any; 

export function AtomLogoVisualizer({
  isSpeaking,
  audioNode,
  sensitivity = 2
}: {
  isSpeaking: boolean,
  audioNode: HTMLAudioElement | null,
  sensitivity?: number
}) {
  const analyserRef = useRef<ToneAnalyser | null>(null);
  const animationFrameId = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let sourceNode: MediaElementAudioSourceNode | null = null;
    const setup = async () => {
      // Check if Tone is available on the window object
      if (audioNode && !analyserRef.current && (window as any).Tone) {
        const Tone = (window as any).Tone;
        await Tone.start();
        const analyser = new Tone.Analyser("waveform", 128);
        analyserRef.current = analyser;
        
        try {
          // This can fail if the source is already connected, which is fine.
          sourceNode = Tone.context.createMediaElementSource(audioNode);
          Tone.connect(sourceNode, analyser);
          Tone.connect(analyser, Tone.context.destination);
        } catch (e) {
          console.warn("Could not connect audio node for visualization, it may already be connected.", e);
        }
      }
      
      if (isSpeaking) {
        draw();
      } else {
        cancelAnimationFrame(animationFrameId.current);
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
    
    setup();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      // We should not dispose the analyser or disconnect nodes here,
      // as it can cause issues on re-renders and with hot-reloading.
      // The Tone context should persist.
    };
  }, [isSpeaking, audioNode]);

  const draw = () => {
    animationFrameId.current = requestAnimationFrame(draw);
    if (analyserRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const data = analyserRef.current.getValue();

      if (context && data instanceof Float32Array) {
        const { width, height } = canvas;
        context.clearRect(0, 0, width, height);

        data.forEach((value, i) => {
          const amplitude = Math.abs(value);
          // Make the visualization more dramatic
          const barHeight = Math.max(2, amplitude * height * 1.2 * sensitivity); 
          const angle = (i / data.length) * 2 * Math.PI;

          // Start drawing from a radius around the center
          const innerRadius = width / 5;
          const x1 = width / 2 + Math.cos(angle) * innerRadius;
          const y1 = height / 2 + Math.sin(angle) * innerRadius;
          const x2 = width / 2 + Math.cos(angle) * (innerRadius + barHeight);
          const y2 = height / 2 + Math.sin(angle) * (innerRadius + barHeight);

          context.strokeStyle = `hsla(var(--primary), ${0.3 + amplitude * 0.7})`;
          context.lineWidth = 3;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
        });
      }
    }
  };

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} width="600" height="600" className="opacity-70" />
    </div>
  );
}
