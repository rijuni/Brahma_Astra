import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  FileCode,
  Globe,
  FileText,
  Terminal,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ASTRA_TASK_TYPES } from '../../../config/astra-tasks';
import { useToast } from '../../../components/feedback/Toast';

export default function AstraAssistant({
  activeFile,
  activeProject,
  onGenerateTask,
  isGenerating,
  activeTask
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('feature');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      role: 'assistant',
      text: 'ASTRA Autonomous Studio initialized. Ready to generate AST-aware patches, refactor code, run test suites, or automate deployments. Use @ pills to inject context.',
      timestamp: 'Ready'
    }
  ]);

  const { addToast } = useToast();

  // When activeTask updates or isGenerating completes, add assistant response
  useEffect(() => {
    if (activeTask && activeTask.id) {
      setMessages((prev) => {
        const exists = prev.some((m) => m.taskId === activeTask.id);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: `m-task-${activeTask.id}`,
            role: 'assistant',
            taskId: activeTask.id,
            text: `Generated patch proposal for "${activeTask.title || activeTask.instruction}". Proposal is ready in the Diff Review view.`,
            plan: [
              { stage: 'Context Analysis', detail: `Parsed AST structure of target file "${activeFile?.name || 'workspace'}"` },
              { stage: 'Strategy Formulation', detail: 'Identified affected function signatures, imports, and interface boundaries' },
              { stage: 'Patch Generation', detail: 'Created unified diff proposal with zero-breaking change semantics' },
              { stage: 'Safety Validation', detail: 'Passed static lint check, no prohibited host execution calls detected' }
            ],
            timestamp: 'Just now'
          }
        ];
      });
    }
  }, [activeTask, activeFile]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const userText = prompt.trim();
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        role: 'user',
        text: userText,
        timestamp: 'Just now'
      }
    ]);

    if (onGenerateTask) {
      onGenerateTask({
        instruction: userText,
        taskType: selectedTaskType,
        targetFile: activeFile?.path
      });
    }
    setPrompt('');
  };

  const handleAddContextPill = (tag) => {
    setPrompt((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag} ` : `${tag} `;
    });
  };

  const handleCopyText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      addToast('Copied to clipboard', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSession = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: 'assistant',
        text: 'Session reset. Workspace state preserved. How can I assist you with your code?',
        timestamp: 'Just now'
      }
    ]);
    addToast('Cleared assistant history', 'info');
  };

  const planningSteps = [
    { id: 1, title: 'Understanding requirements', detail: 'Extracting semantic goals, API contracts, and parameter signatures', done: true },
    { id: 2, title: 'Planning the implementation', detail: 'Designing clean architecture with modular, decoupled functions', done: true },
    { id: 3, title: 'Generating AST patch proposal', detail: 'Creating surgical additions/modifications for target file', done: !isGenerating },
    { id: 4, title: 'Adding error handling & validation', detail: 'Validating against sandbox execution restrictions and edge cases', done: !isGenerating }
  ];

  return (
    <div
      className="glass-card flex flex-col h-full overflow-hidden"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(30, 27, 61, 0.45)'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          height: '52px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(11, 15, 26, 0.6)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-violet) 0%, var(--brand-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Sparkles size={15} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Astra Assistant
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetSession}
            className="glass-btn-ghost flex items-center justify-center"
            style={{ width: '28px', height: '28px', borderRadius: '6px', padding: 0 }}
            title="Reset assistant chat session"
          >
            <RotateCcw size={14} color="var(--text-muted)" />
          </button>
          <span className="code-inline" style={{ fontSize: '11px', padding: '2px 7px', color: 'var(--brand-gold)' }}>
            brahma-1
          </span>
        </div>
      </div>

      {/* Task Type Selector Bar */}
      <div
        className="px-4 py-2.5 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.4)' }}
      >
        <span className="body-small text-muted" style={{ fontSize: '11.5px', fontWeight: 500 }}>Mode:</span>
        <select
          value={selectedTaskType}
          onChange={(e) => setSelectedTaskType(e.target.value)}
          className="glass-input flex-1"
          style={{ height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}
        >
          {ASTRA_TASK_TYPES.map((t) => (
            <option key={t.id} value={t.id} style={{ background: '#0B0F1A', color: '#F7F7FB' }}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Interaction Stream Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {activeFile && (
          <div
            className="flex items-center gap-1.5 px-2 py-1"
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontSize: '11px',
              color: 'var(--brand-cyan)'
            }}
          >
            <FileCode size={12} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Active Context: {activeFile.path}
            </span>
          </div>
        )}

        {/* Dynamic Planning & Thinking Card */}
        {isGenerating && (
          <div
            className="glass-card flex flex-col gap-2 p-3 animate-entrance ai-think-wave"
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border-violet)',
              background: 'rgba(139, 92, 246, 0.15)',
              animation: 'aiThinkWave 2.5s infinite ease-in-out'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="status-live-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-cyan)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-cyan)' }}>
                ASTRA Engine synthesizing architecture plan...
              </span>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              {planningSteps.map((step) => (
                <div key={step.id} className="flex flex-col">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    className="flex items-center justify-between text-left py-0.5"
                    style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      {step.done ? <CheckCircle2 size={12} color="var(--status-success)" /> : <Clock size={12} color="var(--brand-gold)" />}
                      <span>{step.title}</span>
                    </div>
                    {expandedStep === step.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </button>
                  {expandedStep === step.id && (
                    <div className="text-muted pl-5 pb-1" style={{ fontSize: '10px', lineHeight: '1.4' }}>
                      {step.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
            >
              <div
                className="glass-card p-3.5"
                style={{
                  maxWidth: '92%',
                  borderRadius: 'var(--radius-md)',
                  background: isUser ? 'rgba(139, 92, 246, 0.28)' : 'rgba(255, 255, 255, 0.04)',
                  border: isUser ? '1px solid var(--brand-violet)' : '1px solid var(--glass-border)'
                }}
              >
                <div className="flex items-center justify-between gap-2.5 mb-1.5">
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: isUser ? 'var(--brand-cyan)' : 'var(--brand-gold)' }}>
                    {isUser ? 'You' : 'ASTRA'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted" style={{ fontSize: '10.5px' }}>{m.timestamp}</span>
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="glass-btn-ghost flex items-center justify-center"
                      style={{ width: '22px', height: '22px', borderRadius: '4px', padding: 0 }}
                      title="Copy"
                    >
                      {copiedId === m.id ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} color="var(--text-muted)" />}
                    </button>
                  </div>
                </div>

                <p className="body-small" style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  {m.text}
                </p>

                {m.plan && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-1.5">
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--brand-gold)' }}>
                      Architectural Plan Steps:
                    </span>
                    {m.plan.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-secondary" style={{ fontSize: '11.5px' }}>
                        <CheckCircle2 size={12} color="var(--status-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span><strong>{step.stage}:</strong> {step.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multiline Prompt Composer with Context Pills */}
      <form onSubmit={handleSend} className="p-3.5" style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(11, 15, 26, 0.7)' }}>
        {/* Context Pills */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleAddContextPill(`@file:${activeFile?.name || 'app'}`)}
            className="glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4px 9px', fontSize: '11.5px', fontWeight: 500, borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--brand-cyan)' }}
          >
            <FileCode size={12} /> @ActiveFile
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill(`@project:${activeProject?.name || 'workspace'}`)}
            className="glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4px 9px', fontSize: '11.5px', fontWeight: 500, borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--brand-violet-light)' }}
          >
            <Cpu size={12} /> @Project
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill('@selection')}
            className="glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4px 9px', fontSize: '11.5px', fontWeight: 500, borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--brand-gold)' }}
          >
            <Zap size={12} /> @Selection
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill('@terminal:output')}
            className="glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4px 9px', fontSize: '11.5px', fontWeight: 500, borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}
          >
            <Terminal size={12} /> @Terminal
          </button>
        </div>

        <div className="glass-input flex items-center gap-2.5" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Instruct ASTRA (e.g. Implement rate limiting middleware)..."
            rows={2}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontFamily: 'var(--font-ui)',
              width: '100%',
              resize: 'none',
              lineHeight: '1.4'
            }}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="glass-btn-primary flex items-center justify-center transition-all"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              padding: 0,
              flexShrink: 0,
              opacity: prompt.trim() && !isGenerating ? 1 : 0.4
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
