import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigation } from '../../context/NavigationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { CreateProjectModal } from './CreateProjectModal';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  MessageSquare,
  Clock,
  Trash2,
  ExternalLink,
  Code,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

export function ProjectsWorkspace() {
  const { navigate } = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(id) {
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    }
  }

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Project Management
            </h1>
            <Badge variant="gold" icon={FolderKanban}>Atlas Screen 8</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Coordinate multi-step architectural workspaces, conversations, and coding repositories.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--status-error)',
            color: '#FCA5A5',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                backgroundColor: 'rgba(11, 15, 26, 0.7)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredProjects.length}</strong> of <strong>{projects.length}</strong>
          </div>
        </div>
      </Card>

      {/* Main Grid: Projects List + Inspect Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1fr 380px' : '1fr', gap: '20px' }}>
        {loading ? (
          <Card>
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner size="md" text="Loading projects from database..." />
            </div>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderKanban}
              title="No Projects Found"
              description="Create a project to group intelligence tasks, conversations, and coding workspaces."
              actionLabel="Create First Project"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredProjects.map(proj => {
              const isSelected = selectedProject?.id === proj.id;
              const isDeleting = deleteConfirmId === proj.id;

              return (
                <Card key={proj.id} hoverable glow={isSelected ? 'violet' : undefined}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {proj.name}
                    </h3>
                    <Badge variant={proj.isPublic ? 'cyan' : 'gold'}>
                      {proj.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', minHeight: '38px', margin: '0 0 14px 0' }}>
                    {proj.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {proj.members?.length || 1} Member
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedProject(isSelected ? null : proj)}
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="astra"
                        size="sm"
                        icon={Code}
                        onClick={() => navigate('astra/workspace')}
                        title="Open in ASTRA"
                      >
                        ASTRA
                      </Button>
                    </div>

                    {isDeleting ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProject(proj.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteConfirmId(proj.id)}
                        title="Delete project"
                      />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Selected Project Drawer */}
        {selectedProject && (
          <Card glow="gold">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={16} style={{ color: 'var(--brahma-gold)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Project Overview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Project Name
                </label>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedProject.name}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description
                </label>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '4px' }}>
                  {selectedProject.description || 'No detailed description.'}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Identifiers
                </label>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--brahma-cyan)', marginTop: '4px', wordBreak: 'break-all' }}>
                  ID: {selectedProject.id}
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all' }}>
                  Owner ID: {selectedProject.ownerId}
                </div>
              </div>

              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={MessageSquare}
                  onClick={() => navigate('chat')}
                >
                  Start Project Chat
                </Button>
                <Button
                  variant="astra"
                  size="md"
                  icon={Code}
                  onClick={() => navigate('astra/workspace')}
                >
                  Open in ASTRA Coding Studio
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={newProj => {
          setProjects(prev => [newProj, ...prev]);
        }}
      />
    </div>
  );
}
