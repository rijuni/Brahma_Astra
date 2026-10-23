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
  Plus
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
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

  const featureCards = [
    { id: 'chat', title: 'CHAT', subtitle: 'Start new intelligence session', icon: MessageSquare, variant: 'violet' },
    { id: 'research', title: 'RESEARCH', subtitle: 'Search knowledge base & citations', icon: Search, variant: 'cyan' },
    { id: 'files', title: 'DOCUMENTS', subtitle: 'Manage & inspect files', icon: FileText, variant: 'default' },
    { id: 'projects', title: 'PROJECTS', subtitle: 'View & organize workflows', icon: FolderKanban, variant: 'gold' },
    { id: 'memory', title: 'MEMORY', subtitle: 'Explore personal knowledge', icon: Brain, variant: 'default' },
    { id: 'agents', title: 'AGENTS', subtitle: 'Deploy specialist AI agents', icon: Bot, variant: 'cyan' }
  ];

  const quickChips = [
    'Summarize a PDF',
    'Analyze an image',
    'Research latest papers',
    'Generate code'
  ];

  return (
    <div className="flex flex-col gap-6 animate-entrance" style={{ maxWidth: '1380px', margin: '0 auto' }}>
      {/* Hero Welcome & Composer */}
      <div
        className="glass-card flex flex-col items-center text-center"
        style={{
          padding: '40px 24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--hero-card-bg, linear-gradient(180deg, rgba(30, 27, 61, 0.6) 0%, rgba(17, 24, 39, 0.7) 100%))',
          border: '1px solid var(--glass-border-violet)'
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
          <img
            src="/brand/brahma-mark.svg"
            alt="BRAHMA"
            className="brahma-logo-gold"
            style={{ width: '32px', height: '32px' }}
          />
          <Badge variant="gold">YOUR INTELLIGENCE CORE</Badge>
        </div>

        <h1
          className="display-title"
          style={{
            fontSize: '32px',
            marginBottom: '8px',
            background: 'var(--hero-title-gradient, linear-gradient(135deg, #FFFFFF 0%, #F7F7FB 70%, var(--brand-gold-light) 100%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Good Evening, {user?.name || 'Amlan'}
        </h1>

        <p className="body-regular text-muted" style={{ marginBottom: '20px' }}>
          What would you like to explore in BRAHMA today?
        </p>

        {/* Feature Pills */}
        <div className="flex gap-2 flex-wrap justify-center" style={{ marginBottom: '28px' }}>
          <span className="badge badge-gold flex items-center gap-1">
            <Sparkles size={11} /> Intelligent
          </span>
          <span className="badge badge-violet flex items-center gap-1">
            <Brain size={11} /> Multimodal
          </span>
          <span className="badge badge-cyan flex items-center gap-1">
            <Shield size={11} /> Secure
          </span>
          <span className="badge flex items-center gap-1">
            <Lock size={11} /> Private Context
          </span>
        </div>

        {/* Floating Glass Composer */}
        <form
          onSubmit={handleComposerSubmit}
          className="glass-card flex items-center gap-3 w-full"
          style={{
            maxWidth: '680px',
            padding: '6px 12px 6px 18px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--glass-border-violet)',
            boxShadow: 'var(--composer-shadow, 0 8px 32px var(--brand-violet-glow))',
            background: 'var(--composer-bg, var(--glass-surface-elevated))'
          }}
        >
          <Search size={18} color="var(--brand-violet-light)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="body-regular"
            placeholder="Ask Brahma anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '15px'
            }}
          />
          <button
            type="button"
            onClick={() => addToast('File attachment available in Chat view.', 'info')}
            className="glass-btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
            title="Attach file"
          >
            <Paperclip size={16} color="var(--text-muted)" />
          </button>
          <button
            type="button"
            onClick={() => addToast('Voice input requires microphone permissions.', 'info')}
            className="glass-btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
            title="Voice input"
          >
            <Mic size={16} color="var(--text-muted)" />
          </button>
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="glass-btn glass-btn-primary flex items-center justify-center"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          >
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex gap-2 flex-wrap justify-center" style={{ marginTop: '16px' }}>
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => { setPrompt(chip); }}
              className="glass-btn glass-btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Feature Cards + Right Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Left Column: 6 Core Feature Cards */}
        <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.id}
                onClick={() => onNavigate(feat.id === 'files' ? 'files' : feat.id === 'projects' ? 'projects' : 'chat')}
                className="flex flex-col justify-between"
                style={{ minHeight: '140px', padding: '20px' }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid var(--glass-border-violet)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-violet-light)'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="body-small text-muted flex items-center gap-1">
                    Open <ExternalLink size={12} />
                  </span>
                </div>
                <div>
                  <h3 className="card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>
                    {feat.title}
                  </h3>
                  <p className="body-small text-muted">{feat.subtitle}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Rail: Recent Activity & Recent Projects */}
        <div className="flex flex-col gap-4" style={{ gridColumn: 'span 4' }}>
          {/* Recent Projects Card */}
          <Card style={{ padding: '18px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
              <span className="card-title" style={{ fontSize: '14px' }}>Recent Projects</span>
              <button
                onClick={() => onNavigate('projects')}
                className="glass-btn-ghost body-small text-violet"
                style={{ fontSize: '12px', border: 'none', cursor: 'pointer' }}
              >
                View All
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner size={24} label="" />
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
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                      <FolderKanban size={14} color="var(--brand-gold)" />
                      <span className="body-regular" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {proj.name}
                      </span>
                    </div>
                    <span className="body-small text-muted" style={{ fontSize: '11px' }}>
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity Card */}
          <Card style={{ padding: '18px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
              <span className="card-title" style={{ fontSize: '14px' }}>Recent Activity</span>
              <Clock size={14} color="var(--text-muted)" />
            </div>

            {isLoading ? (
              <LoadingSpinner size={24} label="" />
            ) : auditLogs.length === 0 ? (
              <p className="body-small text-muted" style={{ padding: '12px 0', textAlign: 'center' }}>
                No recent activity logged.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1"
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: '2px solid var(--brand-violet)'
                    }}
                  >
                    <span className="body-regular" style={{ fontSize: '12px', fontWeight: 500 }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="body-small text-muted" style={{ fontSize: '10px' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
