import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  MessagesSquare,
  FolderKanban,
  Zap,
  Activity,
  TrendingUp,
  MessageSquare,
  Folder,
  Clock,
  CheckCircle2,
  AlertCircle,
  MinusCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FridayArcReactor from '../../components/brand/FridayArcReactor';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/project-service';
import { systemService } from '../../services/system-service';
import { conversationService } from '../../services/conversation-service';
import { aiService } from '../../services/ai-service';
import { useToast } from '../../components/feedback/Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function buildWeekBuckets(auditLogs) {
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d,
      count: 0,
      isToday: i === 6
    };
  });
  auditLogs.forEach((log) => {
    if (!log.createdAt) return;
    const logDate = new Date(log.createdAt);
    const daysAgo = Math.floor((Date.now() - logDate.getTime()) / 86400000);
    if (daysAgo >= 0 && daysAgo < 7) {
      buckets[6 - daysAgo].count += 1;
    }
  });
  return buckets;
}

// ─── Health Badge ─────────────────────────────────────────────────────────────
function HealthBadge({ status }) {
  const cfgMap = {
    checking: { dot: 'rgba(255,255,255,0.25)', bg: 'rgba(0,0,0,0.5)',       border: 'rgba(255,255,255,0.15)', label: 'CONNECTING…',         pulse: false },
    online:   { dot: '#10B981',                bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', label: 'ALL SYSTEMS ONLINE',   pulse: true  },
    degraded: { dot: '#F59E0B',                bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', label: 'PARTIAL DEGRADATION',  pulse: false },
    offline:  { dot: '#EF4444',                bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  label: 'BACKEND OFFLINE',      pulse: false }
  };
  const cfg = cfgMap[status] ?? cfgMap.checking;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: '9999px', padding: '4px 14px',
      fontSize: '10px', letterSpacing: '0.18em',
      color: cfg.dot, textTransform: 'uppercase', fontWeight: 700
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}`,
        display: 'inline-block',
        animation: cfg.pulse ? 'friday-pulse-dot 2s infinite' : 'none'
      }} />
      {cfg.label}
    </span>
  );
}

// ─── Widget 1: Usage Summary ──────────────────────────────────────────────────
function UsageSummary({ projects, conversations, aiTasks, auditLogs, isLoading }) {
  const todayActions = auditLogs.filter(l => l.createdAt && isToday(l.createdAt)).length;

  const tiles = [
    {
      label: 'Conversations',
      value: conversations.length,
      icon: MessagesSquare,
      color: '#7DD3FC',
      glow: 'rgba(56,189,248,0.25)'
    },
    {
      label: 'Projects',
      value: projects.length,
      icon: FolderKanban,
      color: '#F6C87A',
      glow: 'rgba(246,200,122,0.25)'
    },
    {
      label: 'AI Tasks Run',
      value: aiTasks.length,
      icon: Zap,
      color: '#A78BFA',
      glow: 'rgba(167,139,250,0.25)'
    },
    {
      label: 'Actions Today',
      value: todayActions,
      icon: Activity,
      color: '#10B981',
      glow: 'rgba(16,185,129,0.25)'
    }
  ];

  return (
    <div
      className="friday-caliper-box"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '20px 24px'
      }}
    >
      {tiles.map(({ label, value, icon: Icon, color, glow }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 12px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,0.07)`,
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle glow behind icon */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '40px',
            background: `radial-gradient(ellipse at center top, ${glow} 0%, transparent 70%)`,
            pointerEvents: 'none'
          }} />

          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: `rgba(${color === '#7DD3FC' ? '56,189,248' : color === '#F6C87A' ? '246,200,122' : color === '#A78BFA' ? '167,139,250' : '16,185,129'},0.12)`,
            border: `1px solid rgba(${color === '#7DD3FC' ? '56,189,248' : color === '#F6C87A' ? '246,200,122' : color === '#A78BFA' ? '167,139,250' : '16,185,129'},0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${glow}`
          }}>
            <Icon size={18} color={color} />
          </div>

          {isLoading ? (
            <div style={{ height: '36px', display: 'flex', alignItems: 'center' }}>
              <LoadingSpinner size={18} label="" />
            </div>
          ) : (
            <span style={{
              fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1,
              fontFamily: "'Michroma', sans-serif",
              textShadow: `0 0 20px ${glow}`
            }}>
              {value}
            </span>
          )}

          <span style={{
            fontSize: '10.5px', color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Widget 2: Weekly Activity Chart ─────────────────────────────────────────
function WeeklyActivityChart({ auditLogs, isLoading }) {
  const buckets = buildWeekBuckets(auditLogs);
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const totalWeek = buckets.reduce((s, b) => s + b.count, 0);
  const peakDay = buckets.reduce((a, b) => (b.count > a.count ? b : a), buckets[0]);

  return (
    <div
      className="friday-hud-module friday-caliper-box"
      style={{ padding: '22px 24px', borderRadius: '18px', height: '100%', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <TrendingUp size={16} color="#10B981" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>Weekly Activity</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Your usage over the last 7 days
          </p>
        </div>
        {!isLoading && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{totalWeek}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              total actions
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
          <LoadingSpinner size={24} label="" />
        </div>
      ) : (
        <>
          {/* Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', marginBottom: '10px' }}>
            {buckets.map((b) => {
              const heightPct = b.count > 0 ? Math.max((b.count / maxCount) * 100, 10) : 5;
              const isPeak = !b.isToday && b.count === peakDay.count && b.count > 0;
              return (
                <div
                  key={b.label}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}
                >
                  <div
                    title={`${b.label}: ${b.count} action${b.count !== 1 ? 's' : ''}`}
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      minHeight: '4px',
                      borderRadius: '5px 5px 3px 3px',
                      background: b.isToday
                        ? 'linear-gradient(180deg, #FFE89E 0%, #F6C87A 50%, #D49A3E 100%)'
                        : isPeak
                          ? 'rgba(167,139,250,0.5)'
                          : b.count > 0
                            ? 'rgba(255,255,255,0.18)'
                            : 'rgba(255,255,255,0.06)',
                      boxShadow: b.isToday
                        ? '0 0 12px rgba(246,200,122,0.5)'
                        : isPeak
                          ? '0 0 8px rgba(167,139,250,0.4)'
                          : 'none',
                      transition: 'height 0.5s cubic-bezier(0.16,1,0.3,1)',
                      cursor: 'default'
                    }}
                  />
                  <span style={{
                    fontSize: '9.5px',
                    color: b.isToday ? '#FAD982' : 'rgba(255,255,255,0.4)',
                    fontWeight: b.isToday ? 700 : 400,
                    letterSpacing: '0.04em'
                  }}>
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '2px', background: 'linear-gradient(135deg,#F6C87A,#D49A3E)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Today</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '2px', background: 'rgba(167,139,250,0.5)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Peak day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '2px', background: 'rgba(255,255,255,0.18)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Past days</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Widget 3: Unified Activity Feed ─────────────────────────────────────────
function UnifiedActivityFeed({ conversations, projects, auditLogs, isLoading, onNavigate }) {
  // Merge all 3 sources into one sorted timeline
  const feedItems = [
    ...conversations.slice(0, 3).map(c => ({
      id: `conv-${c.id}`,
      type: 'chat',
      label: c.title || 'Untitled Conversation',
      time: c.updatedAt || c.createdAt,
      icon: MessageSquare,
      color: '#7DD3FC',
      action: () => onNavigate('chat')
    })),
    ...projects.slice(0, 3).map(p => ({
      id: `proj-${p.id}`,
      type: 'project',
      label: p.name,
      time: p.updatedAt || p.createdAt,
      icon: Folder,
      color: '#F6C87A',
      action: () => onNavigate('projects')
    })),
    ...auditLogs.slice(0, 4).map(l => ({
      id: `log-${l.id}`,
      type: 'event',
      label: l.action ? l.action.replace(/_/g, ' ') : 'System event',
      time: l.createdAt,
      icon: Activity,
      color: 'rgba(255,255,255,0.45)',
      action: null
    }))
  ]
    .filter(item => item.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  const typeLabel = { chat: 'Chat', project: 'Project', event: 'Event' };

  return (
    <div
      className="friday-hud-module friday-caliper-box"
      style={{ padding: '22px 24px', borderRadius: '18px', height: '100%', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Clock size={16} color="rgba(255,255,255,0.6)" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>Activity Feed</span>
        </div>
        <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Chats, projects & events — newest first
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
          <LoadingSpinner size={24} label="" />
        </div>
      ) : feedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
          No activity yet. Start a chat or create a project.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Vertical timeline line */}
          <div style={{
            position: 'absolute', left: '15px', top: '8px', bottom: '8px', width: '1px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)'
          }} />

          {feedItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action || undefined}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '9px 8px 9px 0',
                  borderBottom: idx < feedItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: item.action ? 'pointer' : 'default',
                  borderRadius: '8px',
                  transition: item.action ? 'background 0.15s ease' : 'none'
                }}
                className={item.action ? 'glass-card-interactive' : ''}
              >
                {/* Timeline dot */}
                <div style={{
                  width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                  background: `rgba(${item.color === '#7DD3FC' ? '56,189,248' : item.color === '#F6C87A' ? '246,200,122' : '255,255,255'},0.08)`,
                  border: `1px solid rgba(${item.color === '#7DD3FC' ? '56,189,248' : item.color === '#F6C87A' ? '246,200,122' : '255,255,255'},0.18)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1, position: 'relative', marginLeft: '1px'
                }}>
                  <Icon size={13} color={item.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'hidden', paddingTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{
                      fontSize: '12.5px', fontWeight: 500, color: '#FFFFFF',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                      {timeAgo(item.time)}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px', color: item.color, opacity: 0.8,
                    textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600
                  }}>
                    {typeLabel[item.type]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function HomeDashboard({ onNavigate, onStartChat }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState('');

  const [projects,      setProjects]      = useState([]);
  const [conversations, setConversations] = useState([]);
  const [auditLogs,     setAuditLogs]     = useState([]);
  const [aiTasks,       setAiTasks]       = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [healthStatus,  setHealthStatus]  = useState('checking');
  const healthRef = useRef(null);

  // ── Fetch all data ──
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projRes, auditRes, convRes, taskRes] = await Promise.allSettled([
          projectService.list(),
          systemService.getAuditEvents(),
          conversationService.list(),
          aiService.listTasks()
        ]);
        if (!mounted) return;
        if (projRes.status  === 'fulfilled' && Array.isArray(projRes.value))  setProjects(projRes.value);
        if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value)) setAuditLogs(auditRes.value.slice(0, 30));
        if (convRes.status  === 'fulfilled' && Array.isArray(convRes.value))  setConversations(convRes.value);
        if (taskRes.status  === 'fulfilled' && Array.isArray(taskRes.value))  setAiTasks(taskRes.value);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // ── Health poll every 30 s ──
  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await systemService.getLiveHealth();
        if (!mounted) return;
        const ok = res && (res.status === 'ok' || res.status === 'healthy' || res.ok === true);
        setHealthStatus(ok ? 'online' : 'degraded');
      } catch {
        if (mounted) setHealthStatus('offline');
      }
    }
    check();
    healthRef.current = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(healthRef.current); };
  }, []);

  const handleComposerSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (onStartChat) onStartChat(prompt);
    else onNavigate('chat');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickChips = [
    { label: 'Ask FRIDAY anything', action: () => onNavigate('chat')    },
    { label: 'Open EDITH Studio',   action: () => onNavigate('astra')   },
    { label: 'Browse my Files',     action: () => onNavigate('files')   }
  ];

  return (
    <div
      className="flex flex-col gap-6 animate-entrance"
      style={{ maxWidth: '1420px', margin: '0 auto', paddingBottom: '32px' }}
    >
      {/* ── Hero ── */}
      <div
        className="friday-hero-deck friday-caliper-box flex flex-col items-center text-center"
        style={{ padding: '38px 28px 30px', borderRadius: '24px' }}
      >
        <div style={{ marginBottom: '10px' }}>
          <FridayArcReactor size={52} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <HealthBadge status={healthStatus} />
        </div>

        <h1 style={{
          fontFamily: "'Michroma', 'Syncopate', sans-serif",
          fontSize: '34px', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '4px',
          background: 'linear-gradient(180deg,#FFFFFF 0%,#FFF3D6 24%,#F6C87A 58%,#D49A3E 82%,#9B6717 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 24px rgba(246,200,122,0.45)) drop-shadow(0 4px 14px rgba(0,0,0,0.85))'
        }}>
          {getGreeting()}, FRIDAY
        </h1>

        <p className="body-regular" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', marginBottom: '22px' }}>
          What would you like to explore in FRIDAY today?
        </p>

        {/* Composer */}
        <form
          onSubmit={handleComposerSubmit}
          className="friday-composer-capsule flex items-center gap-3 w-full"
          style={{ maxWidth: '740px', padding: '6px 8px 6px 18px', boxSizing: 'border-box' }}
        >
          <Search size={18} color="#F6C87A" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="body-regular"
            placeholder="Ask FRIDAY anything, build code with EDITH, or analyze your files..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF', fontSize: '14.5px' }}
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            style={{
              padding: '8px 18px', borderRadius: '9999px', border: 'none', flexShrink: 0,
              background: prompt.trim()
                ? 'linear-gradient(135deg,#FFE89E 0%,#F6C87A 50%,#D49A3E 100%)'
                : 'rgba(255,255,255,0.1)',
              color: prompt.trim() ? '#0B0A12' : 'rgba(255,255,255,0.4)',
              fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: prompt.trim() ? '0 0 16px rgba(246,200,122,0.5)' : 'none',
              transition: 'all 0.22s ease'
            }}
          >
            <span>EXECUTE</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick chips */}
        <div className="flex gap-2 flex-wrap justify-center" style={{ marginTop: '16px' }}>
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.action}
              className="friday-quick-chip"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Widget 1: Usage Summary ── */}
      <UsageSummary
        projects={projects}
        conversations={conversations}
        aiTasks={aiTasks}
        auditLogs={auditLogs}
        isLoading={isLoading}
      />

      {/* ── Widgets 2 & 3 side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '20px' }}>
        <WeeklyActivityChart auditLogs={auditLogs} isLoading={isLoading} />
        <UnifiedActivityFeed
          conversations={conversations}
          projects={projects}
          auditLogs={auditLogs}
          isLoading={isLoading}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
