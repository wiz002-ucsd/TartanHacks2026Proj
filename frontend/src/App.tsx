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
      {/* Navigation Bar*/}
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
            {/* Logo with Sunzi branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setCurrentPage('home')}
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
                onClick={() => setCurrentPage('home')}
                style={{
                  padding: '10px 24px',
                  background: currentPage === 'home' ? 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#e5e5e5',
                  border: currentPage === 'home' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: currentPage === 'home' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPage === 'home' ? '0 4px 15px rgba(230, 126, 34, 0.5)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'home') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(230, 126, 34, 0.5)';
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
                  background: currentPage === 'dashboard' ? 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#e5e5e5',
                  border: currentPage === 'dashboard' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: currentPage === 'dashboard' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPage === 'dashboard' ? '0 4px 15px rgba(230, 126, 34, 0.5)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'dashboard') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(230, 126, 34, 0.5)';
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
                AI Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('upload')}
                style={{
                  padding: '10px 24px',
                  background: currentPage === 'upload' ? 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#e5e5e5',
                  border: currentPage === 'upload' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: currentPage === 'upload' ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPage === 'upload' ? '0 4px 15px rgba(230, 126, 34, 0.5)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'upload') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(230, 126, 34, 0.5)';
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
        background: '#000000',
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
