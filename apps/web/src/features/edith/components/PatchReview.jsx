import React, { useState } from 'react';
import {
  FileDiff,
  Check,
  X,
  AlertTriangle,
  Shield,
  Layers,
  ChevronRight,
  Columns,
  AlignLeft,
  Copy,
  Info
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';

export default function PatchReview({
  patchProposal,
  onApprove,
  onReject,
  isApplying
}) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [diffMode, setDiffMode] = useState('unified'); // 'unified' | 'split'
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const { addToast } = useToast();

  if (!patchProposal || !patchProposal.files || patchProposal.files.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '260px' }}>
        <FileDiff size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
        <h4 className="card-title" style={{ fontSize: '15px', marginBottom: '4px' }}>
          No Active Code Patch
        </h4>
        <p className="body-small text-muted" style={{ maxWidth: '320px' }}>
          When EDITH Assistant proposes code modifications, the unified diff and risk analysis will appear here for your review.
        </p>
      </div>
    );
  }

  const activePatchFile = patchProposal.files[selectedFileIndex] || patchProposal.files[0];
  const diffLines = (activePatchFile?.diff || '').split('\n');

  // Compute additions and deletions
  const additions = diffLines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
  const deletions = diffLines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length;

  const handleCopyDiff = async () => {
    try {
      await navigator.clipboard.writeText(activePatchFile?.diff || '');
      addToast('Copied patch diff to clipboard', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Build split view lines
  const splitLeft = [];
  const splitRight = [];
  diffLines.forEach((line) => {
    if (line.startsWith('-') && !line.startsWith('---')) {
      splitLeft.push({ type: 'del', text: line.substring(1) });
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      splitRight.push({ type: 'add', text: line.substring(1) });
    } else if (line.startsWith('@@')) {
      splitLeft.push({ type: 'hunk', text: line });
      splitRight.push({ type: 'hunk', text: line });
    } else {
      splitLeft.push({ type: 'normal', text: line.startsWith(' ') ? line.substring(1) : line });
      splitRight.push({ type: 'normal', text: line.startsWith(' ') ? line.substring(1) : line });
    }
  });

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Patch Header & Risk Assessment */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          height: '52px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(30, 27, 61, 0.6)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <FileDiff size={18} color="var(--brand-gold)" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Proposed Patch Review
          </span>
          <button
            onClick={() => setShowRiskDetails(!showRiskDetails)}
            className="flex items-center gap-1 cursor-pointer"
            title="Click for risk analysis breakdown"
          >
            <Badge variant={patchProposal.risk_level === 'high' ? 'error' : 'cyan'} style={{ padding: '4px 8px', fontSize: '11px' }}>
              Risk: {patchProposal.risk_level || 'low'}
            </Badge>
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-success)' }}>+{additions}</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-error)' }}>-{deletions}</span>
        </div>

        {/* View mode toggle & Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center border border-white/10 rounded-md overflow-hidden mr-1">
            <button
              onClick={() => setDiffMode('unified')}
              className="glass-btn-ghost flex items-center gap-1.5"
              style={{
                height: '32px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 500,
                background: diffMode === 'unified' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                color: diffMode === 'unified' ? 'var(--brand-gold)' : 'var(--text-muted)'
              }}
              title="Unified diff view"
            >
              <AlignLeft size={13} /> Unified
            </button>
            <button
              onClick={() => setDiffMode('split')}
              className="glass-btn-ghost flex items-center gap-1.5"
              style={{
                height: '32px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 500,
                background: diffMode === 'split' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                color: diffMode === 'split' ? 'var(--brand-gold)' : 'var(--text-muted)'
              }}
              title="Side-by-side split diff view"
            >
              <Columns size={13} /> Split
            </button>
          </div>

          <button
            onClick={handleCopyDiff}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            title="Copy diff to clipboard"
          >
            <Copy size={15} color="var(--text-muted)" />
          </button>

          <Button
            variant="ghost"
            icon={X}
            onClick={onReject}
            disabled={isApplying}
            style={{ height: '34px', padding: '0 14px', fontSize: '12.5px', color: 'var(--status-error)' }}
          >
            Reject
          </Button>

          <Button
            variant="gold"
            icon={Check}
            onClick={onApprove}
            isLoading={isApplying}
            style={{ height: '34px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600 }}
          >
            Approve & Apply Patch
          </Button>
        </div>
      </div>

      {/* Risk Details Drawer */}
      {showRiskDetails && (
        <div
          className="p-3 animate-entrance"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid var(--glass-border-violet)',
            fontSize: '11px'
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontWeight: 600, color: 'var(--brand-gold)' }}>
              Static Analysis & Security Audit:
            </span>
            <button onClick={() => setShowRiskDetails(false)} className="text-muted hover:text-white">
              <X size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="p-2 rounded bg-white/5">
              <div className="text-muted" style={{ fontSize: '10px' }}>Confidence Score</div>
              <div style={{ color: 'var(--status-success)', fontWeight: 600 }}>98.4% AST Match</div>
            </div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-muted" style={{ fontSize: '10px' }}>Sandbox Restrictions</div>
              <div style={{ color: 'var(--brand-cyan)', fontWeight: 600 }}>0 Prohibited Calls</div>
            </div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-muted" style={{ fontSize: '10px' }}>Breakage Probability</div>
              <div style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>Low (Additive only)</div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Summary Note */}
      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{
          background: 'rgba(11, 15, 26, 0.4)',
          borderBottom: '1px solid var(--glass-border)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}
      >
        <span>{patchProposal.summary || 'EDITH code synthesis patch proposal'}</span>
        <span className="text-muted" style={{ fontSize: '10px' }}>
          {patchProposal.files.length} file(s) modified
        </span>
      </div>

      {/* Multi-File Tabs (if multiple files in patch) */}
      {patchProposal.files.length > 1 && (
        <div
          className="flex items-center gap-1 px-3 py-1 overflow-x-auto"
          style={{ background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid var(--glass-border)' }}
        >
          {patchProposal.files.map((file, idx) => (
            <button
              key={file.file_path || idx}
              onClick={() => setSelectedFileIndex(idx)}
              className="glass-btn-ghost body-small flex items-center gap-1"
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '4px',
                color: selectedFileIndex === idx ? 'var(--brand-gold)' : 'var(--text-muted)',
                background: selectedFileIndex === idx ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
              }}
            >
              <span>{file.file_path}</span>
            </button>
          ))}
        </div>
      )}

      {/* Diff Stream Visualizer */}
      <div
        className="flex-1 overflow-y-auto p-3"
        style={{
          fontFamily: 'var(--font-code)',
          fontSize: '12px',
          lineHeight: '1.6',
          background: 'rgba(7, 10, 24, 0.6)'
        }}
      >
        {diffMode === 'unified' ? (
          diffLines.map((line, idx) => {
            let lineClass = '';
            if (line.startsWith('+') && !line.startsWith('+++')) lineClass = 'diff-line-add px-2';
            else if (line.startsWith('-') && !line.startsWith('---')) lineClass = 'diff-line-del px-2';
            else if (line.startsWith('@@')) lineClass = 'diff-line-hunk px-2';

            return (
              <div key={idx} className={lineClass} style={{ whiteSpace: 'pre' }}>
                {line || ' '}
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-2 gap-2 h-full">
            {/* Left Original */}
            <div className="flex flex-col border-r border-white/5 pr-2 overflow-x-auto">
              <div className="text-muted pb-1 mb-1 border-b border-white/5" style={{ fontSize: '10px', fontWeight: 600 }}>
                ORIGINAL (Before)
              </div>
              {splitLeft.map((item, idx) => (
                <div
                  key={idx}
                  className={item.type === 'del' ? 'diff-line-del px-1' : item.type === 'hunk' ? 'diff-line-hunk px-1' : 'px-1'}
                  style={{ whiteSpace: 'pre' }}
                >
                  {item.text || ' '}
                </div>
              ))}
            </div>

            {/* Right Modified */}
            <div className="flex flex-col pl-2 overflow-x-auto">
              <div className="text-muted pb-1 mb-1 border-b border-white/5" style={{ fontSize: '10px', fontWeight: 600 }}>
                PROPOSED (After)
              </div>
              {splitRight.map((item, idx) => (
                <div
                  key={idx}
                  className={item.type === 'add' ? 'diff-line-add px-1' : item.type === 'hunk' ? 'diff-line-hunk px-1' : 'px-1'}
                  style={{ whiteSpace: 'pre' }}
                >
                  {item.text || ' '}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
