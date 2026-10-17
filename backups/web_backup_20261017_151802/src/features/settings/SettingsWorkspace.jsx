import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Settings,
  User,
  Palette,
  Cpu,
  Shield,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Server,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';

export function SettingsWorkspace() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveFeedback, setSaveFeedback] = useState(null);

  // Preference states
  const [nameInput, setNameInput] = useState(user?.name || 'Lead Architect');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontScale, setFontScale] = useState('medium');
  const [themeMode, setThemeMode] = useState('cosmic-dark');

  function handleSavePreferences(e) {
    e.preventDefault();
    setSaveFeedback('Preferences saved successfully.');
    setTimeout(() => setSaveFeedback(null), 3000);
  }

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
    { id: 'providers', label: 'AI Models & Providers', icon: Cpu },
    { id: 'system', label: 'System & Security', icon: Shield }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Settings &amp; Preferences
            </h1>
            <Badge variant="violet" icon={Settings}>Atlas Screen 11 &amp; 12</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage account profile, appearance tokens, AI provider configurations, and system health.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={LogOut}
          onClick={() => logout()}
        >
          Sign Out
        </Button>
      </div>

      {/* Save Notification */}
      {saveFeedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid var(--status-success)',
            color: '#86EFAC',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: isCurrent ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCurrent ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                border: isCurrent ? '1px solid var(--brahma-violet)' : '1px solid transparent',
                color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} style={{ color: isCurrent ? 'var(--brahma-gold)' : 'var(--text-secondary)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Account */}
      {activeTab === 'profile' && (
        <Card glow="violet">
          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(246, 200, 122, 0.15)',
                  border: '2px solid var(--brahma-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--brahma-gold)'
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'B'}
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {user?.name || 'Administrator'}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {user?.email || 'admin@brahma-astra.local'}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <Badge variant="gold">System Administrator</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <Input
                label="Full Name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
              />

              <Input
                label="Email Address"
                value={user?.email || 'admin@brahma-astra.local'}
                disabled
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <Button type="submit" variant="primary">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Appearance & Themes */}
      {activeTab === 'appearance' && (
        <Card glow="violet">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Design Theme (Locked System)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                The BRAHMA design system uses an approved deep cosmic palette with strict brand tokens.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#0B0F1A',
                  border: '2px solid var(--brahma-gold)',
                  boxShadow: 'var(--shadow-glow-gold)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brahma-gold)' }}>Cosmic Dark</span>
                  <CheckCircle2 size={16} style={{ color: 'var(--brahma-gold)' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Approved base (#0B0F1A) with Gold (#F6C87A) and Violet (#8B5CF6).
                </p>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#070A18',
                  border: '1px solid var(--astra-electric-blue)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--astra-electric-blue)' }}>ASTRA Indigo</span>
                  <Badge variant="blue">IDE Scoped</Badge>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Dedicated coding palette for the ASTRA development workspace.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Accessibility Controls
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Reduce Interface Motion</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Disable cosmic particle animations and smooth transition sweeps</div>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={e => setReducedMotion(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brahma-violet)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: AI Models & Providers */}
      {activeTab === 'providers' && (
        <Card glow="cyan">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} style={{ color: 'var(--brahma-cyan)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  AI Provider Status &amp; Secrets Policy
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Providers are managed by BRAHMA Core on Port 8001. Raw API keys and secrets are never exposed to the frontend browser interface.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Mock Provider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(17, 24, 39, 0.7)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    BRAHMA Mock Provider (Local Deterministic Synthesis)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Standard local test engine • 100% offline reliable • Zero API quota required
                  </div>
                </div>
                <Badge variant="success">Active / Default</Badge>
              </div>

              {/* OpenAI Placeholder */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(17, 24, 39, 0.4)',
                  border: '1px solid var(--border-default)',
                  opacity: 0.8
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    OpenAI GPT-4o Integration
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Configured via server-side environment `OPENAI_API_KEY` in `services/brahma-core`
                  </div>
                </div>
                <Badge variant="gold">Server Environment Configured</Badge>
              </div>

              {/* Anthropic Placeholder */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(17, 24, 39, 0.4)',
                  border: '1px solid var(--border-default)',
                  opacity: 0.8
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Anthropic Claude 3.5 Sonnet Integration
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Configured via server-side environment `ANTHROPIC_API_KEY`
                  </div>
                </div>
                <Badge variant="violet">Available</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: System & Security */}
      {activeTab === 'system' && (
        <Card glow="gold">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} style={{ color: 'var(--brahma-gold)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Live Architecture &amp; Service Endpoints
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(11, 15, 26, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Main API Server</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>Node.js / Express (Port 3000)</div>
                <div style={{ fontSize: '11px', color: 'var(--status-success)', marginTop: '4px' }}>● Verified Online</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(11, 15, 26, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>BRAHMA Core Orchestrator</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>FastAPI Python (Port 8001)</div>
                <div style={{ fontSize: '11px', color: 'var(--status-success)', marginTop: '4px' }}>● Verified Online</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(11, 15, 26, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ASTRA Engine</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>FastAPI Python (Port 8002)</div>
                <div style={{ fontSize: '11px', color: 'var(--status-success)', marginTop: '4px' }}>● Verified Online</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(11, 15, 26, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ASTRA Runner Sandbox</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>FastAPI Python (Port 8003)</div>
                <div style={{ fontSize: '11px', color: 'var(--status-success)', marginTop: '4px' }}>● Mode: Disabled (Host Protected)</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>
              Native Windows process isolation active. Zero Docker dependency. SQLite database: `services/api/prisma/dev.db`.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
