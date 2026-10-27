import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function RegisterForm({ onSubmit, isLoading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(email, password, name);
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
        label="Full Name"
        type="text"
        icon={User}
        placeholder="Amlan Nanda"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={formErrors.name}
        disabled={isLoading}
        wrapperMargin="7px"
        className="friday-auth-input"
        style={{ height: '38px', fontSize: '13px' }}
      />

      <Input
        label="Email Address"
        type="email"
        icon={Mail}
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={formErrors.email}
        disabled={isLoading}
        wrapperMargin="7px"
        className="friday-auth-input"
        style={{ height: '38px', fontSize: '13px' }}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="Minimum 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={formErrors.password}
        disabled={isLoading}
        wrapperMargin="7px"
        className="friday-auth-input"
        style={{ height: '38px', fontSize: '13px' }}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={formErrors.confirmPassword}
        disabled={isLoading}
        wrapperMargin="7px"
        className="friday-auth-input"
        style={{ height: '38px', fontSize: '13px' }}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="friday-auth-btn-gold w-full"
        style={{ height: '42px', fontSize: '14px', marginTop: '6px' }}
      >
        <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
        {!isLoading && <ArrowRight size={17} className="auth-btn-arrow" />}
      </button>
    </form>
  );
}
