"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import styles from "./radio-knob.module.css";

type Size = "sm" | "md" | "lg";

type Props = {
  isPlaying: boolean;
  onClick?: () => void;
  size?: Size;
  asDiv?: boolean;
  "aria-label"?: string;
};

export function RadioKnob({
  isPlaying,
  onClick,
  size = "md",
  asDiv,
  "aria-label": ariaLabel,
}: Props) {
  const wrapRef    = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(isPlaying);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const px  = Math.round(wrap.getBoundingClientRect().width) || 56;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    /* ── Renderer ─────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(px, px);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace    = THREE.SRGBColorSpace;

    /* ── Environment map — gives metallic surfaces something to reflect */
    const pmrem      = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture;

    /* ── Scene / Camera ───────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 20);
    camera.position.set(0, 3.5, 1.0);
    camera.lookAt(0, 0, 0);

    /* ── Materials ────────────────────────────────────────────────── */
    const brass = new THREE.MeshStandardMaterial({
      color: 0xC87C08,
      metalness: 0.95,
      roughness: 0.18,
      envMapIntensity: 1.6,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x0E0703,
      metalness: 0.75,
      roughness: 0.55,
      envMapIntensity: 0.6,
    });
    const ridge = new THREE.MeshStandardMaterial({
      color: 0xFFCC30,
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.2,
    });
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0xFFF5CC,
      metalness: 1.0,
      roughness: 0.03,
      envMapIntensity: 1.8,
      emissive: new THREE.Color(0.15, 0.12, 0.04),
    });

    /* ── Knob geometry ────────────────────────────────────────────── */
    const knob = new THREE.Group();
    scene.add(knob);
    const Y = 0.188;

    // Body
    knob.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.38, 128), brass));

    // Outer chamfer
    const chamfer = new THREE.Mesh(new THREE.TorusGeometry(0.968, 0.044, 20, 128), dark);
    chamfer.rotation.x = Math.PI / 2;
    chamfer.position.y = Y;
    knob.add(chamfer);

    // Concentric rings — bold enough to read at 44 px
    // 3 dark grooves + 2 bright ridges between them
    const ringDefs: [number, THREE.MeshStandardMaterial, number][] = [
      [0.80, dark,  0.044],
      [0.60, dark,  0.038],
      [0.40, dark,  0.030],
      [0.70, ridge, 0.024],
      [0.50, ridge, 0.020],
    ];
    for (const [r, mat, tube] of ringDefs) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 24, 128), mat);
      t.rotation.x = Math.PI / 2;
      t.position.y = Y;
      knob.add(t);
    }

    // Center dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 48, 48), dark);
    dome.scale.y = 0.42;
    dome.position.y = Y;
    knob.add(dome);

    // Pointer dot (12 o'clock)
    const pointer = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.044, 28), dotMat);
    pointer.position.set(0, Y + 0.014, -0.82);
    knob.add(pointer);

    /* ── Lights ───────────────────────────────────────────────────── */
    const key = new THREE.PointLight(0xFFE070, 14, 14);
    key.position.set(2.5, 5.5, 2.5);
    scene.add(key);

    const fill = new THREE.PointLight(0x88AAFF, 3.5, 12);
    fill.position.set(-3.5, 3, 1);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(0x5C2800, 2.5));

    const glowLight = new THREE.PointLight(0xFF5500, 0, 6);
    glowLight.position.set(0, 0.6, 0);
    scene.add(glowLight);

    /* ── Animation ────────────────────────────────────────────────── */
    let raf: number;
    let rot      = 0;
    let prevPlay = false;
    const TWO_PI = Math.PI * 2;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const playing = playingRef.current;

      if (playing) {
        rot     += 0.007;
        prevPlay = true;
      } else {
        if (prevPlay) {
          rot      = ((rot % TWO_PI) + TWO_PI) % TWO_PI;
          prevPlay = false;
        }
        rot += (0 - rot) * 0.10;
      }

      knob.rotation.y = rot;
      glowLight.intensity += ((playing ? 5 : 0) - glowLight.intensity) * 0.07;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      [brass, dark, ridge, dotMat].forEach(m => m.dispose());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const cls = [styles.knob, styles[size], isPlaying ? styles.playing : ""].join(" ");
  const canvasEl = (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );

  if (asDiv) {
    return (
      <div
        ref={wrapRef as React.RefObject<HTMLDivElement>}
        className={cls}
        aria-hidden
      >
        {canvasEl}
      </div>
    );
  }

  return (
    <button
      ref={wrapRef as React.RefObject<HTMLButtonElement>}
      className={cls}
      onClick={onClick}
      aria-label={ariaLabel ?? (isPlaying ? "Pause" : "Lecture")}
    >
      {canvasEl}
    </button>
  );
}
