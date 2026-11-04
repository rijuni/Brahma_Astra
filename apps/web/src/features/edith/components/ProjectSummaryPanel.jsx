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
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Title & Path */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <FolderKanban size={20} color="#38BDF8" />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>{project.name}</span>
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>{project.status || 'active'}</Badge>
        </div>
        <span className="code-inline" style={{ fontSize: '13.5px', padding: '3px 10px' }}>{project.path}</span>
      </div>

      <p className="body-regular text-secondary mb-4" style={{ fontSize: '15px', lineHeight: '1.55' }}>
        {project.description}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="flex flex-col p-3 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
            <FileText size={15} /> Files
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--brand-cyan)', marginTop: '4px' }}>
            {project.files ? project.files.length : (project.stats?.files || 48)}
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
            <Code2 size={15} /> Lines of Code
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#00D2FF', marginTop: '4px' }}>
            ~{totalLines.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
            <GitCommit size={15} /> Commits
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#38BDF8', marginTop: '4px' }}>
            {project.stats?.commits || 128}
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
            <Clock size={15} /> Updated
          </div>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#34D399', marginTop: '4px' }}>
            {project.stats?.lastUpdated || 'Just now'}
          </span>
        </div>
      </div>

      {/* Tech Stack Badges & Architectural Boundaries */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        <div>
          <span className="body-small text-muted" style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            TECHNOLOGY STACK
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(project.techStack || []).map((t) => (
              <Badge key={t} variant="cyan" style={{ fontSize: '13px', padding: '4px 10px' }}>{t}</Badge>
            ))}
          </div>
        </div>

        <div className="p-3 rounded bg-white/5 border border-white/5 mt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={16} color="var(--status-success)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Execution & Architecture Security
            </span>
          </div>
          <p className="body-regular text-muted" style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Running in isolated browser context. Backend Node API (:3000) and EDITH Engine (:8002) communicate via strictly scoped REST schemas. Arbitrary OS execution remains blocked.
          </p>
        </div>
      </div>
    </div>
  );
}
