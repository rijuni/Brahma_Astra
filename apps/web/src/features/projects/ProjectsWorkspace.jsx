import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  FileText,
  Trash2,
  Calendar,
  Users,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { projectService } from '../../services/project-service';
import { useToast } from '../../components/feedback/Toast';

export default function ProjectsWorkspace({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      try {
        const data = await projectService.list();
        if (mounted && Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0 && !selectedProject) {
            setSelectedProject(data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadProjects();
    return () => { mounted = false; };
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectService.delete(projectToDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      if (selectedProject?.id === projectToDelete.id) {
        setSelectedProject(null);
      }
      addToast(`Project "${projectToDelete.name}" deleted.`, 'info');
      setProjectToDelete(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-entrance" style={{ maxWidth: '1380px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '4px' }}>
            Projects Workspace
          </h1>
          <p className="body-small text-muted">
            Organize multi-step workflows, conversations, and technical documentation.
          </p>
        </div>

        <Button
          variant="gold"
          onClick={() => setIsCreateOpen(true)}
          icon={Plus}
        >
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="glass-input flex items-center gap-2" style={{ maxWidth: '320px', padding: '8px 14px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }}
          />
        </div>

        <div
          className="flex"
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            border: '1px solid var(--glass-border)'
          }}
        >
          {['all', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`glass-btn ${filterTab === tab ? 'glass-btn-secondary' : 'glass-btn-ghost'}`}
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                textTransform: 'capitalize',
                background: filterTab === tab ? 'rgba(255, 255, 255, 0.12)' : 'transparent'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid & Details Split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? 'repeat(12, 1fr)' : '1fr', gap: '24px' }}>
        {/* Project Cards Column */}
        <div style={{ gridColumn: selectedProject ? 'span 8' : 'span 12' }}>
          {isLoading ? (
            <LoadingSpinner size={32} label="Loading projects..." />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects found"
              description="Get started by creating your first intelligence project."
              actionLabel="+ Create Project"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onSelect={() => setSelectedProject(project)}
                  onDelete={(p) => setProjectToDelete(p)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Project Details Drawer */}
        {selectedProject && (
          <div
            className="glass-card flex flex-col justify-between animate-entrance"
            style={{
              gridColumn: 'span 4',
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              maxHeight: '680px',
              border: '1px solid var(--glass-border-violet)'
            }}
          >
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <span className="card-title" style={{ fontSize: '15px' }}>Project Overview</span>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="glass-btn-ghost"
                  style={{ padding: '4px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                >
                  <X size={16} color="var(--text-muted)" />
                </button>
              </div>

              <h2 className="section-title" style={{ fontSize: '20px', color: 'var(--brand-gold)', marginBottom: '8px' }}>
                {selectedProject.name}
              </h2>

              <p className="body-regular text-muted" style={{ marginBottom: '20px', fontSize: '13px' }}>
                {selectedProject.description || 'No description added for this project.'}
              </p>

              <div className="flex flex-col gap-3" style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="body-small text-muted flex items-center gap-1">
                    <Calendar size={13} /> Created
                  </span>
                  <span className="body-small" style={{ fontWeight: 500 }}>
                    {new Date(selectedProject.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small text-muted flex items-center gap-1">
                    <Users size={13} /> Members
                  </span>
                  <span className="body-small" style={{ fontWeight: 500 }}>
                    {selectedProject.members?.length || 1} Active
                  </span>
                </div>
              </div>

              {/* Attached Files Section */}
              <div style={{ marginBottom: '20px' }}>
                <span className="card-title" style={{ fontSize: '13px', display: 'block', marginBottom: '10px' }}>
                  Project Documentation & Files
                </span>
                <div className="flex flex-col gap-2">
                  <div className="glass-card flex items-center justify-between p-2" style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div className="flex items-center gap-2">
                      <FileText size={14} color="var(--brand-cyan)" />
                      <span className="body-small">Architecture_Notes.md</span>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Indexed</span>
                  </div>
                  <div className="glass-card flex items-center justify-between p-2" style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div className="flex items-center gap-2">
                      <FileText size={14} color="var(--brand-gold)" />
                      <span className="body-small">Requirements_v1.pdf</span>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '10px' }}>Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              icon={Sparkles}
              onClick={() => onNavigate('chat')}
            >
              Open AI Chat for this Project
            </Button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Project Deletion"
        maxWidth="440px"
      >
        <p className="body-regular text-muted" style={{ marginBottom: '20px' }}>
          Are you sure you want to delete project <strong style={{ color: 'var(--text-primary)' }}>"{projectToDelete?.name}"</strong>? This action will permanently remove associated metadata and cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmDelete}
            isLoading={isDeleting}
            style={{ background: 'var(--status-error)', borderColor: 'var(--status-error)' }}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}
