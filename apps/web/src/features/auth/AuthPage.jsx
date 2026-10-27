import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import FridayArcReactor from '../../components/brand/FridayArcReactor';
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
      className="friday-auth-canvas flex flex-col items-center justify-center relative"
      style={{
        minHeight: '100vh',
        width: '100vw',
        padding: '20px 16px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Top-Right HUD Environmental Motto */}
      <div
        className="hidden-mobile"
        style={{
          position: 'absolute',
          top: '28px',
          right: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.24em',
            color: 'rgba(255, 255, 255, 0.78)',
            textTransform: 'uppercase',
            fontWeight: 600,
            textShadow: '0 0 10px rgba(0, 0, 0, 0.9)'
          }}
        >
          THINK · EXPLORE · CREATE · EVOLVE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(246, 200, 122, 0.6) 100%)' }} />
          <span style={{ color: 'var(--brand-gold-light)', fontSize: '10px' }}>◆</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(246, 200, 122, 0.6) 0%, transparent 100%)' }} />
        </div>
      </div>

      {/* Bottom-Left Bulkhead Pillars */}
      <div
        className="hidden-mobile"
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 10,
          pointerEvents: 'none',
          fontSize: '10.5px',
          letterSpacing: '0.24em',
          color: 'rgba(246, 200, 122, 0.7)',
          fontWeight: 600,
          textTransform: 'uppercase',
          lineHeight: '1.6',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)'
        }}
      >
        <span>INTELLIGENCE</span>
        <span>PRODUCTIVITY</span>
        <span>CREATIVITY</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>WITHOUT LIMITS</span>
      </div>

      {/* Brand Header: Placed Outside & Above the Card */}
      <div className="flex flex-col items-center text-center animate-entrance" style={{ marginBottom: '14px', zIndex: 10 }}>
        {/* Authentic Arc Reactor Emblem (Internal Precision Animations) */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: '92px', height: '92px', marginBottom: '8px' }}
        >
          {/* Deep Space Backdrop Mask (Clears any background image artifacts behind the emblem) */}
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(7, 9, 19, 0.96) 0%, rgba(7, 9, 19, 0.85) 45%, transparent 75%)',
              filter: 'blur(8px)',
              pointerEvents: 'none'
            }}
          />

          {/* Ambient Gold Core Flare */}
          <div
            style={{
              position: 'absolute',
              inset: '6px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 215, 130, 0.35) 0%, rgba(229, 169, 60, 0.14) 48%, transparent 72%)',
              filter: 'blur(10px)',
              pointerEvents: 'none'
            }}
          />

          {/* Dedicated Arc Reactor Vector (88px) */}
          <FridayArcReactor size={88} />
        </div>

        <h1
          style={{
            fontFamily: "'Michroma', 'Syncopate', sans-serif",
            fontSize: '34px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF3D6 24%, #F6C87A 58%, #D49A3E 82%, #9B6717 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px',
            filter: 'drop-shadow(0 0 20px rgba(246, 200, 122, 0.55)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.95))'
          }}
        >
          FRIDAY
        </h1>
        <span
          style={{
            fontFamily: "'Michroma', 'Syncopate', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--brand-gold-light)',
            opacity: 0.95,
            textShadow: '0 0 14px rgba(246, 200, 122, 0.6), 0 2px 8px rgba(0, 0, 0, 0.9)'
          }}
        >
          YOUR PERSONAL AI PLATFORM
        </span>
      </div>

      {/* Center Auth Pod Container */}
      <div
        className="friday-auth-pod animate-entrance"
        style={{
          maxWidth: '430px',
          width: '100%',
          padding: tab === 'register' ? '20px 28px 18px' : '24px 28px 20px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Segmented Tab Switcher: [ Login ] [ Sign Up ] */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '9999px',
            padding: '3px',
            marginBottom: '14px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setAuthError(null); }}
            style={{
              flex: 1,
              borderRadius: '9999px',
              padding: '8px 0',
              fontSize: '13px',
              fontWeight: tab === 'login' ? 700 : 500,
              color: tab === 'login' ? '#120E05' : 'rgba(255, 255, 255, 0.7)',
              background: tab === 'login'
                ? 'linear-gradient(135deg, #FAD982 0%, #E5A93C 100%)'
                : 'transparent',
              border: 'none',
              boxShadow: tab === 'login' ? '0 2px 12px rgba(229, 169, 60, 0.45)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setAuthError(null); }}
            style={{
              flex: 1,
              borderRadius: '9999px',
              padding: '8px 0',
              fontSize: '13px',
              fontWeight: tab === 'register' ? 700 : 500,
              color: tab === 'register' ? '#120E05' : 'rgba(255, 255, 255, 0.7)',
              background: tab === 'register'
                ? 'linear-gradient(135deg, #FAD982 0%, #E5A93C 100%)'
                : 'transparent',
              border: 'none',
              boxShadow: tab === 'register' ? '0 2px 12px rgba(229, 169, 60, 0.45)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
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
        <div style={{ position: 'relative', margin: '12px 0 10px', textAlign: 'center' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.16) 30%, rgba(255, 255, 255, 0.16) 70%, transparent 100%)'
            }}
          />
          <span
            style={{
              position: 'relative',
              background: 'rgba(16, 12, 24, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '1px 12px',
              fontSize: '10.5px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'rgba(255, 255, 255, 0.55)'
            }}
          >
            or continue with
          </span>
        </div>

        {/* Social Circular Icon Buttons (Google, Apple, Microsoft) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '12px'
          }}
        >
          {/* Google Button */}
          <button
            type="button"
            onClick={() => addToast('Google OAuth is not configured on local server.', 'info')}
            className="friday-social-icon-btn"
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
            className="friday-social-icon-btn"
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
            className="friday-social-icon-btn"
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

        {/* Footer Navigation Link */}
        <div style={{ textAlign: 'center', margin: 0 }}>
          {tab === 'login' ? (
            <span className="body-small" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setTab('register'); setAuthError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FAD982',
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
                  color: 'var(--brand-gold-light)',
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
            <span className="body-small" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setTab('login'); setAuthError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FAD982',
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
