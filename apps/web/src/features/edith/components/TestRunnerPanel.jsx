import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../components/feedback/Toast';

export default function TestRunnerPanel() {
  const [filter, setFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [inspectTest, setInspectTest] = useState(null);
  const { addToast } = useToast();

  const [testResults] = useState([
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
    addToast('Preview only: no test suite was started.', 'warning');
  };
  const handleRunTests = handleRunAll;

  const handleRunSingle = (_tId, e) => {
    e.stopPropagation();
    addToast('Preview only: no test was started.', 'warning');
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Test Runner Header & Controls */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            TEST SUITE RUNNER
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className="glass-btn-ghost"
              style={{
                height: '34px',
                padding: '0 12px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                color: filter === 'all' ? '#FFFFFF' : 'var(--text-muted)',
                background: filter === 'all' ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.25) 0%, rgba(2, 132, 199, 0.2) 100%)' : 'transparent',
                border: filter === 'all' ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid transparent'
              }}
            >
              All ({testResults.length})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className="glass-btn-ghost"
              style={{
                height: '34px',
                padding: '0 12px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                color: filter === 'passed' ? 'var(--status-success)' : 'var(--text-muted)',
                background: filter === 'passed' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: filter === 'passed' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
              }}
            >
              Passed ({passedCount})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className="glass-btn-ghost"
              style={{
                height: '34px',
                padding: '0 12px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                color: filter === 'failed' ? 'var(--status-error)' : 'var(--text-muted)',
                background: filter === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                border: filter === 'failed' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent'
              }}
            >
              Failed ({failedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="gold" style={{ padding: '4px 10px', fontSize: '13px' }}>PREVIEW · SAMPLE RESULTS</Badge>
          <Button
            variant="cyan"
            icon={Play}
            onClick={handleRunAll}
            style={{ height: '36px', padding: '0 16px', fontSize: '15px', fontWeight: 600 }}
          >
            Preview results
          </Button>
        </div>
      </div>

      <div role="note" className="edith-preview-note">
        Sample test data only. No test process has run from this panel.
      </div>

      {/* Coverage Metric Bar */}
      <div className="grid grid-cols-4 gap-3 mb-3 p-2.5 rounded" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Statements</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--brand-cyan)' }}>94.2%</span>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Branches</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#00D2FF' }}>88.5%</span>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Functions</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#34D399' }}>96.0%</span>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Lines</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#A78BFA' }}>92.1%</span>
        </div>
      </div>

      {/* Test Execution List */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {filteredTests.map((t) => {
          const isPassed = t.status === 'passed';

          return (
            <div
              key={t.id}
              onClick={() => !isPassed && setInspectTest(t)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded transition-all"
              style={{
                background: isPassed ? 'rgba(7, 10, 24, 0.4)' : 'rgba(239, 68, 68, 0.1)',
                border: isPassed ? '1px solid var(--glass-border)' : '1px solid rgba(239, 68, 68, 0.25)',
                cursor: !isPassed ? 'pointer' : 'default',
                fontSize: '14px'
              }}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {isPassed ? (
                  <CheckCircle2 size={16} color="var(--status-success)" />
                ) : (
                  <XCircle size={16} color="var(--status-error)" />
                )}
                <span className="code-inline" style={{ fontSize: '15px', color: isPassed ? 'var(--text-primary)' : 'var(--status-error)' }}>
                  {t.name}
                </span>
                <span className="text-muted" style={{ fontSize: '12.5px' }}>[{t.suite}]</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-muted" style={{ fontSize: '13px' }}>{t.duration}</span>
                <button
                  onClick={(e) => handleRunSingle(t.id, e)}
                  className="glass-btn-ghost flex items-center justify-center"
                  style={{ width: '28px', height: '28px', borderRadius: '4px', padding: 0 }}
                  title="Preview only; does not run this test"
                >
                  <Play size={13} fill="currentColor" color="var(--text-muted)" />
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
        maxWidth="540px"
      >
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <XCircle size={18} color="var(--status-error)" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--status-error)' }}>
              {inspectTest?.name}
            </span>
          </div>

          <div className="p-3 rounded bg-black/40 border border-red-500/30">
            <div className="text-muted mb-1.5" style={{ fontSize: '13px' }}>Error Details:</div>
            <div style={{ color: '#F87171', fontFamily: 'var(--font-code)', fontSize: '14.5px' }}>
              {inspectTest?.error}
            </div>
          </div>

          <div className="p-3 rounded bg-black/40 border border-white/5">
            <div className="text-muted mb-1.5" style={{ fontSize: '13px' }}>Traceback:</div>
            <pre style={{ margin: 0, color: '#E2E8F0', fontFamily: 'var(--font-code)', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {inspectTest?.traceback}
            </pre>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <Button variant="ghost" size="small" onClick={() => setInspectTest(null)} style={{ fontSize: '14px' }}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
