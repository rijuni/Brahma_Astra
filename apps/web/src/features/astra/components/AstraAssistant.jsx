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
  Cpu,
  X
} from 'lucide-react';
import { ASTRA_TASK_TYPES } from '../../../config/astra-tasks';
import { useToast } from '../../../components/feedback/Toast';

export default function AstraAssistant({
  activeFile,
  activeProject,
  onGenerateTask,
  isGenerating,
  activeTask,
  onClose
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
      className="astra-assistant-container glass-card flex flex-col h-full overflow-hidden"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(18, 14, 38, 0.65)',
        border: '1px solid var(--glass-border)'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          minHeight: '54px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(11, 15, 26, 0.7)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-violet) 0%, var(--brand-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.45)',
              flexShrink: 0
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                Astra Assistant
              </span>
              <span
                className="status-live-pulse"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #10B981'
                }}
                title="AI Engine Active"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="code-inline flex items-center gap-1"
            style={{
              fontSize: '11px',
              padding: '2.5px 8px',
              color: 'var(--brand-gold)',
              background: 'rgba(246, 200, 122, 0.08)',
              border: '1px solid rgba(246, 200, 122, 0.25)',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            <Cpu size={11} /> brahma-1
          </span>
          <button
            onClick={handleResetSession}
            className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white transition-colors"
            style={{ width: '28px', height: '28px', borderRadius: '6px', padding: 0 }}
            title="Reset assistant chat session"
          >
            <RotateCcw size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white transition-colors"
              style={{ width: '28px', height: '28px', borderRadius: '6px', padding: 0 }}
              title="Hide AI Assistant (Ctrl+J)"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Task Type / Mode Selector Bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between gap-3"
        style={{
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(15, 23, 42, 0.5)'
        }}
      >
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Sparkles size={13} color="var(--brand-violet-light)" />
          <span className="text-secondary" style={{ fontSize: '11.5px', fontWeight: 500 }}>
            Task Mode:
          </span>
        </div>
        <select
          value={selectedTaskType}
          onChange={(e) => setSelectedTaskType(e.target.value)}
          className="glass-input flex-1"
          style={{
            height: '34px',
            padding: '0 10px',
            fontSize: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            background: 'rgba(11, 15, 26, 0.85)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          {ASTRA_TASK_TYPES.map((t) => (
            <option key={t.id} value={t.id} style={{ background: '#0B0F1A', color: '#F7F7FB' }}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Context Banner */}
      <div
        className="px-4 py-2 flex items-center justify-between gap-2"
        style={{
          background: 'rgba(56, 189, 248, 0.06)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.14)',
          fontSize: '11.5px'
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode size={13} color="var(--brand-cyan)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--brand-cyan)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeFile ? `Active Context: ${activeFile.path || activeFile.name}` : `Context: ${activeProject?.name || 'Workspace'}`}
          </span>
        </div>
        <span
          className="text-muted"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}
        >
          {activeFile?.language || 'All files'}
        </span>
      </div>

      {/* Interaction Stream Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* Dynamic Planning & Thinking Card */}
        {isGenerating && (
          <div
            className="glass-card flex flex-col gap-2.5 p-4 animate-entrance ai-think-wave"
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border-violet)',
              background: 'rgba(139, 92, 246, 0.16)',
              animation: 'aiThinkWave 2.5s infinite ease-in-out'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="status-live-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--brand-cyan)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-cyan)' }}>
                ASTRA Engine synthesizing architecture plan...
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              {planningSteps.map((step) => (
                <div key={step.id} className="flex flex-col">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    className="flex items-center justify-between text-left py-1 px-1.5 rounded hover:bg-white/5 transition-colors"
                    style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}
                  >
                    <div className="flex items-center gap-2">
                      {step.done ? <CheckCircle2 size={13} color="var(--status-success)" /> : <Clock size={13} color="var(--brand-gold)" />}
                      <span style={{ fontWeight: 500 }}>{step.title}</span>
                    </div>
                    {expandedStep === step.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {expandedStep === step.id && (
                    <div className="text-muted pl-6 pr-2 py-1" style={{ fontSize: '11px', lineHeight: '1.45', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
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
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 w-full`}
            >
              <div
                className="glass-card"
                style={{
                  width: '100%',
                  maxWidth: isUser ? '88%' : '100%',
                  borderRadius: '12px',
                  padding: isUser ? '12px 16px' : '15px 18px',
                  background: isUser ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(99, 102, 241, 0.25) 100%)' : 'rgba(25, 22, 54, 0.65)',
                  border: isUser ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid rgba(139, 92, 246, 0.22)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="flex items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    {!isUser && <Sparkles size={13} color="var(--brand-gold)" />}
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isUser ? 'var(--brand-cyan)' : 'var(--brand-gold)' }}>
                      {isUser ? 'You' : 'ASTRA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted" style={{ fontSize: '10.5px' }}>{m.timestamp}</span>
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
                      style={{ width: '22px', height: '22px', borderRadius: '4px', padding: 0 }}
                      title="Copy message"
                    >
                      {copiedId === m.id ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <p className="body-small" style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {m.text}
                </p>

                {m.plan && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-gold)' }}>
                      Architectural Plan Steps:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {m.plan.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded"
                          style={{ background: 'rgba(11, 15, 26, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '12px' }}
                        >
                          <CheckCircle2 size={13} color="var(--status-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div className="text-secondary leading-snug">
                            <strong className="text-primary">{step.stage}:</strong> {step.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multiline Prompt Composer with Context Pills */}
      <form onSubmit={handleSend} className="p-4" style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(11, 15, 26, 0.75)' }}>
        {/* Context Pills */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleAddContextPill(`@file:${activeFile?.name || 'app'}`)}
            className="astra-context-pill glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4.5px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', color: 'var(--brand-cyan)' }}
            title="Inject active file context"
          >
            <FileCode size={12} /> @ActiveFile
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill(`@project:${activeProject?.name || 'workspace'}`)}
            className="astra-context-pill glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4.5px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)', color: 'var(--brand-violet-light)' }}
            title="Inject project context"
          >
            <Cpu size={12} /> @Project
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill('@selection')}
            className="astra-context-pill glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4.5px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', color: 'var(--brand-gold)' }}
            title="Inject editor selection"
          >
            <Zap size={12} /> @Selection
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill('@terminal:output')}
            className="astra-context-pill glass-btn-ghost flex items-center gap-1.5"
            style={{ padding: '4.5px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--status-success)' }}
            title="Inject terminal output"
          >
            <Terminal size={12} /> @Terminal
          </button>
        </div>

        <div className="astra-composer-box flex items-end gap-2.5" style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
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
              fontSize: '13px',
              fontFamily: 'var(--font-ui)',
              width: '100%',
              resize: 'none',
              lineHeight: '1.5',
              minHeight: '44px',
              maxHeight: '120px'
            }}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="glass-btn-primary flex items-center justify-center transition-all"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              padding: 0,
              flexShrink: 0,
              opacity: prompt.trim() && !isGenerating ? 1 : 0.45,
              background: prompt.trim() && !isGenerating ? 'linear-gradient(135deg, var(--brand-violet) 0%, var(--brand-cyan) 100%)' : undefined,
              boxShadow: prompt.trim() && !isGenerating ? '0 0 12px rgba(139, 92, 246, 0.5)' : 'none'
            }}
            title="Send instruction to ASTRA"
          >
            <Send size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-muted" style={{ fontSize: '10.5px' }}>
          <span>↵ Send • Shift+↵ New Line</span>
          <span style={{ color: 'var(--brand-violet-light)' }}>AST-aware engine</span>
        </div>
      </form>
    </div>
  );
}
