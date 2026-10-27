import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ArrowRight } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function LoginForm({ onSubmit, isLoading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div
          className="glass-card animate-entrance"
          style={{
            padding: '10px 14px',
            marginBottom: '16px',
            borderColor: 'var(--status-error)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--status-error)',
            fontSize: '13px'
          }}
        >
          {error}
        </div>
      )}

      {showForgotNotice && (
        <div
          className="glass-card flex items-start justify-between gap-3 animate-entrance"
          style={{
            padding: '12px 14px',
            marginBottom: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border-gold)',
            background: 'rgba(246, 200, 122, 0.08)'
          }}
        >
          <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--brand-gold-light)', display: 'block', marginBottom: '2px' }}>
              Password Reset Notice
            </strong>
            Self-service password recovery is disabled in this environment (SMTP email service not configured). Please contact your administrator or use the demo credentials below.
          </div>
          <button
            type="button"
            onClick={() => setShowForgotNotice(false)}
            className="glass-btn-ghost"
            style={{ padding: '2px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
            title="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        icon={Mail}
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={formErrors.email}
        disabled={isLoading}
        autoComplete="email"
        wrapperMargin="8px"
        className="friday-auth-input"
        style={{ height: '38px', fontSize: '13px' }}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={formErrors.password}
        disabled={isLoading}
        autoComplete="current-password"
        wrapperMargin="8px"
        className="friday-auth-input"
        style={{ height: '38px', fontSize: '13px' }}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="flex items-center justify-between" style={{ marginBottom: '10px', marginTop: '2px' }}>
        <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <input type="checkbox" style={{ accentColor: 'var(--brand-gold)', borderRadius: '4px' }} />
          <span>Remember Me</span>
        </label>
        <button
          type="button"
          className="body-small text-muted"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--brand-gold-light)',
            fontSize: '12px'
          }}
          onClick={() => setShowForgotNotice(true)}
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="friday-auth-btn-gold w-full"
        style={{ height: '42px', fontSize: '14px', marginTop: '4px' }}
      >
        <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
        {!isLoading && <ArrowRight size={17} className="auth-btn-arrow" />}
      </button>
    </form>
  );
}
