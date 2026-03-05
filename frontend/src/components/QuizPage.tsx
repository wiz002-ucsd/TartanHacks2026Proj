import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { QuizQuestion, QuizResult } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const { id, topicId } = useParams<{ id: string; topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const topicName: string = (location.state as { topicName?: string })?.topicName ?? 'Topic';

  const [retakeKey, setRetakeKey] = useState(0);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) return;
    setIsGenerating(true);
    setGenerateError(null);
    setResult(null);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setSubmitError(null);

    fetch(`${API_BASE_URL}/api/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: Number(topicId), topic_name: topicName }),
    })
      .then((r) => r.json())
      .then((data: { success: boolean; quiz_id?: number; questions?: QuizQuestion[]; error?: string }) => {
        if (data.success && data.quiz_id && data.questions) {
          setQuizId(data.quiz_id);
          setQuestions(data.questions);
          setSelectedAnswers(new Array(data.questions.length).fill(null));
        } else {
          setGenerateError(data.error ?? 'Failed to generate quiz');
        }
      })
      .catch((err: unknown) => setGenerateError(err instanceof Error ? err.message : 'Network error'))
      .finally(() => setIsGenerating(false));
  }, [topicId, topicName, retakeKey]);

  const handleSelect = (optionIndex: number) => {
    if (result) return;
    const updated = [...selectedAnswers];
    updated[currentIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quizId) return;
    const answers = selectedAnswers.map((a) => (a === null ? 0 : a));
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId, answers }),
      });
      const data: { success: boolean; score?: number; correct?: boolean[]; updated_mastery?: number; error?: string } = await res.json();
      if (data.success && data.score !== undefined && data.correct && data.updated_mastery !== undefined) {
        setResult({ score: data.score, correct: data.correct, updated_mastery: data.updated_mastery });
      } else {
        setSubmitError(data.error ?? 'Submission failed');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = selectedAnswers.length > 0 && selectedAnswers.every((a) => a !== null);
  const isLastQuestion = currentIndex === questions.length - 1;

  // ── Generating ──────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#a3a3a3' }}>
        <div style={{ width: '52px', height: '52px', margin: '0 auto 24px', border: '3px solid rgba(230,126,34,0.2)', borderTop: '3px solid #E67E22', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Generating quiz...</p>
        <p style={{ fontSize: '14px', margin: 0 }}>Creating 5 questions on <strong style={{ color: '#e5e5e5' }}>{topicName}</strong></p>
      </div>
    );
  }

  // ── Generate error ───────────────────────────────────────────────
  if (generateError) {
    return (
      <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '24px', background: 'rgba(127,29,29,0.2)', border: '2px solid rgba(239,68,68,0.5)', borderRadius: '16px', color: '#e5e5e5', marginBottom: '20px' }}>
          <strong style={{ color: '#ef4444' }}>Error: </strong>{generateError}
        </div>
        <button
          onClick={() => navigate(`/courses/${id}`)}
          style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.08)', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
        >
          ← Back to Course
        </button>
      </div>
    );
  }

  // ── Results screen ───────────────────────────────────────────────
  if (result) {
    const pct = Math.round(result.score * 100);
    const masteryPct = Math.round(result.updated_mastery * 100);
    const masteryColor = masteryPct >= 80 ? '#10b981' : masteryPct >= 50 ? '#f59e0b' : '#ef4444';
    const scoreColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ padding: '50px', maxWidth: '700px', margin: '0 auto' }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {/* Score card */}
        <div style={{ textAlign: 'center', padding: '40px 32px', background: 'rgba(255,255,255,0.03)', border: `2px solid ${scoreColor}40`, borderRadius: '20px', marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: '72px', fontWeight: '900', color: scoreColor, lineHeight: 1 }}>{pct}%</div>
          <p style={{ margin: '12px 0 4px', fontSize: '20px', fontWeight: '700', color: '#e5e5e5' }}>
            {result.correct.filter(Boolean).length} / {result.correct.length} correct
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#a3a3a3' }}>Quiz on <strong style={{ color: '#e5e5e5' }}>{topicName}</strong></p>

          {/* Mastery update */}
          <div style={{ marginTop: '24px', padding: '16px 20px', background: `${masteryColor}12`, border: `1px solid ${masteryColor}40`, borderRadius: '12px', display: 'inline-block' }}>
            <span style={{ fontSize: '13px', color: '#a3a3a3' }}>Updated mastery: </span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: masteryColor }}>{masteryPct}%</span>
          </div>
        </div>

        {/* Per-question review */}
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#e5e5e5' }}>Review</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {questions.map((q, i) => {
            const isCorrect = result.correct[i];
            const userAnswer = selectedAnswers[i];
            return (
              <div key={i} style={{ padding: '18px 20px', background: isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '14px', animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{isCorrect ? '✓' : '✗'}</span>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e5e5e5', lineHeight: '1.5' }}>{q.question}</p>
                </div>
                {!isCorrect && (
                  <div style={{ marginLeft: '28px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#ef4444' }}>Your answer: {userAnswer !== null ? q.options[userAnswer] : 'None'}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#10b981' }}>Correct: {q.options[q.correct_index]}</p>
                  </div>
                )}
                {q.explanation && (
                  <p style={{ margin: '8px 0 0 28px', fontSize: '13px', color: '#a3a3a3', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate(`/courses/${id}`)}
            style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.06)', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}
          >
            ← Back to Course
          </button>
          <button
            onClick={() => { setQuizId(null); setRetakeKey((k) => k + 1); }}
            style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 15px rgba(230,126,34,0.35)' }}
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz flow ────────────────────────────────────────────────────
  const question = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];

  return (
    <div style={{ padding: '50px', maxWidth: '680px', margin: '0 auto' }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button
          onClick={() => navigate(`/courses/${id}`)}
          style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#a3a3a3' }}>{topicName}</p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: '#e5e5e5' }}>
            {currentIndex + 1} / {questions.length}
          </p>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #E67E22, #D35400)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question */}
      <div key={currentIndex} style={{ animation: 'fadeUp 0.3s ease' }}>
        <p style={{ fontSize: '19px', fontWeight: '700', color: '#e5e5e5', lineHeight: '1.5', marginBottom: '28px' }}>
          {question.question}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  padding: '16px 20px',
                  background: isSelected ? 'rgba(230,126,34,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isSelected ? '#E67E22' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: isSelected ? '600' : '400',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 0 0 1px #E67E22' : 'none',
                }}
                onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(230,126,34,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
              >
                <span style={{ minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? '#E67E22' : 'rgba(255,255,255,0.08)', borderRadius: '50%', fontSize: '13px', fontWeight: '700', color: isSelected ? '#fff' : '#a3a3a3', flexShrink: 0 }}>
                  {OPTION_LABELS[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Nav buttons */}
        {submitError && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', color: '#ef4444', fontSize: '14px' }}>
            {submitError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.06)', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}
            >
              ← Back
            </button>
          )}
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={selected === null}
              style={{ flex: 1, padding: '14px', background: selected !== null ? 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' : 'rgba(115,115,115,0.3)', color: '#fff', border: 'none', borderRadius: '12px', cursor: selected !== null ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: '700', opacity: selected !== null ? 1 : 0.5, boxShadow: selected !== null ? '0 4px 15px rgba(230,126,34,0.35)' : 'none', transition: 'all 0.2s' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              style={{ flex: 1, padding: '14px', background: allAnswered && !isSubmitting ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(115,115,115,0.3)', color: '#fff', border: 'none', borderRadius: '12px', cursor: allAnswered && !isSubmitting ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: '700', opacity: allAnswered && !isSubmitting ? 1 : 0.5, boxShadow: allAnswered && !isSubmitting ? '0 4px 15px rgba(16,185,129,0.35)' : 'none', transition: 'all 0.2s' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
