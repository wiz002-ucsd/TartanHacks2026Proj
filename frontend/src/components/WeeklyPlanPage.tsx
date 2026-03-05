import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function WeeklyPlanPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/strategy/generate`, { method: 'POST' });
      const data: { success: boolean; plan?: string; error?: string } = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      } else {
        setError(data.error ?? 'Failed to generate plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '860px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .plan-body h1, .plan-body h2, .plan-body h3 {
          color: #e5e5e5;
          margin: 1.4em 0 0.5em;
          font-weight: 700;
          line-height: 1.3;
        }
        .plan-body h1 { font-size: 22px; border-bottom: 1px solid rgba(230,126,34,0.3); padding-bottom: 8px; }
        .plan-body h2 { font-size: 18px; color: #E67E22; }
        .plan-body h3 { font-size: 16px; color: #d4a76a; }
        .plan-body p { margin: 0.5em 0; color: #d4d4d4; line-height: 1.75; }
        .plan-body ul, .plan-body ol { margin: 0.5em 0 0.5em 1.5em; padding: 0; }
        .plan-body li { color: #d4d4d4; margin: 0.3em 0; line-height: 1.65; }
        .plan-body strong { color: #e5e5e5; font-weight: 700; }
        .plan-body em { color: #a3a3a3; font-style: italic; }
        .plan-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5em 0; }
        .plan-body code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 13px; color: '#e5e5e5'; }
        .plan-body blockquote { border-left: 3px solid rgba(230,126,34,0.5); margin: 1em 0; padding: 0.5em 1em; background: rgba(230,126,34,0.05); border-radius: 0 8px 8px 0; }
        .plan-body blockquote p { color: '#a3a3a3'; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: '36px', fontWeight: '800', color: '#e5e5e5', letterSpacing: '-1px' }}>
          Weekly Study Plan
        </h1>
        <p style={{ margin: 0, fontSize: '16px', color: '#a3a3a3' }}>
          AI-generated based on your mastery scores and upcoming deadlines.
        </p>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{
          padding: '16px 36px',
          background: isLoading ? 'rgba(115,115,115,0.3)' : 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          boxShadow: isLoading ? 'none' : '0 4px 20px rgba(230,126,34,0.4)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '36px',
        }}
        onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(230,126,34,0.5)'; } }}
        onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,126,34,0.4)'; } }}
      >
        {isLoading && (
          <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />
        )}
        {isLoading ? 'Generating plan...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
      </button>

      {/* Error */}
      {error && (
        <div style={{ padding: '20px 24px', background: 'rgba(127,29,29,0.2)', border: '2px solid rgba(239,68,68,0.5)', borderRadius: '14px', color: '#e5e5e5', marginBottom: '24px' }}>
          <strong style={{ color: '#ef4444' }}>Error: </strong>{error}
        </div>
      )}

      {/* Loading placeholder */}
      {isLoading && (
        <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#a3a3a3' }}>
          <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>Analyzing your mastery and deadlines...</p>
          <p style={{ margin: 0, fontSize: '13px' }}>This may take a few seconds.</p>
        </div>
      )}

      {/* Plan output */}
      {plan && !isLoading && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#e5e5e5' }}>Your 7-Day Plan</h2>
            <button
              onClick={() => navigator.clipboard.writeText(plan)}
              style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e5e5'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#a3a3a3'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              Copy
            </button>
          </div>
          <div
            className="plan-body"
            style={{
              padding: '28px 32px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(230,126,34,0.2)',
              borderRadius: '16px',
              fontSize: '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
