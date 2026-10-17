import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GitPullRequest,
  FileDiff,
  Shield,
  Layers,
  Clock,
  Check,
  X
} from 'lucide-react';

export function PatchReview({
  codingTasks,
  activeTaskId,
  onSelectTask,
  onApproveTask,
  onCancelTask,
  isProcessing
}) {
  const activeTask = codingTasks.find(t => t.id === activeTaskId) || codingTasks[0];
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  if (!activeTask) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '24px',
          color: 'var(--astra-muted)',
          textAlign: 'center',
          gap: '12px'
        }}
      >
        <GitPullRequest size={36} style={{ color: 'var(--astra-border)' }} />
        <h4 style={{ fontSize: '14px', color: 'var(--astra-text)', margin: 0 }}>
          No Active Patch Proposals
        </h4>
        <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
          Ask the ASTRA AI Assistant to generate a code change or refactoring plan.
          Generated patch proposals will appear here for explicit human review.
        </p>
      </div>
    );
  }

  const patchFiles = activeTask.patchProposal?.files || [];
  const activePatchFile = patchFiles[selectedFileIdx] || patchFiles[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'proposed':
        return { label: 'Review Pending', color: 'var(--status-warning)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'approved':
        return { label: 'Approved', color: 'var(--status-success)', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
      case 'running':
        return { label: 'Executing in Engine', color: 'var(--astra-electric-blue)', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' };
      case 'completed':
        return { label: 'Completed', color: 'var(--status-success)', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
      case 'cancelled':
        return { label: 'Rejected / Cancelled', color: 'var(--status-error)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'failed':
        return { label: 'Execution Failed', color: 'var(--status-error)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { label: status, color: 'var(--astra-muted)', bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--astra-border)' };
    }
  };

  const statusBadge = getStatusBadge(activeTask.status);
  const isProposed = activeTask.status === 'proposed';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--astra-surface)',
        overflow: 'hidden'
      }}
    >
      {/* ── Proposal Header ─────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--astra-border)',
          backgroundColor: 'var(--astra-panel)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileDiff size={16} style={{ color: 'var(--astra-electric-blue)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--astra-text)', margin: 0 }}>
              Patch Proposal Review
            </h3>
          </div>

          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`
            }}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Task Title & Summary */}
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--astra-text)' }}>
          {activeTask.title}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--astra-muted)', lineHeight: '1.4', margin: 0 }}>
          {activeTask.patchProposal?.summary || activeTask.instruction}
        </p>

        {/* Risk & Safety Disclosure */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--astra-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} /> Risk Level:
            <strong style={{ color: activeTask.patchProposal?.risk_level === 'high' ? 'var(--status-error)' : 'var(--status-success)', textTransform: 'uppercase' }}>
              {activeTask.patchProposal?.risk_level || 'low'}
            </strong>
          </span>

          <span style={{ fontSize: '11px', color: 'var(--astra-muted)' }}>
            {patchFiles.length} file{patchFiles.length === 1 ? '' : 's'} proposed
          </span>
        </div>
      </div>

      {/* ── File Selector Tabs (if multiple files) ───────────────────── */}
      {patchFiles.length > 1 && (
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--astra-bg)',
            borderBottom: '1px solid var(--astra-border)',
            overflowX: 'auto',
            padding: '4px 8px',
            gap: '6px',
            flexShrink: 0
          }}
        >
          {patchFiles.map((file, fIdx) => (
            <button
              key={fIdx}
              type="button"
              onClick={() => setSelectedFileIdx(fIdx)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontFamily: 'var(--font-code)',
                backgroundColor: selectedFileIdx === fIdx ? 'var(--astra-panel)' : 'transparent',
                border: selectedFileIdx === fIdx ? '1px solid var(--astra-electric-blue)' : '1px solid transparent',
                color: selectedFileIdx === fIdx ? 'var(--astra-electric-blue)' : 'var(--astra-muted)',
                cursor: 'pointer'
              }}
            >
              {file.file_path}
            </button>
          ))}
        </div>
      )}

      {/* ── Unified Diff View ────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#070A18',
          fontFamily: 'var(--font-code)',
          fontSize: '12px',
          lineHeight: '1.6',
          padding: '10px 14px'
        }}
      >
        {activePatchFile?.diff ? (
          activePatchFile.diff.split('\n').map((line, idx) => {
            const isAdd = line.startsWith('+') && !line.startsWith('+++');
            const isDel = line.startsWith('-') && !line.startsWith('---');
            const isHunk = line.startsWith('@@');

            let lineBg = 'transparent';
            let lineColor = 'var(--astra-muted)';

            if (isAdd) {
              lineBg = 'rgba(34, 197, 94, 0.12)';
              lineColor = '#86EFAC';
            } else if (isDel) {
              lineBg = 'rgba(239, 68, 68, 0.12)';
              lineColor = '#FCA5A5';
            } else if (isHunk) {
              lineColor = 'var(--astra-cyan)';
              lineBg = 'rgba(34, 211, 238, 0.05)';
            }

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: lineBg,
                  color: lineColor,
                  padding: '1px 6px',
                  borderRadius: '2px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {line}
              </div>
            );
          })
        ) : (
          <div style={{ color: 'var(--astra-muted)', padding: '20px', textAlign: 'center' }}>
            No unified diff available for this proposal.
          </div>
        )}
      </div>

      {/* ── Explicit Human-In-The-Loop Approval Actions ──────────────── */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--astra-border)',
          backgroundColor: 'var(--astra-panel)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--astra-muted)', lineHeight: '1.4' }}>
          <strong>Human-in-the-loop Gate:</strong> Code changes will never be applied automatically. Approving will create an execution job in ASTRA Engine.
        </div>

        {isProposed ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onCancelTask(activeTask.id)}
              disabled={isProcessing}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--status-error)',
                color: '#FCA5A5',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              <X size={14} />
              <span>Reject Patch</span>
            </button>

            <button
              type="button"
              onClick={() => onApproveTask(activeTask.id)}
              disabled={isProcessing}
              style={{
                flex: 2,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--status-success)',
                border: 'none',
                color: '#070A18',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <Check size={14} />
              <span>{isProcessing ? 'Processing Approval...' : 'Approve & Apply Patch'}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: statusBadge.color }}>
            <CheckCircle2 size={16} />
            <span>Task has been {statusBadge.label.toLowerCase()}.</span>
          </div>
        )}
      </div>
    </div>
  );
}
