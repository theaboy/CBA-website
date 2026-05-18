"use client";

import styles from "./radio-knob.module.css";

type Props = {
  isPlaying: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  /** render as div when already inside a <button> */
  asDiv?: boolean;
  "aria-label"?: string;
};

export function RadioKnob({ isPlaying, onClick, size = "md", asDiv, "aria-label": ariaLabel }: Props) {
  const cls = `${styles.knob} ${styles[size]} ${isPlaying ? styles.playing : ""}`;

  if (asDiv) {
    return <div className={cls} aria-hidden />;
  }

  return (
    <button
      className={cls}
      onClick={onClick}
      aria-label={ariaLabel ?? (isPlaying ? "Pause" : "Lecture")}
    />
  );
}
