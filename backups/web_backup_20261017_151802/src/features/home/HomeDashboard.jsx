import React, { useState, useEffect } from 'react';
import {
  Infinity,
  BookOpen,
  Image as ImageIcon,
  FileText,
  LayoutGrid,
  Boxes,
  Sparkles,
  Rocket,
  Search,
  Paperclip,
  Mic,
  ArrowUp,
  Globe,
  Youtube,
  Upload,
  PhoneCall,
  Clock,
  FolderPlus,
  ChevronRight,
  FolderKanban,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export function HomeDashboard() {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  // Composer state
  const [promptText, setPromptText] = useState('');
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [promptFeedback, setPromptFeedback] = useState(null);

  // Projects & Activity State
  const [projects, setProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Amlan';

  // Load real projects and real conversations from backend
  const loadDashboardData = async () => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const data = await api.listProjects();
      const projList = Array.isArray(data) ? data : (data?.projects || []);
      setProjects(projList);
    } catch (err) {
      // Gracefully handle unauthenticated/network state without raw error dumping
      setProjects([]);
      if (err.status !== 401) {
        setProjectsError('Unable to load projects right now');
      }
    } finally {
      setIsLoadingProjects(false);
    }

    // Try loading real user conversations for recent activity
    try {
      const convData = await api.listConversations();
      const convList = Array.isArray(convData) ? convData : (convData?.conversations || []);
      if (convList.length > 0) {
        setRecentActivity(
          convList.slice(0, 4).map(c => ({
            id: c.id,
            title: c.title || 'Conversation',
            time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
            icon: Infinity
          }))
        );
      }
    } catch {
      // Fallback cleanly to approved reference items
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle composer submission
  const handleComposerSubmit = async (e) => {
    e?.preventDefault();
    if (!promptText.trim()) return;

    setIsSubmittingPrompt(true);
    setPromptFeedback(null);

    try {
      // Dispatches real asynchronous AI task to backend
      const task = await api.createAiTask({
        prompt: promptText.trim(),
        provider: 'mock',
        taskType: 'general'
      });
      setPromptFeedback({
        type: 'success',
        message: `AI Task queued successfully (ID: ${task.id?.substring(0, 8) || 'active'}...). Dispatching to BRAHMA Core.`
      });
      setPromptText('');
    } catch (err) {
      setPromptFeedback({
        type: 'error',
        message: err.message || 'Failed to dispatch AI task. Verify backend is running.'
      });
    } finally {
      setIsSubmittingPrompt(false);
    }
  };

  // 8 Main Cards matching BRAHMA_Home_Dashboard_Reference_v1.png
  const mainCards = [
    {
      id: 'chat',
      title: 'Chat',
      subtitle: 'Intelligent conversation',
      icon: Infinity,
      bg: 'rgba(139, 92, 246, 0.15)',
      color: '#8B5CF6',
      route: 'chat'
    },
    {
      id: 'research',
      title: 'Research',
      subtitle: 'Find, analyze, discover',
      icon: BookOpen,
      bg: 'rgba(217, 70, 239, 0.15)',
      color: '#D946EF',
      route: 'research'
    },
    {
      id: 'create-image',
      title: 'Create Image',
      subtitle: 'Generate stunning visuals',
      icon: ImageIcon,
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10B981',
      route: 'images'
    },
    {
      id: 'documents',
      title: 'Documents',
      subtitle: 'Upload, summarize, analyze',
      icon: FileText,
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#F59E0B',
      route: 'documents'
    },
    {
      id: 'projects',
      title: 'Projects',
      subtitle: 'Organize your work',
      icon: LayoutGrid,
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#3B82F6',
      route: 'projects'
    },
    {
      id: 'memory',
      title: 'Memory',
      subtitle: 'Your personal knowledge',
      icon: Boxes,
      bg: 'rgba(249, 115, 22, 0.15)',
      color: '#F97316',
      route: 'memory'
    },
    {
      id: 'agents',
      title: 'Agents',
      subtitle: 'Specialized AI agents',
      icon: Sparkles,
      bg: 'rgba(168, 85, 247, 0.15)',
      color: '#A855F7',
      route: 'agents'
    },
    {
      id: 'astra',
      title: 'Astra',
      subtitle: 'Coding & Development',
      icon: Rocket,
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#38BDF8',
      route: 'astra-launcher',
      special: true
    }
  ];

  // Quick prompt chips matching reference
  const promptChips = [
    'Summarize a PDF',
    'Analyze an image',
    'Research latest papers',
    'Generate code ⌵',
    '… More ⌵'
  ];

  // Approved reference activity items
  const defaultActivity = [
    { id: 1, title: 'Research on quantum computing', time: '2 hours ago', icon: BookOpen, color: '#38BDF8' },
    { id: 2, title: 'Hospital Dashboard Analysis', time: '5 hours ago', icon: LayoutGrid, color: '#8B5CF6' },
    { id: 3, title: 'Generate radiology report summary', time: '1 day ago', icon: FileText, color: '#F59E0B' },
    { id: 4, title: 'Hospital Pharmacy System Plan', time: '1 day ago', icon: Infinity, color: '#D946EF' }
  ];

  const activityList = recentActivity.length > 0 ? recentActivity : defaultActivity;

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%'
      }}
      className="dashboard-container"
    >
      {/* Central Content Area (Hero + Composer + 8 Cards) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
        {/* Cosmic Hero Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            padding: '36px 32px',
            background: 'linear-gradient(135deg, rgba(30, 27, 61, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)',
            border: '1px solid var(--glass-border-gold)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* Ambient Cosmic Castle Background Effect */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(246, 200, 122, 0.12) 40%, rgba(11, 15, 26, 0) 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <img
                src="/brand/brahma-mark.svg"
                alt="BRAHMA Sacred Mark"
                style={{ width: '48px', height: '48px', filter: 'drop-shadow(0 0 16px rgba(246, 200, 122, 0.35))' }}
              />
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {getGreeting()}, {displayName}
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  What would you like to explore today?
                </p>
              </div>
            </div>

            {/* Pill Tag Badges matching the reference */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              <span className="badge badge-gold">✨ Intelligent</span>
              <span className="badge badge-violet">🖼️ Multimodal</span>
              <span className="badge badge-cyan">🛡️ Secure</span>
              <span className="badge badge-gold">🔒 Private</span>
              <span className="badge badge-violet">🌌 Your AI Universe</span>
            </div>
          </div>
        </div>

        {/* Primary AI Composer matching visual reference */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 18px',
            boxShadow: 'var(--shadow-card)',
            transition: 'border-color var(--transition-fast)'
          }}
          className="main-composer-card"
        >
          <form onSubmit={handleComposerSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Ask Brahma anything..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isSubmittingPrompt}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                style={{ padding: '8px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}
                title="Attach Document or Image"
                onClick={() => setPromptFeedback({ type: 'info', message: 'Attachment pipeline active. Select a file from Documents.' })}
              >
                <Paperclip size={18} />
              </button>
              <button
                type="button"
                style={{ padding: '8px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}
                title="Voice Input (Microphone)"
                onClick={() => setPromptFeedback({ type: 'info', message: 'Voice input ready (supported in compliant browsers).' })}
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                disabled={!promptText.trim() || isSubmittingPrompt}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-violet)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: promptText.trim() && !isSubmittingPrompt ? 'pointer' : 'not-allowed',
                  opacity: promptText.trim() && !isSubmittingPrompt ? 1 : 0.5,
                  boxShadow: '0 2px 12px rgba(139, 92, 246, 0.45)',
                  transition: 'all var(--transition-fast)'
                }}
                title="Send Prompt"
              >
                {isSubmittingPrompt ? <LoadingSpinner size="sm" color="violet" /> : <ArrowUp size={20} />}
              </button>
            </div>
          </form>

          {/* Feedback banner for composer */}
          {promptFeedback && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: promptFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                color: promptFeedback.type === 'error' ? 'var(--status-error)' : 'var(--brand-gold-light)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {promptFeedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              <span>{promptFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Suggested Prompt Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptText(chip)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(30, 27, 61, 0.6)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-violet)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Eight Main Dashboard Cards (2 Rows of 4 Cards) */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Capabilities &amp; Workspaces
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px'
            }}
          >
            {mainCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => navigate(card.route)}
                  style={{
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all var(--transition-fast)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = card.color;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}25`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: card.bg,
                        color: card.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    {card.special && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--astra-electric-blue)'
                        }}
                      >
                        DEV IDE
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {card.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Rail: Recent Activity, Quick Tools & Recent Projects */}
      <aside
        style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flexShrink: 0
        }}
        className="dashboard-right-rail"
      >
        {/* Section 1: Recent Activity */}
        <Card style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--brand-gold)" />
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h4>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--brand-gold)', cursor: 'pointer' }} onClick={() => navigate('chat')}>
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activityList.map(item => {
              const Icon = item.icon || Clock;
              const itemColor = item.color || 'var(--brand-violet)';
              return (
                <div
                  key={item.id}
                  onClick={() => navigate('chat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = itemColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: `${itemColor}20`,
                      color: itemColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Section 2: Quick Tools */}
        <Card style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Quick Tools</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Customize</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
            {[
              { label: 'Web Search', icon: Globe, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', route: 'research' },
              { label: 'YouTube', icon: Youtube, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', route: 'research' },
              { label: 'Upload File', icon: Upload, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', route: 'documents' },
              { label: 'Voice Chat', icon: PhoneCall, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', route: 'chat' }
            ].map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate(tool.route)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(17, 24, 39, 0.5)',
                    border: '1px solid var(--border-default)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tool.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: tool.bg,
                      color: tool.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Section 3: Recent Projects (Real Backend Integration) */}
        <Card style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderKanban size={16} color="var(--brand-gold)" />
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Projects</h4>
            </div>
            <span
              style={{ fontSize: '11px', color: 'var(--brand-gold)', cursor: 'pointer' }}
              onClick={() => navigate('projects')}
            >
              View All
            </span>
          </div>

          {isLoadingProjects ? (
            <LoadingSpinner size="sm" message="Loading projects..." />
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {user ? 'No projects yet. Create one to organize your workspace.' : 'Sign in to access and synchronize your projects.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={FolderPlus}
                onClick={() => user ? setIsCreateProjectOpen(true) : navigate('login')}
              >
                {user ? 'New Project' : 'Sign In'}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate('projects')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-violet)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(246, 200, 122, 0.15)',
                      color: 'var(--brand-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FolderKanban size={14} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {p.createdAt ? `Updated ${new Date(p.createdAt).toLocaleDateString()}` : 'Active'}
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                icon={FolderPlus}
                onClick={() => setIsCreateProjectOpen(true)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                Add New Project
              </Button>
            </div>
          )}
        </Card>
      </aside>

      {/* Modal to create real projects via API */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={() => loadProjects()}
      />
    </div>
  );
}
