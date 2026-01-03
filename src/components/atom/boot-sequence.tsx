"use client";

import { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { AtomIcon } from '../icons';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { api } from '@/lib/api';

const bootModules = [
  'ATOM_CORE',
  'MEMORY_ENGINE',
  'EMBEDDINGS_SERVER',
  'ROBOTICS_INTERFACE',
];

const moduleDisplayNames: { [key: string]: string } = {
  ATOM_CORE: 'ATOM CORE',
  MEMORY_ENGINE: 'MEMORY ENGINE',
  EMBEDDINGS_SERVER: 'EMBEDDINGS SERVER',
  ROBOTICS_INTERFACE: 'ROBOTICS INTERFACE',
};


interface BootSequenceProps {
  onComplete: () => void;
  onReset: () => void;
}

type Status = 'pending' | 'ok' | 'error';

export function BootSequence({ onComplete, onReset }: BootSequenceProps) {
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(bootModules.map(m => [m, 'pending']))
  );
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [playBootSound, { stop: stopBootSound }] = useSound('/sounds/boot.mp3', { volume: 0.5 });
  const [playOnlineSound] = useSound('/sounds/online.mp3', { volume: 0.5 });
  const [playErrorSound] = useSound('/sounds/error.mp3', { volume: 0.4 });
  const [hasPlayedBootSound, setHasPlayedBootSound] = useState(false);

  useEffect(() => {
    // This effect ensures the sound plays only once on component mount in a browser-compatible way.
    if (!hasPlayedBootSound) {
      // playBootSound();
      setHasPlayedBootSound(true);
    }
  }, [hasPlayedBootSound]);


  useEffect(() => {
    if (isFinished) return;

    const checkModule = async (moduleName: string) => {
      try {
        const response = await api('/api/boot-status', {
          method: 'POST',
          body: JSON.stringify({ module: moduleName }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.status === 'ok') {
          setStatuses(prev => ({ ...prev, [moduleName]: 'ok' }));
        } else {
          throw new Error(`Module ${moduleName} check failed`);
        }
      } catch (e) {
        console.error(`Boot check for ${moduleName} failed:`, e);
        setStatuses(prev => ({ ...prev, [moduleName]: 'error' }));
        setHasError(true);
        // playErrorSound();
      }
    };
    
    const processNextModule = () => {
        if (currentModuleIndex < bootModules.length && !hasError) {
          checkModule(bootModules[currentModuleIndex]);
        }
    }

    if (currentModuleIndex < bootModules.length && !hasError) {
      const timeoutId = setTimeout(() => {
        processNextModule();
        // Move to the next module regardless of success or failure of the fetch
        setCurrentModuleIndex(prev => prev + 1);
      }, 300 + Math.random() * 400);
      return () => clearTimeout(timeoutId);
    } else {
      // All modules checked or an error occurred
      const finishTimeout = setTimeout(() => {
          setIsFinished(true);
          // stopBootSound();
          if (!hasError) {
            // playOnlineSound();
            setTimeout(onComplete, 1000);
          }
      }, 500);
      return () => clearTimeout(finishTimeout);
    }

  }, [currentModuleIndex, hasError, onComplete]);


  const renderStatusIcon = (status: Status) => {
    switch(status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader className="w-5 h-5 animate-spin" />;
    }
  }

  const retryBoot = () => {
    setStatuses(Object.fromEntries(bootModules.map(m => [m, 'pending'])));
    setCurrentModuleIndex(0);
    setHasError(false);
    setIsFinished(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary font-mono p-4">
      <div className={cn("transition-opacity duration-1000 mb-8", isFinished && !hasError ? "opacity-100" : "opacity-0")}>
        <AtomIcon className="w-24 h-24" />
      </div>
      <div className="w-full max-w-md text-left">
        {bootModules.slice(0, currentModuleIndex + 1).map((moduleName, index) => (
          index <= currentModuleIndex &&
          <div key={index} className="flex items-center gap-4 text-sm md:text-base mb-2 animate-in fade-in duration-500">
            <span className="flex-1">[CHECKING {moduleDisplayNames[moduleName]}...]</span>
            <div className="w-6 h-6">{renderStatusIcon(statuses[moduleName])}</div>
          </div>
        ))}

        {hasError && isFinished && (
           <div className="mt-8 text-center animate-in fade-in duration-500 space-y-4">
             <p className="text-red-500">[SYSTEM CHECK FAILED]</p>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={retryBoot} variant="secondary">
                    Retry
                </Button>
                <Button onClick={onReset} variant="destructive">
                    Change API URL
                </Button>
                <Button onClick={onComplete} variant="outline">
                    Continue Anyway
                </Button>
             </div>
           </div>
        )}

        {isFinished && !hasError && (
             <p className="text-green-400 mt-8 text-center animate-in fade-in duration-500">[SYSTEM ONLINE]</p>
        )}
      </div>
    </div>
  );
}
