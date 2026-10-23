import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Square } from 'lucide-react';

export default function PromptComposer({
  onSendMessage,
  onCancelGeneration,
  isGenerating,
  disabled,
  placeholder = 'Ask BRAHMA AI anything...',
  initialValue = ''
}) {
  const [content, setContent] = useState(initialValue || '');
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialValue) {
      setContent(initialValue);
    }
  }, [initialValue]);

  // Auto-expand textarea height up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [content]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!content.trim() || isGenerating || disabled) return;

    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments = files.map((file) => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Attachment Badges Pill Bar */}
      {attachments.length > 0 && (
        <div className="flex gap-2 flex-wrap" style={{ padding: '0 4px' }}>
          {attachments.map((att, idx) => (
            <span
              key={idx}
              className="badge badge-violet flex items-center gap-1 animate-entrance"
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              <Paperclip size={12} />
              <span>{att.name}</span>
              <span className="text-muted" style={{ fontSize: '10px' }}>({att.size})</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Floating Frosted Glass Composer Container */}
      <form
        onSubmit={handleSubmit}
        className="glass-card flex items-end gap-2"
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border-violet)',
          background: 'rgba(15, 23, 42, 0.65)',
          boxShadow: '0 8px 32px var(--brand-violet-glow)'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating || disabled}
          className="glass-btn-ghost"
          style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', marginBottom: '2px' }}
          title="Attach file"
        >
          <Paperclip size={18} color="var(--text-muted)" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating || disabled}
          className="body-regular"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            maxHeight: '160px',
            padding: '6px 4px'
          }}
        />

        {isGenerating ? (
          <button
            type="button"
            onClick={onCancelGeneration}
            className="glass-btn glass-btn-secondary flex items-center justify-center"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%', color: 'var(--status-warning)' }}
            title="Stop generation"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!content.trim() || disabled}
            className="glass-btn glass-btn-primary flex items-center justify-center"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
            title="Send prompt"
          >
            <Send size={16} />
          </button>
        )}
      </form>
      <div className="flex justify-between items-center" style={{ padding: '0 8px' }}>
        <span className="body-small text-muted" style={{ fontSize: '11px' }}>
          Enter sends, Shift + Enter for new lines
        </span>
        <span className="body-small text-muted" style={{ fontSize: '11px' }}>
          BRAHMA Core AI Orchestration
        </span>
      </div>
    </div>
  );
}
