import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  FileText,
  FolderKanban,
  Brain,
  Bot,
  Paperclip,
  Mic,
  ArrowRight,
  Sparkles,
  Shield,
  Lock,
  Clock,
  ExternalLink,
  Plus,
  Code2,
  Activity,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import FridayArcReactor from '../../components/brand/FridayArcReactor';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/project-service';
import { systemService } from '../../services/system-service';
import { useToast } from '../../components/feedback/Toast';

export default function HomeDashboard({ onNavigate, onStartChat }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchDashboardData() {
      try {
        const [projectsData, auditData] = await Promise.allSettled([
          projectService.list(),
          systemService.getAuditEvents()
        ]);

        if (mounted) {
          if (projectsData.status === 'fulfilled' && Array.isArray(projectsData.value)) {
            setProjects(projectsData.value.slice(0, 5));
          }
          if (auditData.status === 'fulfilled' && Array.isArray(auditData.value)) {
            setAuditLogs(auditData.value.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchDashboardData();
    return () => { mounted = false; };
  }, []);

  const handleComposerSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (onStartChat) {
      onStartChat(prompt);
    } else {
      onNavigate('chat');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const featureCards = [
    {
      id: 'astra',
      title: 'EDITH STUDIO',
      subtitle: 'Autonomous AI software development environment & IDE',
      badge: 'DEV ENGINE v2.4',
      badgeColor: 'gold',
      icon: Code2,
      actionLabel: 'Launch Studio'
    },
    {
      id: 'chat',
      title: 'NEURAL CHAT',
      subtitle: 'Multi-turn reasoning, streaming synthesis & context exploration',
      badge: 'STREAMING ACTIVE',
      badgeColor: 'amber',
      icon: MessageSquare,
      actionLabel: 'Open Session'
    },
    {
      id: 'files',
      title: 'DOCUMENTS',
      subtitle: 'Inspect, index, and organize workspace files & vector embeddings',
      badge: 'ENCRYPTED VAULT',
      badgeColor: 'cyan',
      icon: FileText,
      actionLabel: 'Browse Vault'
    },
    {
      id: 'projects',
      title: 'PROJECT WORKFLOWS',
      subtitle: 'Manage autonomous pipelines, tasks, and stateful memory',
      badge: 'STATEFUL MEMORY',
      badgeColor: 'gold',
      icon: FolderKanban,
      actionLabel: 'Manage Projects'
    },
    {
      id: 'research',
      title: 'DEEP RESEARCH',
      subtitle: 'Multi-source citation synthesis and verified knowledge extraction',
      badge: 'CITATION ENGINE',
      badgeColor: 'cyan',
      icon: Search,
      actionLabel: 'Start Research'
    },
    {
      id: 'agents',
      title: 'SPECIALIST AGENTS',
      subtitle: 'Deploy specialized multi-agent swarms for autonomous execution',
      badge: 'CLUSTER READY',
      badgeColor: 'violet',
      icon: Bot,
      actionLabel: 'Dispatch Swarm'
    }
  ];

  const quickChips = [
    'Summarize a PDF',
    'Analyze an image',
    'Research latest papers',
    'Generate code in EDITH',
    'Audit security vulnerabilities'
  ];

  return (
    <div className="flex flex-col gap-6 animate-entrance" style={{ maxWidth: '1420px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* 1. Cockpit Hero Command Deck with Stark Calipers */}
      <div
        className="friday-hero-deck friday-caliper-box flex flex-col items-center text-center"
        style={{
          padding: '38px 28px 32px',
          borderRadius: '24px'
        }}
      >
        {/* Animated Arc Reactor Emblem Lockup */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <FridayArcReactor size={52} />
        </div>

        {/* Telemetry Status Beacon */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(246, 200, 122, 0.35)',
            borderRadius: '9999px',
            padding: '4px 16px',
            marginBottom: '10px'
          }}
        >
          <span className="telemetry-beacon-online" />
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.24em',
              color: 'var(--brand-gold-light)',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            SYSTEMS OPERATIONAL // ALL ENGINES ONLINE
          </span>
        </div>

        {/* Dynamic User Greeting */}
        <h1
          style={{
            fontFamily: "'Michroma', 'Syncopate', sans-serif",
            fontSize: '34px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '4px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF3D6 24%, #F6C87A 58%, #D49A3E 82%, #9B6717 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 24px rgba(246, 200, 122, 0.45)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85))'
          }}
        >
          {getGreeting()}, {user?.name || 'Amlan'}
        </h1>

        <p className="body-regular" style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '15px', marginBottom: '6px' }}>
          What would you like to explore in FRIDAY today?
        </p>

        {/* Cinematic Environmental Motto */}
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.26em',
            color: 'var(--brand-gold-light)',
            textTransform: 'uppercase',
            marginBottom: '20px',
            fontWeight: 700,
            opacity: 0.95
          }}
        >
          THINK · EXPLORE · CREATE · EVOLVE
        </div>

        {/* Feature Capability Badges */}
        <div className="flex gap-2.5 flex-wrap justify-center" style={{ marginBottom: '26px' }}>
          <span
            className="flex items-center gap-1.5"
            style={{
              background: 'rgba(246, 200, 122, 0.12)',
              border: '1px solid rgba(246, 200, 122, 0.35)',
              borderRadius: '9999px',
              padding: '4px 13px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#FAD982'
            }}
          >
            <Sparkles size={11} /> Intelligent Neural Core
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{
              background: 'rgba(229, 169, 60, 0.1)',
              border: '1px solid rgba(229, 169, 60, 0.3)',
              borderRadius: '9999px',
              padding: '4px 13px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#F6C87A'
            }}
          >
            <Brain size={11} /> Multimodal Synthesis
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '9999px',
              padding: '4px 13px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#7DD3FC'
            }}
          >
            <Shield size={11} /> Quantum-Safe Enclave
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '9999px',
              padding: '4px 13px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)'
            }}
          >
            <Code2 size={11} /> EDITH Autonomous Studio
          </span>
        </div>

        {/* Cockpit Floating AI Composer */}
        <form
          onSubmit={handleComposerSubmit}
          className="friday-composer-capsule flex items-center gap-3 w-full"
          style={{
            maxWidth: '740px',
            padding: '6px 8px 6px 18px',
            boxSizing: 'border-box'
          }}
        >
          <Search size={18} color="#F6C87A" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="body-regular"
            placeholder="Ask FRIDAY anything, build code with EDITH, or analyze telemetry..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '14.5px'
            }}
          />
          <button
            type="button"
            onClick={() => addToast('File attachment available in Chat view.', 'info')}
            className="glass-btn-ghost"
            style={{
              padding: '6px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.65)'
            }}
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <button
            type="button"
            onClick={() => addToast('Voice input requires microphone permissions.', 'info')}
            className="glass-btn-ghost"
            style={{
              padding: '6px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.65)'
            }}
            title="Voice input"
          >
            <Mic size={16} />
          </button>
          <button
            type="submit"
            disabled={!prompt.trim()}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: 'none',
              background: prompt.trim()
                ? 'linear-gradient(135deg, #FFE89E 0%, #F6C87A 50%, #D49A3E 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: prompt.trim() ? '#0B0A12' : 'rgba(255, 255, 255, 0.4)',
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: prompt.trim() ? '0 0 16px rgba(246, 200, 122, 0.5)' : 'none',
              transition: 'all 0.22s ease',
              flexShrink: 0
            }}
            title="Launch prompt in FRIDAY"
          >
            <span>EXECUTE</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex gap-2 flex-wrap justify-center" style={{ marginTop: '16px' }}>
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => { setPrompt(chip); }}
              className="friday-quick-chip"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Cockpit Command Deck Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '22px' }}>
        {/* Left Rail: 6 Core HUD Module Panels (Span 8) */}
        <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            const isStudio = feat.id === 'astra';
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.id === 'astra' ? 'astra' : feat.id === 'files' ? 'files' : feat.id === 'projects' ? 'projects' : 'chat')}
                className="friday-hud-module friday-caliper-box"
                style={{
                  borderColor: isStudio ? 'rgba(246, 200, 122, 0.45)' : undefined
                }}
              >
                {/* Card Top: Icon & Badge */}
                <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: isStudio
                        ? 'linear-gradient(135deg, rgba(246, 200, 122, 0.22) 0%, rgba(229, 169, 60, 0.12) 100%)'
                        : 'rgba(255, 255, 255, 0.06)',
                      border: isStudio
                        ? '1px solid rgba(246, 200, 122, 0.55)'
                        : '1px solid rgba(255, 255, 255, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isStudio ? 'var(--brand-gold-light)' : '#FFFFFF',
                      boxShadow: isStudio ? '0 0 18px rgba(246, 200, 122, 0.35)' : 'none'
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: isStudio ? 'rgba(246, 200, 122, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                      border: isStudio ? '1px solid rgba(246, 200, 122, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                      color: isStudio ? '#FAD982' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    {feat.badge}
                  </span>
                </div>

                {/* Card Middle: Title & Subtitle */}
                <div style={{ flex: 1, marginBottom: '14px' }}>
                  <h3
                    style={{
                      fontSize: '15.5px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      color: 'rgba(255, 255, 255, 0.68)',
                      margin: 0
                    }}
                  >
                    {feat.subtitle}
                  </p>
                </div>

                {/* Card Bottom: Action Link */}
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: isStudio ? '#FAD982' : 'rgba(255, 255, 255, 0.75)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {feat.actionLabel}
                  </span>
                  <ExternalLink size={13} className="hud-action-arrow" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Rail: Telemetry Hub & Recent Projects (Span 4) */}
        <div className="flex flex-col gap-4" style={{ gridColumn: 'span 4' }}>
          {/* Cockpit Microservice Telemetry Monitor */}
          <div
            className="friday-hero-deck friday-caliper-box"
            style={{
              padding: '18px 20px',
              borderRadius: '18px'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
              <div className="flex items-center gap-2">
                <Activity size={16} color="var(--brand-gold-light)" />
                <span
                  style={{
                    fontFamily: "'Michroma', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#FFFFFF'
                  }}
                >
                  Cockpit Telemetry
                </span>
              </div>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                LIVE MONITOR
              </span>
            </div>

            {/* Microservice Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div className="telemetry-stat-tile">
                <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gateway :3000</div>
                <div className="flex items-center gap-1.5" style={{ marginTop: '2px' }}>
                  <span className="telemetry-beacon-online" />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>Connected</span>
                </div>
              </div>

              <div className="telemetry-stat-tile">
                <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Core AI :8001</div>
                <div className="flex items-center gap-1.5" style={{ marginTop: '2px' }}>
                  <span className="telemetry-beacon-online" />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>Online</span>
                </div>
              </div>

              <div className="telemetry-stat-tile">
                <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Engine :8002</div>
                <div className="flex items-center gap-1.5" style={{ marginTop: '2px' }}>
                  <span className="telemetry-beacon-online" />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>Active</span>
                </div>
              </div>

              <div className="telemetry-stat-tile">
                <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sandbox :8003</div>
                <div className="flex items-center gap-1.5" style={{ marginTop: '2px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#F59E0B',
                      boxShadow: '0 0 6px #F59E0B'
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>Armed</span>
                </div>
              </div>
            </div>

            {/* Live CPU & Memory Visual Gauges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', background: 'rgba(0, 0, 0, 0.45)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(246, 200, 122, 0.14)' }}>
              <div>
                <div className="flex items-center justify-between" style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Cpu size={11} color="var(--brand-gold-light)" /> CPU LOAD
                  </span>
                  <span style={{ color: 'var(--brand-gold-light)', fontWeight: 700 }}>28%</span>
                </div>
                <div className="friday-metric-track">
                  <div className="friday-metric-fill" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between" style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={11} color="#7DD3FC" /> MEMORY POOL
                  </span>
                  <span style={{ color: '#7DD3FC', fontWeight: 700 }}>4.2 / 16 GB</span>
                </div>
                <div className="friday-metric-track">
                  <div className="friday-metric-fill" style={{ width: '38%', background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)', boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)' }} />
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center justify-between" style={{ paddingTop: '4px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DATA STREAMS
                </span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '14px' }}>
                  <div className="telemetry-wave-bar wave-bar-1" style={{ height: '8px' }} />
                  <div className="telemetry-wave-bar wave-bar-2" style={{ height: '12px' }} />
                  <div className="telemetry-wave-bar wave-bar-3" style={{ height: '6px' }} />
                  <div className="telemetry-wave-bar wave-bar-4" style={{ height: '14px' }} />
                  <div className="telemetry-wave-bar wave-bar-1" style={{ height: '10px' }} />
                  <div className="telemetry-wave-bar wave-bar-3" style={{ height: '7px' }} />
                </div>
              </div>
            </div>

            {/* Quick Station Metric */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.6)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '8px'
              }}
            >
              <span>Cluster Uptime: 99.98%</span>
              <span style={{ color: 'var(--brand-gold-light)' }}>Latency: 12ms</span>
            </div>
          </div>

          {/* Recent Workflows Card with Caliper styling */}
          <div
            className="friday-hud-module friday-caliper-box"
            style={{
              padding: '18px 20px',
              borderRadius: '18px',
              minHeight: 'auto'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <FolderKanban size={15} color="var(--brand-gold)" />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>Recent Workflows</span>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="glass-btn-ghost body-small"
                style={{ fontSize: '11.5px', color: '#FAD982', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View All →
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner size={22} label="" />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create a project to organize conversations and files."
                actionLabel="+ New Project"
                onAction={() => onNavigate('projects')}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onNavigate('projects')}
                    className="flex items-center justify-between p-2 glass-card-interactive"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                      <FolderKanban size={13} color="var(--brand-gold)" />
                      <span className="body-regular" style={{ fontSize: '12.5px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {proj.name}
                      </span>
                    </div>
                    <span className="body-small text-muted" style={{ fontSize: '10.5px' }}>
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div
            className="friday-hud-module"
            style={{
              padding: '18px 20px',
              borderRadius: '18px',
              minHeight: 'auto'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <Clock size={15} color="rgba(255, 255, 255, 0.6)" />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>Recent Activity</span>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner size={22} label="" />
            ) : auditLogs.length === 0 ? (
              <p className="body-small text-muted" style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px' }}>
                No recent activity logged.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-0.5"
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: '2.5px solid var(--brand-gold)'
                    }}
                  >
                    <span className="body-regular" style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="body-small text-muted" style={{ fontSize: '10px' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
