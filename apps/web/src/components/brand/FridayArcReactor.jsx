import React from 'react';

/**
 * FridayArcReactor — Dedicated Authentic Vector Arc Reactor Emblem
 * Features internal precision mechanical rotations and fusion plasma core pulse.
 *
 * @param {Object} props
 * @param {number} [props.size=94] - Pixel size (width and height)
 * @param {string} [props.className] - Optional extra class names
 * @param {React.CSSProperties} [props.style] - Inline style overrides
 */
export default function FridayArcReactor({ size = 94, className = '', style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={`friday-arc-reactor ${className}`}
      style={{
        display: 'block',
        flexShrink: 0,
        filter: 'drop-shadow(0 0 20px rgba(246, 200, 122, 0.45)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))',
        ...style
      }}
    >
      <defs>
        {/* Metallic Gold & Amber Gradients */}
        <linearGradient id="reactorGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE5A7" />
          <stop offset="35%" stopColor="#F6C87A" />
          <stop offset="70%" stopColor="#D49A3E" />
          <stop offset="100%" stopColor="#9A6B1F" />
        </linearGradient>

        <linearGradient id="reactorDarkSteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A2218" />
          <stop offset="50%" stopColor="#18130B" />
          <stop offset="100%" stopColor="#0E0A05" />
        </linearGradient>

        <radialGradient id="reactorPlasmaCore" cx="50%" cy="48%" r="48%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFF3D1" />
          <stop offset="55%" stopColor="#F6C87A" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="reactorAmbientGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#B45309" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#1E1B3D" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0B0F1A" stopOpacity="0" />
        </radialGradient>

        <filter id="reactorGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Layer 0: Ambient Gold Core Aura */}
      <circle cx="50" cy="50" r="46" fill="url(#reactorAmbientGlow)" />

      {/* Layer 1: Vertical & Horizontal Lens Flare Filaments */}
      <line x1="50" y1="4" x2="50" y2="96" stroke="#FFE5A7" strokeWidth="0.8" opacity="0.65" />
      <line x1="50" y1="18" x2="50" y2="82" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9" filter="url(#reactorGlowFilter)" />
      <line x1="8" y1="50" x2="92" y2="50" stroke="#F6C87A" strokeWidth="0.6" opacity="0.45" />

      {/* Layer 2: Outer Segmented Machined Gear Ring & Lugs (Rotates 36s) */}
      <g className="reactor-gear-spin" style={{ transformOrigin: '50px 50px' }}>
        <circle cx="50" cy="50" r="44" stroke="url(#reactorGoldMetallic)" strokeWidth="1.8" fill="none" opacity="0.95" />
        <circle cx="50" cy="50" r="41" stroke="#0E0A05" strokeWidth="4.5" fill="none" strokeDasharray="18 4" />
        <circle cx="50" cy="50" r="41" stroke="url(#reactorGoldMetallic)" strokeWidth="1.4" fill="none" strokeDasharray="18 4" />

        {/* 10 Peripheral Bolt / Alignment Lugs */}
        <g fill="#FFE5A7">
          <circle cx="50" cy="9" r="1.3" />
          <circle cx="74" cy="17" r="1.3" />
          <circle cx="89" cy="38" r="1.3" />
          <circle cx="84" cy="65" r="1.3" />
          <circle cx="63" cy="86" r="1.3" />
          <circle cx="37" cy="86" r="1.3" />
          <circle cx="16" cy="65" r="1.3" />
          <circle cx="11" cy="38" r="1.3" />
          <circle cx="26" cy="17" r="1.3" />
          <circle cx="50" cy="91" r="1.3" />
        </g>
      </g>

      {/* Layer 3: Precision Caliper Track (Counter-Rotates 24s) */}
      <g className="reactor-track-spin" style={{ transformOrigin: '50px 50px' }}>
        <circle cx="50" cy="50" r="36" stroke="#D49A3E" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.8" fill="none" />
        <circle cx="50" cy="50" r="33" stroke="url(#reactorGoldMetallic)" strokeWidth="0.9" opacity="0.9" fill="none" />
      </g>

      {/* Layer 4: Mid-Chamber Mechanical Collar (Stationary Anchor) */}
      <circle cx="50" cy="50" r="27" fill="url(#reactorDarkSteel)" stroke="url(#reactorGoldMetallic)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="23" stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="4 2" opacity="0.85" fill="none" />

      {/* Layer 5: Central Inverted Fusion Plasma Core Triangle (Breathing Pulse) */}
      <g className="reactor-core-plasma" style={{ transformOrigin: '50px 50px' }} filter="url(#reactorGlowFilter)">
        {/* Outer Inverted Triangle Housing */}
        <polygon
          points="28,34 72,34 50,72"
          fill="#18130B"
          stroke="url(#reactorGoldMetallic)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Luminous Fusion Plasma Core */}
        <polygon points="32,36 68,36 50,68" fill="url(#reactorPlasmaCore)" />

        {/* Inner Radiant Core Ring */}
        <polygon points="38,40 62,40 50,61" fill="#FFFFFF" opacity="0.95" />

        {/* Intense Fusion Center Singularity */}
        <circle cx="50" cy="48" r="4.5" fill="#FFFFFF" />
        <circle cx="50" cy="48" r="7.5" stroke="#FFE5A7" strokeWidth="1" fill="none" opacity="0.85" />
      </g>

      {/* Layer 6: Ambient Energy Spark Filaments */}
      <circle cx="36" cy="24" r="0.8" fill="#FFE5A7" opacity="0.85" />
      <circle cx="66" cy="22" r="0.7" fill="#FFE5A7" opacity="0.8" />
      <circle cx="78" cy="52" r="0.8" fill="#FFE5A7" opacity="0.85" />
      <circle cx="24" cy="60" r="0.7" fill="#FFE5A7" opacity="0.8" />
    </svg>
  );
}
