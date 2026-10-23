import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Copy,
  Check,
  Bot,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import PromptComposer from './PromptComposer';
import CodeBlock from './CodeBlock';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { conversationService } from '../../services/conversation-service';
import { aiService } from '../../services/ai-service';
import { useToast } from '../../components/feedback/Toast';

export default function ChatWorkspace({ initialPrompt }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const { addToast } = useToast();
  const messagesEndRef = useRef(null);

  // Load conversation list on mount
  useEffect(() => {
    let mounted = true;
    async function loadConversations() {
      try {
        const list = await conversationService.list();
        if (mounted && Array.isArray(list)) {
          setConversations(list);
          if (list.length > 0 && !activeConversationId) {
            setActiveConversationId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        if (mounted) setIsLoadingList(false);
      }
    }
    loadConversations();
    return () => { mounted = false; };
  }, []);

  // Load messages whenever activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) return;
    let mounted = true;
    setIsLoadingMessages(true);

    async function loadMessages() {
      try {
        const conv = await conversationService.get(activeConversationId);
        if (mounted && conv?.messages) {
          setMessages(conv.messages);
        }
      } catch (err) {
        console.error('Failed to load conversation details:', err);
      } finally {
        if (mounted) setIsLoadingMessages(false);
      }
    }
    loadMessages();
    return () => { mounted = false; };
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle creating a new conversation
  const handleNewChat = async () => {
    try {
      const newConv = await conversationService.create(`Chat ${conversations.length + 1}`);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      addToast('New conversation initialized', 'info');
    } catch (err) {
      addToast('Failed to create new chat', 'error');
    }
  };

  // Handle sending a message
  const handleSendMessage = async (text, attachments = []) => {
    let convId = activeConversationId;

    // Create a conversation if none exists
    if (!convId) {
      try {
        const created = await conversationService.create(text.slice(0, 30) || 'New Conversation');
        setConversations((prev) => [created, ...prev]);
        convId = created.id;
        setActiveConversationId(convId);
      } catch (err) {
        addToast('Failed to start conversation', 'error');
        return;
      }
    }

    // Append user message optimistically
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      await conversationService.addMessage(convId, text, 'user');
    } catch (err) {
      console.warn('Message persist notice:', err.message);
    }

    // Trigger AI orchestration task and poll
    setIsGenerating(true);
    try {
      const result = await aiService.executeAndPoll({
        prompt: text,
        conversationId: convId,
        onProgress: (task) => setActiveTaskId(task.id)
      });

      const rawText = result?.text ?? result?.response ?? result?.summary ?? 'No response generated.';
      const cleanText = typeof rawText === 'object' && rawText !== null
        ? (rawText.response || rawText.content || rawText.text || rawText.summary || JSON.stringify(rawText, null, 2))
        : String(rawText);

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: cleanText,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant message to conversation
      try {
        await conversationService.addMessage(convId, cleanText, 'assistant');
      } catch (err) {
        console.warn('AI message persist notice:', err.message);
      }
    } catch (err) {
      addToast(err.message || 'AI generation failed', 'error');
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'AI request failed'}. Please check backend connection.`,
        createdAt: new Date().toISOString(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setActiveTaskId(null);
    }
  };

  const handleCancelGeneration = async () => {
    if (activeTaskId) {
      try {
        await aiService.cancelTask(activeTaskId);
        addToast('AI generation cancelled', 'info');
      } catch (err) {
        console.error('Failed to cancel task:', err);
      }
    }
    setIsGenerating(false);
    setActiveTaskId(null);
  };

  const handleCopyMessage = async (msgId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Helper to parse text with embedded code blocks
  const renderMessageContent = (content) => {
    let text = content;
    if (typeof content === 'object' && content !== null) {
      text = content.response || content.content || content.text || content.summary || JSON.stringify(content, null, 2);
    } else if (typeof content !== 'string') {
      text = String(content ?? '');
    }

    const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2].trim()
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    if (parts.length === 0) {
      return <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{text}</p>;
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return <CodeBlock key={index} code={part.code} language={part.language} />;
      }
      return (
        <p key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: '4px 0' }}>
          {part.content}
        </p>
      );
    });
  };

  const filteredConversations = conversations.filter((c) =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex gap-4 animate-entrance"
      style={{
        height: 'calc(100vh - var(--header-height) - 48px)',
        maxHeight: '880px',
        maxWidth: '1380px',
        margin: '0 auto'
      }}
    >
      {/* Left Conversations Rail */}
      <div
        className="glass-card flex flex-col"
        style={{
          width: '280px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          flexShrink: 0
        }}
      >
        <Button
          variant="primary"
          onClick={handleNewChat}
          icon={Plus}
          className="w-full"
          style={{ marginBottom: '14px' }}
        >
          New Chat
        </Button>

        {/* Search Input */}
        <div className="glass-input flex items-center gap-2" style={{ padding: '6px 10px', marginBottom: '14px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }}
          />
        </div>

        {/* Conversation List */}
        <div className="flex flex-col gap-1" style={{ flex: 1, overflowY: 'auto' }}>
          {isLoadingList ? (
            <LoadingSpinner size={20} label="" />
          ) : filteredConversations.length === 0 ? (
            <p className="body-small text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>
              No conversations found.
            </p>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`glass-btn ${isActive ? 'glass-btn-secondary' : 'glass-btn-ghost'} flex items-center gap-2 w-full text-left`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid var(--glass-border-violet)' : '1px solid transparent',
                    background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    boxShadow: isActive ? '0 2px 8px var(--brand-violet-glow)' : 'none',
                    justifyContent: 'flex-start'
                  }}
                >
                  <MessageSquare size={14} color={isActive ? 'var(--brand-gold)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                  <span
                    className="body-regular"
                    style={{
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {conv.title || 'Untitled Chat'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread & Composer Area */}
      <div
        className="glass-card flex flex-col flex-1"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          overflow: 'hidden'
        }}
      >
        {/* Chat Thread Header */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingBottom: '14px',
            borderBottom: '1px solid var(--glass-border)',
            marginBottom: '16px'
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/brand/brahma-mark.svg"
              alt="BRAHMA"
              className="brahma-logo-gold"
              style={{ width: '24px', height: '24px' }}
            />
            <div>
              <span className="card-title" style={{ fontSize: '15px' }}>BRAHMA Intelligence Chat</span>
              <span className="body-small text-muted" style={{ marginLeft: '8px' }}>
                {conversations.find((c) => c.id === activeConversationId)?.title || 'Active Session'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-live-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
            <span className="body-small text-muted" style={{ fontSize: '11px' }}>Brahma Core Live</span>
          </div>
        </div>

        {/* Message Thread Stream */}
        <div className="flex flex-col gap-4 flex-1" style={{ overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
          {isLoadingMessages ? (
            <LoadingSpinner size={28} label="Loading messages..." />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Welcome to BRAHMA Chat"
              description="Ask complex research questions, analyze systems, write code, or draft documents."
            />
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const isCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 animate-entrance ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(246, 200, 122, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        border: '1px solid var(--glass-border-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <img src="/brand/brahma-mark.svg" alt="" style={{ width: '18px', height: '18px' }} />
                    </div>
                  )}

                  <div
                    className="glass-card"
                    style={{
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      background: isAssistant
                        ? 'rgba(30, 27, 61, 0.65)'
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%)',
                      borderColor: isAssistant
                        ? (msg.isError ? 'var(--status-error)' : 'var(--glass-border-violet)')
                        : 'var(--brand-violet)',
                      boxShadow: isAssistant
                        ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                        : '0 4px 20px var(--brand-violet-glow)'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                      <span className="body-small" style={{ fontWeight: 600, color: isAssistant ? 'var(--brand-gold)' : 'var(--text-primary)' }}>
                        {isAssistant ? 'BRAHMA' : 'You'}
                      </span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="glass-btn-ghost"
                        style={{ padding: '2px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Copy message"
                      >
                        {isCopied ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="body-regular" style={{ color: 'var(--text-primary)' }}>
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* AI Thinking Waveform Indicator */}
          {isGenerating && (
            <div className="flex gap-3 items-center animate-entrance" style={{ padding: '8px 0' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid var(--glass-border-violet)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={16} color="var(--brand-gold)" />
              </div>
              <div
                className="glass-card flex items-center gap-2"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--glass-border-violet)'
                }}
              >
                <span className="body-small text-violet" style={{ fontWeight: 500 }}>
                  Brahma Core is thinking
                </span>
                <div className="flex items-center gap-1" style={{ marginLeft: '6px' }}>
                  <div className="ai-wave-dot" />
                  <div className="ai-wave-dot" />
                  <div className="ai-wave-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Composer Dock */}
        <PromptComposer
          onSendMessage={handleSendMessage}
          onCancelGeneration={handleCancelGeneration}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}
