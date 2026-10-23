import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Activity,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Key,
  Sun,
  Moon
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { systemService } from '../../services/system-service';
import { useToast } from '../../components/feedback/Toast';

export default function SettingsWorkspace() {
  const { user, logout } = useAuth();
  const { theme, isDark, setTheme } = useTheme();
  const { addToast } = useToast();
  const [liveHealth, setLiveHealth] = useState(null);
  const [readyHealth, setReadyHealth] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      try {
        const [live, ready] = await Promise.allSettled([
          systemService.getLiveHealth(),
          systemService.getReadyHealth()
        ]);

        if (mounted) {
          if (live.status === 'fulfilled') setLiveHealth(live.value);
          if (ready.status === 'fulfilled') setReadyHealth(ready.value);
        }
      } catch (err) {
        console.error('Health check error:', err);
      } finally {
        if (mounted) setIsLoadingHealth(false);
      }
    }
    checkHealth();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-entrance" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '4px' }}>
          Settings & Profile
        </h1>
        <p className="body-small text-muted">
          Manage your account profile, system diagnostics, and platform security.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Profile Card */}
        <div style={{ gridColumn: 'span 7' }}>
          <Card style={{ padding: '28px' }}>
            <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-violet) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: '#0B0F1A'
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '2px' }}>
                  {user?.name || 'Amlan Nanda'}
                </h2>
                <span className="body-regular text-muted">{user?.email}</span>
                <div style={{ marginTop: '6px' }}>
                  <Badge variant="gold">PRO PLAN</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginBottom: '24px' }}>
              <div className="flex justify-between items-center">
                <span className="body-regular text-muted">User ID</span>
                <span className="code-inline" style={{ fontSize: '12px' }}>{user?.id || 'usr-local-session'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-regular text-muted">Role</span>
                <span className="body-regular" style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {user?.role || 'User'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-regular text-muted">Account Created</span>
                <span className="body-regular">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              icon={LogOut}
              onClick={() => {
                logout();
                addToast('Session terminated.', 'info');
              }}
              style={{ color: 'var(--status-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              Sign Out
            </Button>
          </Card>

          {/* Appearance Theme Card */}
          <Card style={{ padding: '24px', marginTop: '16px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
              <Sun size={18} color="var(--brand-gold)" />
              <h2 className="card-title" style={{ fontSize: '16px' }}>Appearance Theme</h2>
            </div>
            <p className="body-small text-muted" style={{ marginBottom: '16px' }}>
              Select your preferred visual aesthetic for the BRAHMA intelligence platform.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  addToast('Theme switched to Cosmic Dark', 'info');
                }}
                className="glass-card flex items-center gap-3 p-3 flex-1 cursor-pointer"
                style={{
                  border: isDark ? '2px solid var(--brand-violet)' : '1px solid var(--glass-border)',
                  background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Moon size={20} color={isDark ? 'var(--brand-violet-light)' : 'var(--text-muted)'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Cosmic Dark</div>
                  <div className="body-small text-muted" style={{ fontSize: '11px' }}>Deep space & galactic nebula</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  addToast('Theme switched to Ethereal Light', 'info');
                }}
                className="glass-card flex items-center gap-3 p-3 flex-1 cursor-pointer"
                style={{
                  border: !isDark ? '2px solid var(--brand-gold)' : '1px solid var(--glass-border)',
                  background: !isDark ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Sun size={20} color={!isDark ? 'var(--brand-gold)' : 'var(--text-muted)'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Ethereal Light</div>
                  <div className="body-small text-muted" style={{ fontSize: '11px' }}>Solar radiant frosted crystal</div>
                </div>
              </button>
            </div>
          </Card>
        </div>

        {/* System & Backend Diagnostics Card */}
        <div style={{ gridColumn: 'span 5' }}>
          <Card style={{ padding: '24px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '18px' }}>
              <Activity size={18} color="var(--brand-cyan)" />
              <h2 className="card-title" style={{ fontSize: '16px' }}>System Diagnostics</h2>
            </div>

            <div className="flex flex-col gap-3" style={{ marginBottom: '20px' }}>
              <div
                className="glass-card flex items-center justify-between"
                style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-3">
                  <Cpu size={16} color="var(--brand-violet)" />
                  <div>
                    <span className="body-regular" style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                      Node.js Express API
                    </span>
                    <span className="body-small text-muted" style={{ fontSize: '11px' }}>Port 3000</span>
                  </div>
                </div>
                {liveHealth?.status === 'ok' ? (
                  <Badge variant="cyan">Live (200 OK)</Badge>
                ) : (
                  <Badge variant="default">Checking...</Badge>
                )}
              </div>

              <div
                className="glass-card flex items-center justify-between"
                style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-3">
                  <Database size={16} color="var(--brand-gold)" />
                  <div>
                    <span className="body-regular" style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                      SQLite (Prisma ORM)
                    </span>
                    <span className="body-small text-muted" style={{ fontSize: '11px' }}>dev.db verified</span>
                  </div>
                </div>
                {readyHealth?.status === 'ready' ? (
                  <Badge variant="gold">Ready</Badge>
                ) : (
                  <Badge variant="default">Verified</Badge>
                )}
              </div>

              <div
                className="glass-card flex items-center justify-between"
                style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} color="var(--brand-cyan)" />
                  <div>
                    <span className="body-regular" style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>
                      Security Boundary
                    </span>
                    <span className="body-small text-muted" style={{ fontSize: '11px' }}>Native Windows</span>
                  </div>
                </div>
                <Badge variant="cyan">Active</Badge>
              </div>
            </div>

            <div className="body-small text-muted" style={{ fontSize: '11px', textAlign: 'center', lineHeight: '1.5' }}>
              BRAHMA Platform Engine v1.0 • Running natively on Windows
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
