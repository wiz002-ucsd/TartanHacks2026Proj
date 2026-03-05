import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../theme';

// ── SVG icons (inline, no dependency) ──────────────────────

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/home') return currentPath === '/home' || currentPath.startsWith('/courses');
    return currentPath === path;
  };

  const NAV_ITEMS = [
    { path: '/home',      label: 'Courses' },
    { path: '/dashboard', label: 'AI Dashboard' },
    { path: '/upload',    label: 'Upload Syllabus' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.bg.primary, fontFamily: theme.typography.fontFamily.primary }}>

      {/* ── Navigation ── */}
      <nav style={{
        background: 'rgba(0,0,0,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        boxShadow: `0 1px 0 rgba(230,126,34,0.07), 0 4px 24px rgba(0,0,0,0.6)`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          height: '68px',
          gap: '48px',
        }}>

          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => navigate('/home')}
          >
            {/* Logo mark */}
            <div style={{
              width: '34px',
              height: '34px',
              background: theme.colors.primary,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 0 16px rgba(230,126,34,0.45)',
              flexShrink: 0,
            }}>
              <BookIcon />
            </div>
            {/* Brand name — Crimson Pro serif */}
            <span style={{
              fontFamily: '"Crimson Pro", Georgia, serif',
              fontSize: '22px',
              fontWeight: 600,
              color: theme.colors.text.primary,
              letterSpacing: '0.01em',
              lineHeight: 1,
            }}>
              Sunzi
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: '6px', flex: 1 }}>
            {NAV_ITEMS.map(({ path, label }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    padding: '8px 20px',
                    background: active
                      ? 'linear-gradient(135deg, #E67E22 0%, #D97706 100%)'
                      : 'transparent',
                    color: active ? '#000' : theme.colors.text.secondary,
                    border: active ? 'none' : `1px solid transparent`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: active ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                    boxShadow: active ? '0 4px 16px rgba(230,126,34,0.4)' : 'none',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = theme.colors.text.primary;
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(230,126,34,0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = theme.colors.text.secondary;
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                  onFocus={(e) => {
                    if (!active) {
                      e.currentTarget.style.outline = `2px solid ${theme.colors.border.focus}`;
                      e.currentTarget.style.outlineOffset = '2px';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main style={{
        minHeight: 'calc(100vh - 68px)',
        background: theme.colors.bg.primary,
      }}>
        <Outlet />
      </main>
    </div>
  );
}
