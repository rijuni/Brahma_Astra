import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Terminal,
  Layers
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';

export default function DeployPanel() {
  const [environment, setEnvironment] = useState('preview');
  const [target, setTarget] = useState('development');
  const [port, setPort] = useState('8000');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [activeDeployStep, setActiveDeployStep] = useState(0);
  const [deployedUrl, setDeployedUrl] = useState('https://edith-preview.friday-ai.local');

  const [envVars, setEnvVars] = useState([
    { key: 'NODE_ENV', value: 'production', isSecret: false },
    { key: 'SERVICE_PORT', value: '8000', isSecret: false },
    { key: 'DATABASE_URL', value: 'sqlite:///data/dev.db', isSecret: true },
    { key: 'JWT_SIGNING_KEY', value: 'edith_cosmic_jwt_secret_key_v1', isSecret: true }
  ]);
  const [showSecrets, setShowSecrets] = useState({});

  const [deployLogs, setDeployLogs] = useState([
    '[SAMPLE] Deployment preview. No build or tests were started.',
    '[SAMPLE] No container image was created.',
    '[SAMPLE] No service was deployed and no health check was performed.'
  ]);

  const { addToast } = useToast();

  const handleDeploy = () => {
    setIsDeploying(true);
    setShowLogs(true);
    setActiveDeployStep(1);
    addToast(`Showing a deployment preview for ${environment.toUpperCase()}; no service will be changed.`, 'info');

    const interval = setInterval(() => {
      setActiveDeployStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsDeploying(false);
          addToast('Deployment preview completed. No service was changed.', 'info');
          return 4;
        }
        return prev + 1;
      });
    }, 400);
  };

  const handleAddEnvVar = () => {
    setEnvVars((prev) => [...prev, { key: '', value: '', isSecret: false }]);
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <Rocket size={18} color="#00D2FF" />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Deployment Orchestrator</span>
          <Badge variant="cyan" style={{ padding: '4px 10px', fontSize: '13px' }}>SIMULATED CLOUD DEPLOY</Badge>
        </div>
        <div className="flex items-center gap-2">
          {deployedUrl && (
            <a
              href={deployedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-muted hover:text-white"
              style={{ fontSize: '13.5px' }}
            >
              <span>{deployedUrl}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex flex-col gap-1.5">
          <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Environment</span>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="glass-input"
            style={{ height: '38px', padding: '0 12px', fontSize: '15px', borderRadius: '6px' }}
          >
            <option value="preview" style={{ background: '#0B0F1A' }}>Preview Sandbox</option>
            <option value="docker" style={{ background: '#0B0F1A' }}>Docker Container</option>
            <option value="staging" style={{ background: '#0B0F1A' }}>Staging Cluster</option>
            <option value="production" style={{ background: '#0B0F1A' }}>Production</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Strategy</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="glass-input"
            style={{ height: '38px', padding: '0 12px', fontSize: '15px', borderRadius: '6px' }}
          >
            <option value="development" style={{ background: '#0B0F1A' }}>Blue-Green Zero Downtime</option>
            <option value="canary" style={{ background: '#0B0F1A' }}>Canary 10% Rollout</option>
            <option value="rolling" style={{ background: '#0B0F1A' }}>Rolling Replacement</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Service Port</span>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="glass-input"
            style={{ height: '38px', padding: '0 12px', fontSize: '15px', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Main Grid: Release Gates & Environment Variables */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Left: Verification Gates & Logs */}
        <div className="flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center justify-between p-3.5 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Execute Deployment Pipeline</div>
              <div className="body-regular text-muted" style={{ fontSize: '13.5px' }}>Preview only. No health checks or release actions are performed.</div>
            </div>
            <Button variant="cyan" icon={Rocket} onClick={handleDeploy} isLoading={isDeploying} style={{ height: '38px', padding: '0 18px', fontSize: '15px', fontWeight: 600 }}>
              Preview release
            </Button>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
            {[
              { id: 1, title: 'Build & AST bundle verified' },
              { id: 2, title: 'Sandboxed test suites passed' },
              { id: 3, title: 'OCI container image built' },
              { id: 4, title: 'Health checks verified on target' }
            ].map((gate) => {
              const isDone = activeDeployStep >= gate.id || !isDeploying;
              return (
                <div
                  key={gate.id}
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--glass-border)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} color={isDone ? 'var(--status-success)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '14px', color: isDone ? '#6EE7B7' : 'var(--text-muted)' }}>{gate.title}</span>
                  </div>
                  <span className="code-inline" style={{ fontSize: '12px' }}>{isDone ? 'PASS' : 'WAIT'}</span>
                </div>
              );
            })}
          </div>

          {showLogs && (
            <div className="p-2.5 rounded bg-black/50 border border-white/5 font-mono text-muted overflow-y-auto" style={{ maxHeight: '85px', fontSize: '13px' }}>
              {deployLogs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Environment Variables & Secrets */}
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center justify-between pb-1.5">
            <span className="body-small text-muted" style={{ fontSize: '14px', fontWeight: 600 }}>
              ENVIRONMENT VARIABLES ({envVars.length})
            </span>
            <button onClick={handleAddEnvVar} className="glass-btn-ghost flex items-center gap-1.5 text-muted hover:text-white" style={{ fontSize: '13px', padding: '3px 8px' }}>
              <Plus size={13} color="#00D2FF" /> Add Variable
            </button>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
            {envVars.map((v, idx) => {
              const isMasked = v.isSecret && !showSecrets[idx];
              return (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-white/5">
                  <input
                    type="text"
                    placeholder="KEY"
                    value={v.key}
                    onChange={(e) => {
                      const updated = [...envVars];
                      updated[idx].key = e.target.value;
                      setEnvVars(updated);
                    }}
                    className="glass-input"
                    style={{ width: '130px', padding: '6px 10px', fontSize: '14px' }}
                  />
                  <input
                    type={isMasked ? 'password' : 'text'}
                    placeholder="VALUE"
                    value={v.value}
                    onChange={(e) => {
                      const updated = [...envVars];
                      updated[idx].value = e.target.value;
                      setEnvVars(updated);
                    }}
                    className="glass-input flex-1"
                    style={{ padding: '6px 10px', fontSize: '14px' }}
                  />
                  {v.isSecret && (
                    <button
                      onClick={() => setShowSecrets((p) => ({ ...p, [idx]: !p[idx] }))}
                      className="glass-btn-ghost"
                      style={{ padding: '4px' }}
                      title={isMasked ? 'Reveal secret' : 'Hide secret'}
                    >
                      {isMasked ? <Eye size={14} color="#00D2FF" /> : <EyeOff size={14} color="var(--text-muted)" />}
                    </button>
                  )}
                  <button
                    onClick={() => setEnvVars(envVars.filter((_, i) => i !== idx))}
                    className="glass-btn-ghost"
                    style={{ padding: '4px' }}
                  >
                    <Trash2 size={14} color="var(--status-error)" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
