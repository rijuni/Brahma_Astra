import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Check,
  Layers,
  Copy,
  Trash2,
  Download,
  MoreVertical,
  X,
  FileCode,
  Calendar,
  Sparkles
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { useToast } from '../../../components/feedback/Toast';

const TEMPLATE_OPTIONS = [
  { id: 'python', label: 'Python FastAPI', lang: 'python', defaultExt: 'py' },
  { id: 'node', label: 'Node.js Express', lang: 'javascript', defaultExt: 'js' },
  { id: 'react', label: 'React Vite', lang: 'javascript', defaultExt: 'jsx' },
  { id: 'rust', label: 'Rust Microservice', lang: 'rust', defaultExt: 'rs' },
  { id: 'sql', label: 'PostgreSQL Analytics', lang: 'sql', defaultExt: 'sql' }
];

export default function ProjectExplorer({
  projects = [],
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('python');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);

  const { addToast } = useToast();

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.techStack && p.techStack.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const chosenTemplate = TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate);

    if (onCreateProject) {
      onCreateProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        template: chosenTemplate
      });
    }
    addToast(`Created project "${newProjectName}"`, 'success');
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreateOpen(false);
  };

  const handleExportJson = (proj, e) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(proj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${proj.name.toLowerCase().replace(/\s+/g, '-')}-manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(`Exported "${proj.name}" manifest`, 'info');
    setMenuOpenId(null);
  };

  const handleDuplicate = (projId, e) => {
    e.stopPropagation();
    if (onDuplicateProject) {
      onDuplicateProject(projId);
    }
    setMenuOpenId(null);
  };

  const handleDeletePrompt = (proj, e) => {
    e.stopPropagation();
    setDeleteConfirmProject(proj);
    setMenuOpenId(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmProject && onDeleteProject) {
      onDeleteProject(deleteConfirmProject.id);
    }
    setDeleteConfirmProject(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ padding: '14px 16px' }}>
      {/* Top Header & New Project CTA */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <div className="flex items-center gap-2">
          <FolderKanban size={16} color="var(--brand-gold)" />
          <span className="body-small text-muted" style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.06em' }}>
            WORKSPACES ({projects.length})
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="glass-btn-ghost flex items-center justify-center transition-all"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            padding: 0,
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)'
          }}
          title="New Project"
        >
          <Plus size={15} color="var(--brand-gold)" />
        </button>
      </div>

      {/* Project Search Input */}
      <div
        className="glass-input flex items-center gap-2"
        style={{ padding: '7px 10px', marginBottom: '12px', borderRadius: 'var(--radius-sm)' }}
      >
        <Search size={14} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter workspaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '12px',
            width: '100%'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="glass-btn-ghost"
            style={{ padding: '2px', borderRadius: '50%' }}
            title="Clear search"
          >
            <X size={12} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Project List Rail */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{ paddingRight: '2px' }}>
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--glass-border)'
            }}
          >
            <FolderKanban size={24} color="var(--text-muted)" style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p className="body-small text-muted" style={{ fontSize: '11px', marginBottom: '8px' }}>
              No workspaces matching "{searchTerm}"
            </p>
            <Button variant="ghost" size="small" onClick={() => setSearchTerm('')}>
              Clear Filter
            </Button>
          </div>
        ) : (
          filtered.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const isMenuOpen = menuOpenId === proj.id;

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="glass-card flex flex-col cursor-pointer transition-all relative"
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? 'var(--brand-violet)' : 'var(--glass-border)',
                  boxShadow: isActive ? '0 4px 14px var(--brand-violet-glow)' : 'none'
                }}
              >
                {/* Header row: Icon, Name, Active Badge & Menu */}
                <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FolderKanban size={16} color={isActive ? 'var(--brand-gold)' : 'var(--brand-cyan)'} />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {proj.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isActive && <Badge variant="gold" size="small">Active</Badge>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : proj.id);
                      }}
                      className="glass-btn-ghost flex items-center justify-center"
                      style={{ width: '24px', height: '24px', borderRadius: '4px', padding: 0 }}
                      title="Project options"
                    >
                      <MoreVertical size={13} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>

                {/* Dropdown Action Menu */}
                {isMenuOpen && (
                  <div
                    className="glass-panel flex flex-col"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '32px',
                      zIndex: 30,
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                      padding: '4px',
                      minWidth: '130px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-white/10 rounded"
                      style={{ fontSize: '11px', color: 'var(--text-primary)' }}
                    >
                      <Copy size={12} color="var(--brand-cyan)" /> Duplicate
                    </button>
                    <button
                      onClick={(e) => handleExportJson(proj, e)}
                      className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-white/10 rounded"
                      style={{ fontSize: '11px', color: 'var(--text-primary)' }}
                    >
                      <Download size={12} color="var(--brand-gold)" /> Export JSON
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => handleDeletePrompt(proj, e)}
                        className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-red-500/20 rounded"
                        style={{ fontSize: '11px', color: 'var(--status-error)' }}
                      >
                        <Trash2 size={12} color="var(--status-error)" /> Delete
                      </button>
                    )}
                  </div>
                )}

                <p
                  className="body-small text-muted"
                  style={{
                    fontSize: '11px',
                    marginBottom: '6px',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {proj.description || 'No description provided.'}
                </p>

                {/* Project Stats & Tech Stack Pills */}
                <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
                  <div className="flex items-center gap-2" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>{proj.files ? proj.files.length : (proj.stats?.files || 0)} files</span>
                    <span>•</span>
                    <span>{proj.stats?.commits || 1} commits</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(proj.techStack || []).slice(0, 2).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmProject)}
        onClose={() => setDeleteConfirmProject(null)}
        title="Delete Workspace"
        maxWidth="400px"
      >
        <div className="flex flex-col gap-3">
          <p className="body-small text-muted" style={{ lineHeight: '1.5' }}>
            Are you sure you want to delete workspace{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              "{deleteConfirmProject?.name}"
            </strong>? All open editor buffers and memory changes for this workspace will be removed.
          </p>
          <div className="flex justify-end gap-2" style={{ marginTop: '8px' }}>
            <Button variant="ghost" size="small" onClick={() => setDeleteConfirmProject(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="small" onClick={confirmDelete}>
              Delete Workspace
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create ASTRA Workspace"
        maxWidth="460px"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Telemetry Analytics Engine"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
            required
          />
          <Input
            label="Description (Optional)"
            placeholder="Purpose and capabilities of this workspace..."
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
          />

          <div>
            <label className="body-small text-muted" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Primary Template & Tech Stack
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className="flex items-center gap-2 p-2 rounded text-left transition-all"
                  style={{
                    background: selectedTemplate === t.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedTemplate === t.id ? '1px solid var(--brand-violet)' : '1px solid var(--glass-border)',
                    color: selectedTemplate === t.id ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  <FileCode size={13} color={selectedTemplate === t.id ? 'var(--brand-gold)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '11px', fontWeight: selectedTemplate === t.id ? 600 : 400 }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2" style={{ marginTop: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit">
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
