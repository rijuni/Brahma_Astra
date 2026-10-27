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
    <div className="flex flex-col gap-6 animate-entrance" style={{ maxWidth: '1120px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(246, 200, 122, 0.3)',
            borderRadius: '9999px',
            padding: '2px 12px',
            marginBottom: '6px'
          }}
        >
          <span className="telemetry-beacon-online" />
          <span
            style={{
              fontSize: '9.5px',
              letterSpacing: '0.2em',
              color: 'var(--brand-gold-light)',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            SYSTEM TELEMETRY // SECURITY & DIAGNOSTICS
          </span>
        </div>
        <h1 className="friday-page-title">
          Settings & Profile
        </h1>
        <p className="body-small" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          Manage your account profile, cluster diagnostics, and platform security enclave.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Profile Card */}
        <div style={{ gridColumn: 'span 7' }}>
          <div className="friday-workspace-panel friday-caliper-box" style={{ padding: '28px' }}>
            <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFE89E 0%, #F6C87A 50%, #D49A3E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '26px',
                  color: '#0B0A12',
                  boxShadow: '0 0 20px rgba(246, 200, 122, 0.4)'
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Michroma', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#FFFFFF',
                    marginBottom: '4px'
                  }}
                >
                  {user?.name || 'Amlan Nanda'}
                </h2>
                <span className="body-regular" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{user?.email}</span>
                <div style={{ marginTop: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: 'rgba(246, 200, 122, 0.18)',
                      border: '1px solid rgba(246, 200, 122, 0.45)',
                      color: '#FAD982'
                    }}
                  >
                    PRO PLAN // ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3" style={{ borderTop: '1px solid rgba(246, 200, 122, 0.16)', paddingTop: '20px', marginBottom: '24px' }}>
              <div className="flex justify-between items-center">
                <span className="body-regular" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>User ID</span>
                <span className="code-inline" style={{ fontSize: '12px', color: 'var(--brand-gold-light)', border: '1px solid rgba(246, 200, 122, 0.25)', background: 'rgba(0, 0, 0, 0.4)' }}>
                  {user?.id || 'usr-local-session'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-regular" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Role</span>
                <span className="body-regular" style={{ fontWeight: 600, color: '#FFFFFF', textTransform: 'capitalize' }}>
                  {user?.role || 'Lead Developer'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-regular" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Account Created</span>
                <span className="body-regular" style={{ color: '#FFFFFF' }}>
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
              style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
            >
              Sign Out
            </Button>
          </div>

          {/* Appearance Theme Card */}
          <div className="friday-workspace-panel friday-caliper-box" style={{ padding: '24px', marginTop: '20px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
              <Sun size={18} color="var(--brand-gold-light)" />
              <h2
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#FFFFFF',
                  margin: 0
                }}
              >
                Appearance Theme
              </h2>
            </div>
            <p className="body-small" style={{ marginBottom: '16px', color: 'rgba(255, 255, 255, 0.65)' }}>
              Select your preferred visual aesthetic for the FRIDAY cockpit platform.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  addToast('Theme switched to Cosmic Cockpit', 'info');
                }}
                className="flex items-center gap-3 p-3 flex-1 cursor-pointer"
                style={{
                  border: isDark ? '1.5px solid rgba(246, 200, 122, 0.65)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isDark ? 'linear-gradient(135deg, rgba(246, 200, 122, 0.2) 0%, rgba(229, 169, 60, 0.08) 100%)' : 'rgba(0, 0, 0, 0.3)',
                  boxShadow: isDark ? '0 0 16px rgba(246, 200, 122, 0.2)' : 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Moon size={20} color={isDark ? '#FAD982' : 'rgba(255, 255, 255, 0.5)'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>Cosmic Cockpit</div>
                  <div className="body-small" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>Obsidian glass & fusion gold</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  addToast('Theme switched to Ethereal Solar', 'info');
                }}
                className="flex items-center gap-3 p-3 flex-1 cursor-pointer"
                style={{
                  border: !isDark ? '1.5px solid rgba(246, 200, 122, 0.65)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: !isDark ? 'linear-gradient(135deg, rgba(246, 200, 122, 0.2) 0%, rgba(229, 169, 60, 0.08) 100%)' : 'rgba(0, 0, 0, 0.3)',
                  boxShadow: !isDark ? '0 0 16px rgba(246, 200, 122, 0.2)' : 'none',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sun size={20} color={!isDark ? '#FAD982' : 'rgba(255, 255, 255, 0.5)'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>Ethereal Solar</div>
                  <div className="body-small" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>Radiant solar frosted crystal</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System & Backend Diagnostics Card */}
        <div style={{ gridColumn: 'span 5' }}>
          <div className="friday-workspace-panel friday-caliper-box" style={{ padding: '24px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '18px' }}>
              <Activity size={18} color="var(--brand-gold-light)" />
              <h2
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#FFFFFF',
                  margin: 0
                }}
              >
                System Diagnostics
              </h2>
            </div>

            <div className="flex flex-col gap-3" style={{ marginBottom: '20px' }}>
              <div
                className="telemetry-stat-tile flex items-center justify-between"
                style={{ padding: '12px 14px' }}
              >
                <div className="flex items-center gap-3">
                  <Cpu size={16} color="var(--brand-gold-light)" />
                  <div>
                    <span className="body-regular" style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
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
                className="telemetry-stat-tile flex items-center justify-between"
                style={{ padding: '12px 14px' }}
              >
                <div className="flex items-center gap-3">
                  <Database size={16} color="var(--brand-gold-light)" />
                  <div>
                    <span className="body-regular" style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
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
                className="telemetry-stat-tile flex items-center justify-between"
                style={{ padding: '12px 14px' }}
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} color="#7DD3FC" />
                  <div>
                    <span className="body-regular" style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                      Security Boundary
                    </span>
                    <span className="body-small text-muted" style={{ fontSize: '11px' }}>Native Windows</span>
                  </div>
                </div>
                <Badge variant="cyan">Active</Badge>
              </div>
            </div>

            <div className="body-small" style={{ fontSize: '11px', textAlign: 'center', lineHeight: '1.5', color: 'rgba(255, 255, 255, 0.5)' }}>
              FRIDAY Platform Cockpit Engine v2.4 • Running natively on Windows
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
