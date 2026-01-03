
"use client";

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { Group, Mesh } from 'three';
import * as THREE from 'three';
import { useInterval } from 'react-use';
import { api } from '@/lib/api';
import { motion } from 'framer-motion-3d';

const blueColor = new THREE.Color("#4D8AFF");

function AtomLogo3D({cpuLoad = 0, introPlayed}: {cpuLoad?: number, introPlayed: boolean}) {
    const groupRef = useRef<Group>(null!);
    const coreRef = useRef<Group>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    const ring1Ref = useRef<THREE.MeshStandardMaterial>(null!);
    const ring2Ref = useRef<THREE.MeshStandardMaterial>(null!);
    const ring3Ref = useRef<THREE.MeshStandardMaterial>(null!);

    const vibrantBlue = new THREE.Color("hsl(217, 90%, 60%)");
    const vibrantHot = new THREE.Color("hsl(25, 100%, 55%)");

    useFrame((state, delta) => {
        if(coreRef.current) {
            const vibration = cpuLoad * 0.05;
            coreRef.current.position.x = (Math.random() - 0.5) * vibration;
            coreRef.current.position.y = (Math.random() - 0.5) * vibration;
            coreRef.current.position.z = (Math.random() - 0.5) * vibration;
        }

        const refs = [materialRef, ring1Ref, ring2Ref, ring3Ref];
        refs.forEach(ref => {
            if (ref.current) {
                 ref.current.color.lerpColors(vibrantBlue, vibrantHot, cpuLoad);
                 ref.current.emissive.lerpColors(vibrantBlue, vibrantHot, cpuLoad);
            }
        })
    });
    
    const variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
    }

    return (
        <motion.group 
            ref={groupRef}
            variants={variants}
            initial="hidden"
            animate={introPlayed ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {/* Core Nucleus */}
            <group ref={coreRef}>
                <mesh>
                    <sphereGeometry args={[0.09, 16, 16]} />
                    <meshStandardMaterial ref={materialRef} wireframe color={blueColor} emissive={blueColor} emissiveIntensity={0.8} toneMapped={false} />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial wireframe color={blueColor} emissive={blueColor} emissiveIntensity={1} toneMapped={false} />
                </mesh>
            </group>
            
            {/* Rings */}
            <motion.mesh 
                rotation={[Math.PI / 2, 0, 0]}
                variants={variants}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <ringGeometry args={[0.35, 0.351, 64]} />
                <meshStandardMaterial ref={ring1Ref} color={blueColor} emissive={blueColor} emissiveIntensity={0.6} toneMapped={false} side={THREE.DoubleSide} />
            </motion.mesh>
            <motion.mesh 
                rotation={[Math.PI / 2, Math.PI / 3, 0]}
                variants={variants}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <ringGeometry args={[0.25, 0.251, 64]} />
                <meshStandardMaterial ref={ring2Ref} color={blueColor} emissive={blueColor} emissiveIntensity={0.6} toneMapped={false} side={THREE.DoubleSide} />
            </motion.mesh>
            <motion.mesh 
                rotation={[Math.PI / 2, -Math.PI / 3, 0]}
                variants={variants}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <ringGeometry args={[0.25, 0.251, 64]} />
                <meshStandardMaterial ref={ring3Ref} color={blueColor} emissive={blueColor} emissiveIntensity={0.6} toneMapped={false} side={THREE.DoubleSide} />
            </motion.mesh>

            {/* Electrons */}
            <Electron radius={0.35} speed={1} rotation={[Math.PI / 2, 0, 0]} introPlayed={introPlayed} delay={0.8} />
            <Electron radius={0.25} speed={1.2} offset={Math.PI / 2} rotation={[Math.PI / 2, Math.PI / 3, 0]} introPlayed={introPlayed} delay={0.9}/>
            <Electron radius={0.25-0.001} speed={-0.8} offset={Math.PI} rotation={[Math.PI / 2, -Math.PI / 3, 0]} introPlayed={introPlayed} delay={1.0}/>
        </motion.group>
    )
}

function Electron({ radius, speed = 1, offset = 0, rotation = [0,0,0], color = blueColor, size = 0.025, introPlayed, delay = 0 }: { radius: number, speed?: number, offset?: number, rotation?: [number,number,number], color?: THREE.Color, size?: number, introPlayed: boolean, delay?: number }) {
  const ref = useRef<Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
  })
  
  const variants = {
      hidden: { scale: 0, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
  }

  return (
    <motion.group 
        rotation={rotation}
        variants={variants}
        initial="hidden"
        animate={introPlayed ? "visible" : "hidden"}
        transition={{ duration: 0.3, delay }}
    >
        <mesh ref={ref}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
    </motion.group>
  )
}

function ToolPlanet({ position, color, toolName, introPlayed }: { position: [number, number, number], color: string, toolName: string, introPlayed: boolean }) {
    const groupRef = useRef<Group>(null!);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5;
            groupRef.current.rotation.x += delta * 0.1;
        }
    });

    const planetColor = new THREE.Color(color);
    
    const variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
    }
    const delay = 1.2 + Math.abs(position[0]) * 0.1;

    return (
        <motion.group 
            position={position} 
            ref={groupRef} 
            scale={[0.5, 0.5, 0.5]}
            variants={variants}
            initial="hidden"
            animate={introPlayed ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay }}
        >
             {/* Core */}
            <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial wireframe color={planetColor} emissive={planetColor} emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
            {/* Ring */}
            <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
                <ringGeometry args={[0.3, 0.301, 32]} />
                <meshStandardMaterial color={planetColor} emissive={planetColor} emissiveIntensity={0.8} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
            {/* Electron */}
            <Electron radius={0.3} speed={2} color={planetColor} size={0.02} rotation={[Math.PI/2, Math.PI/4, 0]} introPlayed={introPlayed} />
        </motion.group>
    )
}

