import React, { useState } from 'react';
import {
  Bug,
  Play,
  CircleDot,
  Pause,
  ArrowDown,
  CornerDownRight,
  CornerUpLeft,
  RotateCcw,
  Square,
  Plus,
  Trash2,
  Check,
  Eye
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';

export default function DebugPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [breakpoints, setBreakpoints] = useState([
    { id: 'bp-1', file: 'app/main.py', line: 12, enabled: true },
    { id: 'bp-2', file: 'app/views.py', line: 8, enabled: true }
  ]);
  const [newBpFile, setNewBpFile] = useState('app/main.py');
  const [newBpLine, setNewBpLine] = useState('');
  const [isAddingBp, setIsAddingBp] = useState(false);

  const [watchExpressions, setWatchExpressions] = useState([
    { expr: 'patient.age > 30', value: 'true' },
    { expr: 'admission_status == "admitted"', value: 'true' }
  ]);
  const [newWatchInput, setNewWatchInput] = useState('');

  const [callStack, setCallStack] = useState([
    { frame: 'get_patient()', file: 'app/views.py', line: 14 },
    { frame: 'authenticate_request()', file: 'app/auth.py', line: 42 },
    { frame: 'dispatch()', file: 'fastapi/routing.py', line: 128 }
  ]);

  const [variables, setVariables] = useState([
    { name: 'patient_id', value: '1', type: 'int' },
    { name: 'name', value: '"John Doe"', type: 'str' },
    { name: 'age', value: '35', type: 'int' },
    { name: 'gender', value: '"Male"', type: 'str' },
    { name: 'admission_status', value: '"admitted"', type: 'str' },
    { name: 'vitals.heart_rate_bpm', value: '72', type: 'int' }
  ]);

  const { addToast } = useToast();

  const handleStartDebug = () => {
    setIsRunning(true);
    addToast('Debugger preview opened. No process was attached.', 'warning');
  };

  const handleStopDebug = () => {
    setIsRunning(false);
    setActiveStep(0);
    addToast('Debugger detached', 'info');
  };

  const handleStepOver = () => {
    setActiveStep((p) => p + 1);
    addToast('Preview only: no program instruction was executed.', 'warning');
  };

  const handleAddBreakpoint = (e) => {
    e.preventDefault();
    if (!newBpLine.trim()) return;
    const bp = {
      id: `bp-${Date.now()}`,
      file: newBpFile.trim() || 'main.py',
      line: parseInt(newBpLine.trim(), 10) || 1,
      enabled: true
    };
    setBreakpoints((prev) => [...prev, bp]);
    setNewBpLine('');
    setIsAddingBp(false);
    addToast(`Added breakpoint at ${bp.file}:${bp.line}`, 'success');
  };

  const handleAddWatch = (e) => {
    e.preventDefault();
    if (!newWatchInput.trim()) return;
    setWatchExpressions((prev) => [
      ...prev,
      { expr: newWatchInput.trim(), value: 'evaluated: true' }
    ]);
    setNewWatchInput('');
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header Controls & Stepping Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <Bug size={18} color="#38BDF8" />
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Run & Debug
          </span>
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>SIMULATED DEBUGGER</Badge>
        </div>

        {/* Stepping controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleStartDebug}
              className="glass-btn flex items-center justify-center gap-2"
              style={{ height: '36px', padding: '0 16px', fontSize: '15px', fontWeight: 600, color: '#34D399', borderRadius: '6px' }}
              title="Start Debugging (F5)"
            >
              <Play size={15} fill="currentColor" />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleStepOver}
                className="glass-btn-ghost flex items-center gap-2"
                style={{ height: '36px', padding: '0 14px', fontSize: '14px', borderRadius: '6px' }}
                title="Step Over (F10)"
              >
                <CornerDownRight size={15} color="var(--brand-cyan)" />
                <span>Step Over</span>
              </button>
              <button
                onClick={() => addToast('Preview only: no program instruction was executed.', 'warning')}
                className="glass-btn-ghost flex items-center gap-2"
                style={{ height: '36px', padding: '0 14px', fontSize: '14px', borderRadius: '6px' }}
                title="Step Into (F11)"
              >
                <ArrowDown size={15} color="#00D2FF" />
                <span>Step Into</span>
              </button>
              <button
                onClick={handleStopDebug}
                className="glass-btn-ghost flex items-center gap-2"
                style={{ height: '36px', padding: '0 14px', fontSize: '14px', borderRadius: '6px', color: 'var(--status-error)' }}
                title="Stop Debugging (Shift+F5)"
              >
                <Square size={14} fill="currentColor" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid: Breakpoints + Watch + Call Stack + Variables */}
      <div className="grid grid-cols-4 gap-4 flex-1 overflow-y-auto">
        {/* 1. Breakpoints */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '10px' }}>
          <div className="flex items-center justify-between pb-1">
            <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>BREAKPOINTS</span>
            <button onClick={() => setIsAddingBp(!isAddingBp)} className="glass-btn-ghost" style={{ padding: '2px 6px' }} title="Add breakpoint">
              <Plus size={15} color="#00D2FF" />
            </button>
          </div>

          {isAddingBp && (
            <form onSubmit={handleAddBreakpoint} className="flex flex-col gap-2 mb-1 p-2.5 rounded bg-white/5">
              <input
                type="text"
                placeholder="file.py"
                value={newBpFile}
                onChange={(e) => setNewBpFile(e.target.value)}
                className="glass-input"
                style={{ padding: '6px 8px', fontSize: '13.5px' }}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="line"
                  value={newBpLine}
                  onChange={(e) => setNewBpLine(e.target.value)}
                  className="glass-input flex-1"
                  style={{ padding: '6px 8px', fontSize: '13.5px' }}
                />
                <Button variant="cyan" size="small" type="submit" style={{ padding: '4px 10px', fontSize: '13px' }}>
                  Add
                </Button>
              </div>
            </form>
          )}

          {breakpoints.map((bp) => (
            <div
              key={bp.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded"
              style={{ background: 'rgba(7, 10, 24, 0.4)', fontSize: '14px', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <CircleDot size={13} color={bp.enabled ? 'var(--status-error)' : 'var(--text-muted)'} />
                <span className="code-inline" style={{ fontSize: '13.5px' }}>{bp.file}:{bp.line}</span>
              </div>
              <button
                onClick={() => setBreakpoints(breakpoints.filter((b) => b.id !== bp.id))}
                className="glass-btn-ghost"
                style={{ padding: '2px' }}
              >
                <Trash2 size={13} color="var(--text-muted)" />
              </button>
            </div>
          ))}
        </div>

        {/* 2. Watch Expressions */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '10px' }}>
          <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>WATCH EXPRESSIONS</span>
          <form onSubmit={handleAddWatch} className="flex items-center gap-1.5 mb-1">
            <input
              type="text"
              placeholder="+ Watch expression"
              value={newWatchInput}
              onChange={(e) => setNewWatchInput(e.target.value)}
              className="glass-input flex-1"
              style={{ padding: '6px 10px', fontSize: '13.5px' }}
            />
          </form>
          {watchExpressions.map((w, idx) => (
            <div key={idx} className="flex flex-col p-2 rounded" style={{ background: 'rgba(7, 10, 24, 0.4)', fontSize: '13.5px', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--brand-cyan)', fontFamily: 'var(--font-code)', fontSize: '13.5px' }}>{w.expr}</span>
                <button onClick={() => setWatchExpressions(watchExpressions.filter((_, i) => i !== idx))} className="glass-btn-ghost" style={{ padding: '2px' }}>
                  <Trash2 size={13} color="var(--text-muted)" />
                </button>
              </div>
              <span style={{ color: '#34D399', fontFamily: 'var(--font-code)', fontSize: '13.5px' }}>{w.value}</span>
            </div>
          ))}
        </div>

        {/* 3. Call Stack */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '10px' }}>
          <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>CALL STACK</span>
          {callStack.map((cs, idx) => (
            <div
              key={idx}
              className="flex flex-col px-2.5 py-1.5 rounded"
              style={{ background: idx === 0 ? 'rgba(0, 210, 255, 0.15)' : 'rgba(7, 10, 24, 0.4)', border: '1px solid var(--glass-border)' }}
            >
              <span style={{ color: '#00D2FF', fontFamily: 'var(--font-code)', fontSize: '14px' }}>{cs.frame}</span>
              <span className="text-muted" style={{ fontSize: '12.5px' }}>{cs.file}:{cs.line}</span>
            </div>
          ))}
        </div>

        {/* 4. Variables Inspector */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>VARIABLES</span>
          {variables.map((v, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-1.5 rounded"
              style={{ background: 'rgba(7, 10, 24, 0.4)', border: '1px solid var(--glass-border)', fontSize: '13.5px' }}
            >
              <span style={{ color: 'var(--brand-cyan)', fontFamily: 'var(--font-code)', fontSize: '14px' }}>{v.name}</span>
              <span style={{ color: '#38BDF8', fontFamily: 'var(--font-code)', fontSize: '14px' }}>{v.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
