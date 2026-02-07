import React, { useState, useEffect } from 'react';
import type { CoursesResponse, CourseWithDeadline } from '../types/syllabus';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface HomeProps {
  onNavigateToUpload: () => void;
}

export default function Home({ onNavigateToUpload }: HomeProps) {
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

    if (daysUntil <= 1) return '#dc3545'; // Red - urgent
    if (daysUntil <= 3) return '#ffc107'; // Yellow - soon
    if (daysUntil <= 7) return '#17a2b8'; // Blue - upcoming
    return '#28a745'; // Green - future
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0 }}>My Courses</h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d' }}>
            {courses.length === 0 && !isLoading ? 'No courses yet' : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onNavigateToUpload}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Add New Course
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          <p>Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f8d7da',
            border: '1px solid #dc3545',
            borderRadius: '8px',
            color: '#721c24',
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
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6',
          }}
        >
          {/* Empty state icon removed */}
          <h2 style={{ color: '#6c757d', marginBottom: '10px' }}>No courses yet</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Upload your first syllabus to get started!
          </p>
          <button
            onClick={onNavigateToUpload}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* Course Header */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#e7f3ff',
                    color: '#0066cc',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  {course.code}
                </div>
                <h3 style={{ margin: '8px 0', fontSize: '18px', color: '#343a40' }}>
                  {course.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#6c757d' }}>
                  {course.term}
                </p>
              </div>

              {/* Next Deadline */}
              <div
                style={{
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '15px',
                  marginTop: '15px',
                }}
              >
                {course.nextDeadline ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Next Deadline
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '500', color: '#343a40' }}>
                      {course.nextDeadline.name}
                    </p>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: getUrgencyColor(course.nextDeadline.dueDate),
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatDate(course.nextDeadline.dueDate)}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#6c757d' }}>
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
