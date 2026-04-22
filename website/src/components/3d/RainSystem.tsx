'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const DROP_COUNT = 120;

export default function RainSystem({ target }: { target: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { mouse } = useThree();

  // Each drop: [x, y, z, speed, phase, xDrift]
  const drops = useMemo(() => {
    const rng = (n: number) => {
      let s = n * 1664525 + 1013904223;
      return ((s >>> 0) / 0xffffffff);
    };
    return Array.from({ length: DROP_COUNT }, (_, i) => ({
      x: target[0] + (rng(i * 3)     - 0.5) * 7,
      y: target[1] + 5 + rng(i * 3 + 1) * 4,
      z: target[2] + (rng(i * 3 + 2) - 0.5) * 3,
      speed: 4.5 + rng(i * 7) * 3,
      phase: rng(i * 11) * 8,
      xDrift: (rng(i * 13) - 0.5) * 0.4,
      len: 0.06 + rng(i * 17) * 0.08,
    }));
  }, [target]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const matrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    for (let i = 0; i < DROP_COUNT; i++) {
      const d = drops[i];
      const elapsed = (t * d.speed + d.phase) % 6;
      const dropY = d.y - elapsed;

      // Reset when fallen below pot - focus on "watering" the plant
      const fy = dropY < target[1] - 0.5 ? d.y : dropY;
      
      // Add slight spiral motion for "watering" effect
      const fx = d.x + Math.sin(t * 2 + d.phase) * 0.15;
      const fz = d.z + Math.cos(t * 2 + d.phase) * 0.15;

      dummy.position.set(fx, fy, fz);
      // Small bubbles/droplets
      dummy.scale.setScalar(0.012 + Math.sin(t + d.phase) * 0.005);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DROP_COUNT]}>
      <sphereGeometry args={[1, 12, 10]} />
      <meshPhysicalMaterial
        color="#cce8ff"
        transparent
        opacity={0.5}
        roughness={0.02}
        metalness={0.1}
        clearcoat={1}
      />
    </instancedMesh>
  );
}
