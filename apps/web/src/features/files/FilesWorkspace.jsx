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
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(246, 200, 122, 0.3)',
              borderRadius: '9999px',
              padding: '2px 12px',
              marginBottom: '6px'
            }}
          >
            <span className="telemetry-beacon-online" />
            <span
              style={{
                fontSize: '9.5px',
                letterSpacing: '0.2em',
                color: 'var(--brand-gold-light)',
                textTransform: 'uppercase',
                fontWeight: 700
              }}
            >
              QUANTUM-SAFE ENCLAVE // FILE VAULT
            </span>
          </div>
          <h1 className="friday-page-title">
            Document & File Management
          </h1>
          <p className="body-small" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            Upload, inspect, and stage files for AI reasoning and knowledge indexing.
          </p>
        </div>

        <Button
          variant="gold"
          icon={Upload}
          onClick={() => fileInputRef.current?.click()}
          style={{ fontWeight: 700, letterSpacing: '0.04em' }}
        >
          Upload Files
        </Button>
      </div>

      {/* Backend Status Notice */}
      <div
        className="friday-workspace-panel flex items-center justify-between"
        style={{
          padding: '12px 18px',
          borderColor: 'rgba(56, 189, 248, 0.35)',
          background: 'rgba(8, 20, 36, 0.55)'
        }}
      >
        <div className="flex items-center gap-3">
          <Info size={18} color="#7DD3FC" />
          <span className="body-regular" style={{ fontSize: '13px', color: '#FFFFFF' }}>
            <strong style={{ color: '#7DD3FC' }}>Local Workspace Staging Active:</strong> Files are held safely in client session memory. Persistent remote cloud storage endpoint integration is currently pending backend S3 setup.
          </span>
        </div>
        <Badge variant="cyan">Session Staging</Badge>
      </div>

      {/* Drag & Drop Zone with Caliper Brackets */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`friday-dropzone friday-caliper-box flex flex-col items-center justify-center text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
        style={{
          padding: '48px 24px'
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
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(246, 200, 122, 0.22) 0%, rgba(229, 169, 60, 0.1) 100%)',
            border: '1.5px solid rgba(246, 200, 122, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--brand-gold-light)',
            boxShadow: '0 0 20px rgba(246, 200, 122, 0.25)'
          }}
        >
          <Upload size={26} />
        </div>

        <h3
          style={{
            fontFamily: "'Michroma', sans-serif",
            fontSize: '17px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#FFFFFF',
            marginBottom: '6px'
          }}
        >
          Drag & Drop Files Here, or <span style={{ color: 'var(--brand-gold-light)' }}>Browse</span>
        </h3>
        <p className="body-small" style={{ maxWidth: '440px', color: 'rgba(255, 255, 255, 0.65)' }}>
          Supports PDF, Markdown, DOCX, JSON, CSV, and code files up to 25MB per file.
        </p>
      </div>

      {/* File Inventory Table */}
      <div className="friday-workspace-panel friday-caliper-box" style={{ padding: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '18px' }}>
          <div className="flex items-center gap-2">
            <HardDrive size={18} color="var(--brand-gold-light)" />
            <h2
              style={{
                fontFamily: "'Michroma', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                margin: 0
              }}
            >
              Workspace Files
            </h2>
          </div>
          <span className="body-small" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{files.length} Item(s) Staged</span>
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
                <tr style={{ borderBottom: '1px solid rgba(246, 200, 122, 0.16)', color: 'rgba(255, 255, 255, 0.55)', fontSize: '11px', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>NAME</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>SIZE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>TYPE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>UPLOADED</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '13px',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center gap-3">
                        <FileText size={16} color="var(--brand-gold-light)" />
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{file.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(255, 255, 255, 0.7)' }}>{file.size}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'rgba(246, 200, 122, 0.15)',
                          border: '1px solid rgba(246, 200, 122, 0.35)',
                          color: '#FAD982'
                        }}
                      >
                        {file.type.split('/')[1] || 'file'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(255, 255, 255, 0.55)' }}>
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="glass-btn-ghost"
                          style={{ padding: '6px', border: 'none', cursor: 'pointer', borderRadius: '4px', color: 'rgba(255, 255, 255, 0.7)' }}
                          title="Download file snapshot"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          className="glass-btn-ghost"
                          style={{ padding: '6px', border: 'none', cursor: 'pointer', borderRadius: '4px', color: '#F87171' }}
                          title="Delete file"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
