import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Square } from 'lucide-react';

export default function PromptComposer({
  onSendMessage,
  onCancelGeneration,
  isGenerating,
  disabled,
  placeholder = 'Ask FRIDAY AI anything...',
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
              className="badge flex items-center gap-1 animate-entrance"
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                background: 'rgba(246, 200, 122, 0.15)',
                border: '1px solid rgba(246, 200, 122, 0.35)',
                color: '#FAD982'
              }}
            >
              <Paperclip size={12} />
              <span>{att.name}</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>({att.size})</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#FAD982' }}
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
        className="flex items-end gap-2"
        style={{
          padding: '8px 12px',
          borderRadius: '20px',
          border: '1.5px solid rgba(246, 200, 122, 0.35)',
          borderTop: '1.5px solid rgba(255, 255, 255, 0.4)',
          background: 'rgba(10, 9, 20, 0.7)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
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
          style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', marginBottom: '2px', color: 'rgba(255, 255, 255, 0.6)' }}
          title="Attach file"
        >
          <Paperclip size={18} />
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
            color: '#FFFFFF',
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
            className="flex items-center justify-center"
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: '50%',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#F87171',
              cursor: 'pointer'
            }}
            title="Stop generation"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!content.trim() || disabled}
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: '50%',
              border: 'none',
              background: content.trim() && !disabled
                ? 'linear-gradient(135deg, #FFE89E 0%, #F6C87A 50%, #D49A3E 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              color: content.trim() && !disabled ? '#0B0A12' : 'rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: content.trim() && !disabled ? 'pointer' : 'not-allowed',
              boxShadow: content.trim() && !disabled ? '0 0 14px rgba(246, 200, 122, 0.45)' : 'none',
              transition: 'all 0.22s ease'
            }}
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
        <span style={{ fontSize: '11px', color: 'var(--brand-gold-light)', fontWeight: 600 }}>
          FRIDAY Neural Synthesis Active
        </span>
      </div>
    </div>
  );
}
