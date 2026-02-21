import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/home') return currentPath === '/home' || currentPath.startsWith('/courses');
    return currentPath === path;
  };

  const navButtonStyle = (path: string): React.CSSProperties => ({
    padding: '10px 24px',
    background: isActive(path) ? 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' : 'rgba(255, 255, 255, 0.03)',
    color: '#e5e5e5',
    border: isActive(path) ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: isActive(path) ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive(path) ? '0 4px 15px rgba(230, 126, 34, 0.5)' : 'none',
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, path: string) => {
    if (!isActive(path)) {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'rgba(230, 126, 34, 0.5)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, path: string) => {
    if (!isActive(path)) {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <div className="App">
      <nav
        style={{
          background: '#000000',
          padding: '4px 0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
          marginBottom: '0',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(230, 126, 34, 0.3)',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/home')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(230, 126, 34, 0.5))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <img
                src="/sunzi-logo.png"
                alt="Sunzi Logo"
                style={{
                  height: '100px',
                  width: 'auto',
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: '300',
                  color: '#FFFFFF',
                  letterSpacing: '2px',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Sunzi
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/home')}
                style={navButtonStyle('/home')}
                onMouseEnter={(e) => handleMouseEnter(e, '/home')}
                onMouseLeave={(e) => handleMouseLeave(e, '/home')}
              >
                Courses
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={navButtonStyle('/dashboard')}
                onMouseEnter={(e) => handleMouseEnter(e, '/dashboard')}
                onMouseLeave={(e) => handleMouseLeave(e, '/dashboard')}
              >
                AI Dashboard
              </button>
              <button
                onClick={() => navigate('/upload')}
                style={navButtonStyle('/upload')}
                onMouseEnter={(e) => handleMouseEnter(e, '/upload')}
                onMouseLeave={(e) => handleMouseLeave(e, '/upload')}
              >
                Upload Syllabus
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{
        minHeight: 'calc(100vh - 70px)',
        background: '#000000',
      }}>
        <Outlet />
      </div>
    </div>
  );
}
