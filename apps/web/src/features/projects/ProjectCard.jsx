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
      className={`animate-entrance friday-hud-module friday-caliper-box ${isSelected ? 'glass-card-gold' : ''}`}
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '168px',
        borderColor: isSelected ? 'rgba(246, 200, 122, 0.75)' : 'rgba(246, 200, 122, 0.22)',
        boxShadow: isSelected ? '0 8px 32px rgba(246, 200, 122, 0.3)' : undefined
      }}
    >
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(246, 200, 122, 0.2) 0%, rgba(229, 169, 60, 0.1) 100%)',
                border: '1px solid rgba(246, 200, 122, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-gold-light)'
              }}
            >
              <FolderKanban size={17} />
            </div>
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(246, 200, 122, 0.15)',
                border: '1px solid rgba(246, 200, 122, 0.35)',
                color: '#FAD982'
              }}
            >
              Active
            </span>
          </div>

          <button
            onClick={handleDeleteClick}
            className="glass-btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.5)' }}
            title="Delete project"
          >
            <Trash2 size={14} />
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
