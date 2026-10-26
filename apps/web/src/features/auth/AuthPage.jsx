import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/Toast';

export default function AuthPage({ onSuccess }) {
  const [tab, setTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { login, register, quickDemoLogin } = useAuth();
  const { addToast } = useToast();

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await login(email, password);
      addToast('Welcome back to FRIDAY!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email, password, name) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await register(email, password, name);
      addToast('FRIDAY account created successfully!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setAuthError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await quickDemoLogin();
      addToast('Welcome to FRIDAY, Amlan Nanda!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setAuthError(err.message || 'Demo initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="galaxy-canvas flex items-center justify-center"
      style={{
        minHeight: '100vh',
        width: '100vw',
        padding: '16px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Celestial Nebula Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '640px',
          height: '640px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(246, 200, 122, 0.2) 0%, rgba(212, 154, 62, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      <div
        className="glass-card-crystal animate-entrance"
        style={{
          maxWidth: '410px',
          width: '100%',
          padding: '28px 28px 22px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Brand Header: FRIDAY Arc Reactor & Wordmark */}
        <div className="flex flex-col items-center text-center" style={{ marginBottom: '18px' }}>
          <img
            src="/brand/friday-mark.svg"
            alt="FRIDAY"
            className="brahma-logo-gold"
            style={{ width: '56px', height: '56px', marginBottom: '8px' }}
          />
          <h1
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '25px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #FFE5A7 0%, #F6C87A 50%, #D49A3E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px'
            }}
          >
            FRIDAY
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: 'var(--brand-gold-light)',
              opacity: 0.85
            }}
          >
            YOUR PERSONAL AI PLATFORM
          </span>
        </div>

        {/* Segmented Tab Switcher (Screen 2: [ Login ]  [ Sign Up ]) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            marginBottom: '18px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.45)',
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setAuthError(null); }}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-pill)',
              padding: '8px 0',
              fontSize: '13px',
              fontWeight: tab === 'login' ? 700 : 500,
              color: tab === 'login' ? '#0B0F1A' : 'rgba(255, 255, 255, 0.7)',
              background: tab === 'login'
                ? 'linear-gradient(135deg, #FFF3D6 0%, #F6C87A 40%, #E2A646 80%, #C48226 100%)'
                : 'transparent',
              border: tab === 'login' ? '1px solid rgba(255, 255, 255, 0.65)' : '1px solid transparent',
              borderTop: tab === 'login' ? '1px solid #FFFFFF' : '1px solid transparent',
              boxShadow: tab === 'login' ? '0 3px 14px rgba(246, 200, 122, 0.45), inset 0 1px 2px #FFFFFF' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setAuthError(null); }}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-pill)',
              padding: '8px 0',
              fontSize: '13px',
              fontWeight: tab === 'register' ? 700 : 500,
              color: tab === 'register' ? '#0B0F1A' : 'rgba(255, 255, 255, 0.7)',
              background: tab === 'register'
                ? 'linear-gradient(135deg, #FFF3D6 0%, #F6C87A 40%, #E2A646 80%, #C48226 100%)'
                : 'transparent',
              border: tab === 'register' ? '1px solid rgba(255, 255, 255, 0.65)' : '1px solid transparent',
              borderTop: tab === 'register' ? '1px solid #FFFFFF' : '1px solid transparent',
              boxShadow: tab === 'register' ? '0 3px 14px rgba(246, 200, 122, 0.45), inset 0 1px 2px #FFFFFF' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        {tab === 'login' ? (
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={authError} />
        ) : (
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={authError} />
        )}

        {/* Divider: or continue with */}
        <div style={{ position: 'relative', margin: '18px 0 14px', textAlign: 'center' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.18) 50%, transparent 100%)'
            }}
          />
          <span
            style={{
              position: 'relative',
              background: 'rgba(16, 20, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 12px',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--text-muted)'
            }}
          >
            or continue with
          </span>
        </div>

        {/* Social Circular Icon Buttons (Google, Apple, Microsoft) */}
        <div className="flex gap-3 justify-center" style={{ marginBottom: '16px' }}>
          {/* Google Button */}
          <button
            type="button"
            onClick={() => addToast('Google OAuth is not configured on local server.', 'info')}
            className="glass-social-btn"
            style={{ width: '42px', height: '42px' }}
            title="Sign in with Google"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            onClick={() => addToast('Apple Sign-In is not configured on local server.', 'info')}
            className="glass-social-btn"
            style={{ width: '42px', height: '42px' }}
            title="Sign in with Apple"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.56.64-1.06 1.7-0.93 2.71 1.01.08 2.02-.46 2.64-1.21z" />
            </svg>
          </button>

          {/* Microsoft Button */}
          <button
            type="button"
            onClick={() => addToast('Microsoft Sign-In is not configured on local server.', 'info')}
            className="glass-social-btn"
            style={{ width: '42px', height: '42px' }}
            title="Sign in with Microsoft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#00A4EF" d="M1 13h10v10H1z" />
              <path fill="#7FBA00" d="M13 1h10v10H13z" />
              <path fill="#FFB900" d="M13 13h10v10H13z" />
            </svg>
          </button>
        </div>

        {/* Footer Navigation Link (Card Ends Cleanly Here) */}
        <div style={{ textAlign: 'center', margin: 0 }}>
          {tab === 'login' ? (
            <span className="body-small text-muted" style={{ fontSize: '12px' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setTab('register'); setAuthError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-cyan-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12px'
                }}
              >
                Create Account
              </button>
              <span style={{ margin: '0 8px', opacity: 0.35 }}>•</span>
              <button
                type="button"
                onClick={handleQuickDemo}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-gold)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12px'
                }}
                title="Instant Demo Login as Amlan Nanda"
              >
                Demo Access
              </button>
            </span>
          ) : (
            <span className="body-small text-muted" style={{ fontSize: '12px' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setTab('login'); setAuthError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-cyan-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12px'
                }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
