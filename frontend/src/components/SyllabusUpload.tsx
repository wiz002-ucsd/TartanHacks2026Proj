import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UploadResponse } from '../types/syllabus';
import SyllabusSummary from './SyllabusSummary';

// Backend API base URL (configure in .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function SyllabusUpload() {
  const navigate = useNavigate();
  const [syllabusText, setSyllabusText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSyllabusText(''); // Clear text input when file is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input based on mode
    if (uploadMode === 'file' && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    if (uploadMode === 'text' && !syllabusText.trim()) {
      alert('Please enter syllabus text');
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      let res: Response;

      if (uploadMode === 'file' && selectedFile) {
        // Upload file using FormData
        const formData = new FormData();
        formData.append('file', selectedFile);

        res = await fetch(`${API_BASE_URL}/api/upload-syllabus`, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        });
      } else {
        // Upload text using JSON
        res = await fetch(`${API_BASE_URL}/api/upload-syllabus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ syllabusText }),
        });
      }

      const data: UploadResponse = await res.json();
      setResponse(data);

      if (data.success) {
        console.log('✓ Syllabus uploaded successfully:', data);
        // Clear form on success
        setSyllabusText('');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Navigate to home after a short delay to show success
        setTimeout(() => {
          navigate('/home', { state: { refresh: true } });
        }, 3000); // Give user 3 seconds to see the success message
      } else {
        console.error('✗ Upload failed:', data.error);
      }

    } catch (error) {
      console.error('Network error:', error);
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      padding: '50px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'transparent',
      minHeight: '100vh',
      animation: 'fadeIn 0.6s ease-in',
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div style={{ animation: 'slideUp 0.5s ease-out' }}>
        <h1 style={{
          color: '#e5e5e5',
          fontSize: '40px',
          fontWeight: '800',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #fff 0%, #a3a3a3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
        }}>
          Syllabus Upload & Analysis
        </h1>
        <p style={{
          color: '#a3a3a3',
          fontSize: '17px',
          fontWeight: '500',
          marginBottom: '32px',
        }}>
          Upload a syllabus PDF or paste text to extract structured course information
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{
        marginTop: '28px',
        marginBottom: '32px',
        animation: 'slideUp 0.5s ease-out 0.1s both',
      }}>
        <button
          onClick={() => setUploadMode('file')}
          style={{
            padding: '12px 28px',
            marginRight: '14px',
            background: uploadMode === 'file'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            color: '#e5e5e5',
            border: uploadMode === 'file' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: uploadMode === 'file' ? '700' : '500',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            boxShadow: uploadMode === 'file' ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (uploadMode !== 'file') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (uploadMode !== 'file') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          📁 Upload File
        </button>
        <button
          onClick={() => setUploadMode('text')}
          style={{
            padding: '12px 28px',
            background: uploadMode === 'text'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            color: '#e5e5e5',
            border: uploadMode === 'text' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: uploadMode === 'text' ? '700' : '500',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            boxShadow: uploadMode === 'text' ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (uploadMode !== 'text') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (uploadMode !== 'text') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          📝 Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{
        marginTop: '28px',
        animation: 'slideUp 0.5s ease-out 0.2s both',
      }}>
        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div style={{
            marginBottom: '28px',
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
            border: '2px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
          }}
          onDragEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)';
          }}>
            <label htmlFor="file-upload" style={{
              display: 'block',
              marginBottom: '12px',
              fontWeight: '700',
              color: '#e5e5e5',
              fontSize: '16px',
            }}>
              Upload Syllabus File (PDF or TXT)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={isLoading}
              style={{
                padding: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e5e5e5',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            />
            {selectedFile && (
              <p style={{
                marginTop: '14px',
                fontSize: '14px',
                color: '#10b981',
                fontWeight: '500',
                padding: '10px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        )}

        {/* Text Paste Mode */}
        {uploadMode === 'text' && (
          <div style={{ marginBottom: '28px' }}>
            <label htmlFor="syllabus-text" style={{
              display: 'block',
              marginBottom: '12px',
              fontWeight: '700',
              color: '#e5e5e5',
              fontSize: '16px',
            }}>
              Paste Syllabus Text
            </label>
            <textarea
              id="syllabus-text"
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste your syllabus text here..."
              disabled={isLoading}
              rows={15}
              style={{
                width: '100%',
                padding: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'vertical',
                background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
                color: '#e5e5e5',
                backdropFilter: 'blur(10px)',
                lineHeight: '1.6',
              }}
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (uploadMode === 'file' ? !selectedFile : !syllabusText.trim())}
          style={{
            padding: '16px 36px',
            background: isLoading
              ? 'rgba(115, 115, 115, 0.3)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '17px',
            fontWeight: '700',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading || (uploadMode === 'file' ? !selectedFile : !syllabusText.trim()) ? 0.5 : 1,
            boxShadow: isLoading ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading && (uploadMode === 'file' ? selectedFile : syllabusText.trim())) {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.3)';
          }}
        >
          {isLoading ? '⏳ Processing...' : '🚀 Analyze Syllabus'}
        </button>
      </form>

      {/* Response Display */}
      {response && !response.success && (
        <div
          style={{
            marginTop: '40px',
            padding: '32px',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(127, 29, 29, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
            animation: 'slideUp 0.5s ease-out',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '32px' }}>⚠️</span>
            <h2 style={{
              margin: '0',
              color: '#e5e5e5',
              fontSize: '24px',
              fontWeight: '800',
            }}>
              Error
            </h2>
          </div>
          <p style={{
            color: '#e5e5e5',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0 0 12px 0',
          }}>
            <strong>Error:</strong> {response.error}
          </p>
          {response.details && (
            <pre style={{
              marginTop: '16px',
              padding: '16px',
              fontSize: '13px',
              overflow: 'auto',
              color: '#e5e5e5',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              lineHeight: '1.5',
            }}>
              {response.details}
            </pre>
          )}
        </div>
      )}

      {/* Success Summary */}
      {response && response.success && response.extractedData && (
        <SyllabusSummary
          data={response.extractedData}
          courseId={response.courseId!}
          message={response.message!}
        />
      )}
    </div>
  );
}
