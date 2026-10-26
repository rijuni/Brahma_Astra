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
import { getLanguageForFile } from '../../../config/astra-languages';
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

  const toggleFolder = (folderName) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: prev[folderName] === undefined ? false : !prev[folderName]
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const trimmed = newItemName.trim();
    if (onAddFile) {
      if (isCreatingFolder) {
        onAddFile(`${trimmed}/index.js`);
        addToast(`Created folder "${trimmed}"`, 'success');
      } else {
        onAddFile(trimmed);
        addToast(`Created file "${trimmed}"`, 'success');
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
    if (fileName.endsWith('.json')) return <FileJson size={15} color={lang.iconColor} />;
    if (fileName.endsWith('.md')) return <FileText size={15} color={lang.iconColor} />;
    return <FileCode size={15} color={lang.iconColor} />;
  };

  // Build folder/file hierarchy
  const treeData = useMemo(() => {
    const rootFiles = [];
    const folders = {};

    const filtered = files.filter((f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    for (const f of filtered) {
      const parts = f.path.split('/');
      if (parts.length > 1) {
        const folderName = parts[0];
        if (!folders[folderName]) folders[folderName] = [];
        folders[folderName].push(f);
      } else {
        rootFiles.push(f);
      }
    }

    return { rootFiles, folders, totalMatches: filtered.length };
  }, [files, searchTerm]);

  return (
    <div className="flex flex-col h-full" style={{ padding: '14px 16px' }}>
      {/* File Tree Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <span className="body-small text-muted" style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.06em' }}>
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
            style={{ width: '28px', height: '28px', borderRadius: '6px', padding: 0 }}
            title="New File"
          >
            <Plus size={15} color="var(--brand-gold)" />
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
              setNewItemName('');
            }}
            className="glass-btn-ghost flex items-center justify-center transition-all"
            style={{ width: '28px', height: '28px', borderRadius: '6px', padding: 0 }}
            title="New Folder"
          >
            <FolderPlus size={15} color="var(--brand-cyan)" />
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
              style={{ width: '26px', height: '26px', borderRadius: '6px', padding: 0 }}
              title="Collapse Explorer (Ctrl+E)"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Search */}
      <div
        className="glass-input flex items-center gap-2"
        style={{ padding: '7px 10px', marginBottom: '10px', borderRadius: 'var(--radius-sm)' }}
      >
        <Search size={14} color="var(--text-muted)" />
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
            fontSize: '12px',
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
            <X size={12} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Inline New File / Folder Input */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleCreateSubmit} style={{ marginBottom: '8px' }}>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder={isCreatingFolder ? 'folder_name' : 'e.g. service.py'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => !newItemName && (setIsCreatingFile(false), setIsCreatingFolder(false))}
              autoFocus
              className="glass-input flex-1"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                borderRadius: 'var(--radius-sm)',
                borderColor: isCreatingFolder ? 'var(--brand-cyan)' : 'var(--brand-gold)'
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
          <div className="p-3 text-center text-muted body-small" style={{ fontSize: '11px' }}>
            No files match "{searchTerm}"
          </div>
        ) : (
          <>
            {/* Folder Groups */}
            {Object.entries(treeData.folders).map(([folderName, folderFiles]) => {
              const isExpanded = openFolders[folderName] !== false; // default expanded

              return (
                <div key={folderName} className="flex flex-col">
                  {/* Folder Row */}
                  <button
                    onClick={() => toggleFolder(folderName)}
                    className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md transition-all hover:bg-white/5"
                    style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, minHeight: '30px' }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} color="var(--text-muted)" />
                    ) : (
                      <ChevronRight size={14} color="var(--text-muted)" />
                    )}
                    {isExpanded ? (
                      <FolderOpen size={15} color="var(--brand-gold)" />
                    ) : (
                      <Folder size={15} color="var(--brand-gold)" />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{folderName}</span>
                    <span className="text-muted" style={{ fontSize: '11px', marginLeft: 'auto' }}>
                      ({folderFiles.length})
                    </span>
                  </button>

                  {/* Folder Children */}
                  {isExpanded && (
                    <div className="flex flex-col pl-3 border-l border-white/5 ml-2 mt-0.5">
                      {folderFiles.map((file) => renderFileItem(file))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Root Files */}
            {treeData.rootFiles.map((file) => renderFileItem(file))}
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
            label="File Name"
            value={renamingFile?.newName || ''}
            onChange={(e) => setRenamingFile((prev) => ({ ...prev, newName: e.target.value }))}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="small" type="button" onClick={() => setRenamingFile(null)}>
              Cancel
            </Button>
            <Button variant="gold" size="small" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmFile)}
        onClose={() => setDeleteConfirmFile(null)}
        title="Delete File"
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
              Delete File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  function renderFileItem(file) {
    const isActive = file.path === activeFilePath;
    const isDirty = dirtyFilePaths.has(file.path);
    const isMenuOpen = activeMenuPath === file.path;

    return (
      <div
        key={file.path}
        onClick={() => onSelectFile(file)}
        className="flex items-center justify-between w-full text-left cursor-pointer transition-all rounded-md relative group"
        style={{
          padding: '6px 8px',
          minHeight: '30px',
          background: isActive ? 'rgba(139, 92, 246, 0.22)' : 'transparent',
          border: isActive ? '1px solid var(--glass-border-violet)' : '1px solid transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '12.5px'
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {getFileIcon(file.name)}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400 }}>
            {file.path.split('/').pop() || file.path}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isDirty && (
            <span
              title="Unsaved changes"
              style={{
                color: 'var(--brand-gold)',
                fontSize: '13px',
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
            style={{ width: '22px', height: '22px', borderRadius: '4px', padding: 0 }}
            title="Options"
          >
            <MoreVertical size={13} color="var(--text-muted)" />
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
              style={{ fontSize: '11px', color: 'var(--text-primary)' }}
            >
              <Copy size={11} color="var(--brand-cyan)" /> Copy Path
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingFile({ path: file.path, newName: file.path });
                setActiveMenuPath(null);
              }}
              className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-white/10 rounded"
              style={{ fontSize: '11px', color: 'var(--brand-gold)' }}
            >
              <Edit2 size={11} color="var(--brand-gold)" /> Rename
            </button>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmFile(file);
                  setActiveMenuPath(null);
                }}
                className="flex items-center gap-2 p-1.5 text-left body-small hover:bg-red-500/20 rounded"
                style={{ fontSize: '11px', color: 'var(--status-error)' }}
              >
                <Trash2 size={11} color="var(--status-error)" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}