const toolPositions = {
    'Web Search': new THREE.Vector3(1.5, 0, -1),
    'Memory': new THREE.Vector3(-1.5, 0.5, -0.5),
    'System Control': new THREE.Vector3(0, -1, -1.5),
    'main': new THREE.Vector3(0, 0, 5),
};

const toolFocusPositions = {
    'Web Search': new THREE.Vector3(2.5, 0, -1),
    'Memory': new THREE.Vector3(-2.5, 0.5, -0.5),
    'System Control': new THREE.Vector3(0, -1.5, -2.0),
}

const toolColors = {
    'Web Search': '#34D399', // Emerald
    'Memory': '#FBBF24', // Amber
    'System Control': '#60A5FA', // Blue
};

const defaultTarget = new THREE.Vector3(0, 0, 0);

function Scene() {
    const [rotationSpeed, setRotationSpeed] = useState(1);
    const [systemLoad, setSystemLoad] = useState({ cpuLoad: 0, temperature: 0 });
    const starsRef = useRef<any>();
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [animationStyle, setAnimationStyle] = useState('solar-system');
    const controlsRef = useRef<any>(null);
    const [introPlayed, setIntroPlayed] = useState(false);

    useEffect(() => {
        // Trigger intro animation
        setTimeout(() => setIntroPlayed(true), 100);
    }, []);

    // Fetch system load for animations
    useInterval(async () => {
        try {
            const res = await api('/api/system/load');
            if (res.ok) {
                const data = await res.json();
                setSystemLoad(data);
            }
        } catch (e) {
            console.error("Failed to fetch system load", e);
        }
    }, 2000);

    // Fetch tool usage for camera animation
    useInterval(async () => {
        if (animationStyle !== 'solar-system') {
            setActiveTool(null);
            return;
        };

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
                const timeDiff = (now.getTime() - usageTime.getTime()) / 1000;

                if (timeDiff < 5) {
                    const tags = latestUsage.metadata?.tags;
                    if (tags && typeof tags === 'string') {
                        if (tags.includes('Web Search')) {
                            setActiveTool('Web Search');
                            return;
                        }
                        if (tags.includes('Memory')) {
                            setActiveTool('Memory');
                            return;
                        }
                        if (tags.includes('System Control')) {
                            setActiveTool('System Control');
                            return;
                        }
                    }
                }
            }
            setActiveTool(null);
        } catch (error) {
            setActiveTool(null);
        }
    }, 2000);

    useEffect(() => {
        const getSettings = () => {
            const speed = localStorage.getItem('atom_model_rotation_speed');
            setRotationSpeed(speed ? parseFloat(speed) : 1);
            const animStyle = localStorage.getItem('atom_tool_animation_style');
            setAnimationStyle(animStyle || 'solar-system');
        }
        getSettings();

        window.addEventListener('storage', getSettings);
        return () => window.removeEventListener('storage', getSettings);
    }, []);

    useFrame((state) => {
        if (starsRef.current) {
            const jitter = systemLoad.cpuLoad * 0.01;
            starsRef.current.position.x = THREE.MathUtils.lerp(starsRef.current.position.x, (Math.random() - 0.5) * jitter, 0.1);
            starsRef.current.position.y = THREE.MathUtils.lerp(starsRef.current.position.y, (Math.random() - 0.5) * jitter, 0.1);
        }
        
        // Cinematic Camera Movement
        if (controlsRef.current) {
            const controlsTarget = controlsRef.current.target as THREE.Vector3;
            if (animationStyle === 'solar-system' && activeTool) {
                const cameraTargetPosition = toolFocusPositions[activeTool as keyof typeof toolFocusPositions];
                
                state.camera.position.lerp(toolPositions[activeTool as keyof typeof toolPositions] || toolPositions.main, 0.05);
                controlsTarget.lerp(cameraTargetPosition, 0.05);
                
                controlsRef.current.enabled = false;
            } else {
                 controlsTarget.lerp(defaultTarget, 0.05);
                 controlsRef.current.enabled = true;
            }
             controlsRef.current.update();
        }
    });
  
    return (
      <>
        <ambientLight intensity={0.1} />
        <directionalLight color={blueColor} position={[2, 2, 5]} intensity={0.5} />
        <Stars ref={starsRef} radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial wireframe color={blueColor} emissive={blueColor} emissiveIntensity={0.1} transparent opacity={0.2} />
        </Sphere>
        
        <motion.group 
            scale={[3, 3, 3]}
            initial={{ scale: 0 }}
            animate={{ scale: introPlayed ? 3: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        >
            <AtomLogo3D cpuLoad={systemLoad.cpuLoad} introPlayed={introPlayed} />
        </motion.group>

        <ToolPlanet position={[2.5, 0, -1]} color={toolColors['Web Search']} toolName="Web Search" introPlayed={introPlayed} />
        <ToolPlanet position={[-2.5, 0.5, -0.5]} color={toolColors['Memory']} toolName="Memory" introPlayed={introPlayed} />
        <ToolPlanet position={[0, -1.5, -2.0]} color={toolColors['System Control']} toolName="System Control" introPlayed={introPlayed} />

        <OrbitControls 
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            autoRotate={!activeTool}
            autoRotateSpeed={rotationSpeed * 0.5}
            minDistance={2}
            maxDistance={15}
        />
        <EffectComposer>
            <Bloom 
                luminanceThreshold={0.1} 
                luminanceSmoothing={0.9} 
                height={300} 
                intensity={0.6}
            />
        </EffectComposer>
      </>
    )
}

export function SciFiGlobe() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
       <Suspense fallback={null}>
            <Scene />
       </Suspense>
    </Canvas>
  );
}
