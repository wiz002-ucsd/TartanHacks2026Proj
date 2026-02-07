import { useState } from 'react';
import Home from './components/Home';
import SyllabusUpload from './components/SyllabusUpload';

type Page = 'home' | 'upload';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav
        style={{
          backgroundColor: '#343a40',
          padding: '15px 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '0',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <h1
              style={{
                margin: 0,
                color: 'white',
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
                  backgroundColor: currentPage === 'home' ? '#007bff' : 'transparent',
                  color: 'white',
                  border: currentPage === 'home' ? 'none' : '1px solid #6c757d',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: currentPage === 'home' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'home') {
                    e.currentTarget.style.backgroundColor = '#495057';
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
                  backgroundColor: currentPage === 'upload' ? '#007bff' : 'transparent',
                  color: 'white',
                  border: currentPage === 'upload' ? 'none' : '1px solid #6c757d',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: currentPage === 'upload' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'upload') {
                    e.currentTarget.style.backgroundColor = '#495057';
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
      <div style={{ minHeight: 'calc(100vh - 70px)', backgroundColor: '#f8f9fa', paddingTop: '20px' }}>
        {currentPage === 'home' && (
          <Home onNavigateToUpload={() => setCurrentPage('upload')} />
        )}
        {currentPage === 'upload' && (
          <SyllabusUpload onSuccessfulUpload={() => setCurrentPage('home')} />
        )}
      </div>
    </div>
  );
}

export default App;
