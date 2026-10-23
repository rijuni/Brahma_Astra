import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function LoginForm({ onSubmit, isLoading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      <div className="flex items-center justify-between" style={{ marginBottom: '14px', marginTop: '2px' }}>
        <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <input type="checkbox" style={{ accentColor: 'var(--brand-gold)' }} />
          <span>Remember Me</span>
        </label>
        <span
          className="body-small text-muted"
          style={{ cursor: 'pointer', color: 'var(--brand-gold-light)', fontSize: '12px' }}
          onClick={() => alert('Password reset is not configured on the local backend.')}
        >
          Forgot Password?
        </span>
      </div>

      <Button
        type="submit"
        variant="gold"
        isLoading={isLoading}
        className="w-full"
        style={{ padding: '11px', fontSize: '14px' }}
      >
        Login
      </Button>
    </form>
  );
}
