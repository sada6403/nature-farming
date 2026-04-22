'use client';

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows, AdaptiveDpr, Float } from '@react-three/drei';
import AloePlant from './AloePlant';
import ParticleField from './ParticleField';
import * as THREE from 'three';

// Cinematic camera motion
const CinematicCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  
  useFrame(({ clock, mouse }) => {
    const t = clock.elapsedTime;
    // Slow drifting motion
    cameraRef.current.position.x = Math.sin(t * 0.2) * 0.5 + mouse.x * 0.2;
    cameraRef.current.position.y = 1.5 + Math.cos(t * 0.15) * 0.2 + mouse.y * 0.1;
    cameraRef.current.lookAt(2.5, 0.5, 0);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.5, 12]} fov={38} />;
};

// Unstructured Organic Land
const SoilIsland = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(12, 10, 32, 32);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Create unstructured/irregular border and surface
      const dist = Math.sqrt(x * x + y * y);
      const noise = (Math.sin(x * 1.5) + Math.cos(y * 1.5)) * 0.5;
      const mask = Math.max(0, 1 - (dist / (4.5 + noise)));
      pos.setZ(i, (Math.random() * 0.15 + noise * 0.2) * mask);
      if (mask === 0) {
        pos.setZ(i, -10); // Hide edges
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <meshStandardMaterial color="#3d2b1f" roughness={1} />
    </mesh>
  );
};

export default function HeroScene() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        shadows="soft"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <AdaptiveDpr pixelated />
        
        <fog attach="fog" args={['#fdfcf7', 10, 25]} />

        <CinematicCamera />

        <ambientLight intensity={0.6} color="#ffffff" />
        
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        <pointLight position={[-15, 10, 15]} intensity={0.8} color="#fff8e1" />
        <pointLight position={[5, -5, 10]} intensity={0.4} color="#5c3c24" />

        <Suspense fallback={null}>
          <group position={[isMobile ? 0 : 4.5, isMobile ? -1.2 : -1.8, 0]}>
            {/* Land is static (no Float) and unstructured */}
            <SoilIsland />

            {/* Plants have subtle swaying/floating independently */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
              {/* One very large plant, others smaller */}
              <AloePlant scale={isMobile ? 1.4 : 1.8} position={[0, -1.0, 0]} />
              <AloePlant scale={0.75} position={[3.2, -1.1, 1.8]} />
              <AloePlant scale={0.85} position={[-2.8, -1.1, 2.2]} />
              <AloePlant scale={0.65} position={[1.4, -1.1, -3.2]} />
            </Float>
          </group>

          <ParticleField />
          <Environment preset="park" />

          <ContactShadows
            position={[isMobile ? 0 : 4.5, -2.5, 0]}
            opacity={0.35}
            scale={15}
            blur={3}
            far={10}
            color="#2d2218"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
