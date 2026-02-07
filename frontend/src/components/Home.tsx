import React, { useState, useEffect } from 'react';
import type { CoursesResponse, CourseWithDeadline } from '../types/syllabus';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface HomeProps {
  onNavigateToUpload: () => void;
  onNavigateToCourse: (courseId: number) => void;
}

export default function Home({ onNavigateToUpload, onNavigateToCourse }: HomeProps) {
  const [courses, setCourses] = useState<CourseWithDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`);
      const data: CoursesResponse = await res.json();

      if (data.success) {
        setCourses(data.courses);
      } else {
        setError(data.error || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Calculate days until deadline
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 7) {
      return `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    }

    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get urgency color based on days until deadline
  const getUrgencyColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 1) return '#ef4444'; // Red - urgent
    if (daysUntil <= 3) return '#f59e0b'; // Amber - soon
    if (daysUntil <= 7) return '#06b6d4'; // Cyan - upcoming
    return '#10b981'; // Green - future
  };

  // Get event type emoji
  const getEventTypeEmoji = (type: string) => {
    switch (type) {
      case 'homework': return '📝';
      case 'test': return '📋';
      case 'project': return '🚀';
      case 'quiz': return '❓';
      default: return '📌';
    }
  };

  return (
    <div style={{ width: '100%', padding: '30px 40px', boxSizing: 'border-box', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h1 style={{ margin: 0, color: '#e5e5e5' }}>My Courses</h1>
          <p style={{ margin: '5px 0 0 0', color: '#a3a3a3' }}>
            {courses.length === 0 && !isLoading ? 'No courses yet' : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onNavigateToUpload}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: '#e5e5e5',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Add New Course
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a3a3a3' }}>
          <p>Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#7f1d1d',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#e5e5e5',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '2px dashed #404040',
          }}
        >
          {/* Empty state icon removed */}
          <h2 style={{ color: '#a3a3a3', marginBottom: '10px' }}>No courses yet</h2>
          <p style={{ color: '#a3a3a3', marginBottom: '20px' }}>
            Upload your first syllabus to get started!
          </p>
          <button
            onClick={onNavigateToUpload}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: '#e5e5e5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Upload Syllabus
          </button>
        </div>
      )}

      {/* Course Cards */}
      {!isLoading && !error && courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onNavigateToCourse(course.id)}
              style={{
                backgroundColor: '#2d2d2d',
                border: '1px solid #404040',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                e.currentTarget.style.backgroundColor = '#3a3a3a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                e.currentTarget.style.backgroundColor = '#2d2d2d';
              }}
            >
              {/* Course Header */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#1e3a8a',
                    color: '#60a5fa',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  {course.code}
                </div>
                <h3 style={{ margin: '8px 0', fontSize: '18px', color: '#e5e5e5' }}>
                  {course.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#a3a3a3' }}>
                  {course.term}
                </p>
              </div>

              {/* Next Deadline */}
              <div
                style={{
                  borderTop: '1px solid #404040',
                  paddingTop: '15px',
                  marginTop: '15px',
                }}
              >
                {course.nextDeadline ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#a3a3a3', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Next Deadline
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '500', color: '#e5e5e5' }}>
                      {course.nextDeadline.name}
                    </p>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: getUrgencyColor(course.nextDeadline.dueDate),
                        color: '#e5e5e5',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatDate(course.nextDeadline.dueDate)}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#a3a3a3' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
