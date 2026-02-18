import { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';
import LectureRoadmap from './LectureRoadmap';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface CourseDetailProps {
  courseId: number;
  onBack: (shouldRefresh?: boolean) => void;
}

interface Event {
  id: number;
  name: string;
  type: string;
  due_date: string | null;
  release_date: string | null;
  weight: number | null;
}

interface Topic {
  topic_id: number;
  topic_name: string;
  description: string | null;
  mastery_score: number | null;
  mastery_level: string | null;
}

interface CourseData {
  id: number;
  name: string;
  code: string;
  term: string;
  units: number | null;
  grading_policies: {
    homework: number | null;
    tests: number | null;
    project: number | null;
    quizzes: number | null;
  } | null;
  events: Event[];
  lectures: Array<{
    id: number;
    lecture_number: number;
    title: string;
    date: string | null;
    topics: string[];
    description: string | null;
  }>;
  course_policies: {
    late_days_total: number | null;
    late_days_per_hw: number | null;
    genai_allowed: boolean | null;
    genai_notes: string | null;
  } | null;
}

export default function CourseDetail({ courseId, onBack }: CourseDetailProps) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchTopics();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      const data = await res.json();

      if (data.success) {
        setCourse(data.course);
      } else {
        setError(data.error || 'Failed to fetch course details');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/topics`);
      const data = await res.json();

      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      // Don't set error state - topics are optional
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        // Navigate back to home and refresh the course list
        setShowDeleteConfirm(false);
        onBack(true);
      } else {
        setError(data.error || 'Failed to delete course');
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Network error');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Get upcoming events within next 2 weeks
  const getUpcomingEvents = () => {
    if (!course) return [];

    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    return course.events
      .filter(event => {
        if (!event.due_date) return false;
        const dueDate = new Date(event.due_date);
        return dueDate >= today && dueDate <= twoWeeksFromNow;
      })
      .sort((a, b) => {
        const dateA = new Date(a.due_date!);
        const dateB = new Date(b.due_date!);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get days until deadline
  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get urgency color
  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 1) return '#ef4444';
    if (daysUntil <= 3) return '#f59e0b';
    if (daysUntil <= 7) return '#06b6d4';
    return '#10b981';
  };

  const formatPercent = (value: number | null) => {
    return value !== null ? `${value}%` : 'N/A';
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        padding: '50px',
        boxSizing: 'border-box',
        background: 'transparent',
        minHeight: '100vh',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 24px',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
              }
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
          <p style={{
            fontSize: '20px',
            color: '#a3a3a3',
            fontWeight: '600',
          }}>
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{
        width: '100%',
        padding: '50px',
        boxSizing: 'border-box',
        background: 'transparent',
        minHeight: '100vh',
        animation: 'fadeIn 0.5s ease-in',
      }}>
        <button
          onClick={() => onBack()}
          style={{
            padding: '12px 24px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ← Back to Courses
        </button>
        <div style={{
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(127, 29, 29, 0.1) 100%)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '20px',
          color: '#e5e5e5',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '12px',
          }}>⚠️</div>
          <strong style={{ fontSize: '18px' }}>Error:</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '15px' }}>
            {error || 'Course not found'}
          </p>
        </div>
      </div>
    );
  }

  const grading = course.grading_policies ?? {
    homework: null,
    tests: null,
    project: null,
    quizzes: null,
  };
  const upcomingEvents = getUpcomingEvents();
  const gradingItems = [
    { label: 'Homework', value: grading.homework, color: '#3b82f6' },
    { label: 'Tests', value: grading.tests, color: '#ef4444' },
    { label: 'Project', value: grading.project, color: '#f59e0b' },
    { label: 'Quizzes', value: grading.quizzes, color: '#06b6d4' },
  ].filter((item): item is { label: string; value: number; color: string } => item.value !== null && item.value > 0);
  const gradingTotal = gradingItems.reduce((sum, item) => sum + item.value, 0);

  const gradingPieBackground = (() => {
    if (gradingTotal <= 0) return '#1a1a1a';

    let currentPercent = 0;
    const slices = gradingItems.map((item) => {
      const start = currentPercent;
      currentPercent += (item.value / gradingTotal) * 100;
      return `${item.color} ${start.toFixed(2)}% ${currentPercent.toFixed(2)}%`;
    });

    return `conic-gradient(${slices.join(', ')})`;
  })();

  return (
    <div style={{
      width: '100%',
      padding: '50px',
      boxSizing: 'border-box',
      background: 'transparent',
      minHeight: '100vh',
      animation: 'fadeIn 0.6s ease-in',
    }}>
      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '14px',
        marginBottom: '28px',
        alignItems: 'center',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <button
          onClick={() => onBack()}
          style={{
            padding: '12px 24px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ← Back to Courses
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          style={{
            padding: '12px 24px',
            background: isDeleting
              ? 'rgba(115, 115, 115, 0.3)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
            color: isDeleting ? '#737373' : '#ef4444',
            border: `1px solid ${isDeleting ? 'rgba(115, 115, 115, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            borderRadius: '12px',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            opacity: isDeleting ? 0.6 : 1,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)';
            }
          }}
        >
          {isDeleting ? 'Deleting...' : '🗑️ Delete Course'}
        </button>
      </div>

      {/* Course Header */}
      <div style={{
        marginBottom: '40px',
        animation: 'slideUp 0.6s ease-out 0.1s both',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          borderRadius: '25px',
          fontSize: '15px',
          fontWeight: '700',
          marginBottom: '16px',
          letterSpacing: '0.5px',
        }}>
          {course.code}
        </div>
        <h1 style={{
          margin: '0 0 12px 0',
          fontSize: '40px',
          fontWeight: '800',
          color: '#e5e5e5',
          letterSpacing: '-1px',
        }}>
          {course.name}
        </h1>
        <p style={{
          margin: '0',
          fontSize: '17px',
          color: '#a3a3a3',
          fontWeight: '500',
        }}>
          {course.term} {course.units && `• ${course.units} units`}
        </p>
      </div>

      {/* Priority Deadlines (Next 2 Weeks) */}
      {upcomingEvents.length > 0 && (
        <div style={{
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.4) 0%, rgba(120, 53, 15, 0.2) 100%)',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.2s both',
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '22px',
            fontWeight: '800',
            color: '#e5e5e5',
            letterSpacing: '-0.5px',
          }}>
            ⚠️ Priority: Upcoming Deadlines (Next 2 Weeks)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {upcomingEvents.map((event) => {
              const daysUntil = getDaysUntil(event.due_date!);
              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.5) 0%, rgba(30, 30, 46, 0.3) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 158, 11, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#e5e5e5',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                        fontWeight: '600',
                      }}>
                        {event.type}
                      </span>
                      <h3 style={{
                        margin: 0,
                        fontSize: '17px',
                        fontWeight: '700',
                        color: '#e5e5e5',
                      }}>
                        {event.name}
                      </h3>
                    </div>
                    {event.weight !== null && (
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '14px',
                        color: '#a3a3a3',
                        fontWeight: '500',
                      }}>
                        Weight: {event.weight}%
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '10px 18px',
                      background: `linear-gradient(135deg, ${getUrgencyColor(daysUntil)} 0%, ${getUrgencyColor(daysUntil)}dd 100%)`,
                      color: '#fff',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '14px',
                      boxShadow: `0 4px 16px ${getUrgencyColor(daysUntil)}40`,
                    }}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </div>
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '13px',
                      color: '#a3a3a3',
                      fontWeight: '500',
                    }}>
                      {formatDate(event.due_date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 && (
        <div style={{
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(6, 95, 70, 0.3) 0%, rgba(6, 95, 70, 0.1) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '20px',
          marginBottom: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
          animation: 'slideUp 0.6s ease-out 0.2s both',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
          <p style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '600',
            color: '#e5e5e5',
          }}>
            No deadlines in the next 2 weeks
          </p>
        </div>
      )}

      {/* Course Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        {/* Grading Breakdown */}
        <div style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.3s both',
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            borderBottom: '3px solid rgba(16, 185, 129, 0.5)',
            paddingBottom: '12px',
            color: '#e5e5e5',
            fontWeight: '800',
            letterSpacing: '-0.5px',
          }}>
            Grading Breakdown
          </h3>
          {gradingItems.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: gradingPieBackground,
                  border: '6px solid #1a1a1a',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {gradingItems.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ color: '#e5e5e5', fontWeight: '500' }}>{item.label}</span>
                    </div>
                    <span style={{ color: item.color, fontWeight: 'bold' }}>{formatPercent(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#a3a3a3' }}>No grading breakdown available</p>
          )}
        </div>

        {/* Top Mastered Topics */}
        <div style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.4s both',
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            borderBottom: '3px solid rgba(139, 92, 246, 0.5)',
            paddingBottom: '12px',
            color: '#e5e5e5',
            fontWeight: '800',
            letterSpacing: '-0.5px',
          }}>
            🎯 Topic Mastery
          </h3>
          {(() => {
            // Get topics with mastery scores
            const masteredTopics = topics
              .filter(t => t.mastery_score !== null && t.mastery_score > 0)
              .sort((a, b) => (b.mastery_score || 0) - (a.mastery_score || 0))
              .slice(0, 2);

            // If no mastered topics, show first two topics or just first topic
            const displayTopics = masteredTopics.length > 0
              ? masteredTopics
              : topics.slice(0, 1);

            if (displayTopics.length === 0) {
              return (
                <p style={{ margin: 0, color: '#a3a3a3' }}>
                  No topics available yet
                </p>
              );
            }

            const getMasteryColor = (score: number | null) => {
              if (!score) return '#737373';
              if (score >= 0.9) return '#10b981'; // expert
              if (score >= 0.75) return '#06b6d4'; // proficient
              if (score >= 0.6) return '#f59e0b'; // developing
              if (score >= 0.4) return '#f97316'; // emerging
              return '#ef4444'; // foundational
            };

            const getMasteryLabel = (score: number | null) => {
              if (!score) return 'Not started';
              if (score >= 0.9) return 'Expert';
              if (score >= 0.75) return 'Proficient';
              if (score >= 0.6) return 'Developing';
              if (score >= 0.4) return 'Emerging';
              return 'Foundational';
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayTopics.map((topic) => (
                  <div
                    key={topic.topic_id}
                    style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '12px',
                      gap: '12px',
                    }}>
                      <strong style={{
                        color: '#e5e5e5',
                        fontSize: '16px',
                        flex: 1,
                      }}>
                        {topic.topic_name}
                      </strong>
                      {topic.mastery_score !== null && (
                        <span style={{
                          padding: '6px 14px',
                          background: `linear-gradient(135deg, ${getMasteryColor(topic.mastery_score)} 0%, ${getMasteryColor(topic.mastery_score)}dd 100%)`,
                          color: '#fff',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '700',
                          boxShadow: `0 4px 12px ${getMasteryColor(topic.mastery_score)}40`,
                          whiteSpace: 'nowrap',
                        }}>
                          {Math.round(topic.mastery_score * 100)}%
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(topic.mastery_score || 0) * 100}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${getMasteryColor(topic.mastery_score)} 0%, ${getMasteryColor(topic.mastery_score)}dd 100%)`,
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '13px',
                        color: getMasteryColor(topic.mastery_score),
                        fontWeight: '600',
                        minWidth: '90px',
                        textAlign: 'right',
                      }}>
                        {getMasteryLabel(topic.mastery_score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Lecture Roadmap */}
      {course.lectures && course.lectures.length > 0 && (
        <div style={{
          marginTop: '40px',
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.5s both',
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            borderBottom: '3px solid rgba(59, 130, 246, 0.5)',
            paddingBottom: '12px',
            color: '#e5e5e5',
            fontWeight: '800',
            letterSpacing: '-0.5px',
          }}>
            📅 Lecture Schedule ({course.lectures.length} lectures)
          </h3>
          <LectureRoadmap lectures={course.lectures} />
        </div>
      )}

      {/* All Events */}
      {course.events.length > 0 && (
        <div style={{
          marginTop: '40px',
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.6s both',
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            borderBottom: '3px solid rgba(245, 158, 11, 0.5)',
            paddingBottom: '12px',
            color: '#e5e5e5',
            fontWeight: '800',
            letterSpacing: '-0.5px',
          }}>
            📋 All Course Events ({course.events.length})
          </h3>
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, rgba(26, 26, 42, 0.6) 0%, rgba(26, 26, 42, 0.4) 100%)',
                }}>
                  <th style={{
                    padding: '14px',
                    textAlign: 'left',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e5e5e5',
                    fontWeight: '700',
                  }}>Type</th>
                  <th style={{
                    padding: '14px',
                    textAlign: 'left',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e5e5e5',
                    fontWeight: '700',
                  }}>Name</th>
                  <th style={{
                    padding: '14px',
                    textAlign: 'left',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e5e5e5',
                    fontWeight: '700',
                  }}>Release Date</th>
                  <th style={{
                    padding: '14px',
                    textAlign: 'left',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e5e5e5',
                    fontWeight: '700',
                  }}>Due Date</th>
                  <th style={{
                    padding: '14px',
                    textAlign: 'left',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e5e5e5',
                    fontWeight: '700',
                  }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {course.events.map((event, idx) => (
                  <tr key={event.id} style={{
                    background: idx % 2 === 0
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = idx % 2 === 0
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(255, 255, 255, 0.05)';
                  }}>
                    <td style={{
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      textTransform: 'capitalize',
                      color: '#e5e5e5',
                      fontWeight: '500',
                    }}>{event.type}</td>
                    <td style={{
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: '#e5e5e5',
                      fontWeight: '500',
                    }}>{event.name}</td>
                    <td style={{
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: '#a3a3a3',
                    }}>{formatDate(event.release_date)}</td>
                    <td style={{
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: '#a3a3a3',
                    }}>{formatDate(event.due_date)}</td>
                    <td style={{
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: '#a3a3a3',
                    }}>{formatPercent(event.weight)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.name}" (${course.code})?\n\nThis will permanently remove the course and all its data. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
