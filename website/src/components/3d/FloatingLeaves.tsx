'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AloeLeaf = ({ position, rotation, scale }: { position: [number, number, number], rotation: [number, number, number], scale: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a custom bent geometry for the aloe leaf
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Simple leaf profile
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.5, 2, 0, 4);
    shape.quadraticCurveTo(-0.5, 2, 0, 0);
    
    const extrudeSettings = {
      steps: 2,
      depth: 0.1,
      beveledEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 4
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle floating motion
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.z += 0.001;
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      geometry={leafGeometry}
    >
      <meshStandardMaterial 
        color="#52B788" 
        emissive="#2D6A4F" 
        emissiveIntensity={0.2} 
        roughness={0.3} 
        metalness={0.1} 
      />
    </mesh>
  );
};

export default function FloatingLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 5
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      scale: Math.random() * 0.5 + 0.2
    }));
  }, []);

  return (
    <group>
      {leaves.map((props, i) => (
        <AloeLeaf key={i} {...props} />
      ))}
    </group>
  );
}
