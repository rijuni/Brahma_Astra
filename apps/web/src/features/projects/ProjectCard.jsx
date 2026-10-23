import React from 'react';
import { FolderKanban, Users, Trash2, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function ProjectCard({
  project,
  isSelected,
  onSelect,
  onDelete
}) {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(project);
  };

  return (
    <Card
      onClick={onSelect}
      className={`animate-entrance ${isSelected ? 'glass-card-gold' : ''}`}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        borderColor: isSelected ? 'var(--brand-gold)' : undefined,
        boxShadow: isSelected ? '0 8px 30px var(--brand-gold-glow)' : undefined
      }}
    >
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(246, 200, 122, 0.15)',
                border: '1px solid var(--glass-border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-gold)'
              }}
            >
              <FolderKanban size={16} />
            </div>
            <Badge variant="violet">Active</Badge>
          </div>

          <button
            onClick={handleDeleteClick}
            className="glass-btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Delete project"
          >
            <Trash2 size={14} color="var(--text-muted)" />
          </button>
        </div>

        <h3 className="card-title" style={{ fontSize: '16px', marginBottom: '6px' }}>
          {project.name}
        </h3>

        <p
          className="body-small text-muted"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '14px'
          }}
        >
          {project.description || 'No project description provided.'}
        </p>
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--glass-border)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {project.members?.length || 1} Member
        </span>
      </div>
    </Card>
  );
}
