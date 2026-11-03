import React from 'react';

/**
 * EdithArcReactor — Dedicated High-Fidelity Arc Reactor Emblem for EDITH
 * Accurately replicates the 10-coil segmented power chamber, inverted plasma core triangle,
 * outer orbital HUD calibration tracks, and horizontal laser lens flare filaments.
 *
 * @param {Object} props
 * @param {number} [props.size=100] - Pixel size (width and height)
 * @param {boolean} [props.showHud=true] - Whether to render outer HUD calibration rings
 * @param {boolean} [props.animated=true] - Whether internal rotation and pulse animations are active
 * @param {string} [props.className] - Optional extra class names
 * @param {React.CSSProperties} [props.style] - Inline style overrides
 */
export default function EdithArcReactor({
  size = 100,
  showHud = true,
  animated = true,
  className = '',
  style = {}
}) {
  const spinClassClockwise = animated ? 'edith-reactor-spin-cw' : '';
  const spinClassCounter = animated ? 'edith-reactor-spin-ccw' : '';
  const pulseClass = animated ? 'edith-reactor-plasma-pulse' : '';

  // 10 radial coil segments spaced at 36 degrees
  const coilAngles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={`edith-arc-reactor ${className}`}
      style={{
        display: 'block',
        flexShrink: 0,
        filter: 'drop-shadow(0 0 22px rgba(56, 189, 248, 0.55)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85))',
        ...style
      }}
    >
      <defs>
        {/* Futuristic Metallic Steel & Cyan Gradients */}
        <linearGradient id="edithSteelBezel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="25%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="85%" stopColor="#0B192C" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>

        <linearGradient id="edithDarkArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="40%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="edithCoilCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#BAE6FD" />
          <stop offset="65%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Central Inverted Triangle Plasma Core Radial Gradient */}
        <radialGradient id="edithFusionCore" cx="50%" cy="48%" r="48%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#E0F2FE" />
          <stop offset="55%" stopColor="#38BDF8" />
          <stop offset="85%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0" />
        </radialGradient>

        {/* Deep Ambient Plasma Aura */}
        <radialGradient id="edithAmbientPlasma" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#0284C7" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#0369A1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>

        {/* Glow Filters */}
        <filter id="edithGlowIntense" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur1" />
          <feGaussianBlur stdDeviation="5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="edithFlareFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Layer 0: Ambient Energy Field */}
      <circle cx="50" cy="50" r="48" fill="url(#edithAmbientPlasma)" />

      {/* Layer 1: Horizontal Laser Lens Flare Beam */}
      <g filter="url(#edithFlareFilter)">
        <line x1="2" y1="50" x2="98" y2="50" stroke="#38BDF8" strokeWidth="0.75" opacity="0.65" />
        <line x1="14" y1="50" x2="86" y2="50" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9" />
        <line x1="50" y1="6" x2="50" y2="94" stroke="#38BDF8" strokeWidth="0.5" opacity="0.35" />
      </g>

      {/* Layer 2: Outermost HUD Calibration Rings (Orbiting smoothly) */}
      {showHud && (
        <g className={spinClassClockwise} style={{ transformOrigin: '50px 50px' }}>
          {/* Outer fine dotted orbit */}
          <circle
            cx="50"
            cy="50"
            r="46.5"
            stroke="#38BDF8"
            strokeWidth="0.5"
            strokeDasharray="1.5 3"
            opacity="0.6"
            fill="none"
          />
          {/* Segmented guide ring with cardinal gaps */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#7DD3FC"
            strokeWidth="0.8"
            strokeDasharray="22 6"
            opacity="0.75"
            fill="none"
          />
          {/* 4 Cardinal Crosshair Ticks */}
          <line x1="50" y1="2" x2="50" y2="6" stroke="#BAE6FD" strokeWidth="1.2" />
          <line x1="50" y1="94" x2="50" y2="98" stroke="#BAE6FD" strokeWidth="1.2" />
          <line x1="2" y1="50" x2="6" y2="50" stroke="#BAE6FD" strokeWidth="1.2" />
          <line x1="94" y1="50" x2="98" y2="50" stroke="#BAE6FD" strokeWidth="1.2" />
        </g>
      )}

      {/* Layer 3: Main Outer Armor Casing Ring (Titanium / Dark Steel Chassis) */}
      <circle cx="50" cy="50" r="41" fill="url(#edithDarkArmor)" stroke="url(#edithSteelBezel)" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="40" stroke="#00D2FF" strokeWidth="0.5" opacity="0.4" fill="none" />

      {/* Layer 4: The 10 Segmented Arc Reactor Power Chambers (Clockwise array) */}
      <g>
        {coilAngles.map((deg, i) => (
          <g key={i} transform={`rotate(${deg} 50 50)`}>
            {/* Luminous Cyan Energy Window / Coil Core */}
            <rect
              x="46.2"
              y="11.2"
              width="7.6"
              height="6.8"
              rx="1.2"
              fill="url(#edithCoilCyan)"
              filter="url(#edithGlowIntense)"
              opacity="0.95"
            />
            {/* Coil Internal Grid Filaments */}
            <line x1="47.2" y1="13.2" x2="52.8" y2="13.2" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.85" />
            <line x1="47.2" y1="15.8" x2="52.8" y2="15.8" stroke="#0284C7" strokeWidth="0.5" opacity="0.8" />
            
            {/* Dark Metallic Containment Clamping Bracket / Armor Claws */}
            <path
              d="M 44.5 9.5 L 45.8 19 L 47 19 L 46.2 9.5 Z"
              fill="#334155"
              stroke="#0F172A"
              strokeWidth="0.3"
            />
            <path
              d="M 55.5 9.5 L 54.2 19 L 53 19 L 53.8 9.5 Z"
              fill="#334155"
              stroke="#0F172A"
              strokeWidth="0.3"
            />
            {/* Outer perimeter bolt head */}
            <circle cx="50" cy="9.8" r="0.9" fill="#E0F2FE" />
          </g>
        ))}
      </g>

      {/* Layer 5: Inner Rotating Caliper & Notch Ring (Counter-rotates) */}
      <g className={spinClassCounter} style={{ transformOrigin: '50px 50px' }}>
        {/* Dark inner collar boundary */}
        <circle cx="50" cy="50" r="29.5" fill="#071221" stroke="url(#edithSteelBezel)" strokeWidth="1.2" />
        {/* Precision etched dash track */}
        <circle
          cx="50"
          cy="50"
          r="26.8"
          stroke="#38BDF8"
          strokeWidth="0.7"
          strokeDasharray="2 3"
          opacity="0.85"
          fill="none"
        />
        {/* Inner mechanical notches */}
        <circle
          cx="50"
          cy="50"
          r="24"
          stroke="#00D2FF"
          strokeWidth="1.2"
          strokeDasharray="5 5"
          opacity="0.55"
          fill="none"
        />
        {/* Calibration dots */}
        <circle cx="50" cy="24" r="0.8" fill="#FFFFFF" />
        <circle cx="76" cy="50" r="0.8" fill="#FFFFFF" />
        <circle cx="50" cy="76" r="0.8" fill="#FFFFFF" />
        <circle cx="24" cy="50" r="0.8" fill="#FFFFFF" />
      </g>

      {/* Layer 6: Mid-Chamber Containment Ring */}
      <circle cx="50" cy="50" r="21.5" fill="#040C1A" stroke="url(#edithSteelBezel)" strokeWidth="1" />
      <circle cx="50" cy="50" r="19.5" stroke="#38BDF8" strokeWidth="0.5" opacity="0.6" fill="none" />

      {/* Layer 7: Central Inverted Equilateral Triangle Arc Reactor Core (Breathing Pulse) */}
      <g className={pulseClass} style={{ transformOrigin: '50px 49px' }} filter="url(#edithGlowIntense)">
        {/* Outer Inverted Triangle Housing Bezel */}
        <polygon
          points="31,34.5 69,34.5 50,67.5"
          fill="#0B192C"
          stroke="url(#edithSteelBezel)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Luminous Fusion Plasma Mantle */}
        <polygon
          points="33.5,36 66.5,36 50,64.5"
          fill="url(#edithFusionCore)"
          stroke="#38BDF8"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Inner Pure White Intense Core */}
        <polygon
          points="38.5,39 61.5,39 50,59"
          fill="#FFFFFF"
          opacity="0.95"
        />

        {/* Center Singularity Core Point */}
        <circle cx="50" cy="46" r="3.8" fill="#FFFFFF" />
        <circle cx="50" cy="46" r="6.2" stroke="#BAE6FD" strokeWidth="0.8" fill="none" opacity="0.8" />
      </g>

      {/* Layer 8: Ambient Plasma Sparks & Micro Filaments */}
      <circle cx="37" cy="27" r="0.7" fill="#BAE6FD" opacity="0.8" />
      <circle cx="63" cy="27" r="0.7" fill="#BAE6FD" opacity="0.8" />
      <circle cx="72" cy="58" r="0.6" fill="#7DD3FC" opacity="0.75" />
      <circle cx="28" cy="58" r="0.6" fill="#7DD3FC" opacity="0.75" />
    </svg>
  );
}

