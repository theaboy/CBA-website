"use client";

import { Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const RECORD_RADIUS = 1.14;
const HOLE_RADIUS = 0.16;
const RECORD_DEPTH = 0.014;

const RADIO_TRACKS = [
  {
    id: "north-line",
    number: "01",
    title: "Nord Line",
    src: "/audio/north-line.wav",
    sub: "Ride de nuit.",
    type: "Mix",
    date: "21 mai 2026",
    quartier: "Saint-Laurent",
    duration: "04:12",
  },
  {
    id: "district-fever",
    number: "02",
    title: "Quartier chaud",
    src: "/audio/district-fever.wav",
    sub: "La salle commence à pop.",
    type: "Session",
    date: "18 mai 2026",
    quartier: "Mile End",
    duration: "03:48",
  },
  {
    id: "strobe-testimony",
    number: "03",
    title: "Strobe talk",
    src: "/audio/strobe-testimony.wav",
    sub: "Percus, néon, gros mood.",
    type: "Live cut",
    date: "14 mai 2026",
    quartier: "Plateau",
    duration: "04:36",
  },
  {
    id: "after-hours-anthem",
    number: "04",
    title: "Après la pluie",
    src: "/audio/after-hours-anthem.wav",
    sub: "Ça sonne doux, un peu tard.",
    type: "Field take",
    date: "9 mai 2026",
    quartier: "Outremont",
    duration: "06:02",
  },
  {
    id: "concrete-velvet",
    number: "05",
    title: "Halogène",
    src: "/audio/concrete-velvet.wav",
    sub: "Cassette, jasette, glow.",
    type: "Voice note",
    date: "3 mai 2026",
    quartier: "Hochelaga",
    duration: "05:17",
  },
  {
    id: "amber-session",
    number: "06",
    title: "Basse fréquence",
    src: "/audio/amber-session.wav",
    sub: "Entre deux antennes.",
    type: "Radio drop",
    date: "28 avr. 2026",
    quartier: "Verdun",
    duration: "07:44",
  },
];

function makeWaveformBars(trackIndex: number) {
  return Array.from({ length: 44 }, (_, barIndex) => {
    const seed = (trackIndex + 1) * 7.31;
    const wave =
      Math.sin(barIndex * 0.42 + seed) * 0.3 +
      Math.sin(barIndex * 1.13 + seed * 1.7) * 0.22 +
      Math.sin(barIndex * 0.21 + seed * 0.4) * 0.18 +
      Math.sin(barIndex * 2.4 + seed * 3) * 0.12;

    return Number((Math.max(0.18, 0.45 + wave) * 56).toFixed(1));
  });
}

type DiscTextures = {
  surfaceMap: THREE.CanvasTexture | null;
  faceMap: THREE.CanvasTexture | null;
  roughnessMap: THREE.CanvasTexture | null;
};

function ReadableDiscFaceMaterial({ map }: { map: THREE.CanvasTexture | null }) {
  const material = useMemo(() => {
    const faceMaterial = new THREE.MeshBasicMaterial({
      map: map ?? undefined,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    faceMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
#ifdef USE_MAP
  vec2 readableMapUv = gl_FrontFacing ? vMapUv : vec2(1.0 - vMapUv.x, vMapUv.y);
  vec4 sampledDiffuseColor = texture2D(map, readableMapUv);

  #ifdef DECODE_VIDEO_TEXTURE
    sampledDiffuseColor = sRGBTransferEOTF(sampledDiffuseColor);
  #endif

  diffuseColor *= sampledDiffuseColor;
#endif
        `
      );
    };

    faceMaterial.needsUpdate = true;
    return faceMaterial;
  }, [map]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return <primitive object={material} attach="material" />;
}

function makeTextureCanvas(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  return canvas;
}

function buildDiscTextures(): DiscTextures {
  if (typeof document === "undefined") {
    return { surfaceMap: null, faceMap: null, roughnessMap: null };
  }

  const colorCanvas = makeTextureCanvas(1024);
  const faceCanvas = makeTextureCanvas(1024);
  const roughnessCanvas = makeTextureCanvas(1024);
  const colorCtx = colorCanvas.getContext("2d");
  const faceCtx = faceCanvas.getContext("2d");
  const roughnessCtx = roughnessCanvas.getContext("2d");

  if (!colorCtx || !faceCtx || !roughnessCtx) {
    return { surfaceMap: null, faceMap: null, roughnessMap: null };
  }

  const center = colorCanvas.width / 2;
  const outerRadius = colorCanvas.width * 0.48;
  const innerRadius = colorCanvas.width * 0.07;
  const baseGradient = colorCtx.createRadialGradient(center, center, innerRadius, center, center, outerRadius);

  baseGradient.addColorStop(0, "#e2ded0");
  baseGradient.addColorStop(0.34, "#f7f4ea");
  baseGradient.addColorStop(0.72, "#ebe6d8");
  baseGradient.addColorStop(1, "#d5d0c2");

  colorCtx.fillStyle = baseGradient;
  colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

  roughnessCtx.fillStyle = "#9c9c9c";
  roughnessCtx.fillRect(0, 0, roughnessCanvas.width, roughnessCanvas.height);

  for (let radius = innerRadius + 14; radius < outerRadius; radius += 7.4) {
    const alpha = radius % 22 < 7 ? 0.18 : 0.08;
    colorCtx.strokeStyle = `rgba(65, 61, 50, ${alpha})`;
    colorCtx.lineWidth = radius % 29 < 8 ? 1.15 : 0.55;
    colorCtx.beginPath();
    colorCtx.arc(center, center, radius, 0, Math.PI * 2);
    colorCtx.stroke();

    roughnessCtx.strokeStyle = radius % 29 < 8 ? "#6f6f6f" : "#b2b2b2";
    roughnessCtx.lineWidth = 1;
    roughnessCtx.beginPath();
    roughnessCtx.arc(center, center, radius, 0, Math.PI * 2);
    roughnessCtx.stroke();
  }

  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  faceCtx.drawImage(colorCanvas, 0, 0);

  faceCtx.save();
  faceCtx.translate(center, center);

  faceCtx.strokeStyle = "rgba(255, 255, 255, 0.78)";
  faceCtx.lineWidth = 8;
  faceCtx.beginPath();
  faceCtx.arc(0, 0, outerRadius - 22, 0, Math.PI * 2);
  faceCtx.stroke();

  faceCtx.fillStyle = "#020202";
  faceCtx.beginPath();
  faceCtx.arc(0, 0, 72, 0, Math.PI * 2);
  faceCtx.fill();

  faceCtx.strokeStyle = "rgba(12, 31, 22, 0.48)";
  faceCtx.lineWidth = 12;
  faceCtx.beginPath();
  faceCtx.arc(0, 0, 126, 0, Math.PI * 2);
  faceCtx.stroke();
  faceCtx.strokeStyle = "rgba(255, 255, 255, 0.78)";
  faceCtx.lineWidth = 5;
  faceCtx.beginPath();
  faceCtx.arc(0, 0, 92, 0, Math.PI * 2);
  faceCtx.stroke();
  faceCtx.beginPath();
  faceCtx.arc(0, 0, 156, 0, Math.PI * 2);
  faceCtx.stroke();

  faceCtx.fillStyle = "rgba(11, 36, 22, 0.92)";
  faceCtx.textAlign = "center";
  faceCtx.textBaseline = "middle";
  faceCtx.font = "800 78px Georgia, serif";
  faceCtx.fillText("CBA Radio", 0, -250);

  faceCtx.font = "700 22px sans-serif";
  faceCtx.letterSpacing = "5px";
  faceCtx.fillText("CREATE  BUILD  ACHIEVE", 0, -188);

  faceCtx.font = "600 22px sans-serif";
  faceCtx.fillText("Desktop.fm", 0, 250);

  faceCtx.font = "500 17px sans-serif";
  faceCtx.fillText("virtual instrument connection", 0, 304);
  faceCtx.fillText("through sound and motion", 0, 328);

  for (const side of [-1, 1]) {
    faceCtx.save();
    faceCtx.translate(side * 260, 34);
    faceCtx.strokeStyle = "rgba(8, 44, 24, 0.52)";
    faceCtx.lineWidth = 5;
    for (let index = 0; index < 7; index += 1) {
      const angle = (index / 7) * Math.PI * 2;
      faceCtx.beginPath();
      faceCtx.ellipse(Math.cos(angle) * 34, Math.sin(angle) * 18, 12, 28, angle, 0, Math.PI * 2);
      faceCtx.stroke();
    }
    faceCtx.restore();
  }

  faceCtx.restore();

  const surfaceMap = new THREE.CanvasTexture(colorCanvas);
  surfaceMap.colorSpace = THREE.SRGBColorSpace;
  surfaceMap.anisotropy = 12;
  surfaceMap.needsUpdate = true;

  const faceMap = new THREE.CanvasTexture(faceCanvas);
  faceMap.colorSpace = THREE.SRGBColorSpace;
  faceMap.anisotropy = 12;
  faceMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.anisotropy = 12;
  roughnessMap.needsUpdate = true;

  return { surfaceMap, faceMap, roughnessMap };
}

function makeRingShape(outerRadius: number, innerRadius: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

  const hole = new THREE.Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

function makeRecordGeometry() {
  const shape = makeRingShape(RECORD_RADIUS, HOLE_RADIUS);

  return new THREE.ExtrudeGeometry(shape, {
    depth: RECORD_DEPTH,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.006,
    bevelThickness: 0.006,
    curveSegments: 160,
    steps: 1,
  });
}

function makeRecordFaceGeometry() {
  const outerRadius = RECORD_RADIUS * 0.992;
  const innerRadius = HOLE_RADIUS * 1.05;
  const segments = 192;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (const radius of [outerRadius, innerRadius]) {
      const x = cos * radius;
      const y = sin * radius;

      positions.push(x, y, 0);
      uvs.push(0.5 - x / (outerRadius * 2), 0.5 - y / (outerRadius * 2));
    }
  }

  for (let index = 0; index < segments; index += 1) {
    const outerA = index * 2;
    const innerA = outerA + 1;
    const outerB = outerA + 2;
    const innerB = outerA + 3;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function Record({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const spinVelocity = useRef(0.12);
  const shock = useRef(0);
  const tug = useRef(new THREE.Vector2(0, 0));
  const targetTilt = useRef(new THREE.Vector2(0, 0));
  const { pointer, clock, size } = useThree();

  const geometry = useMemo(makeRecordGeometry, []);
  const faceGeometry = useMemo(makeRecordFaceGeometry, []);
  const discTextures = useMemo(buildDiscTextures, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !materialRef.current) return;

    targetTilt.current.x = pointer.x * 0.28;
    targetTilt.current.y = pointer.y * 0.32;

    spinVelocity.current = spinVelocity.current * Math.max(0, 1 - delta * 0.55) + delta * 0.2;

    if (shock.current > 0) {
      spinVelocity.current += shock.current * delta * 3.4;
      shock.current = Math.max(0, shock.current - delta * 1.7);
      tug.current.multiplyScalar(Math.max(0, 1 - delta * 2.05));
    }

    const pulse = Math.min(1, shock.current);
    const jolt = Math.sin(clock.elapsedTime * 34) * pulse;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -0.66 + targetTilt.current.y + tug.current.y * pulse + jolt * 0.12,
      0.12
    );
    groupRef.current.rotation.y += (spinVelocity.current + pulse * 1.05) * delta;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      0.08 + targetTilt.current.x + tug.current.x * pulse + Math.cos(clock.elapsedTime * 29) * pulse * 0.1,
      0.12
    );
    materialRef.current.anisotropy = 0.75;
    materialRef.current.anisotropyRotation = clock.elapsedTime * 0.38 + pulse * 5.2;
    materialRef.current.roughness = 0.32 + pulse * 0.08;
    materialRef.current.clearcoatRoughness = 0.1 + pulse * 0.12;
    materialRef.current.emissiveIntensity = 0.01 + pulse * 0.04;
  });

  const responsiveScale = size.width < 640 ? 0.68 : 0.92;
  const scrollLift = THREE.MathUtils.clamp(scrollProgress, 0, 1);
  const recordY = size.width < 640 ? -0.08 + scrollLift * 1.04 : -0.1 + scrollLift * 1.18;
  const recordScale = responsiveScale * (1 - scrollLift * 0.52);

  return (
    <group
      ref={groupRef}
      position={[0.08, recordY, 0]}
      rotation={[-0.66, 0.12, 0.08]}
      scale={recordScale}
      onClick={() => {
        shock.current = 2.15;
        tug.current.set(0.58, -0.42);
        spinVelocity.current += 2.6;
      }}
    >
      <mesh
        geometry={geometry}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshPhysicalMaterial
          ref={materialRef}
          map={discTextures.surfaceMap ?? undefined}
          roughnessMap={discTextures.roughnessMap ?? undefined}
          color="#f4efe2"
          emissive="#ffffff"
          emissiveIntensity={0.01}
          metalness={0.08}
          roughness={0.32}
          anisotropy={0.75}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={faceGeometry} position={[0, 0, RECORD_DEPTH + 0.012]} rotation={[0, 0, Math.PI]}>
        <ReadableDiscFaceMaterial map={discTextures.faceMap} />
      </mesh>

      <mesh geometry={faceGeometry} position={[0, 0, -0.012]} rotation={[Math.PI, 0, Math.PI]}>
        <ReadableDiscFaceMaterial map={discTextures.faceMap} />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[RECORD_RADIUS, 0.012, 12, 192]} />
        <meshPhysicalMaterial color="#d9d4c7" metalness={0.06} roughness={0.26} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
    </group>
  );
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = Math.max(1, window.innerHeight * 0.95);
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}

function RadioArchive() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleTrack = (track: (typeof RADIO_TRACKS)[number]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeId === track.id && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (activeId !== track.id) {
      audio.src = track.src;
      setActiveId(track.id);
      setProgress(0);
    }

    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      setProgress(0);
      return;
    }

    setProgress(Math.min(100, (audio.currentTime / audio.duration) * 100));
  };

  return (
    <section
      className="relative z-30 mx-auto min-h-screen w-full max-w-7xl px-5 pb-32 pt-[96vh] text-[#efe5cc] sm:px-10 lg:px-20"
      aria-label="Captations de terrain"
    >
      <div className="relative z-40 mb-20 max-w-[1280px]">
        <p className="flex items-center gap-3 font-['JetBrains_Mono',ui-monospace,monospace] text-[11px] font-medium uppercase tracking-[0.28em] text-[#d5a93f] before:block before:h-1.5 before:w-1.5 before:animate-pulse before:rounded-full before:bg-[#e6b540] before:shadow-[0_0_8px_#e6b540]">
          CBA Radio · Archives
        </p>
        <h1 className="mt-7 max-w-[14ch] text-balance font-['DM_Serif_Display','Cormorant_Garamond',serif] text-[clamp(56px,9vw,144px)] font-normal leading-[0.92] tracking-[-0.02em] text-[#efe5cc]">
          Les sons de la salle.
        </h1>
        <p className="mt-8 max-w-[56ch] font-['Cormorant_Garamond',Georgia,serif] text-[clamp(18px,1.5vw,22px)] italic leading-[1.5] text-[#bda884]">
          Des petits bouts de sessions CBA. Ça joue, ça respire, ça vient direct du room.
        </p>
      </div>

      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={updateProgress}
      />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-[18px] before:pointer-events-none before:absolute before:bottom-6 before:left-[76px] before:top-6 before:hidden before:w-px before:bg-[linear-gradient(180deg,transparent,rgba(184,149,66,0.35)_8%,rgba(184,149,66,0.35)_92%,transparent)] md:before:block">
        <div className="hidden grid-cols-[56px_1fr_auto_auto] items-end gap-6 border-b border-[#3d4d34]/70 px-7 pb-[18px] pl-24 font-['JetBrains_Mono',ui-monospace,monospace] text-[10px] uppercase tracking-[0.24em] text-[#857a5e] md:grid">
          <span />
          <span>Track</span>
          <span className="w-[88px] text-right">Temps</span>
          <span className="w-[220px] text-right">Signal</span>
        </div>

        {RADIO_TRACKS.map((track, index) => {
          const isActive = activeId === track.id;
          const isCurrentPlaying = isActive && isPlaying;
          const bars = makeWaveformBars(index);

          return (
            <article
              key={track.id}
              tabIndex={0}
              onClick={() => toggleTrack(track)}
              onKeyDown={(event) => {
                if (event.code === "Space" || event.code === "Enter") {
                  event.preventDefault();
                  toggleTrack(track);
                }
              }}
              aria-label={`Play ${track.title}`}
              className={`group relative isolate grid cursor-pointer items-center gap-x-6 gap-y-4 overflow-hidden rounded border px-5 py-[18px] transition duration-300 ease-out before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_60%_200%_at_0%_50%,rgba(213,169,63,0.1),transparent_60%)] before:opacity-0 before:transition-opacity after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[linear-gradient(90deg,#e6b540_0%,#e6b540_var(--progress),transparent_var(--progress))] after:opacity-0 after:shadow-[0_0_8px_#e6b540] after:transition-opacity hover:-translate-y-px hover:border-[#7f8347] hover:bg-[#16291c]/70 hover:before:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6b540] md:grid-cols-[56px_1fr_auto_auto] md:px-7 md:py-[22px] ${
                isCurrentPlaying
                  ? "border-[#b89542] bg-[#16291c]/65 before:opacity-100 after:opacity-100"
                  : "border-[#3d4d34]/55 bg-[#101e16]/55"
              }`}
              style={{ "--progress": `${isCurrentPlaying ? progress : 0}%` } as CSSProperties}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleTrack(track);
                }}
                className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-[radial-gradient(circle_at_35%_30%,#25372a,#101e16)] p-0 text-[#d5a93f] transition duration-200 before:absolute before:inset-[-4px] before:rounded-full before:border before:border-[#8b7036]/35 before:transition-all group-hover:scale-[1.04] group-hover:border-[#d5a93f] group-hover:shadow-[0_0_24px_rgba(213,169,63,0.25)] group-hover:before:inset-[-7px] group-hover:before:border-[#b89542] ${
                  isCurrentPlaying ? "border-[#e6b540] shadow-[0_0_28px_rgba(230,181,64,0.4)]" : "border-[#8b7036]"
                }`}
                aria-label={`${isCurrentPlaying ? "Pause" : "Play"} ${track.title}`}
              >
                {isCurrentPlaying ? (
                  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" className="fill-[#e6b540]">
                    <rect x="2" y="2" width="4" height="14" rx="0.5" />
                    <rect x="10" y="2" width="4" height="14" rx="0.5" />
                  </svg>
                ) : (
                  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" className="fill-[#d5a93f] group-hover:fill-[#e6b540]">
                    <path d="M2 1 L14 9 L2 17 Z" />
                  </svg>
                )}
              </button>

              <div className="grid min-w-0 items-center gap-0 md:grid-cols-[72px_1fr] md:gap-6">
                <span
                  className={`hidden font-['DM_Serif_Display','Cormorant_Garamond',serif] text-[56px] leading-none tracking-[-0.03em] transition-colors md:block ${
                    isCurrentPlaying ? "text-[#d5a93f]" : "text-[#8b7036] group-hover:text-[#d5a93f]"
                  }`}
                >
                  {track.number}
                </span>
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2.5 font-['JetBrains_Mono',ui-monospace,monospace] text-[10px] uppercase tracking-[0.22em] text-[#b89542]">
                    <span>{track.type}</span>
                    <span className="text-[#857a5e]">·</span>
                    <span>{track.date}</span>
                    <span className="text-[#857a5e]">·</span>
                    <span>{track.quartier}</span>
                  </div>
                  <h2 className="m-0 truncate font-['DM_Serif_Display','Cormorant_Garamond',serif] text-[clamp(24px,2.25vw,32px)] font-normal leading-none tracking-[-0.01em] text-[#efe5cc] max-md:whitespace-normal max-sm:text-[20px]">
                    {track.title}
                  </h2>
                  <p className="mt-1.5 font-['Cormorant_Garamond',Georgia,serif] text-base italic text-[#bda884]">
                    {track.sub}
                  </p>
                </div>
              </div>

              <div className="flex w-auto items-baseline gap-3 text-left md:w-[88px] md:flex-col md:items-end md:gap-0.5 md:text-right">
                <span
                  className={`font-['JetBrains_Mono',ui-monospace,monospace] text-lg tracking-[0.04em] text-[#efe5cc] tabular-nums transition-colors ${
                    isCurrentPlaying ? "text-[#e6b540]" : "group-hover:text-[#e6b540]"
                  }`}
                >
                  {track.duration}
                </span>
                <span className="font-['JetBrains_Mono',ui-monospace,monospace] text-[9px] uppercase tracking-[0.22em] text-[#857a5e]">
                  min · sec
                </span>
              </div>

              <div className="col-span-full flex h-8 w-full items-center justify-stretch gap-0.5 overflow-hidden md:col-auto md:h-14 md:w-[220px] md:justify-end" aria-hidden="true">
                {bars.map((height, barIndex) => (
                  <span
                    key={`${track.id}-${barIndex}`}
                    className={`block w-[2.5px] max-w-1 flex-1 rounded-sm bg-gradient-to-b opacity-70 transition-opacity duration-200 group-hover:opacity-100 md:flex-none ${
                      isCurrentPlaying
                        ? "animate-[desktopFmWave_1.4s_ease-in-out_infinite] from-[#e6b540] to-[#d5a93f] opacity-100 shadow-[0_0_4px_rgba(230,181,64,0.3)]"
                        : "from-[#b89542] to-[#8b7036]"
                    }`}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${(barIndex * 0.04).toFixed(2)}s`,
                    }}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes desktopFmWave {
          0%,
          100% {
            transform: scaleY(1);
          }
          25% {
            transform: scaleY(0.55);
          }
          50% {
            transform: scaleY(1.15);
          }
          75% {
            transform: scaleY(0.8);
          }
        }
      `}</style>
    </section>
  );
}

export function DesktopFmScene() {
  const scrollProgress = useScrollProgress();

  return (
    <main className="relative min-h-[230vh] w-full overflow-x-hidden bg-[#080706] text-white">
      <div className="fixed inset-0 z-10 h-dvh w-full bg-[radial-gradient(circle_at_25%_10%,rgba(232,200,112,0.38),transparent_26%),radial-gradient(circle_at_76%_18%,rgba(30,101,57,0.5),transparent_34%),radial-gradient(circle_at_48%_72%,rgba(10,75,42,0.54),transparent_44%),linear-gradient(145deg,#080706_0%,#0a4b2a_48%,#1b2620_70%,#e8c870_140%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.66))]" />
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 35 }}
          dpr={[1, 2]}
          gl={{ alpha: true }}
          style={{ height: "100%", width: "100%" }}
        >
          <ambientLight intensity={0.16} />
          <directionalLight position={[-4.2, 4.6, 5.6]} intensity={2.8} color="#fff8df" />
          <directionalLight position={[3.6, -1.4, 4.8]} intensity={0.72} color="#e8c870" />
          <directionalLight position={[-4.6, -2.9, 5.8]} intensity={0.58} color="#75ff96" />
          <Record scrollProgress={scrollProgress} />
          <Environment preset="studio" />
        </Canvas>
      </div>
      <RadioArchive />
    </main>
  );
}
