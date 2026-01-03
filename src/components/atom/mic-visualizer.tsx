"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";

interface MicVisualizerProps {
  isRecording: boolean;
}

export function MicVisualizer({ isRecording }: MicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const micRef = useRef<Tone.UserMedia | null>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const setup = async () => {
      try {
        if (isRecording && !micRef.current) {
            await Tone.start();
            micRef.current = new Tone.UserMedia();
            await micRef.current.open();
            analyserRef.current = new Tone.Analyser("waveform", 1024);
            micRef.current.connect(analyserRef.current);
            draw();
        } else if (!isRecording && micRef.current) {
          micRef.current.close();
          micRef.current = null;
          analyserRef.current = null;
          cancelAnimationFrame(animationFrameId.current);
          const canvas = canvasRef.current;
          if (canvas) {
            const context = canvas.getContext("2d");
            context?.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (e) {
        console.error("Mic access denied or not available. User may need to grant permissions.", e);
        // Clean up on error
        if (micRef.current) micRef.current.close();
        micRef.current = null;
        analyserRef.current = null;
      }
    };
    setup();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (micRef.current) {
        micRef.current.close();
      }
    };
  }, [isRecording]);

  const draw = () => {
    animationFrameId.current = requestAnimationFrame(draw);
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (analyser && canvas) {
      const context = canvas.getContext("2d");
      const data = analyser.getValue();

      if(context && data instanceof Float32Array) {
        const { width, height } = canvas;
        context.clearRect(0, 0, width, height);
        context.lineWidth = 2;
        context.strokeStyle = "hsl(var(--primary))";
        context.beginPath();

        const sliceWidth = width * 1.0 / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const v = data[i];
          const y = (v * 0.5 + 0.5) * height;
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
          x += sliceWidth;
        }

        context.lineTo(canvas.width, canvas.height / 2);
        context.stroke();
      }
    }
  };

  return <canvas ref={canvasRef} width="1000" height="100" className="w-full h-24 max-w-3xl" />;
}
