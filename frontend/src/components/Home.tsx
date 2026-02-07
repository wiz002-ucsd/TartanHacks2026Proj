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
    <div style={{
      width: '100%',
      padding: '40px 50px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: 'transparent',
      animation: 'fadeIn 0.5s ease-in',
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
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}
      </style>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px',
        width: '100%',
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <h1 style={{
            margin: 0,
            color: '#e5e5e5',
            fontSize: '36px',
            fontWeight: '800',
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #fff 0%, #a3a3a3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            My Courses
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#a3a3a3',
            fontSize: '16px',
            fontWeight: '500',
          }}>
            {courses.length === 0 && !isLoading ? 'No courses yet' : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onNavigateToUpload}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
          }}
        >
          + Add New Course
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#a3a3a3',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
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
            `}
          </style>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          style={{
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(127, 29, 29, 0.1) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '16px',
            color: '#e5e5e5',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <strong style={{ fontSize: '18px' }}>Error</strong>
          </div>
          <p style={{ margin: '0', fontSize: '15px', opacity: 0.9 }}>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: '20px',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.6s ease-out',
          }}
        >
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
            opacity: 0.6,
          }}>
            📚
          </div>
          <h2 style={{
            color: '#e5e5e5',
            marginBottom: '12px',
            fontSize: '24px',
            fontWeight: '700',
          }}>
            No courses yet
          </h2>
          <p style={{
            color: '#a3a3a3',
            marginBottom: '30px',
            fontSize: '16px',
            maxWidth: '400px',
            margin: '0 auto 30px',
          }}>
            Upload your first syllabus to get started with your academic journey!
          </p>
          <button
            onClick={onNavigateToUpload}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            Upload Syllabus
          </button>
        </div>
      )}

      {/* Course Cards */}
      {!isLoading && !error && courses.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '28px',
          animation: 'slideUp 0.6s ease-out',
        }}>
          {courses.map((course, index) => (
            <div
              key={course.id}
              onClick={() => onNavigateToCourse(course.id)}
              style={{
                background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.6) 0%, rgba(30, 30, 46, 0.4) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                borderRadius: '20px 20px 0 0',
              }} />

              {/* Course Header */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    borderRadius: '25px',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '14px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {course.code}
                </div>
                <h3 style={{
                  margin: '10px 0',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#e5e5e5',
                  lineHeight: '1.3',
                }}>
                  {course.name}
                </h3>
                <p style={{
                  margin: '6px 0 0 0',
                  fontSize: '14px',
                  color: '#a3a3a3',
                  fontWeight: '500',
                }}>
                  {course.term}
                </p>
              </div>

              {/* Next Deadline */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '20px',
                  marginTop: '20px',
                }}
              >
                {course.nextDeadline ? (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}>
                      <span style={{
                        fontSize: '11px',
                        color: '#a3a3a3',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        letterSpacing: '1px',
                      }}>
                        Next Deadline
                      </span>
                    </div>
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#e5e5e5',
                    }}>
                      {course.nextDeadline.name}
                    </p>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: `linear-gradient(135deg, ${getUrgencyColor(course.nextDeadline.dueDate)} 0%, ${getUrgencyColor(course.nextDeadline.dueDate)}dd 100%)`,
                        color: '#fff',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '700',
                        boxShadow: `0 4px 12px ${getUrgencyColor(course.nextDeadline.dueDate)}40`,
                      }}
                    >
                      {formatDate(course.nextDeadline.dueDate)}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px 0',
                    color: '#a3a3a3',
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '12px',
                  }}>
                    <span style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}>✓</span>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      No upcoming deadlines
                    </p>
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
