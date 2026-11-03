import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Check,
  SlidersHorizontal,
  X
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../components/feedback/Toast';

export default function TestRunnerPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [inspectTest, setInspectTest] = useState(null);
  const [runningTestId, setRunningTestId] = useState(null);
  const { addToast } = useToast();

  const [testResults, setTestResults] = useState([
    { id: 1, name: 'test_get_patient_by_id', status: 'passed', duration: '0.24s', suite: 'unit' },
    { id: 2, name: 'test_patient_not_found_returns_404', status: 'passed', duration: '0.18s', suite: 'unit' },
    { id: 3, name: 'test_create_patient_validates_payload', status: 'passed', duration: '0.31s', suite: 'integration' },
    { id: 4, name: 'test_update_patient_vitals', status: 'passed', duration: '0.22s', suite: 'unit' },
    { id: 5, name: 'test_delete_patient_cascades', status: 'passed', duration: '0.19s', suite: 'integration' },
    {
      id: 6,
      name: 'test_rate_limit_throttle_after_100_requests',
      status: 'failed',
      duration: '0.45s',
      suite: 'security',
      error: 'AssertionError: Expected HTTP 429 Too Many Requests, received 200 OK',
      traceback: 'tests/test_rate_limit.py:38 in test_rate_limit_throttle_after_100_requests\n  assert response.status_code == 429\n  where response.status_code = 200'
    }
  ]);

  const passedCount = testResults.filter((t) => t.status === 'passed').length;
  const failedCount = testResults.filter((t) => t.status === 'failed').length;

  const filteredTests = testResults.filter((t) => {
    if (filter === 'passed') return t.status === 'passed';
    if (filter === 'failed') return t.status === 'failed';
    return true;
  });

  const handleRunAll = () => {
    setIsRunning(true);
    addToast('Executing full test suite against sandboxed boundary...', 'info');
    setTimeout(() => {
      setIsRunning(false);
      addToast(`Test suite complete: ${passedCount} passed, ${failedCount} failed`, failedCount > 0 ? 'warning' : 'success');
    }, 1100);
  };
  const handleRunTests = handleRunAll;

  const handleRunSingle = (tId, e) => {
    e.stopPropagation();
    setRunningTestId(tId);
    setTimeout(() => {
      setRunningTestId(null);
      addToast('Test execution verified', 'info');
    }, 500);
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-3" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Test Runner Header & Controls */}
      <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            TEST SUITE RUNNER
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className="glass-btn-ghost"
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '11.5px',
                fontWeight: 500,
                borderRadius: '5px',
                color: filter === 'all' ? 'var(--brand-gold)' : 'var(--text-muted)',
                background: filter === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
              }}
            >
              All ({testResults.length})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className="glass-btn-ghost"
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '11.5px',
                fontWeight: 500,
                borderRadius: '5px',
                color: filter === 'passed' ? 'var(--status-success)' : 'var(--text-muted)',
                background: filter === 'passed' ? 'rgba(16, 185, 129, 0.15)' : 'transparent'
              }}
            >
              Passed ({passedCount})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className="glass-btn-ghost"
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '11.5px',
                fontWeight: 500,
                borderRadius: '5px',
                color: filter === 'failed' ? 'var(--status-error)' : 'var(--text-muted)',
                background: filter === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
              }}
            >
              Failed ({failedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="cyan" style={{ padding: '4px 8px', fontSize: '11px' }}>SANDBOXED RUNNER</Badge>
          <Button
            variant="gold"
            icon={isRunning ? RefreshCw : Play}
            onClick={handleRunAll}
            isLoading={isRunning}
            style={{ height: '32px', padding: '0 14px', fontSize: '12px', fontWeight: 600 }}
          >
            {isRunning ? 'Running...' : 'Run All'}
          </Button>
        </div>
      </div>

      {/* Coverage Metric Bar */}
      <div className="grid grid-cols-4 gap-2 mb-2 p-1.5 rounded" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '9px', display: 'block' }}>Statements</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-cyan)' }}>94.2%</span>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '9px', display: 'block' }}>Branches</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-gold)' }}>88.5%</span>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '9px', display: 'block' }}>Functions</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#34D399' }}>96.0%</span>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '9px', display: 'block' }}>Lines</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#A78BFA' }}>92.1%</span>
        </div>
      </div>

      {/* Test Execution List */}
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {filteredTests.map((t) => {
          const isPassed = t.status === 'passed';
          const isSingleRunning = runningTestId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => !isPassed && setInspectTest(t)}
              className="flex items-center justify-between px-2 py-1 rounded transition-all"
              style={{
                background: isPassed ? 'rgba(7, 10, 24, 0.4)' : 'rgba(239, 68, 68, 0.1)',
                border: isPassed ? '1px solid var(--glass-border)' : '1px solid rgba(239, 68, 68, 0.25)',
                cursor: !isPassed ? 'pointer' : 'default',
                fontSize: '11px'
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {isPassed ? (
                  <CheckCircle2 size={13} color="var(--status-success)" />
                ) : (
                  <XCircle size={13} color="var(--status-error)" />
                )}
                <span className="code-inline" style={{ fontSize: '11px', color: isPassed ? 'var(--text-primary)' : 'var(--status-error)' }}>
                  {t.name}
                </span>
                <span className="text-muted" style={{ fontSize: '9px' }}>[{t.suite}]</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: '10px' }}>{t.duration}</span>
                <button
                  onClick={(e) => handleRunSingle(t.id, e)}
                  disabled={isSingleRunning}
                  className="glass-btn-ghost"
                  style={{ padding: '2px 5px', fontSize: '9px' }}
                  title="Run this test"
                >
                  <Play size={9} fill="currentColor" color={isSingleRunning ? 'var(--brand-gold)' : 'var(--text-muted)'} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Failure Inspection Modal */}
      <Modal
        isOpen={Boolean(inspectTest)}
        onClose={() => setInspectTest(null)}
        title="Test Failure Traceback"
        maxWidth="500px"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <XCircle size={16} color="var(--status-error)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-error)' }}>
              {inspectTest?.name}
            </span>
          </div>

          <div className="p-2.5 rounded bg-black/40 border border-red-500/30">
            <div className="text-muted mb-1" style={{ fontSize: '10px' }}>Error Details:</div>
            <div style={{ color: '#F87171', fontFamily: 'var(--font-code)', fontSize: '11px' }}>
              {inspectTest?.error}
            </div>
          </div>

          <div className="p-2.5 rounded bg-black/40 border border-white/5">
            <div className="text-muted mb-1" style={{ fontSize: '10px' }}>Traceback:</div>
            <pre style={{ margin: 0, color: '#E2E8F0', fontFamily: 'var(--font-code)', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
              {inspectTest?.traceback}
            </pre>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <Button variant="ghost" size="small" onClick={() => setInspectTest(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
