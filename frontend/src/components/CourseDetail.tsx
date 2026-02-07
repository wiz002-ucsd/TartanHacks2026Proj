import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
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
      <div style={{ width: '100%', padding: '30px 40px', boxSizing: 'border-box', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '18px', color: '#a3a3a3' }}>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ width: '100%', padding: '30px 40px', boxSizing: 'border-box', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          ← Back to Courses
        </button>
        <div style={{
          padding: '20px',
          backgroundColor: '#7f1d1d',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#e5e5e5',
        }}>
          <strong>Error:</strong> {error || 'Course not found'}
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
  const policies = course.course_policies ?? {
    late_days_total: null,
    late_days_per_hw: null,
    genai_allowed: null,
    genai_notes: null,
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
    <div style={{ width: '100%', padding: '30px 40px', boxSizing: 'border-box', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← Back to Courses
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          style={{
            padding: '8px 16px',
            backgroundColor: isDeleting ? '#737373' : '#ef4444',
            color: '#e5e5e5',
            border: 'none',
            borderRadius: '4px',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: isDeleting ? 0.6 : 1,
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete Course'}
        </button>
      </div>

      {/* Course Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          backgroundColor: '#1e3a8a',
          color: '#60a5fa',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '12px',
        }}>
          {course.code}
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#e5e5e5' }}>{course.name}</h1>
        <p style={{ margin: '0', fontSize: '16px', color: '#a3a3a3' }}>
          {course.term} {course.units && `• ${course.units} units`}
        </p>
      </div>

      {/* Priority Deadlines (Next 2 Weeks) */}
      {upcomingEvents.length > 0 && (
        <div style={{
          padding: '24px',
          backgroundColor: '#78350f',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          marginBottom: '30px',
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#e5e5e5' }}>
            Priority: Upcoming Deadlines (Next 2 Weeks)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingEvents.map((event) => {
              const daysUntil = getDaysUntil(event.due_date!);
              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: '#404040',
                        color: '#e5e5e5',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                      }}>
                        {event.type}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e5e5e5' }}>{event.name}</h3>
                    </div>
                    {event.weight !== null && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#a3a3a3' }}>
                        Weight: {event.weight}%
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: getUrgencyColor(daysUntil),
                      color: '#e5e5e5',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#a3a3a3' }}>
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
          padding: '24px',
          backgroundColor: '#065f46',
          border: '2px solid #10b981',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#e5e5e5' }}>
            No deadlines in the next 2 weeks
          </p>
        </div>
      )}

      {/* Course Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Grading Breakdown */}
        <div style={{
          padding: '20px',
          backgroundColor: '#2d2d2d',
          border: '1px solid #404040',
          borderRadius: '12px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: '2px solid #10b981', paddingBottom: '8px', color: '#e5e5e5' }}>
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

        {/* Course Policies */}
        <div style={{
          padding: '20px',
          backgroundColor: '#2d2d2d',
          border: '1px solid #404040',
          borderRadius: '12px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: '2px solid #8b5cf6', paddingBottom: '8px', color: '#e5e5e5' }}>
            Course Policies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <strong style={{ color: '#e5e5e5' }}>Late Days:</strong>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#a3a3a3' }}>
                {policies.late_days_total !== null ? `${policies.late_days_total} total` : 'Not specified'}
                {policies.late_days_per_hw !== null && ` (${policies.late_days_per_hw} per assignment)`}
              </p>
            </div>
            <div>
              <strong style={{ color: '#e5e5e5' }}>Generative AI:</strong>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <span style={{ color: policies.genai_allowed ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {policies.genai_allowed !== null ? (policies.genai_allowed ? 'Allowed' : 'Not Allowed') : 'Not specified'}
                </span>
              </p>
              {policies.genai_notes && (
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#a3a3a3' }}>
                  {policies.genai_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lecture Roadmap */}
      {course.lectures && course.lectures.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#2d2d2d',
          border: '1px solid #404040',
          borderRadius: '12px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: '2px solid #3b82f6', paddingBottom: '8px', color: '#e5e5e5' }}>
            Lecture Schedule ({course.lectures.length} lectures)
          </h3>
          <LectureRoadmap lectures={course.lectures} />
        </div>
      )}

      {/* All Events */}
      {course.events.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#2d2d2d',
          border: '1px solid #404040',
          borderRadius: '12px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: '2px solid #f59e0b', paddingBottom: '8px', color: '#e5e5e5' }}>
            All Course Events ({course.events.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1a1a' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Release Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Due Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {course.events.map((event, idx) => (
                  <tr key={event.id} style={{ backgroundColor: idx % 2 === 0 ? '#2d2d2d' : '#1a1a1a' }}>
                    <td style={{ padding: '12px', border: '1px solid #404040', textTransform: 'capitalize', color: '#e5e5e5' }}>{event.type}</td>
                    <td style={{ padding: '12px', border: '1px solid #404040', color: '#e5e5e5' }}>{event.name}</td>
                    <td style={{ padding: '12px', border: '1px solid #404040', color: '#a3a3a3' }}>{formatDate(event.release_date)}</td>
                    <td style={{ padding: '12px', border: '1px solid #404040', color: '#a3a3a3' }}>{formatDate(event.due_date)}</td>
                    <td style={{ padding: '12px', border: '1px solid #404040', color: '#a3a3a3' }}>{formatPercent(event.weight)}</td>
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
