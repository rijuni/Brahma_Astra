import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Play,
  RotateCw,
  Terminal,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';

export default function PipelinesPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const { addToast } = useToast();

  const stages = [
    {
      id: 1,
      name: '1. Lint & Static Analysis',
      duration: '14s',
      status: 'passed',
      logs: '[ESLint] 0 errors found in 18 files.\n[Black/Flake8] Python AST formatted to PEP8 standards.\n[Security] Bandit security audit: 0 high-severity vulnerabilities.'
    },
    {
      id: 2,
      name: '2. Unit & Contract Tests',
      duration: '32s',
      status: 'passed',
      logs: '[Pytest] Running 27 unit tests...\nPASS test_auth_token_rotation (0.12s)\nPASS test_workspace_crud (0.24s)\nPASS test_runner_host_block (0.08s)\nResult: 27/27 passed.'
    },
    {
      id: 3,
      name: '3. Security & Dependency Scan',
      duration: '18s',
      status: 'passed',
      logs: '[Audit] Checking npm package graph for known CVEs...\n[Audit] Checking pip lockfile hashes...\n0 vulnerable dependencies found. Integrity verified.'
    },
    {
      id: 4,
      name: '4. Docker Container Build',
      duration: '45s',
      status: 'passed',
      logs: '[Docker] Step 1/6 : FROM python:3.12-slim\n[Docker] Step 2/6 : WORKDIR /app\n[Docker] Step 3/6 : COPY . .\n[Docker] Step 4/6 : RUN pip install -r requirements.txt\n[Docker] Successfully tagged astra-engine:v1.0.0 (312MB)'
    },
    {
      id: 5,
      name: '5. Staging Environment Deployment',
      duration: '28s',
      status: 'passed',
      logs: '[Deploy] Authenticating to Kubernetes cluster staging.brahma-astra.local\n[Deploy] Applying Helm chart astra-release-v142\n[Deploy] Pods 3/3 healthy. Traffic routed to ingress.'
    }
  ];

  const handleRerun = () => {
    setIsRunning(true);
    addToast('Triggered CI/CD Pipeline #143 run...', 'info');
    setTimeout(() => {
      setIsRunning(false);
      addToast('Pipeline #143 completed successfully in 2m 17s', 'success');
    }, 1500);
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden p-3" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <Layers size={15} color="var(--brand-violet)" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>CI/CD Pipeline Stages</span>
          <Badge variant="cyan" size="small">SIMULATED PIPELINE</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="gold" size="small">Pipeline #142 Passed</Badge>
          <Button
            variant="gold"
            icon={isRunning ? RotateCw : Play}
            onClick={handleRerun}
            isLoading={isRunning}
            style={{ padding: '3px 10px', fontSize: '11px' }}
          >
            {isRunning ? 'Running...' : 'Rerun Pipeline'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Stages Flow + Console Output Drawer */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
        {/* Stages Flow */}
        <div className="flex flex-col gap-1.5 overflow-y-auto">
          {stages.map((stage) => {
            const isSelected = selectedStage?.id === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(isSelected ? null : stage)}
                className="flex items-center justify-between p-2 rounded cursor-pointer transition-all hover:bg-white/5"
                style={{
                  background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(7, 10, 24, 0.4)',
                  border: isSelected ? '1px solid var(--brand-violet)' : '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={14} color="var(--status-success)" />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-primary)' }}>{stage.name}</div>
                    <div className="text-muted" style={{ fontSize: '9px' }}>Completed in {stage.duration} • Click for logs</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="cyan" size="small">SUCCESS</Badge>
                  {isSelected ? <ChevronDown size={11} color="var(--text-muted)" /> : <ChevronRight size={11} color="var(--text-muted)" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage Console Log Drawer */}
        <div className="flex flex-col gap-1 overflow-hidden p-2 rounded bg-black/50 border border-white/5">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Terminal size={12} color="var(--brand-gold)" />
              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 600 }}>
                {selectedStage ? `STAGE LOGS: ${selectedStage.name}` : 'SELECT A STAGE TO VIEW LOGS'}
              </span>
            </div>
            {selectedStage && (
              <button onClick={() => setSelectedStage(null)} className="text-muted hover:text-white">
                <X size={11} />
              </button>
            )}
          </div>

          <pre
            className="flex-1 overflow-y-auto font-mono text-muted p-1"
            style={{ fontSize: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.4', margin: 0, color: '#34D399' }}
          >
            {selectedStage
              ? selectedStage.logs
              : 'Click any pipeline stage on the left to inspect its real-time standard output and diagnostic logs.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
