'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function FpsCounter({ className }: { className?: string }) {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef(0);

  useEffect(() => {
    const loop = (time: number) => {
      frameCount.current++;
      if (time - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = time;
      }
      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className={cn("text-xs font-mono text-green-400/80 p-1 bg-background/50 rounded", className)}>
      <span>FPS: {fps}</span>
    </div>
  );
}
