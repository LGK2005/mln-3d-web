"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Stars,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

import { SceneSettings, defaultSettings } from "./sceneConfig";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Props
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface InteractiveSceneProps {
  activeNodeId: string;
  settings: SceneSettings;
  playTrigger: number;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Easing
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. CẢM GIÁC (Sensation) — "Sensory Receptor"
   Phản ánh thuộc tính riêng lẻ của sự vật thông qua giác quan.
   Một hạt nhân trung tâm phát sáng, 8 thụ thể vươn ra xung quanh.
   Khi Play, tín hiệu điện chạy cực nhanh từ các thụ thể vào lõi làm lõi bừng sáng.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SensationModel({ playTrigger }: { playTrigger: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const pulseLightRef = useRef<THREE.PointLight>(null!);
  const signalGlowsRef = useRef<THREE.Mesh[]>([]);
  const enterProgress = useRef(0);
  const playProgress = useRef(-1);
  const lastTrigger = useRef(playTrigger);

  // 8 hướng của các thụ thể giác quan hướng ra ngoài
  const receptors = useMemo(() => {
    const dirs = [
      new THREE.Vector3(1, 1, 1).normalize(),
      new THREE.Vector3(1, 1, -1).normalize(),
      new THREE.Vector3(1, -1, 1).normalize(),
      new THREE.Vector3(1, -1, -1).normalize(),
      new THREE.Vector3(-1, 1, 1).normalize(),
      new THREE.Vector3(-1, 1, -1).normalize(),
      new THREE.Vector3(-1, -1, 1).normalize(),
      new THREE.Vector3(-1, -1, -1).normalize(),
    ];
    return dirs.map((dir, i) => ({
      id: i,
      dir,
      length: 1.8,
      size: 0.12,
    }));
  }, []);

  useEffect(() => {
    if (playTrigger !== lastTrigger.current && playTrigger > 0) {
      playProgress.current = 0;
      lastTrigger.current = playTrigger;
    }
  }, [playTrigger]);

  useFrame(({ clock }, delta) => {
    // Hoạt ảnh xuất hiện
    if (enterProgress.current < 1) {
      enterProgress.current = Math.min(1, enterProgress.current + delta * 1.8);
      groupRef.current.scale.setScalar(easeOutBack(enterProgress.current));
    }

    const t = clock.getElapsedTime();

    // Trạng thái rảnh rỗi (Idle)
    let coreScale = 1.0 + Math.sin(t * 2.0) * 0.08;
    let coreEmissive = 0.4 + Math.sin(t * 2.0) * 0.15;
    let signalPosRatio = -1; // Ẩn xung điện

    // Hoạt ảnh tương tác (Play)
    if (playProgress.current >= 0 && playProgress.current < 1) {
      playProgress.current = Math.min(1, playProgress.current + delta * 0.75); // chạy trong 1.33 giây
      const p = playProgress.current;

      if (p < 0.4) {
        // Xung điện chạy từ ngoài thụ thể vào trong lõi
        signalPosRatio = 1.0 - (p / 0.4); // chạy từ 1.0 về 0
        coreScale = 0.95;
        coreEmissive = 0.2;
      } else if (p < 0.7) {
        // Lõi bừng sáng rực rỡ khi tiếp nhận tín hiệu
        const peak = (p - 0.4) / 0.3;
        const burst = easeOutElastic(peak);
        coreScale = 1.0 + burst * 0.7;
        coreEmissive = 0.4 + burst * 1.6;
        signalPosRatio = 0;
      } else {
        // Settle về trạng thái ban đầu
        const settle = (p - 0.7) / 0.3;
        coreScale = 1.7 - settle * 0.7;
        coreEmissive = 2.0 - settle * 1.6;
        signalPosRatio = -1;
      }

      if (playProgress.current >= 1) playProgress.current = -1;
    }

    // Cập nhật lõi trung tâm
    if (coreRef.current) {
      coreRef.current.scale.setScalar(coreScale);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = coreEmissive;
    }

    // Cập nhật điểm sáng xung điện chạy dọc xúc tu
    signalGlowsRef.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const rec = receptors[idx];
      if (signalPosRatio >= 0) {
        mesh.visible = true;
        const pos = rec.dir.clone().multiplyScalar(rec.length * signalPosRatio);
        mesh.position.copy(pos);
        mesh.scale.setScalar(0.18 * (1 + Math.sin(t * 10) * 0.2));
      } else {
        mesh.visible = false;
      }
    });

    if (pulseLightRef.current) {
      pulseLightRef.current.intensity = 1.5 + coreEmissive * 1.5;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Lõi trung tâm nhận thức (Giác quan) */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      </Float>

      {/* 8 Thụ thể hướng ra ngoài */}
      {receptors.map((rec, i) => {
        // Dựng một đường xiên mảnh biểu thị dây thần kinh xúc giác
        const start = new THREE.Vector3(0, 0, 0);
        const end = rec.dir.clone().multiplyScalar(rec.length);
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        
        // Tạo quaternion xoay cylinder hướng theo vector dir
        const alignAxis = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(alignAxis, rec.dir);

        return (
          <group key={rec.id}>
            {/* Dây dẫn thụ thể */}
            <mesh position={midPoint} quaternion={quat}>
              <cylinderGeometry args={[0.015, 0.025, rec.length, 8]} />
              <meshStandardMaterial
                color="#735c00"
                metalness={0.95}
                roughness={0.1}
                transparent
                opacity={0.7}
              />
            </mesh>

            {/* Đầu cảm biến thụ thể phát sáng ở ngoài cùng */}
            <mesh position={end}>
              <sphereGeometry args={[rec.size, 16, 16]} />
              <meshStandardMaterial
                color="#e9c349"
                emissive="#e9c349"
                emissiveIntensity={0.6}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Xung điện cảm giác chạy dọc dây dẫn khi Play */}
            <mesh
              ref={(el) => {
                if (el) signalGlowsRef.current[i] = el;
              }}
              visible={false}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}

      <pointLight ref={pulseLightRef} position={[0, 0, 0]} color="#d4af37" intensity={1.5} distance={8} />
    </group>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. TRI GIÁC (Perception) — "Synthesizing Puzzle"
   Tổng hợp các cảm giác rời rạc thành hình ảnh trọn vẹn của sự vật.
   Lõi đa diện sáng, bao quanh bởi 5 khối hình học khác nhau (biểu thị các thuộc tính rời rạc).
   Khi Play, các khối này tụ họp khít lại thành một khối thống nhất tại tâm, rồi giãn ra.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PerceptionModel({ playTrigger }: { playTrigger: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const piecesRef = useRef<THREE.Group[]>([]);
  const centerRef = useRef<THREE.Mesh>(null!);
  const enterProgress = useRef(0);
  const playProgress = useRef(-1);
  const lastTrigger = useRef(playTrigger);

  // 5 khối hình học đại diện cho các thuộc tính cảm tính khác nhau của cùng 1 vật thể
  const piecesData = useMemo(() => [
    { type: "box", color: "#d4af37", dir: new THREE.Vector3(1.6, 1.2, 0).normalize(), scale: 0.32 },
    { type: "sphere", color: "#b52619", dir: new THREE.Vector3(-1.6, 1.0, 0.8).normalize(), scale: 0.28 },
    { type: "cone", color: "#e9c349", dir: new THREE.Vector3(0, -1.8, 0.5).normalize(), scale: 0.35 },
    { type: "torus", color: "#8a6d1c", dir: new THREE.Vector3(-1.2, -1.2, -1.0).normalize(), scale: 0.25 },
    { type: "tetra", color: "#ff8c00", dir: new THREE.Vector3(0.5, 1.6, -1.2).normalize(), scale: 0.3 },
  ], []);

  useEffect(() => {
    if (playTrigger !== lastTrigger.current && playTrigger > 0) {
      playProgress.current = 0;
      lastTrigger.current = playTrigger;
    }
  }, [playTrigger]);

  useFrame(({ clock }, delta) => {
    if (enterProgress.current < 1) {
      enterProgress.current = Math.min(1, enterProgress.current + delta * 1.8);
      groupRef.current.scale.setScalar(easeOutBack(enterProgress.current));
    }

    const t = clock.getElapsedTime();
    let distMultiplier = 1.0;
    let coreGlow = 0.5;
    let rotationSpeed = 0.6;

    // Hoạt ảnh tương tác (Play)
    if (playProgress.current >= 0 && playProgress.current < 1) {
      playProgress.current = Math.min(1, playProgress.current + delta * 0.6); // chạy trong 1.67s
      const p = playProgress.current;

      if (p < 0.45) {
        // Hội tụ: các khối bay sát về trung tâm và quay nhanh
        const progress = p / 0.45;
        distMultiplier = 1.0 - easeOutQuad(progress) * 0.85; // sát về R * 0.15
        coreGlow = 0.5 + progress * 0.5;
        rotationSpeed = 0.6 + progress * 4.0;
      } else if (p < 0.65) {
        // Kết hợp bừng sáng đồng nhất hoàn chỉnh
        const peak = (p - 0.45) / 0.2;
        distMultiplier = 0.15;
        coreGlow = 1.0 + easeOutElastic(peak) * 1.5;
        rotationSpeed = 4.6;
      } else {
        // Tản ra lại vị trí ban đầu
        const settle = (p - 0.65) / 0.35;
        distMultiplier = 0.15 + settle * 0.85;
        coreGlow = 2.5 - settle * 2.0;
        rotationSpeed = 4.6 - settle * 4.0;
      }

      if (playProgress.current >= 1) playProgress.current = -1;
    }

    // Xoay toàn bộ group để tăng tính sống động
    groupRef.current.rotation.y = t * 0.15;

    // Cập nhật vị trí các mảnh ghép cảm giác rời rạc
    piecesRef.current.forEach((meshGroup, idx) => {
      if (!meshGroup) return;
      const data = piecesData[idx];
      const baseDistance = 2.2;
      const dist = baseDistance * distMultiplier;
      
      // Chuyển động lơ lửng hình sin nhẹ nhàng khi Idle
      const floatOffset = Math.sin(t * 1.5 + idx) * 0.08;
      const targetPos = data.dir.clone().multiplyScalar(dist + floatOffset);
      meshGroup.position.copy(targetPos);

      // Tự xoay của các khối
      meshGroup.rotation.x = t * rotationSpeed * (idx % 2 === 0 ? 1 : -1) + idx;
      meshGroup.rotation.y = t * rotationSpeed * 0.8 + idx;
    });

    if (centerRef.current) {
      centerRef.current.scale.setScalar(0.75 + Math.sin(t * 2.5) * 0.05 + (coreGlow - 0.5) * 0.3);
      const mat = centerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = coreGlow;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Lõi tổng hợp tri giác ở chính giữa */}
      <mesh ref={centerRef}>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#d4af37"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>

      {/* Các mảnh ghép thuộc tính cảm giác rời rạc */}
      {piecesData.map((data, i) => {
        return (
          <group
            key={i}
            ref={(el) => {
              if (el) piecesRef.current[i] = el;
            }}
          >
            {/* Lưới liên kết sáng nối về tâm */}
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 2.0, 4]} />
              <meshBasicMaterial
                color="#d4af37"
                transparent
                opacity={0.25}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Khối thuộc tính */}
            <mesh scale={data.scale} position={[0, 0, 0]}>
              {data.type === "box" && <boxGeometry args={[1, 1, 1]} />}
              {data.type === "sphere" && <sphereGeometry args={[0.6, 16, 16]} />}
              {data.type === "cone" && <coneGeometry args={[0.6, 1.0, 16]} />}
              {data.type === "torus" && <torusGeometry args={[0.4, 0.15, 8, 16]} />}
              {data.type === "tetra" && <tetrahedronGeometry args={[0.7, 0]} />}

              <meshStandardMaterial
                color={data.color}
                emissive={data.color}
                emissiveIntensity={0.25}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      <pointLight position={[0, 0, 0]} color="#d4af37" intensity={1.2} distance={6} />
    </group>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. BIỂU TƯỢNG (Representation) — "Memory Crystal Mirror"
   Hình ảnh cảm tính cao nhất, tái hiện ký ức khi không còn vật thể.
   Một tinh thể kim cương pha lê mờ ảo tự xoay, bao quanh bởi đám mây hạt nơ-ron ký ức.
   Khi Play, phát ra sóng quét hologram lan tỏa, làm các hạt nơ-ron ký ức bừng sáng.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function RepresentationModel({ playTrigger }: { playTrigger: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const crystalGroupRef = useRef<THREE.Group>(null!);
  const scanwaveRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const enterProgress = useRef(0);
  const playProgress = useRef(-1);
  const lastTrigger = useRef(playTrigger);

  // Tạo đám mây hạt nơ-ron ký ức xung quanh tinh thể
  const particleCount = 180;
  const { particlePositions, particleSizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // Phân bố các hạt trong một vỏ cầu bán kính R = 1.8 đến 2.6
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.8 + Math.random() * 0.8;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.03 + Math.random() * 0.05;
    }
    return { particlePositions: pos, particleSizes: sizes };
  }, []);

  useEffect(() => {
    if (playTrigger !== lastTrigger.current && playTrigger > 0) {
      playProgress.current = 0;
      lastTrigger.current = playTrigger;
    }
  }, [playTrigger]);

  useFrame(({ clock }, delta) => {
    if (enterProgress.current < 1) {
      enterProgress.current = Math.min(1, enterProgress.current + delta * 1.8);
      groupRef.current.scale.setScalar(easeOutBack(enterProgress.current));
    }

    const t = clock.getElapsedTime();

    // Idle
    let crystalFloat = Math.sin(t * 1.2) * 0.06;
    let waveScale = 0.1;
    let waveOpacity = 0.0;
    let ptsIntensity = 0.5 + Math.sin(t * 3.0) * 0.15; // nhấp nháy nhẹ

    // Play: Phát sóng quét hologram ký ức bừng sáng
    if (playProgress.current >= 0 && playProgress.current < 1) {
      playProgress.current = Math.min(1, playProgress.current + delta * 0.5); // chạy trong 2 giây
      const p = playProgress.current;

      // Sóng hologram quét ra từ trung tâm R = 0.1 -> R = 3.0
      waveScale = 0.1 + p * 3.2;
      
      if (p < 0.2) {
        waveOpacity = p / 0.2 * 0.45;
      } else if (p < 0.9) {
        waveOpacity = 0.45 * (1.0 - (p - 0.2) / 0.7);
      } else {
        waveOpacity = 0;
      }

      // Kích hoạt bừng sáng các hạt khi sóng quét chạm vào
      ptsIntensity = 0.5 + Math.sin(p * Math.PI) * 2.0;

      if (playProgress.current >= 1) playProgress.current = -1;
    }

    // Xoay tinh thể pha lê ký ức
    if (crystalGroupRef.current) {
      crystalGroupRef.current.position.y = crystalFloat;
      crystalGroupRef.current.rotation.y = t * 0.35;
      crystalGroupRef.current.rotation.x = t * 0.1;
    }

    // Cập nhật sóng quét hologram
    if (scanwaveRef.current) {
      scanwaveRef.current.scale.setScalar(waveScale);
      const mat = scanwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = waveOpacity;
      scanwaveRef.current.visible = waveOpacity > 0;
    }

    // Cập nhật đám mây điểm
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.3 + ptsIntensity * 0.3;
      mat.size = 0.035 * (1.0 + ptsIntensity * 0.5);
      pointsRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Tinh thể ký ức lăng trụ kim cương đôi ở giữa (Memory Crystal) */}
      <group ref={crystalGroupRef}>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.65, 0.9, 4, 1]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.8}
            emissive="#d4af37"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.65, 0.9, 4, 1]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.8}
            emissive="#d4af37"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Vòng viền năng lượng bọc quanh tinh thể */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.03, 8, 32]} />
          <meshBasicMaterial color="#b52619" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Sóng quét Hologram khi tương tác */}
      <mesh ref={scanwaveRef} scale={0.1} visible={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.0}
          wireframe
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Đám mây hạt điểm thần kinh ký ức (Point Cloud Neural Mesh) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#e9c349"
          size={0.04}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      {/* Ánh sáng ký ức mờ ảo */}
      <pointLight position={[0, 0, 0]} color="#d4af37" intensity={1.0} distance={6} />
    </group>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. KHÁI NIỆM (Concept) — "Abstract Core & Mathematical Orbits"
   Nhận thức lý tính, bóc tách hiện tượng tìm bản chất bên trong.
   Lõi pha lê bát diện vàng. 3 vòng quỹ đạo đồng tâm đan chéo xoay theo 3 chiều.
   Khi Play, quỹ đạo tăng tốc cực nhanh, lõi bát diện bóc tách tách đôi để lộ nhân phát sáng đỏ rực.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ConceptModel({ playTrigger }: { playTrigger: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);
  const ring3Ref = useRef<THREE.Group>(null!);
  
  const coreTopRef = useRef<THREE.Mesh>(null!);
  const coreBottomRef = useRef<THREE.Mesh>(null!);
  const coreEssenceRef = useRef<THREE.Mesh>(null!);
  
  const enterProgress = useRef(0);
  const playProgress = useRef(-1);
  const lastTrigger = useRef(playTrigger);

  useEffect(() => {
    if (playTrigger !== lastTrigger.current && playTrigger > 0) {
      playProgress.current = 0;
      lastTrigger.current = playTrigger;
    }
  }, [playTrigger]);

  useFrame(({ clock }, delta) => {
    if (enterProgress.current < 1) {
      enterProgress.current = Math.min(1, enterProgress.current + delta * 1.8);
      groupRef.current.scale.setScalar(easeOutBack(enterProgress.current));
    }

    const t = clock.getElapsedTime();
    let orbitSpeed = 1.0;
    let splitDist = 0.0; // Khoảng cách bóc tách vỏ pha lê bát diện
    let essenceGlow = 0.3;

    // Play: Tăng tốc quỹ đạo logic, bóc tách tìm bản chất lõi
    if (playProgress.current >= 0 && playProgress.current < 1) {
      playProgress.current = Math.min(1, playProgress.current + delta * 0.45); // chạy trong ~2.2 giây
      const p = playProgress.current;

      if (p < 0.35) {
        // Tăng tốc độ quay và bắt đầu bóc tách tách đôi vỏ bát diện
        const factor = p / 0.35;
        orbitSpeed = 1.0 + factor * 5.0;
        splitDist = easeOutQuad(factor) * 0.45; // trượt ra ngoài 0.45 đơn vị
        essenceGlow = 0.3 + factor * 1.2;
      } else if (p < 0.7) {
        // Giữ nguyên trạng thái bóc tách rực sáng
        orbitSpeed = 6.0;
        splitDist = 0.45;
        essenceGlow = 1.5 + Math.sin(t * 12.0) * 0.3; // nhấp nháy năng lượng mạnh
      } else {
        // Thu vỏ lại khít khao, quỹ đạo giảm tốc
        const factor = (p - 0.7) / 0.3;
        orbitSpeed = 6.0 - factor * 5.0;
        splitDist = 0.45 - easeOutQuad(factor) * 0.45;
        essenceGlow = 1.8 - factor * 1.5;
      }

      if (playProgress.current >= 1) playProgress.current = -1;
    }

    // Xoay các vòng quỹ đạo toán học đồng tâm theo các trục độc lập
    if (ring1Ref.current) ring1Ref.current.rotation.y = t * 0.5 * orbitSpeed;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.4 * orbitSpeed;
    if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.6 * orbitSpeed;

    // Trượt nửa trên khối bát diện lên
    if (coreTopRef.current) {
      coreTopRef.current.position.y = splitDist;
      coreTopRef.current.rotation.y = t * 0.3;
    }

    // Trượt nửa dưới khối bát diện xuống
    if (coreBottomRef.current) {
      coreBottomRef.current.position.y = -splitDist;
      coreBottomRef.current.rotation.y = -t * 0.3;
    }

    // Cập nhật nhân bản chất phát sáng đỏ rực bên trong
    if (coreEssenceRef.current) {
      coreEssenceRef.current.scale.setScalar(0.35 + (splitDist * 0.4) + Math.sin(t * 8.0) * 0.03);
      const mat = coreEssenceRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = essenceGlow * 2.0;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Vòng Quỹ đạo 1 (Nằm ngang XZ) */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.015, 8, 64]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Đính 1 hạt tròn biểu thị hạt tri thức di chuyển */}
        <mesh position={[1.7, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#e9c349" />
        </mesh>
      </group>

      {/* Vòng Quỹ đạo 2 (Thẳng đứng YZ) */}
      <group ref={ring2Ref}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.9, 0.015, 8, 64]} />
          <meshStandardMaterial color="#735c00" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#e9c349" />
        </mesh>
      </group>

      {/* Vòng Quỹ đạo 3 (Chéo góc XY) */}
      <group ref={ring3Ref}>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[2.1, 0.015, 8, 64]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0, 2.1]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Lõi thực thể bản chất tinh xảo bát diện chia hai nửa */}
      <group>
        {/* Nhân bản chất rực lửa đỏ giấu kín bên trong (Essence Core) */}
        <mesh ref={coreEssenceRef}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial
            color="#b52619"
            emissive="#b52619"
            emissiveIntensity={0.6}
            metalness={0.1}
            roughness={0.5}
          />
        </mesh>

        {/* Nửa trên bát diện vỏ bọc pha lê */}
        <mesh ref={coreTopRef}>
          <coneGeometry args={[0.7, 0.7, 4, 1]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={0.2}
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Nửa dưới bát diện vỏ bọc pha lê */}
        <mesh ref={coreBottomRef} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.7, 0.7, 4, 1]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={0.2}
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      <pointLight position={[0, 0, 0]} color="#d4af37" intensity={1.2} distance={6} />
    </group>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. THỰC TIỄN (Practice) — "Engine of Labor & Transformation"
   Hoạt động vật chất cải tạo thế giới. Tiêu chuẩn chân lý.
   3 bánh răng 3D (Cogs) khớp răng đan vào nhau quay liên tục. Ở tâm là nhân lửa cách mạng.
   Khi Play, cogs quay cực nhanh, các hạt tia lửa sáng bắn tung tóe từ các điểm tiếp xúc cơ khí.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface SparkParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

// Component Bánh răng 3D tự thiết kế
function Cogwheel({
  radius,
  thickness,
  teethCount,
  color,
  rotationRef,
}: {
  radius: number;
  thickness: number;
  teethCount: number;
  color: string;
  rotationRef: React.MutableRefObject<THREE.Group>;
}) {
  // Tạo danh sách các răng cưa hộp phân bố đều xung quanh rìa hình trụ
  const teeth = useMemo(() => {
    const arr = [];
    const toothSize = [radius * 0.15, thickness * 1.1, radius * 0.15]; // rộng, cao, sâu
    for (let i = 0; i < teethCount; i++) {
      const angle = (i / teethCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      arr.push({
        id: i,
        pos: [x, 0, z] as [number, number, number],
        rot: [0, -angle, 0] as [number, number, number],
        scale: toothSize as [number, number, number],
      });
    }
    return arr;
  }, [radius, thickness, teethCount]);

  return (
    <group ref={rotationRef}>
      {/* Đĩa bánh răng hình trụ chính giữa */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, thickness, 24]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Đĩa lõi trong rỗng lỗ tròn trục */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, thickness * 1.05, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Răng cưa phân bố xung quanh */}
      {teeth.map((t) => (
        <mesh key={t.id} position={t.pos} rotation={t.rot}>
          <boxGeometry args={t.scale} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function PracticeModel({ playTrigger }: { playTrigger: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  
  // Ref để truy cập góc xoay trực tiếp ở useFrame giúp mượt mà
  const cogMainRef = useRef<THREE.Group>(null!);
  const cogSub1Ref = useRef<THREE.Group>(null!);
  const cogSub2Ref = useRef<THREE.Group>(null!);
  const flameCoreRef = useRef<THREE.Mesh>(null!);
  const sparksPointsRef = useRef<THREE.Points>(null!);

  const enterProgress = useRef(0);
  const playProgress = useRef(-1);
  const lastTrigger = useRef(playTrigger);

  // Quản lý hạt tia lửa (Mechanical Sparks)
  const maxSparks = 100;
  const sparksList = useRef<SparkParticle[]>([]);
  const sparksGeometryData = useMemo(() => new Float32Array(maxSparks * 3), []);

  useEffect(() => {
    if (playTrigger !== lastTrigger.current && playTrigger > 0) {
      playProgress.current = 0;
      lastTrigger.current = playTrigger;
    }
  }, [playTrigger]);

  useFrame(({ clock }, delta) => {
    if (enterProgress.current < 1) {
      enterProgress.current = Math.min(1, enterProgress.current + delta * 1.8);
      groupRef.current.scale.setScalar(easeOutBack(enterProgress.current));
    }

    const t = clock.getElapsedTime();
    let speedMultiplier = 1.0;
    let flameScale = 1.0;
    let sparkSpawnRate = 0.0; // không sinh tia lửa khi Idle

    // Play: Động cơ thực tiễn tăng tốc quay, bắn tia lửa cơ khí mãnh liệt
    if (playProgress.current >= 0 && playProgress.current < 1) {
      playProgress.current = Math.min(1, playProgress.current + delta * 0.35); // chạy trong ~2.8s
      const p = playProgress.current;

      if (p < 0.25) {
        const factor = p / 0.25;
        speedMultiplier = 1.0 + factor * 6.5; // Đạt tốc độ cực đại x7.5
        flameScale = 1.0 + factor * 0.5;
        sparkSpawnRate = factor * 0.8;
      } else if (p < 0.75) {
        speedMultiplier = 7.5;
        flameScale = 1.5 + Math.sin(t * 20.0) * 0.15;
        sparkSpawnRate = 1.0; // Tốc độ sinh tia lửa cực đại
      } else {
        const factor = (p - 0.75) / 0.25;
        speedMultiplier = 7.5 - factor * 6.5;
        flameScale = 1.5 - factor * 0.5;
        sparkSpawnRate = (1.0 - factor) * 0.4;
      }

      if (playProgress.current >= 1) playProgress.current = -1;
    }

    // Cập nhật xoay bánh răng Main (nằm ngang)
    if (cogMainRef.current) {
      cogMainRef.current.rotation.y += delta * 0.8 * speedMultiplier;
    }

    // Bánh răng Sub 1 ăn khớp (phía trên bên trái) - tỉ lệ R to/R sub1 = 1.3 / 0.9. Quay ngược chiều
    if (cogSub1Ref.current) {
      cogSub1Ref.current.rotation.y -= delta * 0.8 * (1.3 / 0.9) * speedMultiplier;
    }

    // Bánh răng Sub 2 ăn khớp (phía dưới bên phải) - tỉ lệ R to/R sub2 = 1.3 / 0.6. Quay ngược chiều
    if (cogSub2Ref.current) {
      cogSub2Ref.current.rotation.y -= delta * 0.8 * (1.3 / 0.6) * speedMultiplier;
    }

    // Nhân năng lượng nhấp nháy
    if (flameCoreRef.current) {
      flameCoreRef.current.scale.setScalar(flameScale * (1.0 + Math.sin(t * 15.0) * 0.05));
    }

    // ── XỬ LÝ HẠT TIA LỬA BẮN TUNG TÓE (SPARK EMITTER) ──
    // Vị trí các điểm tiếp xúc cơ học ăn khớp bánh răng để sinh tia lửa:
    // Điểm tiếp xúc 1: Main và Sub 1 -> [-0.75, 0, 0.65]
    // Điểm tiếp xúc 2: Main và Sub 2 -> [0.65, 0, -0.65]
    const spawnPositions = [
      new THREE.Vector3(-0.75, 0.0, 0.65),
      new THREE.Vector3(0.65, 0.0, -0.65),
    ];

    // Sinh hạt ngẫu nhiên dựa trên tỉ lệ spawn
    if (sparkSpawnRate > 0) {
      const spawnCount = Math.floor(sparkSpawnRate * 3.5); // số lượng hạt sinh mỗi khung hình
      for (let s = 0; s < spawnCount; s++) {
        if (sparksList.current.length < maxSparks) {
          const spawnPt = spawnPositions[Math.random() > 0.5 ? 0 : 1].clone();
          // Thêm độ lệch ngẫu nhiên nhỏ
          spawnPt.x += (Math.random() - 0.5) * 0.1;
          spawnPt.y += (Math.random() - 0.5) * 0.1;
          spawnPt.z += (Math.random() - 0.5) * 0.1;

          // Vận tốc tia lửa bắn ra phía ngoài
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 2.5,
            (Math.random() + 0.2) * 2.0, // bắn mạnh lên trên trục Y
            (Math.random() - 0.5) * 2.5
          );

          sparksList.current.push({
            pos: spawnPt,
            vel,
            life: 0.0,
            maxLife: 0.4 + Math.random() * 0.5, // thọ 0.4s - 0.9s
          });
        }
      }
    }

    // Cập nhật vị trí các tia lửa và vẽ lại buffer
    const positions = sparksGeometryData;
    // Reset toàn bộ về 0 trước
    for (let i = 0; i < maxSparks; i++) {
      positions[i * 3] = 999; // đưa ra ngoài màn hình nếu không hoạt động
      positions[i * 3 + 1] = 999;
      positions[i * 3 + 2] = 999;
    }

    // Cập nhật từng hạt còn sống
    sparksList.current = sparksList.current.filter((spark, idx) => {
      spark.life += delta;
      if (spark.life >= spark.maxLife) return false; // chết

      // Vận tốc có trọng lực kéo xuống nhẹ
      spark.vel.y -= delta * 1.5;
      spark.pos.add(spark.vel.clone().multiplyScalar(delta));

      // Đưa vị trí vào buffer để vẽ
      if (idx < maxSparks) {
        positions[idx * 3] = spark.pos.x;
        positions[idx * 3 + 1] = spark.pos.y;
        positions[idx * 3 + 2] = spark.pos.z;
      }
      return true;
    });

    if (sparksPointsRef.current) {
      sparksPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} scale={0} rotation={[0.4, 0, 0]}>
      {/* ── BÁNH RĂNG TRUNG TÂM TO (VÀNG RÒNG) ── */}
      <group position={[0, 0, 0]}>
        <Cogwheel
          radius={1.35}
          thickness={0.25}
          teethCount={16}
          color="#d4af37"
          rotationRef={cogMainRef}
        />
        
        {/* Nhân lửa cách mạng/năng lượng thực tiễn phát sáng ở tâm bánh răng */}
        <mesh ref={flameCoreRef} position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#b52619"
            emissive="#b52619"
            emissiveIntensity={1.2}
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* ── BÁNH RĂNG PHỤ 1 (ĐỒNG ĐỎ, GÓC TRÊN BÊN TRÁI) ── */}
      <group position={[-1.6, 0, 1.2]}>
        <Cogwheel
          radius={0.9}
          thickness={0.22}
          teethCount={10}
          color="#b52619"
          rotationRef={cogSub1Ref}
        />
      </group>

      {/* ── BÁNH RĂNG PHỤ 2 (ĐỒNG VÀNG CỔ, GÓC DƯỚI BÊN PHẢI) ── */}
      <group position={[1.4, 0, -1.3]}>
        <Cogwheel
          radius={0.65}
          thickness={0.2}
          teethCount={8}
          color="#8a6d1c"
          rotationRef={cogSub2Ref}
        />
      </group>

      {/* ── HỆ THỐNG HẠT TIA LỬA CƠ KHÍ (SPARKS POINTS) ── */}
      <points ref={sparksPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparksGeometryData, 3]}
            count={maxSparks}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.065}
          transparent
          opacity={0.95}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <pointLight position={[0, 0, 0]} color="#b52619" intensity={1.5} distance={6} />
    </group>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared: Gold Particle Field
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function GoldParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
      ref.current.rotation.x = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d4af37" size={0.025} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared: Orbital Rings
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function OrbitalRing({
  color,
  radius,
  speed,
}: {
  color: string;
  radius: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * speed) * 0.3;
      ref.current.rotation.z = clock.getElapsedTime() * speed * 0.4;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.015, 8, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Model Selector
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ActiveModel({
  nodeId,
  playTrigger,
}: {
  nodeId: string;
  playTrigger: number;
}) {
  switch (nodeId) {
    case "cam-giac":
      return <SensationModel playTrigger={playTrigger} />;
    case "tri-giac":
      return <PerceptionModel playTrigger={playTrigger} />;
    case "bieu-tuong":
      return <RepresentationModel playTrigger={playTrigger} />;
    case "khai-niem":
      return <ConceptModel playTrigger={playTrigger} />;
    case "thuc-tien":
      return <PracticeModel playTrigger={playTrigger} />;
    default:
      return <RepresentationModel playTrigger={playTrigger} />;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main Scene Export
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function InteractiveScene({
  activeNodeId,
  settings,
  playTrigger,
}: InteractiveSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Ánh sáng tinh xảo */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 6, 4]} intensity={0.95} color="#fff6e3" />
      <pointLight position={[-5, -5, -3]} intensity={0.3} color="#d4af37" />
      <pointLight position={[4, -4, 3]} intensity={0.25} color="#b52619" />

      {/* Mô hình hoạt động hiện tại (thay đổi ID sẽ ép ngắt và remount mượt mà) */}
      <group key={activeNodeId}>
        <ActiveModel nodeId={activeNodeId} playTrigger={playTrigger} />
      </group>

      {/* Các vòng tinh vân xoay tinh tế */}
      {settings.showRings && (
        <>
          <OrbitalRing color="#d4af37" radius={3.2} speed={0.2} />
          <OrbitalRing color="#735c00" radius={3.7} speed={-0.15} />
        </>
      )}

      {/* Các hạt bụi vàng lấp lánh nền */}
      {settings.showParticles && <GoldParticleField />}

      <Stars
        radius={45}
        depth={40}
        count={500}
        factor={1.5}
        saturation={0.15}
        fade
        speed={0.4}
      />

      <Environment preset="night" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={settings.autoRotate}
        autoRotateSpeed={settings.rotationSpeed}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}
