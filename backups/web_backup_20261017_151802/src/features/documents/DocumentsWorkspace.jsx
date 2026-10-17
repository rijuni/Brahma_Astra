import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  FileCode,
  FileSpreadsheet,
  AlertCircle,
  X
} from 'lucide-react';

const INITIAL_DOCS = [
  {
    id: 'doc-1',
    name: 'BRAHMA_ASTRA_Frontend_Design_Master_v1.md',
    type: 'markdown',
    size: '13.1 KB',
    updatedAt: '2026-10-16',
    status: 'indexed',
    summary: 'Approved locked v1 design tokens, typography specifications (Poppins + JetBrains Mono), and screen atlas breakdown for BRAHMA and ASTRA.',
    concepts: ['Design Tokens', 'Cosmic Palette', 'ASTRA Separation', 'Zero Docker Native Windows']
  },
  {
    id: 'doc-2',
    name: 'API_CONTRACTS.md',
    type: 'markdown',
    size: '18.4 KB',
    updatedAt: '2026-10-15',
    status: 'indexed',
    summary: 'Full specification of REST endpoints for Node.js API, authentication tokens, conversations, projects, and AI task lifecycles.',
    concepts: ['JWT Auth', 'Prisma SQLite', 'Brahma Core Gateway', 'ASTRA Security Boundary']
  },
  {
    id: 'doc-3',
    name: 'SECURITY_BASELINE.md',
    type: 'markdown',
    size: '9.2 KB',
    updatedAt: '2026-10-14',
    status: 'indexed',
    summary: 'Security constraints prohibiting arbitrary host process execution in ASTRA Runner on native Windows environments.',
    concepts: ['Execution Mode Disabled', 'HMAC Service Key', 'Input Sanitization', 'Audit Logs']
  }
];

export function DocumentsWorkspace() {
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadSuccess(null);

    // Read client-side file
    const file = files[0];
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.name.split('.').pop() || 'text',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'indexed',
        summary: `Imported document for BRAHMA intelligence analysis. Size: ${(file.size / 1024).toFixed(1)} KB.`,
        concepts: ['User Upload', 'Client Analysis', 'Session Memory']
      };

      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
      setUploadSuccess(`Successfully indexed "${file.name}" into workspace.`);
      setTimeout(() => setUploadSuccess(null), 3500);
    }, 800);
  }

  function handleDelete(id) {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activePreviewDoc?.id === id) {
      setActivePreviewDoc(null);
    }
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Document Intelligence
            </h1>
            <Badge variant="cyan" icon={FileText}>Atlas Screen 6</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Upload, inspect, and index architectural documents, markdown notes, and specifications.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brahma-violet)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-glow-violet)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Upload size={16} />
            <span>{isUploading ? 'Indexing File...' : 'Upload Document'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{ display: 'none' }}
              accept=".md,.txt,.json,.csv,.pdf"
            />
          </label>
        </div>
      </div>

      {/* Success notification */}
      {uploadSuccess && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid var(--status-success)',
            color: '#86EFAC',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search uploaded documents..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} /> Format:
            </span>
            {['all', 'markdown', 'json'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: selectedType === type ? 'var(--brahma-violet)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedType === type ? '1px solid var(--brahma-violet-light)' : '1px solid var(--border-default)',
                  color: selectedType === type ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Grid: Document List & Detail Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: activePreviewDoc ? '1fr 380px' : '1fr', gap: '20px' }}>
        {/* Document Table / Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredDocs.length === 0 ? (
            <Card>
              <EmptyState
                icon={FileText}
                title="No Documents Found"
                description="Upload an architectural specification, markdown guide, or system document to begin indexing."
              />
            </Card>
          ) : (
            filteredDocs.map(doc => {
              const isSelected = activePreviewDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--surface-card)',
                    border: isSelected ? '1px solid var(--brahma-violet)' : '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-card)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brahma-cyan)',
                        flexShrink: 0
                      }}
                    >
                      <FileCode size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span>Size: {doc.size}</span>
                        <span>•</span>
                        <span>Updated: {doc.updatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant="cyan" icon={CheckCircle2}>Indexed</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setActivePreviewDoc(isSelected ? null : doc)}
                    >
                      {isSelected ? 'Close' : 'Inspect'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(doc.id)}
                      title="Remove document from workspace"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Preview Drawer */}
        {activePreviewDoc && (
          <Card glow="violet">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} style={{ color: 'var(--brahma-gold)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Document Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Close preview"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Document Name
                </label>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-all' }}>
                  {activePreviewDoc.name}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Synthesis Summary
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '4px' }}>
                  {activePreviewDoc.summary}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Extracted Architectural Concepts
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {activePreviewDoc.concepts.map((concept, idx) => (
                    <Badge key={idx} variant="violet">{concept}</Badge>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} /> Status: Ready for RAG prompt injection
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
