import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  HardDrive,
  Info,
  Loader2
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { fileService } from '../../services/file-service';
import { useToast } from '../../components/feedback/Toast';

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesWorkspace() {
  const [files, setFiles] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const loadFiles = async () => {
    try {
      const data = await fileService.list();
      if (Array.isArray(data)) {
        setFiles(data);
      }
      setLoadError('');
    } catch (err) {
      setLoadError(err.message || 'Unable to load files from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (newFiles) => {
    setIsUploading(true);
    let uploadedCount = 0;

    for (const file of newFiles) {
      if (file.size > 25 * 1024 * 1024) {
        addToast(`File "${file.name}" exceeds the 25MB maximum limit.`, 'error');
        continue;
      }

      try {
        await fileService.upload(file);
        uploadedCount++;
      } catch (err) {
        addToast(`Upload failed for "${file.name}": ${err.message}`, 'error');
      }
    }

    if (uploadedCount > 0) {
      addToast(`Successfully stored ${uploadedCount} file(s) in persistent vault.`, 'success');
      await loadFiles();
    }
    setIsUploading(false);
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

  const confirmDelete = async () => {
    if (!deleteConfirmFile) return;
    setIsDeleting(true);
    try {
      await fileService.delete(deleteConfirmFile.id);
      addToast(`Removed "${deleteConfirmFile.filename}" from vault.`, 'info');
      setFiles((prev) => prev.filter((f) => f.id !== deleteConfirmFile.id));
    } catch (err) {
      addToast(`Failed to delete file: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmFile(null);
    }
  };

  const handleDownload = async (file) => {
    try {
      addToast(`Initiating download for "${file.filename || file.name}"...`, 'info');
      await fileService.download(file.id, file.filename || file.name || 'download');
      addToast(`Downloaded "${file.filename || file.name}"`, 'success');
    } catch (err) {
      addToast(`Download failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-entrance" style={{ width: '100%', maxWidth: 'none', margin: 0, paddingBottom: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="friday-section-kicker">
            FILE STORAGE
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
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          style={{ fontWeight: 700, letterSpacing: '0.04em' }}
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </div>

      {/* Backend Status Notice */}
      <div
        className="friday-storage-note flex items-start gap-3"
      >
        <Info size={18} aria-hidden="true" />
        <div className="body-regular">
          <strong>Stored on this application server.</strong>
          <span> Checksums help verify file integrity; they do not encrypt files.</span>
          <span className="friday-storage-note__detail">Files are private to your account in this workspace.</span>
        </div>
      </div>

      {/* Drag & Drop Zone with Caliper Brackets */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`friday-dropzone friday-caliper-box flex flex-col items-center justify-center text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
        style={{
          padding: '48px 24px',
          opacity: isUploading ? 0.7 : 1
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          multiple
          onClick={(event) => event.stopPropagation()}
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
          {isUploading ? <Loader2 size={26} className="animate-spin" /> : <Upload size={26} />}
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
          {isUploading ? 'Uploading Files to Storage...' : 'Drag & Drop Files Here, or '}
          {!isUploading && <span style={{ color: 'var(--brand-gold-light)' }}>Browse</span>}
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
          <span className="body-small" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {files.length} Item(s) Persisted
          </span>
        </div>

        {files.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={isLoading ? 'Loading files...' : loadError ? 'Could not load files' : 'No files stored'}
            description={isLoading
              ? 'Connecting to file storage.'
              : loadError || 'Upload documents to make them available in your account.'}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(246, 200, 122, 0.16)', color: 'rgba(255, 255, 255, 0.55)', fontSize: '11px', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>NAME</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>SIZE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>TYPE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>CHECKSUM (SHA-256)</th>
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
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{file.filename}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {formatFileSize(file.sizeBytes || file.size)}
                    </td>
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
                        {(file.mimeType || 'file').split('/')[1] || 'file'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'var(--font-code)', fontSize: '11px' }}>
                      {file.checksum ? `${file.checksum.slice(0, 12)}...` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(255, 255, 255, 0.55)' }}>
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Just now'}
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
                          onClick={() => setDeleteConfirmFile(file)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmFile)}
        onClose={() => setDeleteConfirmFile(null)}
        title="Confirm File Deletion"
        maxWidth="420px"
      >
        <div className="flex flex-col gap-4">
          <p className="body-medium" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Are you sure you want to permanently delete <strong>"{deleteConfirmFile?.filename}"</strong>? This will remove the file from disk storage and SQLite records.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmFile(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
