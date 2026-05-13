interface FiligreeProps {
  className?: string;
  opacity?: number;
}

export function Filigree({ className = "", opacity = 0.15 }: FiligreeProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Central circle */}
      <circle cx="100" cy="100" r="60" stroke="#D4A373" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="45" stroke="#D4A373" strokeWidth="0.3" />

      {/* Ornate curves */}
      <path
        d="M100 40 C120 55, 140 75, 140 100 C140 125, 120 145, 100 160 C80 145, 60 125, 60 100 C60 75, 80 55, 100 40Z"
        stroke="#D4A373"
        strokeWidth="0.4"
        fill="none"
      />

      {/* Swirling arms */}
      <path d="M100 40 C105 30, 115 20, 100 10 C85 20, 95 30, 100 40" stroke="#D4A373" strokeWidth="0.4" fill="none" />
      <path d="M160 100 C170 105, 180 115, 190 100 C180 85, 170 95, 160 100" stroke="#D4A373" strokeWidth="0.4" fill="none" />
      <path d="M100 160 C105 170, 115 180, 100 190 C85 180, 95 170, 100 160" stroke="#D4A373" strokeWidth="0.4" fill="none" />
      <path d="M40 100 C30 105, 20 115, 10 100 C20 85, 30 95, 40 100" stroke="#D4A373" strokeWidth="0.4" fill="none" />

      {/* Corner flourishes */}
      <path d="M30 30 C40 25, 50 35, 45 45 C35 50, 25 40, 30 30" stroke="#D4A373" strokeWidth="0.3" fill="none" />
      <path d="M170 30 C160 25, 150 35, 155 45 C165 50, 175 40, 170 30" stroke="#D4A373" strokeWidth="0.3" fill="none" />
      <path d="M30 170 C40 175, 50 165, 45 155 C35 150, 25 160, 30 170" stroke="#D4A373" strokeWidth="0.3" fill="none" />
      <path d="M170 170 C160 175, 150 165, 155 155 C165 150, 175 160, 170 170" stroke="#D4A373" strokeWidth="0.3" fill="none" />

      {/* Small floral center */}
      <circle cx="100" cy="100" r="4" stroke="#D4A373" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="2" fill="#D4A373" opacity="0.5" />

      {/* Cross lines */}
      <line x1="100" y1="55" x2="100" y2="145" stroke="#D4A373" strokeWidth="0.2" strokeDasharray="2 4" />
      <line x1="55" y1="100" x2="145" y2="100" stroke="#D4A373" strokeWidth="0.2" strokeDasharray="2 4" />
    </svg>
  );
}
