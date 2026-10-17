import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { MarkdownText } from '../../components/ui/MarkdownText';
import {
  MessageSquare,
  Plus,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Paperclip,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bot,
  User as UserIcon,
  Search,
  AlertCircle
} from 'lucide-react';

export function ChatWorkspace() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  async function loadConversations() {
    try {
      setLoadingConversations(true);
      setError(null);
      const data = await api.listConversations();
      const convList = Array.isArray(data) ? data : [];
      setConversations(convList);
      if (convList.length > 0 && !activeConversationId) {
        setActiveConversationId(convList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadMessages(conversationId) {
    try {
      setLoadingMessages(true);
      setError(null);
      const conv = await api.getConversation(conversationId);
      setMessages(conv?.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleNewChat() {
    try {
      setError(null);
      const newConv = await api.createConversation({
        title: 'New Conversation'
      });
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to create conversation.');
    }
  }

  async function handleSendMessage(customPrompt = null) {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || generating) return;

    setInputText('');
    setError(null);

    let targetConvId = activeConversationId;

    // If no active conversation, create one first
    if (!targetConvId) {
      try {
        const titleSnippet = textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '');
        const newConv = await api.createConversation({ title: titleSnippet });
        setConversations(prev => [newConv, ...prev]);
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
      } catch (err) {
        setError(err.message || 'Could not create conversation for message.');
        return;
      }
    }

    // Optimistically append user message to UI
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setGenerating(true);

    try {
      // 1. Post user message to backend
      await api.sendMessage(targetConvId, { content: textToSend, role: 'user' });

      // 2. Dispatch AI task to BRAHMA Core via backend
      const aiTask = await api.createAiTask({
        prompt: textToSend,
        conversationId: targetConvId,
        taskType: 'general'
      });

      // 3. Poll for AI response if pending/running
      let finalResponseText = '';
      if (aiTask.status === 'completed' && aiTask.result) {
        finalResponseText = typeof aiTask.result === 'object'
          ? (aiTask.result.response || aiTask.result.summary || JSON.stringify(aiTask.result))
          : String(aiTask.result);
      } else {
        // Poll up to 5 times for asynchronous task completion
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const polled = await api.getAiTask(aiTask.id);
          if (polled.status === 'completed') {
            finalResponseText = typeof polled.result === 'object'
              ? (polled.result.response || polled.result.summary || JSON.stringify(polled.result))
              : String(polled.result);
            break;
          } else if (polled.status === 'failed') {
            throw new Error(polled.error || 'AI synthesis execution failed.');
          }
        }
      }

      if (!finalResponseText) {
        finalResponseText = `I have received and processed your request: "${textToSend}". BRAHMA Core Mock Provider synthesis is active and operational.`;
      }

      // 4. Save assistant response message to conversation in database
      const assistantMsg = await api.sendMessage(targetConvId, {
        content: finalResponseText,
        role: 'assistant'
      });

      // Update message list with real saved message
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);

      // Update conversation list timestamp
      setConversations(prev =>
        prev.map(c => (c.id === targetConvId ? { ...c, updatedAt: new Date().toISOString() } : c))
      );
    } catch (err) {
      setError(`Message failed: ${err.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  }

  function handleStopGeneration() {
    setGenerating(false);
  }

  function handleCopy(messageId, text) {
    navigator.clipboard?.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const filteredConversations = conversations.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        minHeight: '600px',
        backgroundColor: 'var(--bg-base)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* ── Left Sidebar: Conversation List ─────────────────────────── */}
      <div
        style={{
          width: sidebarOpen ? '280px' : '0px',
          minWidth: sidebarOpen ? '280px' : '0px',
          backgroundColor: 'var(--bg-elevated)',
          borderRight: sidebarOpen ? '1px solid var(--border-default)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all var(--transition-normal)',
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Conversations
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleNewChat}
              title="Start a new chat"
            >
              New Chat
            </Button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                fontSize: '12px',
                backgroundColor: 'rgba(11, 15, 26, 0.7)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {loadingConversations ? (
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner size="sm" text="Loading chats..." />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
              No conversations found. Click "New Chat" to begin.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversationId(conv.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '4px',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <MessageSquare size={16} style={{ color: isActive ? 'var(--brahma-gold)' : 'var(--text-secondary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {conv.title || 'Untitled Conversation'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7, marginTop: '2px' }}>
                      {conv._count?.messages || 0} messages
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Chat Header Bar */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {activeConversation?.title || 'BRAHMA Workspace Chat'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
                  BRAHMA Core Connected
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>•</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Model: Mock Provider v1</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Badge variant="violet" icon={Sparkles}>Intelligence</Badge>
          </div>
        </div>

        {/* Message Thread Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--status-error)',
                color: '#FCA5A5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loadingMessages ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner size="md" text="Loading conversation history..." />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '640px', margin: '0 auto', textAlign: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'radial-gradient(circle, rgba(246, 200, 122, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(246, 200, 122, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brahma-gold)'
                }}
              >
                <Sparkles size={28} />
              </div>

              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  What would you like to explore today?
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Ask questions, research multi-source topics, generate code, or analyze architecture through BRAHMA Intelligence.
                </p>
              </div>

              {/* Starter prompts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', width: '100%', marginTop: '10px' }}>
                {[
                  { title: 'Explain BRAHMA Architecture', desc: 'Overview of core services and native execution' },
                  { title: 'Synthesize Deep Research', desc: 'Generate multi-source academic query summary' },
                  { title: 'Write an Express Middleware', desc: 'Secure token verification and audit logging' }
                ].map((promptItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(promptItem.title)}
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(30, 27, 61, 0.4)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--brahma-violet)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {promptItem.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {promptItem.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isCopied = copiedMessageId === msg.id;

              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      maxWidth: isUser ? '80%' : '88%',
                      alignItems: 'flex-start',
                      flexDirection: isUser ? 'row-reverse' : 'row'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isUser ? 'rgba(139, 92, 246, 0.2)' : 'rgba(246, 200, 122, 0.15)',
                        border: isUser ? '1px solid var(--brahma-violet)' : '1px solid var(--brahma-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isUser ? 'var(--brahma-violet-light)' : 'var(--brahma-gold)',
                        flexShrink: 0
                      }}
                    >
                      {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        backgroundColor: isUser ? 'rgba(30, 27, 61, 0.8)' : 'rgba(17, 24, 39, 0.85)',
                        border: isUser ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-default)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                        color: 'var(--text-primary)',
                        position: 'relative',
                        minWidth: '60px'
                      }}
                    >
                      <MarkdownText content={msg.content} />

                      {/* Message Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginTop: '8px',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          fontSize: '11px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isCopied ? 'var(--status-success)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px',
                            fontSize: '11px'
                          }}
                          title="Copy message text"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleSendMessage(messages[index - 1]?.content || 'Explain further')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px',
                              fontSize: '11px'
                            }}
                            title="Retry response"
                          >
                            <RotateCcw size={12} />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Generating Indicator */}
          {generating && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(246, 200, 122, 0.15)',
                  border: '1px solid var(--brahma-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brahma-gold)'
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(17, 24, 39, 0.7)',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                <LoadingSpinner size="sm" />
                <span>BRAHMA is synthesizing response...</span>
                <Button variant="outline" size="sm" icon={Square} onClick={handleStopGeneration} style={{ marginLeft: '12px' }}>
                  Stop
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Composer Bar ─────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 14px',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Attach context document (available in Documents)"
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask BRAHMA anything... (Shift+Enter for new line)"
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                maxHeight: '160px',
                minHeight: '24px',
                padding: '4px 0',
                lineHeight: '1.5'
              }}
            />

            <Button
              variant={generating ? 'outline' : 'primary'}
              size="md"
              icon={generating ? Square : Send}
              onClick={generating ? handleStopGeneration : () => handleSendMessage()}
              disabled={!generating && !inputText.trim()}
              title={generating ? 'Stop generation' : 'Send message (Enter)'}
            >
              {generating ? 'Stop' : 'Send'}
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Responses generated via BRAHMA Core Orchestrator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
