'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Leaf = ({ rotation, position, scale, delay = 0 }: { rotation: [number, number, number], position: [number, number, number], scale: number, delay?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.4, 1.5, 0, 3.5);
    shape.quadraticCurveTo(-0.4, 1.5, 0, 0);
    
    const extrudeSettings = {
      steps: 4,
      depth: 0.05,
      beveledEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 4
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + delay;
    // Subtler, more organic movement
    meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.05 + rotation[2];
    meshRef.current.position.y = Math.sin(t * 0.3) * 0.02 + position[1];
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      geometry={leafGeometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        color="#386641" 
        roughness={0.4} 
        metalness={0.1}
        emissive="#1a332a"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

export default function AloePlant() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Elegant Mouse Parallax
    const mouseX = (state.mouse.x * 0.5);
    const mouseY = (state.mouse.y * 0.5);
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX * 0.2, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY * 0.1, 0.1);
  });

  return (
    <group ref={groupRef}>
      {/* Central Cluster - Shifted Right */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <group position={[3, -1.5, 0]}>
          <Leaf position={[0, 0, 0]} rotation={[0.4, 0, 0]} scale={1.2} delay={0} />
          <Leaf position={[0.2, 0, 0.2]} rotation={[0.5, 1.2, 0.1]} scale={1} delay={1} />
          <Leaf position={[-0.2, 0, 0.2]} rotation={[0.5, -1.2, -0.1]} scale={1} delay={2} />
          <Leaf position={[0.4, 0, -0.2]} rotation={[0.6, 2.5, 0.2]} scale={0.8} delay={3} />
          <Leaf position={[-0.4, 0, -0.2]} rotation={[0.6, -2.5, -0.2]} scale={0.8} delay={4} />
          <Leaf position={[0, 0.5, 0.1]} rotation={[0.2, 0, 0]} scale={0.6} delay={5} />
        </group>
      </Float>
      
      {/* Distant Artistic Leaves for Depth */}
      <group>
        <Leaf position={[-6, 4, -4]} rotation={[2, 1, 0.5]} scale={1.5} delay={10} />
        <Leaf position={[7, -3, -5]} rotation={[-1, -1, 0.8]} scale={2} delay={15} />
        <Leaf position={[-4, -5, -3]} rotation={[0.5, 0.5, 3]} scale={1.2} delay={20} />
      </group>
    </group>
  );
}
