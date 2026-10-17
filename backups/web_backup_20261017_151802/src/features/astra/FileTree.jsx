import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  FolderPlus,
  Trash2
} from 'lucide-react';

export function FileTree({ files, activeFile, onSelectFile, onNewFile }) {
  const [expandedFolders, setExpandedFolders] = useState({
    src: true,
    'src/controllers': true,
    'src/routes': true,
    tests: false
  });
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onNewFile(newFileName.trim());
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.json')) return <FileJson size={14} style={{ color: 'var(--astra-gold)' }} />;
    if (filename.endsWith('.md')) return <FileText size={14} style={{ color: 'var(--astra-violet)' }} />;
    if (filename.endsWith('.py')) return <FileCode size={14} style={{ color: 'var(--astra-cyan)' }} />;
    return <FileCode size={14} style={{ color: 'var(--astra-electric-blue)' }} />;
  };

  // Group files into folder tree
  const tree = buildTreeFromFlatFiles(files);

  function renderTreeNodes(nodes, currentPath = '') {
    return Object.keys(nodes).map(key => {
      const item = nodes[key];
      const nodePath = currentPath ? `${currentPath}/${key}` : key;

      if (item.__isFile) {
        const isSelected = activeFile?.path === item.path;
        return (
          <button
            key={nodePath}
            type="button"
            onClick={() => onSelectFile(item)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '5px 8px 5px 22px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: isSelected ? 'var(--astra-electric-blue)' : 'var(--astra-text)',
              fontSize: '12px',
              fontFamily: 'var(--font-code)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={e => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            }}
            onMouseLeave={e => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {getFileIcon(key)}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {key}
            </span>
            {item.dirty && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--astra-gold)',
                  marginLeft: 'auto'
                }}
                title="Unsaved changes"
              />
            )}
          </button>
        );
      }

      // Folder Node
      const isExpanded = !!expandedFolders[nodePath];
      return (
        <div key={nodePath} style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            type="button"
            onClick={() => toggleFolder(nodePath)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 8px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'transparent',
              color: 'var(--astra-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--astra-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--astra-muted)'}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isExpanded ? (
              <FolderOpen size={14} style={{ color: 'var(--astra-cyan)' }} />
            ) : (
              <Folder size={14} style={{ color: 'var(--astra-muted)' }} />
            )}
            <span style={{ fontWeight: 600 }}>{key}</span>
          </button>

          {isExpanded && (
            <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
              {renderTreeNodes(item, nodePath)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--astra-surface)',
        borderRight: '1px solid var(--astra-border)',
        overflow: 'hidden'
      }}
    >
      {/* Explorer Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--astra-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--astra-muted)'
          }}
        >
          Project Explorer
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setIsCreatingFile(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--astra-muted)',
              cursor: 'pointer',
              padding: '3px',
              borderRadius: 'var(--radius-xs)'
            }}
            title="Create new file"
            aria-label="New file"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* New File Inline Input */}
      {isCreatingFile && (
        <form
          onSubmit={handleCreateSubmit}
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--astra-border)',
            backgroundColor: 'rgba(56, 189, 248, 0.05)'
          }}
        >
          <input
            type="text"
            placeholder="filename.js (Enter to save)"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: '12px',
              fontFamily: 'var(--font-code)',
              backgroundColor: 'var(--astra-bg)',
              border: '1px solid var(--astra-electric-blue)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--astra-text)',
              outline: 'none'
            }}
          />
        </form>
      )}

      {/* File Tree List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {renderTreeNodes(tree)}
      </div>

      {/* Footer Status */}
      <div
        style={{
          padding: '6px 12px',
          borderTop: '1px solid var(--astra-border)',
          fontSize: '11px',
          color: 'var(--astra-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>{files.length} files</span>
        <span>Local Workspace</span>
      </div>
    </div>
  );
}

function buildTreeFromFlatFiles(files) {
  const root = {};
  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = { ...file, __isFile: true };
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return root;
}
