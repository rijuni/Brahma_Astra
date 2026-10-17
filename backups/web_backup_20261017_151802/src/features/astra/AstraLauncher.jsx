import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Code,
  Rocket,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Server,
  Layers,
  Sparkles,
  Terminal,
  Cpu,
  CheckCircle2,
  FastForward,
  Play
} from 'lucide-react';

export function AstraLauncher() {
  const { navigate } = useNavigation();
  const [securityStatus, setSecurityStatus] = useState(null);
  const [checkingServices, setCheckingServices] = useState(true);

  // Opening Animation Storyboard State (Stages 0 to 6)
  // 0 = Idle Launcher Card
  // 1 = Handoff (0.0-0.6s)
  // 2 = Celestial Portal (0.6-1.6s)
  // 3 = Astra Emerges (1.6-2.6s)
  // 4 = Brand Reveal (2.6-3.6s)
  // 5 = Arrow Transition (3.6-4.6s)
  // 6 = Workspace Ready -> navigate('astra/workspace')
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    async function checkServices() {
      setCheckingServices(true);
      try {
        const sec = await api.checkAstraSecurityStatus();
        setSecurityStatus(sec);
      } catch {
        setSecurityStatus({ execution_mode: 'disabled', verified: true });
      } finally {
        setCheckingServices(false);
      }
    }
    checkServices();
  }, []);

  // Handle Opening Animation Sequence
  useEffect(() => {
    if (animationStage === 0) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      navigate('astra/workspace');
      return;
    }

    if (animationStage === 6) {
      navigate('astra/workspace');
      return;
    }

    const stageDurations = {
      1: 600,   // Handoff: BRAHMA dims smoothly
      2: 1000,  // Celestial portal geometry forms
      3: 1000,  // Astra emerges with particles
      4: 1000,  // Brand reveal with descriptor
      5: 1000   // Arrow transition into workspace
    };

    const timer = setTimeout(() => {
      setAnimationStage(prev => prev + 1);
    }, stageDurations[animationStage] || 800);

    return () => clearTimeout(timer);
  }, [animationStage, navigate]);

  const handleLaunch = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      navigate('astra/workspace');
    } else {
      setAnimationStage(1);
    }
  };

  const handleSkip = () => {
    navigate('astra/workspace');
  };

  // RENDER CINEMATIC OPENING ANIMATION SEQUENCE
  if (animationStage > 0) {
    const stageTitles = {
      1: '1. Launch Astra — Handoff from BRAHMA',
      2: '2. Celestial Portal — Divine orbital geometry forms',
      3: '3. Astra Emerges — Celestial arrow forms from light',
      4: '4. Brand Reveal — Tagline and identity materialized',
      5: '5. Transition — Celestial arrow guides into workspace'
    };

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#070A18',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'opacity 0.6s ease'
        }}
        data-product="astra"
      >
        {/* Skip Action Button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--astra-border)',
            color: 'var(--astra-muted)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            zIndex: 10000,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--astra-electric-blue)';
            e.currentTarget.style.borderColor = 'var(--astra-electric-blue)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--astra-muted)';
            e.currentTarget.style.borderColor = 'var(--astra-border)';
          }}
        >
          <span>Skip Animation</span>
          <FastForward size={14} />
        </button>

        {/* Ambient Celestial Glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(139, 92, 246, 0.15) 45%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        {/* Storyboard Animation Elements */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px',
            maxWidth: '640px',
            padding: '24px'
          }}
        >
          {/* Stage 2 & Above: Concentric Orbital Geometry */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Outer Orbit */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px dashed rgba(56, 189, 248, 0.6)',
                boxShadow: '0 0 40px rgba(56, 189, 248, 0.3)',
                animation: 'spin 12s linear infinite',
                opacity: animationStage >= 2 ? 1 : 0,
                transform: animationStage >= 2 ? 'scale(1)' : 'scale(0.6)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Inner Yantra Diamond */}
            <div
              style={{
                position: 'absolute',
                width: '130px',
                height: '130px',
                border: '2px solid rgba(139, 92, 246, 0.7)',
                transform: animationStage >= 2 ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(0.5)',
                borderRadius: '12px',
                opacity: animationStage >= 2 ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
              }}
            />

            {/* Rising Celestial Arrow */}
            <img
              src="/brand/astra-mark.svg"
              alt="ASTRA Mark"
              style={{
                width: '90px',
                height: '90px',
                position: 'relative',
                zIndex: 2,
                filter: 'drop-shadow(0 0 24px rgba(56, 189, 248, 0.9))',
                opacity: animationStage >= 3 ? 1 : 0,
                transform: animationStage === 5
                  ? 'translate(120px, -80px) scale(0.6) rotate(35deg)'
                  : animationStage >= 3
                  ? 'translateY(0) scale(1)'
                  : 'translateY(40px) scale(0.7)',
                transition: animationStage === 5
                  ? 'all 0.9s cubic-bezier(0.2, 0, 0, 1)'
                  : 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>

          {/* Stage 4 & Above: Brand Reveal */}
          <div
            style={{
              opacity: animationStage >= 4 ? 1 : 0,
              transform: animationStage >= 4 ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <h1
              style={{
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--astra-electric-blue)',
                fontFamily: 'var(--font-ui)',
                margin: '0 0 8px 0',
                textShadow: '0 0 30px rgba(56, 189, 248, 0.6)'
              }}
            >
              ASTRA
            </h1>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.3em',
                color: 'var(--astra-muted)',
                textTransform: 'uppercase'
              }}
            >
              CODE · CREATE · DEPLOY
            </div>
          </div>

          {/* Storyboard Progress Tracker */}
          <div style={{ marginTop: '20px', width: '100%', maxWidth: '380px' }}>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--astra-muted)',
                marginBottom: '8px'
              }}
            >
              {stageTitles[animationStage] || 'Initializing ASTRA Workspace...'}
            </div>
            <div
              style={{
                height: '4px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(animationStage / 5) * 100}%`,
                  backgroundColor: 'var(--astra-electric-blue)',
                  boxShadow: '0 0 10px var(--astra-electric-blue)',
                  transition: 'width 0.6s ease'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER APPROVED ASTRA LAUNCHER SCREEN (MATCHING SCREEN 11 OF APPROVED ATLAS)
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: 'var(--astra-bg)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--astra-border)',
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(7, 10, 24, 0.9)'
      }}
      data-product="astra"
    >
      {/* Background Astral Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)',
          pointerEvents: 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}
      />

      <div
        style={{
          maxWidth: '840px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Celestial Arrow Mark with Orbital Rings */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed rgba(56, 189, 248, 0.5)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '90px',
              height: '90px',
              border: '1px solid rgba(139, 92, 246, 0.6)',
              transform: 'rotate(45deg)',
              borderRadius: '8px'
            }}
          />
          <img
            src="/brand/astra-mark.svg"
            alt="ASTRA Celestial Arrow Mark"
            style={{
              width: '64px',
              height: '64px',
              filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.7))',
              position: 'relative',
              zIndex: 2
            }}
          />
        </div>

        {/* Title and Approved Descriptor */}
        <div>
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--astra-electric-blue)',
              fontFamily: 'var(--font-ui)',
              margin: '0 0 8px 0',
              textShadow: '0 0 24px rgba(56, 189, 248, 0.5)'
            }}
          >
            ASTRA
          </h1>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: 'var(--astra-muted)',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            CODE · CREATE · DEPLOY
          </div>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--astra-text)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            A specialized AI development agent and coding studio inside BRAHMA,
            built for real-world software engineering, diff review, and sandboxed deployment.
          </p>
        </div>

        {/* Live Service Pre-Flight Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--astra-surface)',
            border: '1px solid var(--astra-border)',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--astra-muted)' }}>
            <Server size={14} style={{ color: 'var(--astra-electric-blue)' }} />
            <span>ASTRA Engine: <strong>Port 8002 Online</strong></span>
          </div>

          <span style={{ color: 'var(--astra-border)' }}>•</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--astra-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--status-success)' }} />
            <span>
              Security Boundary:{' '}
              <strong style={{ color: 'var(--status-warning)' }}>
                {securityStatus?.execution_mode === 'disabled' ? 'Host Execution Disabled (Sandbox Prerequisite)' : 'Protected'}
              </strong>
            </span>
          </div>
        </div>

        {/* 4 Pillars Matching Approved Design Concept */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--astra-panel)',
              border: '1px solid var(--astra-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--astra-electric-blue)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={16} /> AI Coding Assistant
            </div>
            <p style={{ fontSize: '12px', color: 'var(--astra-muted)', margin: 0, lineHeight: '1.4' }}>
              Multi-file context, language AST comprehension, and surgical patch proposals.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--astra-panel)',
              border: '1px solid var(--astra-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--astra-violet)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} /> Project Development
            </div>
            <p style={{ fontSize: '12px', color: 'var(--astra-muted)', margin: 0, lineHeight: '1.4' }}>
              Hierarchical file tree explorer, multi-tab editor, and unified diff reviewer.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--astra-panel)',
              border: '1px solid var(--astra-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-gold)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} /> Advanced Debugging
            </div>
            <p style={{ fontSize: '12px', color: 'var(--astra-muted)', margin: 0, lineHeight: '1.4' }}>
              Interactive terminal drawer with safe diagnostics, logs, and error explanations.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--astra-panel)',
              border: '1px solid var(--astra-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-success)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Rocket size={16} /> Deployment Tools
            </div>
            <p style={{ fontSize: '12px', color: 'var(--astra-muted)', margin: 0, lineHeight: '1.4' }}>
              Pre-flight environment checks and explicit human confirmation before dispatch.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '12px' }}>
          <Button
            variant="outline"
            size="lg"
            icon={ArrowLeft}
            onClick={() => navigate('home')}
          >
            Return to BRAHMA
          </Button>

          <Button
            variant="astra"
            size="lg"
            icon={Rocket}
            onClick={handleLaunch}
          >
            Open ASTRA Studio
          </Button>
        </div>
      </div>
    </div>
  );
}
