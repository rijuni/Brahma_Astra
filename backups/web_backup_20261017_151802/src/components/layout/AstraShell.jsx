import React from 'react';
import {
  Code,
  Terminal,
  Play,
  CheckCircle,
  FolderPlus,
  MessageSquare,
  UploadCloud,
  Settings,
  ArrowLeft,
  ShieldAlert,
  ChevronRight,
  LayoutGrid,
  FolderKanban,
  Database,
  Blocks,
  FlaskConical
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export function AstraShell({ children }) {
  const { navigate } = useNavigation();

  return (
    <div
      data-product="astra"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--astra-bg)',
        color: 'var(--astra-text)',
        fontFamily: 'var(--font-ui)',
        overflow: 'hidden'
      }}
    >
      {/* ASTRA Slim Left Tool Rail */}
      <aside
        style={{
          width: '56px',
          backgroundColor: 'var(--astra-surface)',
          borderRight: '1px solid var(--astra-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '16px',
          zIndex: 100,
          flexShrink: 0
        }}
      >
        {/* ASTRA Emblem */}
        <div
          onClick={() => navigate('astra/workspace')}
          style={{
            cursor: 'pointer',
            padding: '4px'
          }}
          title="ASTRA Workspace Home"
        >
          <img
            src="/brand/astra-mark.svg"
            alt="ASTRA Emblem"
            style={{ width: '32px', height: '32px' }}
          />
        </div>

        <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--astra-border)' }} />

        {/* Rail Tools Matching Approved Concept Board */}
        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--brand-violet)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'
          }}
          title="New Project"
          aria-label="New Project"
        >
          <FolderPlus size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-electric-blue)',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Workspace Overview"
          aria-label="Workspace"
        >
          <LayoutGrid size={18} />
        </button>

        <button
          onClick={() => navigate('chat')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="AI Chat"
          aria-label="AI Chat"
        >
          <MessageSquare size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="File Explorer"
          aria-label="File Explorer"
        >
          <FolderKanban size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-electric-blue)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Code Editor"
          aria-label="Code Editor"
        >
          <Code size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Terminal & Output"
          aria-label="Terminal"
        >
          <Terminal size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Run & Debug"
          aria-label="Run & Debug"
        >
          <Play size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Testing Suite"
          aria-label="Testing Suite"
        >
          <FlaskConical size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Deployment"
          aria-label="Deployment"
        >
          <UploadCloud size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Database"
          aria-label="Database"
        >
          <Database size={18} />
        </button>

        <button
          onClick={() => navigate('astra/workspace')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Extensions"
          aria-label="Extensions"
        >
          <Blocks size={18} />
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Return to BRAHMA Button */}
        <button
          onClick={() => navigate('home')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--brand-gold)',
            backgroundColor: 'rgba(246, 200, 122, 0.1)',
            border: '1px solid rgba(246, 200, 122, 0.25)',
            cursor: 'pointer'
          }}
          title="Return to BRAHMA Dashboard"
          aria-label="Return to BRAHMA"
        >
          <ArrowLeft size={18} />
        </button>

        <button
          onClick={() => navigate('settings')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--astra-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </aside>

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        {/* Top Context Header */}
        <header
          style={{
            height: '48px',
            backgroundColor: 'var(--astra-surface)',
            borderBottom: '1px solid var(--astra-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            flexShrink: 0
          }}
        >
          {/* Breadcrumb / Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.06em',
                color: 'var(--astra-electric-blue)'
              }}
            >
              ASTRA
            </span>
            <span style={{ fontSize: '11px', color: 'var(--astra-muted)', letterSpacing: '0.04em' }}>
              CODE · CREATE · DEPLOY
            </span>
            <ChevronRight size={14} color="var(--astra-muted)" />
            <span
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: 'var(--astra-electric-blue)'
              }}
            >
              Default Project
            </span>
          </div>

          {/* Security Status Boundary Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '11px',
                color: 'var(--status-warning)'
              }}
              title="Native Windows Host: Arbitrary execution is disabled without verified hardware sandbox."
            >
              <ShieldAlert size={13} />
              <span>Execution: Disabled (Sandbox Prerequisite)</span>
            </div>

            <button
              onClick={() => navigate('home')}
              style={{
                fontSize: '12px',
                color: 'var(--brand-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(246, 200, 122, 0.08)'
              }}
            >
              <span>BRAHMA Home</span>
            </button>
          </div>
        </header>

        {/* Workspace Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
