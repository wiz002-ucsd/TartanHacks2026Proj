import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UploadResult } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function SyllabusUpload() {
  const navigate = useNavigate();
  const [syllabusText, setSyllabusText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSyllabusText('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && !selectedFile) { alert('Please select a file'); return; }
    if (uploadMode === 'text' && !syllabusText.trim()) { alert('Please enter syllabus text'); return; }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let res: Response;

      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await fetch(`${API_BASE_URL}/api/syllabus/upload`, { method: 'POST', body: formData });
      } else {
        res = await fetch(`${API_BASE_URL}/api/syllabus/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ syllabusText }),
        });
      }

      const data: { success: boolean; error?: string } & Partial<UploadResult> = await res.json();

      if (data.success && data.courseId) {
        setResult({ courseId: data.courseId, course_name: data.course_name ?? '', topic_count: data.topic_count ?? 0, deadline_count: data.deadline_count ?? 0 });
        setSyllabusText('');
        setSelectedFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setTimeout(() => navigate(`/courses/${data.courseId}`), 2000);
      } else {
        setError(data.error ?? 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', padding: '50px', maxWidth: '900px', margin: '0 auto', background: 'transparent', minHeight: '100vh' }}>
      <h1 style={{ color: '#e5e5e5', fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px' }}>
        Upload Syllabus
      </h1>
      <p style={{ color: '#a3a3a3', fontSize: '16px', marginBottom: '32px' }}>
        Upload a PDF or paste text — Sunzi extracts topics and deadlines automatically.
      </p>

      {/* Mode Toggle */}
      <div style={{ marginBottom: '28px', display: 'flex', gap: '12px' }}>
        {(['file', 'text'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setUploadMode(mode)}
            style={{
              padding: '10px 24px',
              background: uploadMode === mode ? 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' : 'rgba(255,255,255,0.05)',
              color: '#e5e5e5',
              border: uploadMode === mode ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: uploadMode === mode ? '700' : '500',
              fontSize: '14px',
              boxShadow: uploadMode === mode ? '0 4px 15px rgba(230,126,34,0.4)' : 'none',
            }}
          >
            {mode === 'file' ? '📁 Upload File' : '📝 Paste Text'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {uploadMode === 'file' && (
          <div style={{ marginBottom: '24px', padding: '28px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '16px' }}>
            <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#e5e5e5' }}>
              Syllabus PDF or TXT
            </label>
            <input id="file-upload" type="file" accept=".pdf,.txt" onChange={handleFileChange} disabled={isLoading}
              style={{ width: '100%', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#e5e5e5', cursor: 'pointer' }} />
            {selectedFile && (
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#10b981', padding: '8px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}

        {uploadMode === 'text' && (
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="syllabus-text" style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#e5e5e5' }}>
              Paste Syllabus Text
            </label>
            <textarea id="syllabus-text" value={syllabusText} onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste your syllabus text here..." disabled={isLoading} rows={15}
              style={{ width: '100%', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontFamily: 'monospace', fontSize: '14px', resize: 'vertical', background: 'rgba(255,255,255,0.03)', color: '#e5e5e5', lineHeight: '1.6', boxSizing: 'border-box' }} />
          </div>
        )}

        <button type="submit" disabled={isLoading || (uploadMode === 'file' ? !selectedFile : !syllabusText.trim())}
          style={{
            padding: '14px 32px', background: isLoading ? 'rgba(115,115,115,0.3)' : 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
            color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading || (uploadMode === 'file' ? !selectedFile : !syllabusText.trim()) ? 0.5 : 1,
            boxShadow: isLoading ? 'none' : '0 4px 20px rgba(230,126,34,0.4)',
          }}>
          {isLoading ? 'Processing...' : 'Analyze Syllabus'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{ marginTop: '32px', padding: '24px', border: '2px solid rgba(239,68,68,0.5)', borderRadius: '16px', background: 'rgba(127,29,29,0.2)' }}>
          <strong style={{ color: '#ef4444' }}>Error: </strong>
          <span style={{ color: '#e5e5e5' }}>{error}</span>
        </div>
      )}

      {/* Success */}
      {result && (
        <div style={{ marginTop: '32px', padding: '28px', border: '2px solid rgba(16,185,129,0.5)', borderRadius: '16px', background: 'rgba(6,95,70,0.2)' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#10b981', fontSize: '22px', fontWeight: '800' }}>✓ Course Created</h2>
          <p style={{ margin: '0 0 8px 0', color: '#e5e5e5', fontSize: '18px', fontWeight: '600' }}>{result.course_name}</p>
          <p style={{ margin: 0, color: '#a3a3a3', fontSize: '14px' }}>
            {result.topic_count} topics extracted · {result.deadline_count} deadlines found
          </p>
          <p style={{ margin: '12px 0 0 0', color: '#a3a3a3', fontSize: '13px' }}>
            Redirecting to course page...
          </p>
        </div>
      )}
    </div>
  );
}
