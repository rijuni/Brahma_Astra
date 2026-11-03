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
  AlertCircle,
  Trash2
} from 'lucide-react';
import PromptComposer from './PromptComposer';
import CodeBlock from './CodeBlock';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import FridayArcReactor from '../../components/brand/FridayArcReactor';
import { conversationService } from '../../services/conversation-service';
import { aiService } from '../../services/ai-service';
import { useToast } from '../../components/feedback/Toast';

export default function ChatWorkspace({ initialPrompt, onResetInitialPrompt }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [convToDelete, setConvToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const messagesEndRef = useRef(null);
  const processedPromptRef = useRef(null);

  // Auto-send initial prompt if transferred from Dashboard
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !isLoadingList && processedPromptRef.current !== initialPrompt) {
      processedPromptRef.current = initialPrompt;
      handleSendMessage(initialPrompt.trim());
      if (onResetInitialPrompt) {
        onResetInitialPrompt();
      }
    }
  }, [initialPrompt, isLoadingList]);

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

  // Handle deleting a conversation
  const handleDeleteChat = async () => {
    if (!convToDelete) return;
    setIsDeleting(true);
    try {
      await conversationService.delete(convToDelete.id);
      const remaining = conversations.filter((c) => c.id !== convToDelete.id);
      setConversations(remaining);

      if (activeConversationId === convToDelete.id) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }

      addToast(`Chat "${convToDelete.title || 'Untitled'}" deleted`, 'info');
      setConvToDelete(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete chat', 'error');
    } finally {
      setIsDeleting(false);
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
        height: '100%',
        width: '100%',
        maxHeight: 'none',
        maxWidth: 'none',
        margin: 0,
        flex: 1
      }}
    >
      {/* Left Conversations Rail */}
      <div
        className="friday-workspace-panel friday-caliper-box flex flex-col"
        style={{
          width: '280px',
          padding: '18px 16px',
          flexShrink: 0
        }}
      >
        <Button
          variant="gold"
          onClick={handleNewChat}
          icon={Plus}
          className="w-full"
          style={{ marginBottom: '14px', fontWeight: 700, letterSpacing: '0.04em' }}
        >
          New Chat
        </Button>

        {/* Search Input */}
        <div className="friday-search-bar flex items-center gap-2" style={{ padding: '6px 12px', marginBottom: '14px' }}>
          <Search size={14} color="#F6C87A" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%' }}
          />
        </div>

        {/* Conversation List */}
        <div className="flex flex-col gap-1.5" style={{ flex: 1, overflowY: 'auto' }}>
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
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className="flex items-center justify-between w-full text-left group"
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: isActive ? '1px solid rgba(246, 200, 122, 0.5)' : '1px solid transparent',
                    background: isActive ? 'linear-gradient(90deg, rgba(246, 200, 122, 0.22) 0%, rgba(229, 169, 60, 0.08) 100%)' : 'transparent',
                    boxShadow: isActive ? '0 2px 10px rgba(246, 200, 122, 0.2)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden" style={{ flex: 1, minWidth: 0, paddingRight: '6px' }}>
                    <MessageSquare size={14} color={isActive ? '#FAD982' : 'rgba(255, 255, 255, 0.5)'} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)'
                      }}
                    >
                      {conv.title || 'Untitled Chat'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConvToDelete(conv);
                    }}
                    title="Delete chat"
                    aria-label={`Delete chat ${conv.title || 'Untitled'}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.45)',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread & Composer Area */}
      <div
        className="friday-workspace-panel friday-caliper-box flex flex-col flex-1"
        style={{
          padding: '20px 24px',
          overflow: 'hidden'
        }}
      >
        {/* Chat Thread Header */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(246, 200, 122, 0.18)',
            marginBottom: '16px'
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ flexShrink: 0 }}>
              <FridayArcReactor size={28} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#FFFFFF'
                }}
              >
                FRIDAY Neural Chat
              </span>
              <span className="body-small" style={{ marginLeft: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {conversations.find((c) => c.id === activeConversationId)?.title || 'Active Session'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeConversationId && (
              <button
                onClick={() => {
                  const current = conversations.find((c) => c.id === activeConversationId);
                  if (current) setConvToDelete(current);
                }}
                className="flex items-center gap-1.5"
                title="Delete this chat"
                aria-label="Delete this conversation"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                  e.currentTarget.style.color = '#ff6b6b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                <Trash2 size={12} color="#ff6b6b" />
                <span>Delete Chat</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="telemetry-beacon-online" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-gold-light)', letterSpacing: '0.04em' }}>
                NEURAL CORE ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Message Thread Stream */}
        <div className="flex flex-col gap-4 flex-1" style={{ overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
          {isLoadingMessages ? (
            <LoadingSpinner size={28} label="Loading messages..." />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Welcome to FRIDAY Chat"
              description="Ask complex research questions, analyze telemetry, build code, or draft architectural systems."
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
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      <FridayArcReactor size={32} />
                    </div>
                  )}

                  <div
                    className={isAssistant ? 'friday-chat-bubble-ai' : 'friday-chat-bubble-user'}
                    style={{
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderColor: msg.isError ? 'var(--status-error)' : undefined
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                      <span className="body-small" style={{ fontWeight: 700, letterSpacing: '0.04em', color: isAssistant ? '#FAD982' : '#FFFFFF' }}>
                        {isAssistant ? 'FRIDAY' : 'You'}
                      </span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="glass-btn-ghost"
                        style={{ padding: '2px', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.5)' }}
                        title="Copy message"
                      >
                        {isCopied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="body-regular" style={{ fontSize: '14px', color: '#FFFFFF' }}>
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
              <div style={{ flexShrink: 0 }}>
                <FridayArcReactor size={26} />
              </div>
              <div
                className="friday-chat-bubble-ai flex items-center gap-2"
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px'
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--brand-gold-light)', letterSpacing: '0.04em' }}>
                  FRIDAY Neural Engine synthesizing
                </span>
                <div className="flex items-center gap-1" style={{ marginLeft: '4px' }}>
                  <div className="telemetry-beacon-online" style={{ width: '6px', height: '6px' }} />
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
          initialValue={initialPrompt || ''}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!convToDelete}
        onClose={() => setConvToDelete(null)}
        title="Confirm Chat Deletion"
        maxWidth="440px"
      >
        <p className="body-regular text-muted" style={{ marginBottom: '20px', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#F6C87A' }}>"{convToDelete?.title || 'this chat'}"</strong>? All conversation messages and neural context in this thread will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConvToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeleteChat}
            isLoading={isDeleting}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              borderColor: '#ef4444',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
            }}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}
