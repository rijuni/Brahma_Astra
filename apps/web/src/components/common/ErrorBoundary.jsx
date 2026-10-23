import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-base)', minHeight: '200px' }}>
          <h2 className="section-title" style={{ color: 'var(--status-error)', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p className="body-regular text-muted" style={{ marginBottom: '16px' }}>
            {this.state.error?.message || 'An unexpected client error occurred.'}
          </p>
          <button
            className="glass-btn glass-btn-secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
