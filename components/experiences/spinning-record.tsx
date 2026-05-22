"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function Disc() {
  const group = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group} rotation={[Math.PI * 0.18, 0, 0]}>
      {/* Vinyl body */}
      <mesh>
        <cylinderGeometry args={[1.14, 1.14, 0.014, 96]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          metalness={0.1}
          roughness={0.45}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Subtle outer groove ring */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.13, 96]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.58, 96]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Center label (gold) */}
      <mesh position={[0, 0.0085, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.0008, 64]} />
        <meshPhysicalMaterial
          color="#d9a85a"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Center hole */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

export function SpinningRecord() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      {/* Gold halo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-15%",
          background:
            "radial-gradient(circle, oklch(74% 0.15 65 / 0.22), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Canvas
        camera={{ position: [0, 1.5, 2.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <Environment preset="studio" />
        <Disc />
      </Canvas>
    </div>
  );
}
