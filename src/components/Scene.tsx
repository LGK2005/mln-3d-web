"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  MeshDistortMaterial,
  Float,
  Stars,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

/* ─── Imperial Gold Sphere ─── */
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#d4af37"
          roughness={0.2}
          metalness={0.95}
          distort={0.3}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

/* ─── Orbital Rings ─── */
function FloatingRing({
  position,
  color,
  rotationSpeed,
  radius = 1.2,
}: {
  position: [number, number, number];
  color: string;
  rotationSpeed: number;
  radius?: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x =
        Math.sin(clock.getElapsedTime() * rotationSpeed) * 0.5;
      ringRef.current.rotation.z =
        clock.getElapsedTime() * rotationSpeed * 0.5;
    }
  });

  return (
    <mesh ref={ringRef} position={position}>
      <torusGeometry args={[radius, 0.03, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        metalness={0.95}
        roughness={0.05}
      />
    </mesh>
  );
}

/* ─── Gold Particle Field ─── */
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 600;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.015;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.008;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4af37"
        size={0.03}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Ambient Glow Orbs ─── */
function GlowOrb({
  position,
  color,
  intensity = 0.8,
}: {
  position: [number, number, number];
  color: string;
  intensity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.15}
      />
    </mesh>
  );
}

/* ─── Main Scene Export ─── */
export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#fff5e0" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#d4af37" />
      <pointLight position={[5, -3, 2]} intensity={0.3} color="#b52619" />

      <AnimatedSphere />

      {/* Gold & Crimson orbital rings */}
      <FloatingRing position={[0, 0, 0]} color="#d4af37" rotationSpeed={0.7} radius={1.4} />
      <FloatingRing position={[0, 0, 0]} color="#b52619" rotationSpeed={-0.5} radius={1.6} />
      <FloatingRing position={[0, 0, 0]} color="#735c00" rotationSpeed={0.3} radius={2.0} />

      {/* Ambient glow orbs */}
      <GlowOrb position={[-3, 2, -3]} color="#d4af37" intensity={0.6} />
      <GlowOrb position={[3, -2, -4]} color="#b52619" intensity={0.4} />

      <ParticleField />
      <Stars
        radius={50}
        depth={50}
        count={800}
        factor={2.5}
        saturation={0.2}
        fade
        speed={0.8}
      />

      <Environment preset="night" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}
