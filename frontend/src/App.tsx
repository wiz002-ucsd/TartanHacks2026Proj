import { useState } from 'react';
import Home from './components/Home';
import SyllabusUpload from './components/SyllabusUpload';
import CourseDetail from './components/CourseDetail';
import Dashboard from './components/Dashboard';

type Page = 'home' | 'upload' | 'detail' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);

  const navigateToCourseDetail = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentPage('detail');
  };

  const navigateToHome = (shouldRefresh = false) => {
    setCurrentPage('home');
    setSelectedCourseId(null);
    if (shouldRefresh) {
      setHomeRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '20px 0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          marginBottom: '0',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
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
            <h1
              style={{
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '28px',
                fontWeight: '800',
                cursor: 'pointer',
                letterSpacing: '-0.5px',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setCurrentPage('home')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sunzi
            </h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCurrentPage('home')}
                style={{
                  padding: '10px 24px',
                  background: currentPage === 'home' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#e5e5e5',
                  border: currentPage === 'home' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: currentPage === 'home' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPage === 'home' ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'home') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'home') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Courses
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                style={{
                  padding: '10px 24px',
                  background: currentPage === 'dashboard' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#e5e5e5',
                  border: currentPage === 'dashboard' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: currentPage === 'dashboard' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPage === 'dashboard' ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                AI View
              </button>
              <button
                onClick={() => setCurrentPage('upload')}
                style={{
                  padding: '10px 24px',
                  background: currentPage === 'upload' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#e5e5e5',
                  border: currentPage === 'upload' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: currentPage === 'upload' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPage === 'upload' ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'upload') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'upload') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Upload Syllabus
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f1e 100%)',
      }}>
        {currentPage === 'home' && (
          <Home
            key={homeRefreshKey}
            onNavigateToUpload={() => setCurrentPage('upload')}
            onNavigateToCourse={navigateToCourseDetail}
          />
        )}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'upload' && (
          <SyllabusUpload onSuccessfulUpload={navigateToHome} />
        )}
        {currentPage === 'detail' && selectedCourseId !== null && (
          <CourseDetail
            courseId={selectedCourseId}
            onBack={navigateToHome}
          />
        )}
      </div>
    </div>
  );
}

export default App;
