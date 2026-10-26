import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Terminal, Play, Cpu, Code2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function AstraLauncher({ onEnterWorkspace, onBackToBrahma }) {
  const [animationStep, setAnimationStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 4-stage celestial opening animation flow
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer1 = setTimeout(() => setAnimationStep(2), 700);
    const timer2 = setTimeout(() => setAnimationStep(3), 1500);
    const timer3 = setTimeout(() => setAnimationStep(4), 2300);
    const timer4 = setTimeout(() => {
      if (onEnterWorkspace) onEnterWorkspace();
    }, 3200);

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
      className="galaxy-canvas flex flex-col items-center relative"
      style={{
        position: 'fixed',
        inset: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Top Glass Navigation Bar */}
      <header
        className="glass-panel flex items-center justify-between w-full"
        style={{
          flexShrink: 0,
          padding: '12px 32px',
          zIndex: 30,
          borderBottom: '1px solid var(--glass-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/brand/friday-mark.svg" alt="FRIDAY" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>
            FRIDAY ECOSYSTEM
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Badge variant="cyan">EDITH WORKSPACE</Badge>
        </div>

        <div className="flex items-center gap-3">
          {onBackToBrahma && (
            <button
              onClick={onBackToBrahma}
              className="glass-btn-ghost body-small"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', color: 'var(--text-secondary)' }}
              title="Return to FRIDAY Platform"
            >
              Return to FRIDAY
            </button>
          )}
          <Button variant="primary" icon={ArrowRight} onClick={handleSkip}>
            Enter Workspace Immediately
          </Button>
        </div>
      </header>

      {/* Main Area Below Header - Perfectly centered with zero clipping */}
      <main
        className="flex-1 flex flex-col items-center justify-center relative w-full overflow-y-auto"
        style={{ padding: '16px 24px', minHeight: 0 }}
      >
        {/* Center Cinematic Opening Portal */}
        <div
          className="flex flex-col items-center text-center z-10 animate-entrance my-auto"
          style={{ maxWidth: '820px', width: '100%' }}
        >
          {/* Animated Sacred Geometry Yantra Rings & EDITH Vector Mark */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: '180px', height: '180px', marginBottom: '18px' }}
          >
            {/* Outer Rotating Sacred Geometry Ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px dashed rgba(56, 189, 248, 0.45)',
                animation: 'astraYantraSpin 12s linear infinite'
              }}
            />

            {/* Inner Counter-Rotating Yantra Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '14px',
                borderRadius: '50%',
                border: '1.5px dotted rgba(246, 200, 122, 0.5)',
                animation: 'astraYantraReverseSpin 8s linear infinite'
              }}
            />

            {/* Radiant Ambient Core Glow */}
            <div
              style={{
                position: 'absolute',
                inset: '24px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(56, 189, 248, 0.25) 50%, transparent 75%)',
                filter: 'blur(12px)',
                animation: 'astraPulseRing 3s ease-in-out infinite'
              }}
            />

            {/* Emerging EDITH Arc Reactor Vector Mark */}
            <div
              style={{
                position: 'relative',
                zIndex: 5,
                animation: animationStep >= 2 ? 'astraPortalBurst 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
                transform: animationStep >= 2 ? 'scale(1)' : 'scale(0.7)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <img
                src="/brand/edith-mark.svg"
                alt="EDITH Logo"
                style={{
                  width: '112px',
                  height: '112px',
                  filter: 'drop-shadow(0 0 24px rgba(56, 189, 248, 0.7)) drop-shadow(0 0 40px rgba(2, 132, 199, 0.45))'
                }}
              />
            </div>
          </div>

          {/* Brand Reveal Typography */}
          <div style={{ opacity: animationStep >= 2 ? 1 : 0.2, transition: 'opacity 0.6s ease' }}>
            <h1
              className="display-title"
              style={{
                fontSize: '40px',
                letterSpacing: '0.14em',
                marginBottom: '6px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 40%, #38BDF8 80%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5))'
              }}
            >
              EDITH
            </h1>

            <div
              className="body-regular"
              style={{
                fontSize: '14px',
                letterSpacing: '0.2em',
                fontWeight: 700,
                color: 'var(--brand-cyan)',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}
            >
              YOUR DEVELOPMENT WORKSPACE
            </div>

            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.22em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              PLAN · CODE · TEST · DEPLOY • TURN IDEAS INTO REALITY
            </div>

            <p
              className="body-regular text-secondary"
              style={{
                maxWidth: '620px',
                margin: '0 auto 20px',
                fontSize: '13px',
                lineHeight: '1.5'
              }}
            >
              A dedicated autonomous AI software development workspace inside FRIDAY. Architected for multi-language coding, real-time diff review, and sandboxed execution.
            </p>
          </div>

          {/* 4 Pillars of EDITH: PLAN · CODE · TEST · DEPLOY in 4-column horizontal layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '12px',
              width: '100%',
              maxWidth: '720px',
              marginBottom: '22px',
              opacity: animationStep >= 3 ? 1 : 0.3,
              transition: 'opacity 0.6s ease'
            }}
          >
            <div className="glass-card flex flex-col items-center text-center" style={{ padding: '12px 8px' }}>
              <Cpu size={18} color="var(--brand-cyan)" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Plan</span>
              <span className="body-small text-muted" style={{ fontSize: '11px' }}>Architecture & Tasks</span>
            </div>

            <div className="glass-card flex flex-col items-center text-center" style={{ padding: '12px 8px' }}>
              <Code2 size={18} color="var(--brand-violet-light)" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Code</span>
              <span className="body-small text-muted" style={{ fontSize: '11px' }}>AST-Aware Synthesis</span>
            </div>

            <div className="glass-card flex flex-col items-center text-center" style={{ padding: '12px 8px' }}>
              <Sparkles size={18} color="var(--brand-gold)" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Test</span>
              <span className="body-small text-muted" style={{ fontSize: '11px' }}>Automated Suites</span>
            </div>

            <div className="glass-card flex flex-col items-center text-center" style={{ padding: '12px 8px' }}>
              <Play size={18} color="var(--status-success)" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Deploy</span>
              <span className="body-small text-muted" style={{ fontSize: '11px' }}>Safe Sandbox Boundary</span>
            </div>
          </div>

          {/* Launch Actions & Sandbox Status */}
          <div className="flex flex-col items-center gap-2.5">
            <Button
              variant="cyan"
              icon={ArrowRight}
              onClick={handleSkip}
              style={{ padding: '10px 28px', fontSize: '14px' }}
            >
              Launch EDITH Workspace
            </Button>

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} color="var(--status-success)" />
              <span className="body-small text-muted" style={{ fontSize: '11.5px' }}>
                Host Security Boundary Active • Sandboxed Execution Isolated
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
