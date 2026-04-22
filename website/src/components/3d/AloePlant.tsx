'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

// ─── Seeded RNG for reproducible leaf variations ───
function seededRng(seed: number) {
  let s = seed * 2654435761;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 4294967295;
  };
}

// ─── Ultra-Realistic Leaf Geometry ───
function createAloeLeafGeometry(
  length: number,
  baseWidth: number,
  curvature: number,
  seed: number
): THREE.BufferGeometry {
  const rng = seededRng(seed);
  const longSeg = 40; // Higher detail
  const radSeg = 16;
  const baseThick = baseWidth * 0.85; // Very thick, succulent

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Spots (white patches)
  const spotCount = 6 + Math.floor(rng() * 6);
  const spots = Array.from({ length: spotCount }, () => ({
    u: 0.3 + rng() * 0.4,
    v: 0.1 + rng() * 0.8,
    ru: 0.05 + rng() * 0.05,
    rv: 0.04 + rng() * 0.04,
  }));

  for (let i = 0; i <= longSeg; i++) {
    const t = i / longSeg;
    const spineX = Math.sin(t * curvature * 1.5) * length * 0.07;
    const spineZ = -Math.pow(t, 2.5) * length * curvature * 0.15;
    const taper = Math.pow(Math.max(0, 1 - t), 0.7); // Organic taper
    const hw = baseWidth * taper;
    const hh = baseThick * Math.pow(Math.max(0, 1 - t), 0.6);

    for (let j = 0; j <= radSeg; j++) {
      const angle = (j / radSeg) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Convex dorsal, slightly flatter ventral
      const rh = sinA >= 0 ? hh * 1.6 : hh * 0.45;
      positions.push(spineX + cosA * hw, t * length, spineZ + sinA * rh);
      uvs.push(j / radSeg, t);

      // Colors
      const uNorm = j / radSeg;
      const dorsalBlend = Math.max(0, sinA);
      const ventralBlend = Math.max(0, -sinA);

      // Vibrant, deep green
      let r = 0.12 + dorsalBlend * 0.15 - ventralBlend * 0.06;
      let g = 0.45 + dorsalBlend * 0.30 - ventralBlend * 0.18;
      let b = 0.06 + dorsalBlend * 0.12 - ventralBlend * 0.05;

      // Tip variation (dried/young tip)
      const tipFactor = Math.max(0, t - 0.75) * 4;
      r += tipFactor * 0.12; g += tipFactor * 0.08; b += tipFactor * 0.02;

      // Spots
      if (uNorm > 0.2 && uNorm < 0.8) {
        let spotInfl = 0;
        for (const sp of spots) {
          const du = (uNorm - sp.u) / sp.ru;
          const dv = (t - sp.v) / sp.rv;
          const d = Math.sqrt(du * du + dv * dv);
          if (d < 1) spotInfl = Math.max(spotInfl, (1 - d) * 1.2);
        }
        r += (0.8 - r) * spotInfl;
        g += (0.92 - g) * spotInfl;
        b += (0.6 - b) * spotInfl;
      }
      colors.push(r, g, b);
    }
  }

  for (let i = 0; i < longSeg; i++) {
    for (let j = 0; j < radSeg; j++) {
      const a = i * (radSeg + 1) + j;
      const b = (i + 1) * (radSeg + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  // Spines
  const spineStep = 0.12;
  const numSpines = Math.floor(length / spineStep);
  const spineLen = baseWidth * 0.25;
  const spineH = spineLen * 0.4;
  let spineVIdx = (longSeg + 1) * (radSeg + 1);

  for (let si = 0; si < numSpines; si++) {
    const t = (si + 0.5) / numSpines;
    if (t > 0.96) continue;
    const y = t * length;
    const sx = Math.sin(t * curvature * 1.5) * length * 0.07;
    const taper = Math.pow(Math.max(0, 1 - t), 0.7);
    const hw = baseWidth * taper;
    
    // Right spine
    positions.push(sx + hw, y - spineH, 0, sx + hw, y + spineH, 0, sx + hw + spineLen, y, 0.015);
    colors.push(0.9, 1, 0.8, 0.9, 1, 0.8, 1, 1, 0.9);
    uvs.push(0.5, t, 0.5, t, 0.5, t);
    indices.push(spineVIdx, spineVIdx + 1, spineVIdx + 2);
    spineVIdx += 3;

    // Left spine
    positions.push(sx - hw, y - spineH, 0, sx - hw, y + spineH, 0, sx - hw - spineLen, y, 0.015);
    colors.push(0.9, 1, 0.8, 0.9, 1, 0.8, 1, 1, 0.9);
    uvs.push(0.5, t, 0.5, t, 0.5, t);
    indices.push(spineVIdx, spineVIdx + 2, spineVIdx + 1);
    spineVIdx += 3;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─── Localized Water System (Always active, intensifies on hover) ───
const WaterSystem = ({ isWatered }: { isWatered: boolean }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 60; // Increased count
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2.2,
      y: 6 + Math.random() * 6,
      z: (Math.random() - 0.5) * 2.2,
      speed: 2.5 + Math.random() * 2.5,
      phase: Math.random() * 20
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const targetOpacity = isWatered ? 0.8 : 0.35;
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.05);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const cycle = 6;
      const elapsed = (t * p.speed + p.phase) % cycle;
      const py = p.y - elapsed;
      
      // Fall down
      const fy = py < -1.5 ? p.y : py;
      
      dummy.position.set(p.x, fy, p.z);
      // Slightly larger bubbles on hover
      const scale = isWatered ? 0.022 : 0.016;
      dummy.scale.setScalar(scale + Math.sin(t * 2 + p.phase) * 0.005);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshPhysicalMaterial 
        color="#d0e9ff" 
        transparent 
        opacity={0.3} 
        roughness={0.01} 
        metalness={0.2} 
        clearcoat={1}
        transmission={0.5}
        thickness={0.5}
      />
    </instancedMesh>
  );
};

// ─── Individual Leaf Component ───
const AloeLeaf = ({ cfg, isWatered }: { cfg: any, isWatered: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => createAloeLeafGeometry(cfg.length, cfg.baseWidth, cfg.curvature, cfg.seed), [cfg]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Gentle organic swaying
    const swayZ = Math.sin(t * 0.4 + cfg.seed) * 0.02;
    const swayX = Math.cos(t * 0.3 + cfg.seed) * 0.01;
    meshRef.current.rotation.z = cfg.tilt + swayZ;
    meshRef.current.rotation.x = swayX;
    meshRef.current.rotation.y = cfg.azimuth;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        vertexColors
        roughness={0.15}
        metalness={0.02}
        clearcoat={0.9}
        clearcoatRoughness={0.05}
        reflectivity={1}
        sheen={0.5}
        sheenColor="#ffffff"
      />
    </mesh>
  );
};

// ─── Main AloePlant Component ───
export default function AloePlant({ scale = 1, position = [0, 0, 0] as [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null!);

  const leafConfigs = useMemo(() => {
    const configs: any[] = [];
    const rings = [
      { n: 6, tilt: 1.1, len: 4.5, w: 0.4, curv: 0.8 },
      { n: 5, tilt: 0.7, len: 3.5, w: 0.3, curv: 0.5 },
      { n: 4, tilt: 0.3, len: 2.2, w: 0.2, curv: 0.2 },
    ];
    let seed = 1;
    rings.forEach((r, ri) => {
      for (let i = 0; i < r.n; i++) {
        configs.push({
          azimuth: (i / r.n) * Math.PI * 2 + (ri * 0.5),
          tilt: r.tilt,
          length: r.len,
          baseWidth: r.w,
          curvature: r.curv,
          seed: seed++,
        });
      }
    });
    return configs;
  }, []);

  useFrame(({ clock }) => {
    const breath = Math.sin(clock.elapsedTime * 0.4) * 0.01;
    groupRef.current.scale.setScalar(scale + breath);
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <WaterSystem isWatered={hovered} />
      {leafConfigs.map((cfg, i) => (
        <AloeLeaf key={i} cfg={cfg} isWatered={hovered} />
      ))}
    </group>
  );
}
