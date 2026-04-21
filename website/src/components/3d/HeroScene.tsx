'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import AloePlant from './AloePlant';
import ParticleField from './ParticleField';

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={38} />
        
        {/* Professional Studio Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[20, 20, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#B7E4C7" />
        <directionalLight position={[0, 10, 0]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <AloePlant />
          <ParticleField />
          
          <Environment preset="park" />
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.3} 
            scale={15} 
            blur={2.5} 
            far={4} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
