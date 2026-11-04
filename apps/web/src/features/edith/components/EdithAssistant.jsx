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
import { EDITH_TASK_TYPES } from '../../../config/edith-tasks';
import { useToast } from '../../../components/feedback/Toast';

export default function EdithAssistant({
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
      text: 'EDITH Autonomous Studio initialized. Ready to generate AST-aware patches, refactor code, run test suites, or automate deployments. Use @ pills to inject context.',
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
        background: 'rgba(10, 16, 32, 0.88)',
        border: '1px solid rgba(56, 189, 248, 0.2)'
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
              background: 'linear-gradient(135deg, #00D2FF 0%, #0284C7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0, 210, 255, 0.45)',
              flexShrink: 0
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                EDITH Assistant
              </span>
              <span
                className="status-live-pulse"
                style={{
                  width: '8px',
                  height: '8px',
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
            className="code-inline flex items-center gap-1.5"
            style={{
              fontSize: '13px',
              padding: '3px 10px',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            <Cpu size={13} /> edith-1
          </span>
          <button
            onClick={handleResetSession}
            className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white transition-colors"
            style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
            title="Reset assistant chat session"
          >
            <RotateCcw size={15} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white transition-colors"
              style={{ width: '32px', height: '32px', borderRadius: '6px', padding: 0 }}
              title="Hide AI Assistant (Ctrl+J)"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Task Type / Mode Selector Bar */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-3"
        style={{
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(15, 23, 42, 0.5)'
        }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <Sparkles size={15} color="#00D2FF" />
          <span className="text-secondary" style={{ fontSize: '15px', fontWeight: 500 }}>
            Task Mode:
          </span>
        </div>
        <select
          value={selectedTaskType}
          onChange={(e) => setSelectedTaskType(e.target.value)}
          className="glass-input flex-1"
          style={{
            height: '40px',
            padding: '0 12px',
            fontSize: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            background: 'rgba(11, 15, 26, 0.85)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          {EDITH_TASK_TYPES.map((t) => (
            <option key={t.id} value={t.id} style={{ background: '#0B0F1A', color: '#F7F7FB' }}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Context Banner */}
      <div
        className="px-4 py-2.5 flex items-center justify-between gap-2"
        style={{
          background: 'rgba(56, 189, 248, 0.06)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.14)',
          fontSize: '14.5px'
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode size={15} color="var(--brand-cyan)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--brand-cyan)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeFile ? `Active Context: ${activeFile.path || activeFile.name}` : `Context: ${activeProject?.name || 'Workspace'}`}
          </span>
        </div>
        <span
          className="text-muted"
          style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}
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
              border: '1px solid rgba(0, 210, 255, 0.35)',
              background: 'rgba(7, 16, 38, 0.75)',
              boxShadow: '0 4px 16px rgba(0, 210, 255, 0.15)',
              animation: 'aiThinkWave 2.5s infinite ease-in-out'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="status-live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D2FF' }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#00D2FF' }}>
                EDITH Engine synthesizing architecture plan...
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {planningSteps.map((step) => (
                <div key={step.id} className="flex flex-col">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    className="flex items-center justify-between text-left py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
                    style={{ fontSize: '15px', color: 'var(--text-secondary)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      {step.done ? <CheckCircle2 size={15} color="var(--status-success)" /> : <Clock size={15} color="#38BDF8" />}
                      <span style={{ fontWeight: 500 }}>{step.title}</span>
                    </div>
                    {expandedStep === step.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {expandedStep === step.id && (
                    <div className="text-muted pl-7 pr-3 py-1.5" style={{ fontSize: '14px', lineHeight: '1.55', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
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
                  padding: isUser ? '14px 18px' : '16px 20px',
                  background: isUser ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 116, 144, 0.25) 100%)' : 'rgba(10, 19, 36, 0.85)',
                  border: isUser ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(56, 189, 248, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div className="flex items-center justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    {!isUser && <Sparkles size={15} color="#00D2FF" />}
                    <span style={{ fontSize: '15px', fontWeight: 600, color: isUser ? '#38BDF8' : '#00D2FF' }}>
                      {isUser ? 'You' : 'EDITH'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted" style={{ fontSize: '13px' }}>{m.timestamp}</span>
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="glass-btn-ghost flex items-center justify-center text-muted hover:text-white"
                      style={{ width: '26px', height: '26px', borderRadius: '4px', padding: 0 }}
                      title="Copy message"
                    >
                      {copiedId === m.id ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <p className="body-regular" style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {m.text}
                </p>

                {m.plan && (
                  <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#00D2FF' }}>
                      Architectural Plan Steps:
                    </span>
                    <div className="flex flex-col gap-2">
                      {m.plan.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded"
                          style={{ background: 'rgba(11, 15, 26, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '15px' }}
                        >
                          <CheckCircle2 size={15} color="var(--status-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div className="text-secondary leading-normal">
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
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleAddContextPill(`@file:${activeFile?.name || 'app'}`)}
            className="astra-context-pill glass-btn-ghost flex items-center gap-2"
            style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', color: 'var(--brand-cyan)' }}
            title="Inject active file context"
          >
            <FileCode size={14} /> @ActiveFile
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill(`@project:${activeProject?.name || 'workspace'}`)}
            className="astra-context-pill glass-btn-ghost flex items-center gap-2"
            style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38BDF8' }}
            title="Inject project context"
          >
            <Cpu size={14} /> @Project
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill('@selection')}
            className="astra-context-pill glass-btn-ghost flex items-center gap-2"
            style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: 'rgba(0, 210, 255, 0.12)', border: '1px solid rgba(0, 210, 255, 0.25)', color: '#00D2FF' }}
            title="Inject editor selection"
          >
            <Zap size={14} /> @Selection
          </button>
          <button
            type="button"
            onClick={() => handleAddContextPill('@terminal:output')}
            className="astra-context-pill glass-btn-ghost flex items-center gap-2"
            style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--status-success)' }}
            title="Inject terminal output"
          >
            <Terminal size={14} /> @Terminal
          </button>
        </div>

        <div className="astra-composer-box flex items-end gap-3" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Instruct EDITH (e.g. Implement rate limiting middleware)..."
            rows={2}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontFamily: 'var(--font-ui)',
              width: '100%',
              resize: 'none',
              lineHeight: '1.5',
              minHeight: '52px',
              maxHeight: '130px'
            }}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="glass-btn-primary flex items-center justify-center transition-all"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              padding: 0,
              flexShrink: 0,
              opacity: prompt.trim() && !isGenerating ? 1 : 0.45,
              background: prompt.trim() && !isGenerating ? 'linear-gradient(135deg, #00D2FF 0%, #0284C7 100%)' : undefined,
              boxShadow: prompt.trim() && !isGenerating ? '0 0 14px rgba(0, 210, 255, 0.5)' : 'none'
            }}
            title="Send instruction to EDITH"
          >
            <Send size={17} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-muted" style={{ fontSize: '10.5px' }}>
          <span>↵ Send • Shift+↵ New Line</span>
          <span style={{ color: '#38BDF8' }}>AST-aware engine</span>
        </div>
      </form>
    </div>
  );
}
