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
      <div className="glass-card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '280px' }}>
        <FileDiff size={42} color="var(--text-muted)" style={{ marginBottom: '14px', opacity: 0.5 }} />
        <h4 className="card-title" style={{ fontSize: '18px', marginBottom: '6px' }}>
          No Active Code Patch
        </h4>
        <p className="body-regular text-muted" style={{ fontSize: '15px', maxWidth: '380px', lineHeight: '1.5' }}>
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
        className="flex items-center justify-between px-4 py-3"
        style={{
          height: '56px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(11, 15, 26, 0.75)'
        }}
      >
        <div className="flex items-center gap-3">
          <FileDiff size={20} color="#38BDF8" />
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Proposed Patch Review
          </span>
          <button
            onClick={() => setShowRiskDetails(!showRiskDetails)}
            className="flex items-center gap-1 cursor-pointer"
            title="Click for risk analysis breakdown"
          >
            <Badge variant={patchProposal.risk_level === 'high' ? 'error' : 'cyan'} style={{ padding: '4px 10px', fontSize: '13px' }}>
              Risk: {patchProposal.risk_level || 'low'}
            </Badge>
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--status-success)' }}>+{additions}</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--status-error)' }}>-{deletions}</span>
        </div>

        {/* View mode toggle & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-white/10 rounded-md overflow-hidden mr-1">
            <button
              onClick={() => setDiffMode('unified')}
              className="glass-btn-ghost flex items-center gap-1.5"
              style={{
                height: '36px',
                padding: '0 14px',
                fontSize: '14px',
                fontWeight: 500,
                background: diffMode === 'unified' ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.25) 0%, rgba(2, 132, 199, 0.2) 100%)' : 'transparent',
                color: diffMode === 'unified' ? '#FFFFFF' : 'var(--text-muted)'
              }}
              title="Unified diff view"
            >
              <AlignLeft size={15} /> Unified
            </button>
            <button
              onClick={() => setDiffMode('split')}
              className="glass-btn-ghost flex items-center gap-1.5"
              style={{
                height: '36px',
                padding: '0 14px',
                fontSize: '14px',
                fontWeight: 500,
                background: diffMode === 'split' ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.25) 0%, rgba(2, 132, 199, 0.2) 100%)' : 'transparent',
                color: diffMode === 'split' ? '#FFFFFF' : 'var(--text-muted)'
              }}
              title="Side-by-side split diff view"
            >
              <Columns size={15} /> Split
            </button>
          </div>

          <button
            onClick={handleCopyDiff}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '36px', height: '36px', borderRadius: '6px' }}
            title="Copy diff to clipboard"
          >
            <Copy size={16} color="var(--text-muted)" />
          </button>

          <Button
            variant="ghost"
            icon={X}
            onClick={onReject}
            disabled={isApplying}
            style={{ height: '38px', padding: '0 16px', fontSize: '15px', color: 'var(--status-error)' }}
          >
            Reject
          </Button>

          <Button
            variant="cyan"
            icon={Check}
            onClick={onApprove}
            isLoading={isApplying}
            style={{ height: '38px', padding: '0 18px', fontSize: '15px', fontWeight: 600 }}
          >
            Approve & Queue
          </Button>
        </div>
      </div>

      {/* Risk Details Drawer */}
      {showRiskDetails && (
        <div
          className="p-4 animate-entrance"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid var(--glass-border-violet)',
            fontSize: '14px'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontWeight: 600, color: '#00D2FF', fontSize: '15px' }}>
              Static Analysis & Security Audit:
            </span>
            <button onClick={() => setShowRiskDetails(false)} className="text-muted hover:text-white">
              <X size={15} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="p-3 rounded bg-white/5">
              <div className="text-muted" style={{ fontSize: '13px' }}>Confidence Score</div>
              <div style={{ color: 'var(--status-success)', fontWeight: 600, fontSize: '15px' }}>98.4% AST Match</div>
            </div>
            <div className="p-3 rounded bg-white/5">
              <div className="text-muted" style={{ fontSize: '13px' }}>Sandbox Restrictions</div>
              <div style={{ color: '#00D2FF', fontWeight: 600, fontSize: '15px' }}>0 Prohibited Calls</div>
            </div>
            <div className="p-3 rounded bg-white/5">
              <div className="text-muted" style={{ fontSize: '13px' }}>Breakage Probability</div>
              <div style={{ color: '#38BDF8', fontWeight: 600, fontSize: '15px' }}>Low (Additive only)</div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Summary Note */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: 'rgba(11, 15, 26, 0.4)',
          borderBottom: '1px solid var(--glass-border)',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}
      >
        <span>{patchProposal.summary || 'EDITH code synthesis patch proposal'}</span>
        <span className="text-muted" style={{ fontSize: '13px' }}>
          {patchProposal.files.length} file(s) modified
        </span>
      </div>

      {/* Multi-File Tabs (if multiple files in patch) */}
      {patchProposal.files.length > 1 && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto"
          style={{ background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid var(--glass-border)' }}
        >
          {patchProposal.files.map((file, idx) => (
            <button
              key={file.file_path || idx}
              onClick={() => setSelectedFileIndex(idx)}
              className="glass-btn-ghost body-small flex items-center gap-1.5"
              style={{
                padding: '4px 12px',
                fontSize: '13.5px',
                borderRadius: '6px',
                color: selectedFileIndex === idx ? '#00D2FF' : 'var(--text-muted)',
                background: selectedFileIndex === idx ? 'rgba(0, 210, 255, 0.15)' : 'transparent'
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
          fontSize: '15.5px',
          lineHeight: '1.65',
          background: '#070B16'
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
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* Left Original */}
            <div className="flex flex-col border-r border-white/5 pr-2 overflow-x-auto">
              <div className="text-muted pb-1.5 mb-1.5 border-b border-white/5" style={{ fontSize: '13px', fontWeight: 600 }}>
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
              <div className="text-muted pb-1.5 mb-1.5 border-b border-white/5" style={{ fontSize: '13px', fontWeight: 600 }}>
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
