import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    login();
    navigate('/home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.bg.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: theme.typography.fontFamily.primary,
      padding: '24px',
    }}>

      {/* Back to landing */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.primary,
          cursor: 'pointer',
          padding: '6px 2px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = theme.colors.text.primary)}
        onMouseLeave={e => (e.currentTarget.style.color = theme.colors.text.secondary)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Home
      </button>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: theme.colors.bg.elevated,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: theme.shadows.lg,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: theme.colors.primary,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows.glow,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span style={{ color: theme.colors.text.primary, fontWeight: 'bold', fontSize: '20px' }}>Sunzi</span>
        </div>

        {/* Heading */}
        <h1 style={{
          color: theme.colors.text.primary,
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
        }}>
          Welcome back
        </h1>
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          margin: '0 0 32px 0',
        }}>
          Sign in to your Sunzi account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: '500',
              marginBottom: '6px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="you@university.edu"
              style={{
                width: '100%',
                backgroundColor: theme.colors.bg.secondary,
                border: `1px solid ${emailFocused ? theme.colors.border.focus : theme.colors.border.primary}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.base,
                fontFamily: theme.typography.fontFamily.primary,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                boxShadow: emailFocused ? '0 0 0 3px rgba(230,126,34,0.15)' : 'none',
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: '500',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              style={{
                width: '100%',
                backgroundColor: theme.colors.bg.secondary,
                border: `1px solid ${passwordFocused ? theme.colors.border.focus : theme.colors.border.primary}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.base,
                fontFamily: theme.typography.fontFamily.primary,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                boxShadow: passwordFocused ? '0 0 0 3px rgba(230,126,34,0.15)' : 'none',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{
              color: theme.colors.danger,
              fontSize: theme.typography.fontSize.sm,
              margin: 0,
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: theme.colors.primary,
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: theme.typography.fontSize.base,
              fontWeight: '600',
              fontFamily: theme.typography.fontFamily.primary,
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = theme.colors.secondary;
              e.currentTarget.style.boxShadow = theme.shadows.glow;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: theme.colors.border.primary }} />
          <span style={{ color: theme.colors.text.tertiary, fontSize: '12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: theme.colors.border.primary }} />
        </div>

        {/* Sign up prompt */}
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          textAlign: 'center',
          margin: 0,
        }}>
          Don't have an account?{' '}
          <button
            onClick={() => { login(); navigate('/home'); }}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.primary,
              cursor: 'pointer',
              padding: 0,
              fontWeight: '500',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = theme.colors.secondary)}
            onMouseLeave={e => (e.currentTarget.style.color = theme.colors.primary)}
          >
            Get started free
          </button>
        </p>
      </div>
    </div>
  );
}
