import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CourseDetail, Deadline } from '../types/index';
import ConfirmDialog from './ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const TYPE_COLORS: Record<string, string> = {
  exam: '#ef4444',
  hw: '#f59e0b',
  project: '#8b5cf6',
  quiz: '#06b6d4',
};

const TYPE_LABELS: Record<string, string> = {
  exam: 'Exam',
  hw: 'Homework',
  project: 'Project',
  quiz: 'Quiz',
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

function urgencyColor(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days <= 1) return '#ef4444';
  if (days <= 3) return '#f59e0b';
  if (days <= 7) return '#06b6d4';
  return '#10b981';
}

function MasteryBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        flex: 1,
        height: '8px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          borderRadius: '4px',
          transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: '600', color, minWidth: '36px', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  );
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/courses/${id}`)
      .then((r) => r.json())
      .then((data: { success: boolean; course?: CourseDetail; error?: string }) => {
        if (data.success && data.course) {
          setCourse(data.course);
        } else {
          setError(data.error ?? 'Failed to load course');
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Network error'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, { method: 'DELETE' });
      const data: { success: boolean; error?: string } = await res.json();
      if (data.success) {
        navigate('/home');
      } else {
        setError(data.error ?? 'Delete failed');
        setShowDeleteDialog(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const upcomingDeadlines = (course?.course_deadlines ?? [])
    .filter((d: Deadline) => daysUntil(d.due_date) >= 0)
    .sort((a: Deadline, b: Deadline) => a.due_date.localeCompare(b.due_date));

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#a3a3a3' }}>
        <div style={{
          width: '48px', height: '48px', margin: '0 auto 20px',
          border: '3px solid rgba(230,126,34,0.2)', borderTop: '3px solid #E67E22',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p>Loading course...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div style={{ padding: '50px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ padding: '24px', background: 'rgba(127,29,29,0.2)', border: '2px solid rgba(239,68,68,0.5)', borderRadius: '16px', color: '#e5e5e5' }}>
          <strong style={{ color: '#ef4444' }}>Error: </strong>{error}
        </div>
        <button
          onClick={() => navigate('/home')}
          style={{ marginTop: '20px', padding: '10px 24px', background: 'rgba(255,255,255,0.08)', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
        >
          ← Back to Courses
        </button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div style={{ padding: '40px 50px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back + Delete header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/home')}
          style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e5e5'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#a3a3a3'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          ← Courses
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          style={{ padding: '8px 18px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
        >
          Delete Course
        </button>
      </div>

      {/* Course header */}
      <div style={{ marginBottom: '40px' }}>
        {course.course_code && (
          <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '12px', letterSpacing: '0.5px' }}>
            {course.course_code}
          </div>
        )}
        <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: '800', color: '#e5e5e5', letterSpacing: '-1px' }}>
          {course.course_name}
        </h1>
        <p style={{ margin: 0, color: '#a3a3a3', fontSize: '16px' }}>{course.semester}</p>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '14px 18px', background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', color: '#ef4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>

        {/* Topics + Mastery */}
        <div>
          <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '700', color: '#e5e5e5' }}>
            Topics <span style={{ color: '#a3a3a3', fontWeight: '400', fontSize: '16px' }}>({course.course_topics.length})</span>
          </h2>
          {course.course_topics.length === 0 ? (
            <div style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px', color: '#a3a3a3', textAlign: 'center' }}>
              No topics extracted from this course.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {course.course_topics.map((topic) => (
                <div
                  key={topic.id}
                  style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(230,126,34,0.3)'; e.currentTarget.style.background = 'rgba(230,126,34,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#e5e5e5' }}>
                      {topic.display_name}
                    </span>
                    <button
                      onClick={() => navigate(`/courses/${id}/quiz/${topic.global_topic_id}`, {
                        state: { topicName: topic.display_name }
                      })}
                      style={{ padding: '6px 16px', background: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(230,126,34,0.35)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,126,34,0.5)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(230,126,34,0.35)'; }}
                    >
                      Take Quiz
                    </button>
                  </div>
                  <MasteryBar score={topic.mastery_score} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Deadlines + Weekly Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Deadlines */}
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '18px', fontWeight: '700', color: '#e5e5e5' }}>
              Upcoming Deadlines
            </h2>
            {upcomingDeadlines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#a3a3a3', fontSize: '14px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✓</span>
                No upcoming deadlines
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingDeadlines.map((d: Deadline) => {
                  const days = daysUntil(d.due_date);
                  const color = urgencyColor(d.due_date);
                  const typeColor = TYPE_COLORS[d.type] ?? '#a3a3a3';
                  return (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${typeColor}22` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: typeColor, background: `${typeColor}20`, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {TYPE_LABELS[d.type] ?? d.type}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a3a3a3' }}>{formatDate(d.due_date)}</p>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color, background: `${color}18`, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Plan CTA */}
          <div style={{ padding: '24px', background: 'rgba(230,126,34,0.05)', border: '1px solid rgba(230,126,34,0.2)', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#e5e5e5' }}>Study Strategy</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#a3a3a3', lineHeight: '1.5' }}>
              Generate an AI-powered weekly study plan based on your mastery and deadlines.
            </p>
            <button
              onClick={() => navigate('/plan')}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230,126,34,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(230,126,34,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(230,126,34,0.3)'; }}
            >
              Generate Weekly Plan
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.course_name}"?\n\nAll topics, deadlines, and mastery data will be permanently removed.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
