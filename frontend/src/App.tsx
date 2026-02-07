import { useState } from 'react';
import Home from './components/Home';
import SyllabusUpload from './components/SyllabusUpload';
import CourseDetail from './components/CourseDetail';

type Page = 'home' | 'upload' | 'detail';

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
          backgroundColor: '#1a1a1a',
          padding: '15px 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          marginBottom: '0',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <h1
              style={{
                margin: 0,
                color: '#e5e5e5',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentPage('home')}
            >
              Academic Assistant
            </h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage('home')}
                style={{
                  padding: '8px 20px',
                  backgroundColor: currentPage === 'home' ? '#3b82f6' : 'transparent',
                  color: '#e5e5e5',
                  border: currentPage === 'home' ? 'none' : '1px solid #404040',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: currentPage === 'home' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'home') {
                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'home') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('upload')}
                style={{
                  padding: '8px 20px',
                  backgroundColor: currentPage === 'upload' ? '#3b82f6' : 'transparent',
                  color: '#e5e5e5',
                  border: currentPage === 'upload' ? 'none' : '1px solid #404040',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: currentPage === 'upload' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'upload') {
                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'upload') {
                    e.currentTarget.style.backgroundColor = 'transparent';
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
      <div style={{ minHeight: 'calc(100vh - 70px)', backgroundColor: '#0a0a0a' }}>
        {currentPage === 'home' && (
          <Home
            key={homeRefreshKey}
            onNavigateToUpload={() => setCurrentPage('upload')}
            onNavigateToCourse={navigateToCourseDetail}
          />
        )}
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
