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
    '[BUILD] Compiling TypeScript AST modules... Done in 1.4s',
    '[TEST] Running automated test suites... 27 passed, 0 failed',
    '[CONTAINER] Generating OCI container image edith/microservice:latest',
    '[DEPLOY] Routing traffic to blue-green container instances on port 8000',
    '[HEALTH] Live health check returned HTTP 200 OK (22ms). Ready.'
  ]);

  const { addToast } = useToast();

  const handleDeploy = () => {
    setIsDeploying(true);
    setShowLogs(true);
    setActiveDeployStep(1);
    addToast(`Triggering deployment to ${environment.toUpperCase()}...`, 'info');

    const interval = setInterval(() => {
      setActiveDeployStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsDeploying(false);
          addToast(`Successfully deployed to ${environment.toUpperCase()} on port ${port}`, 'success');
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
    <div className="glass-card flex flex-col h-full overflow-hidden p-3.5" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2.5">
          <Rocket size={16} color="var(--brand-cyan)" />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Deployment Orchestrator</span>
          <Badge variant="cyan" style={{ padding: '4px 8px', fontSize: '11px' }}>SIMULATED CLOUD DEPLOY</Badge>
        </div>
        <div className="flex items-center gap-2">
          {deployedUrl && (
            <a
              href={deployedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-muted hover:text-white"
              style={{ fontSize: '11.5px' }}
            >
              <span>{deployedUrl}</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5">
        <div className="flex flex-col gap-1">
          <span className="body-small text-muted" style={{ fontSize: '11px', fontWeight: 500 }}>Environment</span>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="glass-input"
            style={{ height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}
          >
            <option value="preview" style={{ background: '#0B0F1A' }}>Preview Sandbox</option>
            <option value="docker" style={{ background: '#0B0F1A' }}>Docker Container</option>
            <option value="staging" style={{ background: '#0B0F1A' }}>Staging Cluster</option>
            <option value="production" style={{ background: '#0B0F1A' }}>Production</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="body-small text-muted" style={{ fontSize: '11px', fontWeight: 500 }}>Strategy</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="glass-input"
            style={{ height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}
          >
            <option value="development" style={{ background: '#0B0F1A' }}>Blue-Green Zero Downtime</option>
            <option value="canary" style={{ background: '#0B0F1A' }}>Canary 10% Rollout</option>
            <option value="rolling" style={{ background: '#0B0F1A' }}>Rolling Replacement</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="body-small text-muted" style={{ fontSize: '11px', fontWeight: 500 }}>Service Port</span>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="glass-input"
            style={{ height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Main Grid: Release Gates & Environment Variables */}
      <div className="grid grid-cols-2 gap-3.5 flex-1 overflow-hidden">
        {/* Left: Verification Gates & Logs */}
        <div className="flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between p-3 rounded-md" style={{ background: 'rgba(7, 10, 24, 0.45)', border: '1px solid var(--glass-border)' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Execute Deployment Pipeline</div>
              <div className="body-small text-muted" style={{ fontSize: '11px' }}>Applies pre-flight health checks and initiates release.</div>
            </div>
            <Button variant="gold" icon={Rocket} onClick={handleDeploy} isLoading={isDeploying} style={{ height: '32px', padding: '0 14px', fontSize: '12px', fontWeight: 600 }}>
              Deploy
            </Button>
          </div>

          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
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
                  className="flex items-center justify-between px-2 py-1 rounded"
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--glass-border)'
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} color={isDone ? 'var(--status-success)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '11px', color: isDone ? '#6EE7B7' : 'var(--text-muted)' }}>{gate.title}</span>
                  </div>
                  <span className="code-inline" style={{ fontSize: '9px' }}>{isDone ? 'PASS' : 'WAIT'}</span>
                </div>
              );
            })}
          </div>

          {showLogs && (
            <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-muted overflow-y-auto" style={{ maxHeight: '70px', fontSize: '10px' }}>
              {deployLogs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Environment Variables & Secrets */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between pb-1">
            <span className="body-small text-muted" style={{ fontSize: '10px', fontWeight: 600 }}>
              ENVIRONMENT VARIABLES ({envVars.length})
            </span>
            <button onClick={handleAddEnvVar} className="glass-btn-ghost flex items-center gap-1 text-muted hover:text-white" style={{ fontSize: '10px', padding: '1px 5px' }}>
              <Plus size={10} color="var(--brand-gold)" /> Add Variable
            </button>
          </div>

          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {envVars.map((v, idx) => {
              const isMasked = v.isSecret && !showSecrets[idx];
              return (
                <div key={idx} className="flex items-center gap-1 p-1 rounded bg-white/5">
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
                    style={{ width: '100px', padding: '2px 5px', fontSize: '10px' }}
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
                    style={{ padding: '2px 5px', fontSize: '10px' }}
                  />
                  {v.isSecret && (
                    <button
                      onClick={() => setShowSecrets((p) => ({ ...p, [idx]: !p[idx] }))}
                      className="glass-btn-ghost"
                      style={{ padding: '2px' }}
                      title={isMasked ? 'Reveal secret' : 'Hide secret'}
                    >
                      {isMasked ? <Eye size={10} color="var(--brand-gold)" /> : <EyeOff size={10} color="var(--text-muted)" />}
                    </button>
                  )}
                  <button
                    onClick={() => setEnvVars(envVars.filter((_, i) => i !== idx))}
                    className="glass-btn-ghost"
                    style={{ padding: '2px' }}
                  >
                    <Trash2 size={10} color="var(--status-error)" />
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
