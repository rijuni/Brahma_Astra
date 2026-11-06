import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Cpu, Code2, Play, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EdithArcReactor from '../../components/brand/EdithArcReactor';

export default function EdithLauncher({ onEnterWorkspace, onBackToFriday }) {
  const [animationStep, setAnimationStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 4-stage cinematic launch sequence:
  // Step 1 (0-700ms): Cosmic asteroid field & ambient core spark
  // Step 2 (700-1500ms): Reactor ignition, 10-coil chamber surge & HUD spin
  // Step 3 (1500-2400ms): Metallic EDITH title reveal & pillars
  // Step 4 (2400-3200ms): System calibration complete -> transition
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer1 = setTimeout(() => setAnimationStep(2), 700);
    const timer2 = setTimeout(() => setAnimationStep(3), 1500);
    const timer3 = setTimeout(() => setAnimationStep(4), 2400);
    const timer4 = setTimeout(() => {
      if (onEnterWorkspace) onEnterWorkspace();
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isAutoPlaying, onEnterWorkspace]);

  const handleSkip = () => {
    setIsAutoPlaying(false);
    if (onEnterWorkspace) onEnterWorkspace();
  };

  return (
    <div
      className="edith-canvas flex flex-col items-center relative"
      style={{
        position: 'fixed',
        inset: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        color: '#FFFFFF'
      }}
    >
      {/* Top Glass Navigation Bar */}
      <header
        className="glass-panel flex items-center justify-between w-full"
        style={{
          flexShrink: 0,
          padding: '12px 32px',
          zIndex: 30,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid rgba(56, 189, 248, 0.22)',
          background: 'rgba(5, 8, 17, 0.72)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/brand/friday-mark.svg" alt="FRIDAY" style={{ width: '26px', height: '26px' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
            FRIDAY ECOSYSTEM
          </span>
          <span style={{ color: 'rgba(56, 189, 248, 0.4)' }}>/</span>
          <Badge variant="cyan" style={{ border: '1px solid rgba(0, 210, 255, 0.4)', background: 'rgba(0, 210, 255, 0.12)' }}>
            EDITH WORKSPACE
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {onBackToFriday && (
            <button
              onClick={onBackToFriday}
              className="glass-btn-ghost body-small"
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                color: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
              title="Return to FRIDAY Platform"
            >
              Return to FRIDAY
            </button>
          )}
          <Button
            variant="cyan"
            icon={ArrowRight}
            onClick={handleSkip}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)'
            }}
          >
            Enter Workspace Immediately
          </Button>
        </div>
      </header>

      {/* Main Area: Centered Splash Screen Portal matching Master Spec Sheet */}
      <main
        className="flex-1 flex flex-col items-center justify-center relative w-full overflow-y-auto"
        style={{ padding: '20px 24px', minHeight: 0 }}
      >
        {/* Ambient Drifting Space Asteroids */}
        <img
          src="/brand/floating-asteroid.png"
          alt="Space Asteroid"
          className="edith-floating-asteroid-1 hidden-mobile"
          style={{
            position: 'absolute',
            left: '6%',
            top: '52%',
            width: '68px',
            height: '68px',
            opacity: 0.88,
            filter: 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.35))',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />

        <img
          src="/brand/floating-asteroid.png"
          alt="Space Asteroid"
          className="edith-floating-asteroid-2 hidden-mobile"
          style={{
            position: 'absolute',
            right: '8%',
            top: '22%',
            width: '44px',
            height: '44px',
            opacity: 0.72,
            transform: 'scaleX(-1) rotate(42deg)',
            filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.25))',
            pointerEvents: 'none',
            zIndex: 3
          }}
        />

        <div
          className="flex flex-col items-center text-center z-10 animate-entrance my-auto"
          style={{ maxWidth: '820px', width: '100%' }}
        >
          {/* Arc Reactor Portal & Atmospheric Orbital HUD Rings */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: '220px', height: '220px', marginBottom: '20px' }}
          >
            {/* Outermost Expanding HUD Calibration Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '-20px',
                borderRadius: '50%',
                border: '1px dashed rgba(56, 189, 248, 0.35)',
                animation: 'edithSpinClockwise 36s linear infinite',
                pointerEvents: 'none'
              }}
            />

            {/* Intermediate Concentric HUD Coordinate Orbit */}
            <div
              style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '50%',
                border: '1px dotted rgba(0, 210, 255, 0.45)',
                animation: 'edithSpinCounter 24s linear infinite',
                pointerEvents: 'none'
              }}
            />

            {/* Deep Cosmic Plasma Flare Backdrop */}
            <div
              style={{
                position: 'absolute',
                inset: '10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 210, 255, 0.35) 0%, rgba(2, 132, 199, 0.18) 50%, transparent 75%)',
                filter: 'blur(16px)',
                animation: 'edithPlasmaPulse 3s ease-in-out infinite',
                pointerEvents: 'none'
              }}
            />

            {/* High-Fidelity Master Arc Reactor Component (Photo-realistic 3D Segmented Reactor Core) */}
            <div
              style={{
                position: 'relative',
                zIndex: 5,
                width: '190px',
                height: '190px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: animationStep >= 2 ? 'scale(1)' : 'scale(0.85)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <img
                src="/brand/edith-reactor-hero.png"
                alt="EDITH Arc Reactor Core"
                style={{
                  width: '172px',
                  height: '172px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  filter: 'drop-shadow(0 0 30px rgba(0, 210, 255, 0.8)) drop-shadow(0 0 55px rgba(56, 189, 248, 0.5)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.95))',
                  animation: 'edithPlasmaPulse 3.5s ease-in-out infinite'
                }}
              />
            </div>
          </div>

          {/* Brand Reveal Typography: Exact match to Master Spec Sheet */}
          <div
            style={{
              opacity: animationStep >= 2 ? 1 : 0.85,
              transform: animationStep >= 2 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Display Title: EDITH */}
            <h1
              style={{
                fontFamily: "'Michroma', 'Syncopate', -apple-system, sans-serif",
                fontSize: '46px',
                fontWeight: 800,
                letterSpacing: '0.18em',
                marginBottom: '6px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 35%, #38BDF8 70%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 24px rgba(56, 189, 248, 0.6)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.9))'
              }}
            >
              EDITH
            </h1>

            {/* Subtitle: YOUR DEVELOPMENT WORKSPACE */}
            <div
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: '14.5px',
                letterSpacing: '0.24em',
                fontWeight: 700,
                color: 'var(--edith-cyan, #00D2FF)',
                textTransform: 'uppercase',
                marginBottom: '10px',
                textShadow: '0 0 16px rgba(0, 210, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.9)'
              }}
            >
              YOUR DEVELOPMENT WORKSPACE
            </div>

            {/* Subline with Diamond Accent: PLAN · CODE · TEST · DEPLOY */}
            <div
              className="flex items-center justify-center gap-2.5"
              style={{
                fontSize: '11px',
                letterSpacing: '0.26em',
                color: 'rgba(186, 230, 253, 0.85)',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              <span>PLAN</span>
              <span style={{ color: '#00D2FF', fontSize: '8px' }}>◆</span>
              <span>CODE</span>
              <span style={{ color: '#00D2FF', fontSize: '8px' }}>◆</span>
              <span>TEST</span>
              <span style={{ color: '#00D2FF', fontSize: '8px' }}>◆</span>
              <span>DEPLOY</span>
            </div>

            <p
              style={{
                maxWidth: '620px',
                margin: '0 auto 22px',
                fontSize: '13.5px',
                lineHeight: '1.55',
                color: 'rgba(255, 255, 255, 0.72)'
              }}
            >
              AI-assisted workspace for project files, code review, and development tools. Arbitrary code execution is disabled by default in the native Windows configuration.
            </p>
          </div>

          {/* 4 Pillars of EDITH in sleek glass cards */}
          <div
            className="edith-launcher-pillars"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '12px',
              width: '100%',
              maxWidth: '720px',
              marginBottom: '24px',
              opacity: animationStep >= 3 ? 1 : 0.85,
              transform: animationStep >= 3 ? 'translateY(0)' : 'translateY(6px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              className="glass-card flex flex-col items-center text-center"
              style={{
                padding: '12px 8px',
                background: 'rgba(10, 22, 40, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              <Cpu size={18} color="#00D2FF" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Plan</span>
              <span className="body-small" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>Architecture & Tasks</span>
            </div>

            <div
              className="glass-card flex flex-col items-center text-center"
              style={{
                padding: '12px 8px',
                background: 'rgba(10, 22, 40, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              <Code2 size={18} color="#38BDF8" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Code</span>
              <span className="body-small" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>AST-Aware Synthesis</span>
            </div>

            <div
              className="glass-card flex flex-col items-center text-center"
              style={{
                padding: '12px 8px',
                background: 'rgba(10, 22, 40, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              <Sparkles size={18} color="#7DD3FC" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Test</span>
              <span className="body-small" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>Automated Suites</span>
            </div>

            <div
              className="glass-card flex flex-col items-center text-center"
              style={{
                padding: '12px 8px',
                background: 'rgba(10, 22, 40, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              <Play size={18} color="#22C55E" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Deploy</span>
              <span className="body-small" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>Runner disabled by default</span>
            </div>
          </div>

          {/* Launch Action & Security Boundary */}
          <div className="flex flex-col items-center gap-2.5">
            <Button
              variant="cyan"
              icon={ArrowRight}
              onClick={handleSkip}
              style={{
                padding: '11px 32px',
                fontSize: '14.5px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: 'linear-gradient(135deg, #00D2FF 0%, #0284C7 100%)',
                boxShadow: '0 0 24px rgba(0, 210, 255, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              Launch EDITH Workspace
            </Button>

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} color="#22C55E" />
              <span className="body-small" style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Safe execution policy active • Code execution disabled by default
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
