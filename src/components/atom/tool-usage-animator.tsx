
"use client";

import { useState } from 'react';
import { useInterval } from 'react-use';
import { api } from '@/lib/api';
import { Globe, DatabaseZap, Cpu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToolType = 'Web Search' | 'Memory' | 'System Control';

const WebSearchAnimation = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0"
    >
        {/* Grid pattern */}
        <div 
            className="absolute inset-0" 
            style={{
                backgroundImage: 'linear-gradient(hsla(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(to right, hsla(var(--primary)/0.1) 1px, transparent 1px)',
                backgroundSize: '2rem 2rem',
                animation: 'grid-pan 10s linear infinite',
            }}
        />
        {/* Scanning beam */}
        <div 
            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/30 to-transparent"
            style={{
                animation: 'scan-beam 4s ease-in-out infinite',
            }}
        />
    </motion.div>
);

const MemoryRecallAnimation = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0 flex items-center justify-center"
    >
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute border border-accent rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: [0, 1.5, 2], 
                    opacity: [1, 0.5, 0] 
                }}
                transition={{
                    duration: 3,
                    ease: "easeInOut",
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatType: 'loop',
                }}
                style={{
                    width: '10rem',
                    height: '10rem',
                }}
            />
        ))}
    </motion.div>
);

const SystemControlAnimation = () => (
     <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0 overflow-hidden"
    >
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-l from-cyan-400/80 to-transparent"
                style={{
                    width: '50%',
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'left',
                }}
                initial={{ 
                    rotate: i * 45, 
                    scaleX: 0,
                    opacity: 0,
                }}
                animate={{ 
                    scaleX: [0, 1, 1, 0],
                    opacity: [0, 1, 1, 0],
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    delay: (i * 0.2) % 1,
                    repeat: Infinity,
                    repeatType: 'loop',
                    times: [0, 0.2, 0.8, 1],
                }}
            />
        ))}
    </motion.div>
)


export function ToolUsageAnimator() {
    const [activeTool, setActiveTool] = useState<ToolType | null>(null);

    useInterval(async () => {
        try {
            const res = await api('/api/tools/usage');
            if (!res.ok) {
                setActiveTool(null);
                return;
            };

            const data = await res.json();
            const latestUsage = data.usage?.[0];
            
            if (latestUsage) {
                const now = new Date();
                const usageTime = new Date(latestUsage.timestamp);
                const timeDiff = (now.getTime() - usageTime.getTime()) / 1000; // in seconds

                if (timeDiff < 20) { // Only show animation for tools used in the last 5 seconds
                    const tags = latestUsage.metadata?.tags;
                    
                    const checkTags = (tagCollection: string | string[], tag: string) => {
                        if (!tagCollection) return false;
                        if (Array.isArray(tagCollection)) {
                            return tagCollection.includes(tag);
                        }
                        return tagCollection.includes(tag);
                    };

                    if (tags) {
                        if (checkTags(tags, 'Web Search')) {
                            setActiveTool('Web Search');
                            return;
                        }
                        if (checkTags(tags, 'Memory')) {
                            setActiveTool('Memory');
                            return;
                        }
                        if (checkTags(tags, 'System Control')) {
                            setActiveTool('System Control');
                            return;
                        }
                    }
                }
            }
            
            setActiveTool(null);

        } catch (error) {
            setActiveTool(null);
            console.error('Failed to fetch tool usage:', error);
        }
    }, 2000);

    const iconMap: Record<ToolType, React.ElementType> = {
        'Web Search': Globe,
        'Memory': DatabaseZap,
        'System Control': Cpu,
    }
    const textMap: Record<ToolType, string> = {
        'Web Search': 'Web Searching Mode',
        'Memory': 'Memory Recall Mode',
        'System Control': 'System Control Active',
    }


    const Icon = activeTool ? iconMap[activeTool] : null;
    const text = activeTool ? textMap[activeTool] : '';

    return (
        <div className="absolute inset-0 z-20 pointer-events-none flex justify-center overflow-hidden">
            <AnimatePresence>
                {activeTool === 'Web Search' && <WebSearchAnimation />}
                {activeTool === 'Memory' && <MemoryRecallAnimation />}
                {activeTool === 'System Control' && <SystemControlAnimation />}
            </AnimatePresence>

            <AnimatePresence>
                {activeTool && Icon && (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-28 z-10"
                    >
                        <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm px-4 py-2 border border-primary/30 text-sm font-headline text-primary w-max pointer-events-auto">
                            <Icon className="h-5 w-5 animate-pulse" />
                            <span>{text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
