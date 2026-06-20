import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "w-48 h-auto", showText = true }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 150"
      className={className}
      aria-label="Spear5 — Wealth Reactor"
    >
      <defs>
        <linearGradient id="wealthEnergy" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#00F0FF" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Reactor icon + spear */}
      <g id="reactor-core">
        {/* Outer orbit ring */}
        <circle
          cx="85" cy="75" r="45"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          opacity="0.6"
        />
        {/* Energy ring */}
        <circle
          cx="85" cy="75" r="35"
          fill="none"
          stroke="url(#wealthEnergy)"
          strokeWidth="5"
          filter="url(#neonGlow)"
        />
        {/* Spear shaft */}
        <polygon
          points="65,95 105,55 105,40 115,40 115,50 75,90"
          fill="#ffffff"
        />
        {/* Spear tip */}
        <polygon
          points="105,40 85,40 105,60"
          fill="url(#wealthEnergy)"
          filter="url(#neonGlow)"
        />
        {/* Accent blade */}
        <polygon
          points="65,75 80,60 80,65 70,75"
          fill="#00E676"
        />
        {/* Core node */}
        <circle
          cx="85" cy="75" r="5"
          fill="#ffffff"
          filter="url(#neonGlow)"
        />
      </g>

      {/* Wordmark */}
      {showText && (
        <g id="logo-text">
          <text
            x="160" y="90"
            fontFamily="'Inter', 'Cairo', sans-serif"
            fontSize="56"
            fontWeight="900"
            fill="#ffffff"
            letterSpacing="1"
          >
            SPEAR<tspan fill="url(#wealthEnergy)">5</tspan>
          </text>
          <text
            x="165" y="115"
            fontFamily="'Inter', 'Tajawal', sans-serif"
            fontSize="13"
            fontWeight="600"
            fill="#888888"
            letterSpacing="6"
          >
            WEALTH REACTOR
          </text>
        </g>
      )}
    </svg>
  );
}
