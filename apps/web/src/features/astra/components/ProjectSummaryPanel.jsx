import React from 'react';
import {
  FolderKanban,
  GitCommit,
  FileText,
  Clock,
  Layers,
  Code2,
  Terminal,
  Play,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

export default function ProjectSummaryPanel({ project, onNavigateTab }) {
  if (!project) return null;

  const totalLines = (project.files || []).reduce((acc, f) => acc + (f.content ? f.content.split('\n').length : 20), 0);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-3.5" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Title & Path */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2.5">
          <FolderKanban size={17} color="var(--brand-gold)" />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{project.name}</span>
          <Badge variant="cyan" style={{ padding: '3px 8px', fontSize: '11px' }}>{project.status || 'active'}</Badge>
        </div>
        <span className="code-inline" style={{ fontSize: '11px', padding: '2px 7px' }}>{project.path}</span>
      </div>

      <p className="body-small text-secondary mb-3.5" style={{ fontSize: '12px', lineHeight: '1.5' }}>
        {project.description}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        <div className="flex flex-col p-2.5 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: '11px' }}>
            <FileText size={13} /> Files
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brand-cyan)' }}>
            {project.files ? project.files.length : (project.stats?.files || 48)}
          </span>
        </div>

        <div className="flex flex-col p-2.5 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: '11px' }}>
            <Code2 size={13} /> Lines of Code
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brand-gold)' }}>
            ~{totalLines.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col p-2.5 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: '11px' }}>
            <GitCommit size={13} /> Commits
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brand-violet-light)' }}>
            {project.stats?.commits || 128}
          </span>
        </div>

        <div className="flex flex-col p-2.5 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: '11px' }}>
            <Clock size={13} /> Updated
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#34D399' }}>
            {project.stats?.lastUpdated || 'Just now'}
          </span>
        </div>
      </div>

      {/* Tech Stack Badges & Architectural Boundaries */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        <div>
          <span className="body-small text-muted" style={{ fontSize: '10px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            TECHNOLOGY STACK
          </span>
          <div className="flex flex-wrap gap-1">
            {(project.techStack || []).map((t) => (
              <Badge key={t} variant="violet" size="small">{t}</Badge>
            ))}
          </div>
        </div>

        <div className="p-2 rounded bg-white/5 border border-white/5 mt-1">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={12} color="var(--status-success)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Execution & Architecture Security
            </span>
          </div>
          <p className="body-small text-muted" style={{ fontSize: '10px', lineHeight: '1.4', margin: 0 }}>
            Running in isolated browser context. Backend Node API (:3000) and ASTRA Engine (:8002) communicate via strictly scoped REST schemas. Arbitrary OS execution remains blocked.
          </p>
        </div>
      </div>
    </div>
  );
}
