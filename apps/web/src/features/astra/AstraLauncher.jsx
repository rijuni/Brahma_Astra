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
      className="galaxy-canvas flex flex-col items-center justify-center relative"
      style={{
        position: 'fixed',
        inset: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Top Glass Navigation Bar */}
      <div
        className="glass-panel flex items-center justify-between"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 32px',
          zIndex: 30,
          borderBottom: '1px solid var(--glass-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/brand/brahma-mark.svg" alt="BRAHMA" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>
            BRAHMA ECOSYSTEM
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Badge variant="gold">ASTRA STUDIO</Badge>
        </div>

        <div className="flex items-center gap-3">
          {onBackToBrahma && (
            <button
              onClick={onBackToBrahma}
              className="glass-btn-ghost body-small"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', color: 'var(--text-secondary)' }}
            >
              Return to BRAHMA
            </button>
          )}
          <Button variant="primary" icon={ArrowRight} onClick={handleSkip}>
            Enter Workspace Immediately
          </Button>
        </div>
      </div>

      {/* Center Cinematic Opening Portal */}
      <div className="flex flex-col items-center text-center z-10 animate-entrance" style={{ maxWidth: '840px', padding: '0 24px' }}>
        {/* Animated Sacred Geometry Yantra Rings & ASTRA Vector Mark */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: '220px', height: '220px', marginBottom: '28px' }}
        >
          {/* Outer Rotating Sacred Geometry Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed rgba(56, 189, 248, 0.4)',
              animation: 'astraYantraSpin 12s linear infinite'
            }}
          />

          {/* Inner Counter-Rotating Yantra Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '16px',
              borderRadius: '50%',
              border: '1.5px dotted rgba(246, 200, 122, 0.5)',
              animation: 'astraYantraReverseSpin 8s linear infinite'
            }}
          />

          {/* Radiant Ambient Core Glow */}
          <div
            style={{
              position: 'absolute',
              inset: '28px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(56, 189, 248, 0.25) 50%, transparent 75%)',
              filter: 'blur(12px)',
              animation: 'astraPulseRing 3s ease-in-out infinite'
            }}
          />

          {/* Emerging ASTRA Celestial Arrow Vector Mark */}
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
              src="/brand/astra-mark.svg"
              alt="ASTRA Logo"
              style={{
                width: '128px',
                height: '128px',
                filter: 'drop-shadow(0 0 24px rgba(56, 189, 248, 0.6)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))'
              }}
            />
          </div>
        </div>

        {/* Brand Reveal Typography */}
        <div style={{ opacity: animationStep >= 2 ? 1 : 0.2, transition: 'opacity 0.6s ease' }}>
          <h1
            className="display-title"
            style={{
              fontSize: '44px',
              letterSpacing: '0.12em',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFE5A7 40%, #38BDF8 80%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5))'
            }}
          >
            ASTRA
          </h1>

          <div
            className="body-regular"
            style={{
              fontSize: '15px',
              letterSpacing: '0.18em',
              fontWeight: 600,
              color: 'var(--brand-gold-light)',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            TURN IDEAS INTO REALITY
          </div>

          <p
            className="body-regular text-secondary"
            style={{
              maxWidth: '620px',
              margin: '0 auto 28px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}
          >
            A specialized AI software development workspace inside BRAHMA. Architected for multi-language coding, real-time diff review, and sandboxed execution.
          </p>
        </div>

        {/* 4 Pillars of ASTRA */}
        <div
          className="grid grid-cols-4 gap-3 w-full"
          style={{
            maxWidth: '780px',
            marginBottom: '32px',
            opacity: animationStep >= 3 ? 1 : 0.3,
            transition: 'opacity 0.6s ease'
          }}
        >
          <div className="glass-card flex flex-col items-center text-center" style={{ padding: '14px 10px' }}>
            <Cpu size={20} color="var(--brand-violet-light)" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Understand</span>
            <span className="body-small text-muted" style={{ fontSize: '11px' }}>Your Requirements</span>
          </div>

          <div className="glass-card flex flex-col items-center text-center" style={{ padding: '14px 10px' }}>
            <Sparkles size={20} color="var(--brand-gold)" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Plan</span>
            <span className="body-small text-muted" style={{ fontSize: '11px' }}>Architecture & Tasks</span>
          </div>

          <div className="glass-card flex flex-col items-center text-center" style={{ padding: '14px 10px' }}>
            <Code2 size={20} color="var(--brand-cyan)" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Build</span>
            <span className="body-small text-muted" style={{ fontSize: '11px' }}>Code, Test & Debug</span>
          </div>

          <div className="glass-card flex flex-col items-center text-center" style={{ padding: '14px 10px' }}>
            <Play size={20} color="var(--status-success)" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Deploy</span>
            <span className="body-small text-muted" style={{ fontSize: '11px' }}>Real Environments</span>
          </div>
        </div>

        {/* Launch Actions & Sandbox Status */}
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="gold"
            icon={ArrowRight}
            onClick={handleSkip}
            style={{ padding: '12px 32px', fontSize: '15px' }}
          >
            Launch ASTRA Workspace
          </Button>

          <div className="flex items-center gap-2">
            <ShieldCheck size={14} color="var(--status-success)" />
            <span className="body-small text-muted" style={{ fontSize: '12px' }}>
              Host Security Boundary Active • Sandboxed Execution Isolated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
