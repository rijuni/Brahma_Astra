import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCode,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Info
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/feedback/Toast';

export default function FilesWorkspace() {
  const [files, setFiles] = useState([
    { id: 'f-1', name: 'FRIDAY_Architecture_Specification.pdf', size: '2.4 MB', type: 'application/pdf', uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'f-2', name: 'System_Requirements_v1.md', size: '148 KB', type: 'text/markdown', uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString() },
    { id: 'f-3', name: 'api_contract_schema.json', size: '34 KB', type: 'application/json', uploadedAt: new Date(Date.now() - 3600000 * 72).toISOString() }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (newFiles) => {
    const validFiles = [];
    for (const file of newFiles) {
      if (file.size > 25 * 1024 * 1024) {
        addToast(`File "${file.name}" exceeds the 25MB maximum limit.`, 'error');
        continue;
      }
      validFiles.push({
        id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: (file.size / 1024 > 1024) ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        fileBlob: file
      });
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...validFiles, ...prev]);
      addToast(`Staged ${validFiles.length} file(s) in local workspace.`, 'success');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id, name) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    addToast(`Removed "${name}" from workspace.`, 'info');
  };

  const handleDownload = (fileOrName) => {
    try {
      const file = typeof fileOrName === 'object' ? fileOrName : (files.find((f) => f.name === fileOrName) || { name: fileOrName });
      const name = file.name || 'document.txt';
      const blob = file.fileBlob || new Blob([`FRIDAY Staged Artifact: ${name}\nSize: ${file.size || 'Unknown'}\nType: ${file.type || 'text/plain'}\nUploaded: ${file.uploadedAt || new Date().toISOString()}`], { type: file.type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast(`Downloaded "${name}"`, 'success');
    } catch (err) {
      addToast(`Download failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-entrance" style={{ maxWidth: '1380px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '4px' }}>
            Document & File Management
          </h1>
          <p className="body-small text-muted">
            Upload, inspect, and stage files for AI reasoning and knowledge indexing.
          </p>
        </div>

        <Button
          variant="gold"
          icon={Upload}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Files
        </Button>
      </div>

      {/* Backend Status Notice */}
      <div
        className="glass-card flex items-center justify-between"
        style={{
          padding: '12px 18px',
          borderColor: 'var(--brand-cyan)',
          background: 'rgba(6, 182, 212, 0.08)'
        }}
      >
        <div className="flex items-center gap-3">
          <Info size={18} color="var(--brand-cyan-light)" />
          <span className="body-regular" style={{ fontSize: '13px' }}>
            <strong>Local Workspace Staging Active:</strong> Files are held safely in client session memory. Persistent remote cloud storage endpoint integration is currently pending backend S3 setup.
          </span>
        </div>
        <Badge variant="cyan">Session Staging</Badge>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="glass-card flex flex-col items-center justify-center text-center cursor-pointer"
        style={{
          padding: '48px 24px',
          borderRadius: 'var(--radius-xl)',
          border: `2px dashed ${isDragging ? 'var(--brand-gold)' : 'var(--glass-border-violet)'}`,
          background: isDragging ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 27, 61, 0.4)',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          multiple
        />

        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(246, 200, 122, 0.15)',
            border: '1px solid var(--glass-border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--brand-gold)'
          }}
        >
          <Upload size={24} />
        </div>

        <h3 className="card-title" style={{ fontSize: '18px', marginBottom: '6px' }}>
          Drag & Drop Files Here, or <span style={{ color: 'var(--brand-gold)' }}>Browse</span>
        </h3>
        <p className="body-small text-muted" style={{ maxWidth: '440px' }}>
          Supports PDF, Markdown, DOCX, JSON, CSV, and code files up to 25MB per file.
        </p>
      </div>

      {/* File Inventory Table */}
      <Card style={{ padding: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '18px' }}>
          <div className="flex items-center gap-2">
            <HardDrive size={18} color="var(--brand-violet-light)" />
            <h2 className="section-title" style={{ fontSize: '18px' }}>Workspace Files</h2>
          </div>
          <span className="body-small text-muted">{files.length} Item(s) Staged</span>
        </div>

        {files.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files staged"
            description="Upload documents to feed project contexts and conversation attachments."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>NAME</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>SIZE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>TYPE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>UPLOADED</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '13px'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center gap-3">
                        <FileText size={16} color="var(--brand-gold)" />
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{file.size}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant="violet">{file.type.split('/')[1] || 'file'}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="glass-btn-ghost"
                          style={{ padding: '6px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          title="Download file snapshot"
                        >
                          <Download size={15} color="var(--text-secondary)" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          className="glass-btn-ghost"
                          style={{ padding: '6px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          title="Delete file"
                        >
                          <Trash2 size={15} color="var(--status-error)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
