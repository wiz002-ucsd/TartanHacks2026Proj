import React, { useState } from 'react';
import type { UploadResponse } from '../types/syllabus';
import SyllabusSummary from './SyllabusSummary';

// Backend API base URL (configure in .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface SyllabusUploadProps {
  onSuccessfulUpload?: () => void;
}

export default function SyllabusUpload({ onSuccessfulUpload }: SyllabusUploadProps) {
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

        // Notify parent component after a short delay to show success
        if (onSuccessfulUpload) {
          setTimeout(() => {
            onSuccessfulUpload();
          }, 3000); // Give user 3 seconds to see the success message
        }
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>Syllabus Upload & Analysis</h1>
      <p>Upload a syllabus PDF or paste text to extract structured course information</p>

      {/* Mode Toggle */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button
          onClick={() => setUploadMode('file')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: uploadMode === 'file' ? '#007bff' : '#f0f0f0',
            color: uploadMode === 'file' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: uploadMode === 'file' ? 'bold' : 'normal',
          }}
        >
          Upload File
        </button>
        <button
          onClick={() => setUploadMode('text')}
          style={{
            padding: '10px 20px',
            backgroundColor: uploadMode === 'text' ? '#007bff' : '#f0f0f0',
            color: uploadMode === 'text' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: uploadMode === 'text' ? 'bold' : 'normal',
          }}
        >
          Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Upload Syllabus File (PDF or TXT)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={isLoading}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%',
              }}
            />
            {selectedFile && (
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        )}

        {/* Text Paste Mode */}
        {uploadMode === 'text' && (
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="syllabus-text" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
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
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (uploadMode === 'file' ? !selectedFile : !syllabusText.trim())}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Processing...' : 'Analyze Syllabus'}
        </button>
      </form>

      {/* Response Display */}
      {response && !response.success && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            backgroundColor: '#f8d7da',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', color: '#721c24' }}>
            Error
          </h2>
          <p style={{ color: '#721c24' }}><strong>Error:</strong> {response.error}</p>
          {response.details && (
            <pre style={{ marginTop: '10px', fontSize: '12px', overflow: 'auto', color: '#721c24' }}>
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
