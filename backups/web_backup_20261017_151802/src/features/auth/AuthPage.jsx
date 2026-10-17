import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const { login, register } = useAuth();
  const { navigate } = useNavigation();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const validateForm = () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return false;
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        setSuccessMessage('Logged in successfully. Redirecting...');
        setTimeout(() => navigate('home'), 500);
      } else {
        await register(email.trim(), password, name.trim());
        setSuccessMessage('Account created successfully. Welcome to BRAHMA!');
        setTimeout(() => navigate('home'), 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('developer@brahma-astra.local');
    setPassword('Password123!');
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login('developer@brahma-astra.local', 'Password123!');
      setSuccessMessage('Signed in with seeded developer account!');
      setTimeout(() => navigate('home'), 500);
    } catch (err) {
      setErrorMessage(err.message || 'Seeded login failed. Verify backend services are active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Cosmic Nebula Ambient Background Glows */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(246, 200, 122, 0.08) 40%, rgba(11, 15, 26, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Auth Container Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--surface-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), var(--shadow-glow-violet)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '12px' }}>
            <img
              src="/brand/brahma-mark.svg"
              alt="BRAHMA Sacred Mark"
              style={{ width: '56px', height: '56px', filter: 'drop-shadow(0 0 16px rgba(246, 200, 122, 0.4))' }}
            />
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--brand-gold)',
              margin: '0 0 4px 0'
            }}
          >
            BRAHMA
          </h1>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 500
            }}
          >
            Your Intelligence Core
          </p>
        </div>

        {/* Tab Switcher: Login / Sign Up */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            marginBottom: '24px'
          }}
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: mode === 'login' ? 'var(--brand-violet)' : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: mode === 'login' ? '0 2px 10px rgba(139, 92, 246, 0.4)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: mode === 'signup' ? 'var(--brand-violet)' : 'transparent',
              color: mode === 'signup' ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: mode === 'signup' ? '0 2px 10px rgba(139, 92, 246, 0.4)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success Feedback Banners */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--status-error)',
              color: 'var(--status-error)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}
            role="alert"
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid var(--status-success)',
              color: 'var(--status-success)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <Input
              label="Full Name"
              placeholder="e.g., Amlan Nanda"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            helperText={mode === 'signup' ? 'Minimum 8 characters' : undefined}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--text-secondary)', padding: '4px' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
          />

          {mode === 'signup' && (
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ color: 'var(--text-secondary)', padding: '4px' }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
          )}

          {/* Remember Me & Forgot Password Row (Login Mode) */}
          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--brand-violet)', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ color: 'var(--brand-gold)', fontSize: '12px', fontWeight: 500 }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gold"
            size="lg"
            icon={mode === 'login' ? ArrowRight : Sparkles}
            iconPosition="right"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '6px' }}
          >
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>

          {/* Developer Quick-Login Button */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(246, 200, 122, 0.08)',
                border: '1px dashed var(--brand-gold)',
                color: 'var(--brand-gold)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all var(--transition-fast)'
              }}
              title="Fills developer@brahma-astra.local / Password123!"
            >
              <KeyRound size={14} />
              <span>Fill Seeded Admin Credentials</span>
            </button>
          )}

          {/* Social Auth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
          </div>

          {/* Social Sign-in Providers (Clean Mock Placeholders with Tooltips) */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {['Google', 'Apple', 'Microsoft'].map(provider => (
              <button
                key={provider}
                type="button"
                onClick={() => setErrorMessage(`${provider} SSO integration is configured on production deployments.`)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(17, 24, 39, 0.7)',
                  border: '1px solid var(--border-default)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>{provider}</span>
              </button>
            ))}
          </div>

          {/* Mode Switch Footer */}
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  style={{ color: 'var(--brand-gold)', fontWeight: 600 }}
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  style={{ color: 'var(--brand-gold)', fontWeight: 600 }}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Forgot Password Information Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Password Recovery"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>
            In local development, passwords are managed via the seeded SQLite database (<code style={{ color: 'var(--brand-gold)' }}>services/api/dev.db</code>).
          </p>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Seeded Developer Account:</div>
            <div>Email: <code style={{ color: 'var(--brand-gold)' }}>developer@brahma-astra.local</code></div>
            <div>Password: <code style={{ color: 'var(--brand-gold)' }}>Password123!</code></div>
          </div>
          <p>
            Production email password recovery utilizes transactional mailers. To reset locally, use the "Fill Seeded Admin Credentials" shortcut.
          </p>
          <Button variant="primary" onClick={() => setShowForgotModal(false)} style={{ alignSelf: 'flex-end', marginTop: '8px' }}>
            Understood
          </Button>
        </div>
      </Modal>
    </div>
  );
}
