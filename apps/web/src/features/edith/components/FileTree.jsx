import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FileCode,
  FileText,
  FileJson,
  FileSpreadsheet,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Trash2,
  Edit2,
  Copy,
  MoreVertical,
  X
} from 'lucide-react';
import { getLanguageForFile } from '../../../config/edith-languages';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useToast } from '../../../components/feedback/Toast';

export default function FileTree({
  files = [],
  activeFilePath,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  dirtyFilePaths = new Set(),
  onCollapse
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFolders, setOpenFolders] = useState({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [activeMenuPath, setActiveMenuPath] = useState(null);
  const [renamingFile, setRenamingFile] = useState(null);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState(null);

  const { addToast } = useToast();

  const toggleFolder = (folderPath) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: prev[folderPath] === undefined ? false : !prev[folderPath]
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const trimmed = newItemName.trim();
    if (onAddFile) {
      if (isCreatingFolder) {
        onAddFile(trimmed, 'directory');
      } else {
        onAddFile(trimmed, 'file');
      }
    }
    setNewItemName('');
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  const handleCopyPath = (filePath, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(filePath);
    addToast(`Copied path: ${filePath}`, 'info');
    setActiveMenuPath(null);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renamingFile || !renamingFile.newName.trim()) return;
    if (onRenameFile) {
      onRenameFile(renamingFile.path, renamingFile.newName.trim());
    }
    setRenamingFile(null);
    setActiveMenuPath(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmFile && onDeleteFile) {
      onDeleteFile(deleteConfirmFile.path);
    }
    setDeleteConfirmFile(null);
  };

  const getFileIcon = (fileName) => {
    const lang = getLanguageForFile(fileName);
    if (fileName.endsWith('.json')) return <FileJson size={18} color={lang.iconColor} />;
    if (fileName.endsWith('.md')) return <FileText size={18} color={lang.iconColor} />;
    return <FileCode size={18} color={lang.iconColor} />;
  };

  // Build recursive folder/file hierarchy
  const treeData = useMemo(() => {
    const filtered = files.filter((f) =>
      (f.name || f.path).toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const root = { files: [], dirs: {} };

    for (const f of filtered) {
      const cleanPath = f.path.replace(/^\/+/, '');
      const parts = cleanPath.split('/');

      if (parts.length === 1) {
        root.files.push(f);
      } else {
        let current = root;
        for (let i = 0; i < parts.length - 1; i++) {
          const folder = parts[i];
          const folderPath = parts.slice(0, i + 1).join('/');
          if (!current.dirs[folder]) {
            current.dirs[folder] = {
              name: folder,
              path: folderPath,
              files: [],
              dirs: {}
            };
          }
          current = current.dirs[folder];
        }
        current.files.push(f);
      }
    }

    return { root, totalMatches: filtered.length };
  }, [files, searchTerm]);

  function renderFileItem(file, depth = 0) {
    const isActive = file.path === activeFilePath;
    const isDirty = dirtyFilePaths.has(file.path);
    const isMenuOpen = activeMenuPath === file.path;

    return (
      <div
        key={file.path}
        onClick={() => onSelectFile(file)}
        className="edith-file-item flex items-center justify-between w-full text-left cursor-pointer transition-all rounded-md relative group"
        style={{
          padding: '6px 8px',
          paddingLeft: `${Math.max(8, depth * 12 + 8)}px`,
          minHeight: '34px',
          background: isActive ? 'rgba(0, 210, 255, 0.14)' : 'transparent',
          border: isActive ? '1px solid rgba(0, 210, 255, 0.35)' : '1px solid transparent',
          color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
          fontSize: '15px'
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {getFileIcon(file.name || file.path)}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400, fontSize: '15px' }}>
            {file.name || file.path.split('/').pop()}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isDirty && (
            <span
              title="Unsaved changes"
              style={{
                color: '#00D2FF',
                fontSize: '14px',
                lineHeight: '1'
              }}
            >
              ●
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuPath(isMenuOpen ? null : file.path);
            }}
            className="glass-btn-ghost opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
            style={{ width: '24px', height: '24px', borderRadius: '4px', padding: 0 }}
            title="Options"
          >
            <MoreVertical size={14} color="var(--text-muted)" />
          </button>
        </div>

        {/* Dropdown Options Menu */}
        {isMenuOpen && (
          <div
            className="glass-panel flex flex-col"
            style={{
              position: 'absolute',
              right: '4px',
              top: '24px',
              zIndex: 40,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              padding: '4px',
              minWidth: '120px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => handleCopyPath(file.path, e)}
              className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-white/10 rounded"
              style={{ fontSize: '12px', color: 'var(--text-primary)' }}
            >
              <Copy size={12} color="var(--brand-cyan)" /> Copy Path
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingFile({ path: file.path, newName: file.path });
                setActiveMenuPath(null);
              }}
              className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-white/10 rounded"
              style={{ fontSize: '12px', color: '#38BDF8' }}
            >
              <Edit2 size={12} color="#38BDF8" /> Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmFile(file);
                setActiveMenuPath(null);
              }}
              className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-red-500/20 rounded"
              style={{ fontSize: '12px', color: 'var(--status-error)' }}
            >
              <Trash2 size={12} color="var(--status-error)" /> Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderDirectory(dir, depth = 0) {
    const isExpanded = openFolders[dir.path] !== false; // default expanded

    return (
      <div key={dir.path} className="flex flex-col">
        <button
          type="button"
          onClick={() => toggleFolder(dir.path)}
          className="edith-dir-row flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md"
          style={{
            paddingLeft: `${Math.max(6, depth * 12 + 6)}px`,
            fontSize: '15px',
            color: 'var(--text-primary)',
            fontWeight: 500,
            minHeight: '34px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? (
            <ChevronDown size={15} color="var(--text-muted)" />
          ) : (
            <ChevronRight size={15} color="var(--text-muted)" />
          )}
          {isExpanded ? (
            <FolderOpen size={17} color="#38BDF8" />
          ) : (
            <Folder size={17} color="#38BDF8" />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dir.name}</span>
        </button>

        {isExpanded && (
          <div className="flex flex-col border-l border-white/5 ml-2">
            {Object.values(dir.dirs).map((subDir) => renderDirectory(subDir, depth + 1))}
            {dir.files.map((file) => renderFileItem(file, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ padding: '14px 16px' }}>
      {/* File Tree Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
          EXPLORER ({files.length})
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
              setNewItemName('');
            }}
            className="glass-btn-ghost flex items-center justify-center transition-all"
            style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
            title="New File"
          >
            <Plus size={16} color="#38BDF8" />
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
              setNewItemName('');
            }}
            className="glass-btn-ghost flex items-center justify-center transition-all"
            style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
            title="New Folder"
          >
            <FolderPlus size={16} color="#00D2FF" />
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
              style={{ width: '30px', height: '30px', borderRadius: '6px', padding: 0 }}
              title="Collapse Explorer (Ctrl+E)"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Search */}
      <div
        className="glass-input flex items-center gap-2.5"
        style={{ padding: '8px 12px', marginBottom: '12px', borderRadius: 'var(--radius-sm)' }}
      >
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter files..."
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
            style={{ padding: '2px', borderRadius: '50%' }}
            title="Clear filter"
          >
            <X size={14} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Inline New File / Folder Input */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleCreateSubmit} style={{ marginBottom: '8px' }}>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder={isCreatingFolder ? 'folder_name' : 'e.g. service.js'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => !newItemName && (setIsCreatingFile(false), setIsCreatingFolder(false))}
              autoFocus
              className="glass-input flex-1"
              style={{
                padding: '6px 8px',
                fontSize: '13px',
                borderRadius: 'var(--radius-sm)',
                borderColor: isCreatingFolder ? '#00D2FF' : '#38BDF8'
              }}
            />
            <Button variant="ghost" size="small" type="button" onClick={() => { setIsCreatingFile(false); setIsCreatingFolder(false); }}>
              <X size={12} />
            </Button>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto" style={{ paddingRight: '2px' }}>
        {treeData.totalMatches === 0 ? (
          <div className="p-3 text-center text-muted body-small" style={{ fontSize: '13px' }}>
            No files match "{searchTerm}"
          </div>
        ) : (
          <>
            {/* Render all nested directory trees */}
            {Object.values(treeData.root.dirs).map((dir) => renderDirectory(dir, 0))}
            {/* Render top-level root files */}
            {treeData.root.files.map((file) => renderFileItem(file, 0))}
          </>
        )}
      </div>

      {/* Rename File Modal */}
      <Modal
        isOpen={Boolean(renamingFile)}
        onClose={() => setRenamingFile(null)}
        title="Rename File"
        maxWidth="400px"
      >
        <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
          <Input
            label="File Path / Name"
            value={renamingFile?.newName || ''}
            onChange={(e) => setRenamingFile((prev) => ({ ...prev, newName: e.target.value }))}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="small" type="button" onClick={() => setRenamingFile(null)}>
              Cancel
            </Button>
            <Button variant="cyan" size="small" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmFile)}
        onClose={() => setDeleteConfirmFile(null)}
        title="Delete Item"
        maxWidth="400px"
      >
        <div className="flex flex-col gap-3">
          <p className="body-small text-muted" style={{ lineHeight: '1.5' }}>
            Are you sure you want to permanently delete{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              "{deleteConfirmFile?.path}"
            </strong>?
          </p>
          <div className="flex justify-end gap-2" style={{ marginTop: '8px' }}>
            <Button variant="ghost" size="small" onClick={() => setDeleteConfirmFile(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="small" onClick={confirmDelete}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
