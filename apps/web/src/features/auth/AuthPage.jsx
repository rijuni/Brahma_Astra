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
  const demoAccessEnabled = import.meta.env.DEV;

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
      addToast('Welcome to FRIDAY demo mode.', 'success');
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
        minHeight: '100dvh',
        width: '100%',
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
      <div className="friday-auth-brand flex flex-col items-center text-center animate-entrance" style={{ marginBottom: '14px', zIndex: 10 }}>
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
          role="group"
          aria-label="Authentication options"
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
            aria-pressed={tab === 'login'}
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
            aria-pressed={tab === 'register'}
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

        <p className="auth-method-note">
          {tab === 'login' ? 'Sign in with your FRIDAY account credentials.' : 'Create your FRIDAY account with the details above.'}
        </p>

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
              {demoAccessEnabled && <>
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
                title="Sign in with the configured development demo account"
              >
                Demo Access
              </button>
              </>}
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
