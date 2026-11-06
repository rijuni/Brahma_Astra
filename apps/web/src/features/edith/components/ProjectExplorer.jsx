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
  const [newRootPath, setNewRootPath] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('python');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);

  const { addToast } = useToast();

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.techStack && p.techStack.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newRootPath.trim()) return;

    const chosenTemplate = TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate);

    let created = true;
    if (onCreateProject) {
      created = await onCreateProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        rootPath: newRootPath.trim(),
        template: chosenTemplate
      });
    }
    if (!created) return;
    setNewProjectName('');
    setNewProjectDesc('');
    setNewRootPath('');
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
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <div className="flex items-center gap-2.5">
          <FolderKanban size={18} color="#38BDF8" />
          <span className="body-small text-muted" style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.04em' }}>
            WORKSPACES ({projects.length})
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="glass-btn-ghost flex items-center justify-center transition-all"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            padding: 0,
            background: 'rgba(0, 210, 255, 0.12)',
            border: '1px solid rgba(0, 210, 255, 0.35)'
          }}
          title="New Project"
        >
          <Plus size={17} color="#00D2FF" />
        </button>
      </div>

      {/* Project Search Input */}
      <div
        className="glass-input flex items-center gap-2.5"
        style={{ padding: '8px 12px', marginBottom: '14px', borderRadius: 'var(--radius-sm)' }}
      >
        <Search size={16} color="var(--text-muted)" />
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
            fontSize: '15px',
            width: '100%'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="glass-btn-ghost"
            style={{ padding: '3px', borderRadius: '50%' }}
            title="Clear search"
          >
            <X size={14} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Project List Rail */}
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto" style={{ paddingRight: '2px' }}>
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--glass-border)'
            }}
          >
            <FolderKanban size={28} color="var(--text-muted)" style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p className="body-regular text-muted" style={{ fontSize: '14px', marginBottom: '10px' }}>
              {projects.length === 0 ? 'No workspace connected yet.' : `No workspaces matching "${searchTerm}"`}
            </p>
            {projects.length > 0 ? (
              <Button variant="ghost" size="small" onClick={() => setSearchTerm('')} style={{ fontSize: '14px' }}>
                Clear Filter
              </Button>
            ) : (
              <span className="body-small text-muted" style={{ fontSize: '12px', lineHeight: 1.45 }}>
                Add a directory inside your configured workspace root to begin.
              </span>
            )}
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
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? 'rgba(0, 210, 255, 0.4)' : 'rgba(56, 189, 248, 0.15)',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 210, 255, 0.15)' : 'none'
                }}
              >
                {/* Header row: Icon, Name, Active Badge & Menu */}
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FolderKanban size={18} color={isActive ? '#00D2FF' : '#38BDF8'} />
                    <span
                      style={{
                        fontSize: '16px',
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
                  <div className="flex items-center gap-2">
                    {isActive && <Badge variant="cyan" style={{ fontSize: '13px', padding: '3px 8px' }}>Active</Badge>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : proj.id);
                      }}
                      className="glass-btn-ghost flex items-center justify-center"
                      style={{ width: '28px', height: '28px', borderRadius: '4px', padding: 0 }}
                      title="Project options"
                    >
                      <MoreVertical size={16} color="var(--text-muted)" />
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
                      top: '36px',
                      zIndex: 30,
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                      padding: '6px',
                      minWidth: '150px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      className="flex items-center gap-2.5 p-2 text-left body-small hover:bg-white/10 rounded"
                      style={{ fontSize: '14px', color: 'var(--text-primary)' }}
                    >
                      <Copy size={15} color="var(--brand-cyan)" /> Duplicate
                    </button>
                    <button
                      onClick={(e) => handleExportJson(proj, e)}
                      className="flex items-center gap-2.5 p-2 text-left body-small hover:bg-white/10 rounded"
                      style={{ fontSize: '14px', color: 'var(--text-primary)' }}
                    >
                      <Download size={15} color="#00D2FF" /> Export JSON
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => handleDeletePrompt(proj, e)}
                        className="flex items-center gap-2.5 p-2 text-left body-small hover:bg-red-500/20 rounded"
                        style={{ fontSize: '14px', color: 'var(--status-error)' }}
                      >
                        <Trash2 size={15} color="var(--status-error)" /> Delete
                      </button>
                    )}
                  </div>
                )}

                <p
                  className="body-regular text-muted"
                  style={{
                    fontSize: '14px',
                    marginBottom: '8px',
                    lineHeight: '1.45',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {proj.description || 'No description provided.'}
                </p>

                {/* Project Stats & Tech Stack Pills */}
                <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
                  <div className="flex items-center gap-2.5" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>{proj.files ? proj.files.length : (proj.stats?.files || 0)} files</span>
                    <span>•</span>
                    <span>{proj.stats?.commits ?? '—'} commits</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(proj.techStack || []).slice(0, 2).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '12px',
                          padding: '2px 8px',
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
        title="Create EDITH Workspace"
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
          <Input
            label="Workspace directory"
            placeholder="C:\\FridayEdithWorkspaces\\my-project"
            value={newRootPath}
            onChange={(e) => setNewRootPath(e.target.value)}
            required
          />
          <p className="body-small text-muted" style={{ marginTop: '-8px', lineHeight: 1.45 }}>
            Choose an existing directory inside the workspace root configured by your API operator.
          </p>

          <div>
            <label className="body-small text-muted" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '15px' }}>
              Primary Template & Tech Stack
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {TEMPLATE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className="flex items-center gap-2.5 p-2.5 rounded text-left transition-all"
                  style={{
                    background: selectedTemplate === t.id ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedTemplate === t.id ? '1px solid #00D2FF' : '1px solid var(--glass-border)',
                    color: selectedTemplate === t.id ? '#FFFFFF' : 'var(--text-muted)'
                  }}
                >
                  <FileCode size={16} color={selectedTemplate === t.id ? '#00D2FF' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '14px', fontWeight: selectedTemplate === t.id ? 600 : 400 }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5" style={{ marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)} style={{ height: '38px', fontSize: '15px' }}>
              Cancel
            </Button>
            <Button variant="cyan" type="submit" style={{ height: '38px', fontSize: '15px', fontWeight: 600 }}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
