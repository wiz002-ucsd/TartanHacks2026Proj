import React from 'react';
import type { SyllabusData, Event } from '../types/syllabus';

interface SyllabusSummaryProps {
  data: SyllabusData;
  courseId: number;
  message: string;
}

export default function SyllabusSummary({ data, courseId, message }: SyllabusSummaryProps) {
  const { course, grading, events, policies } = data;

  // Helper to format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to format percentages
  const formatPercent = (value: number | null) => {
    return value !== null ? `${value}%` : 'N/A';
  };

  // Group events by type
  const groupEventsByType = (events: Event[]) => {
    const grouped: { [key: string]: Event[] } = {};
    events.forEach(event => {
      if (!grouped[event.type]) {
        grouped[event.type] = [];
      }
      grouped[event.type].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByType(events);

  // Calculate total grading percentage
  const totalGrading = [grading.homework, grading.tests, grading.project, grading.quizzes]
    .filter(v => v !== null)
    .reduce((sum, v) => sum + v!, 0);

  return (
    <div style={{ marginTop: '30px' }}>
      {/* Success Banner */}
      <div
        style={{
          padding: '20px',
          border: '2px solid #28a745',
          borderRadius: '8px',
          backgroundColor: '#d4edda',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', color: '#155724' }}>
          Syllabus Analyzed Successfully
        </h2>
        <p style={{ margin: '0', color: '#155724' }}>{message}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#155724' }}>
          <strong>Database ID:</strong> {courseId}
        </p>
      </div>

      {/* Course Information */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#343a40', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
          Course Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <strong>Course Name:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>{course.name}</p>
          </div>
          <div>
            <strong>Course Code:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>{course.code}</p>
          </div>
          <div>
            <strong>Term:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>{course.term}</p>
          </div>
          <div>
            <strong>Units:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>{course.units ?? 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Grading Breakdown */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#343a40', borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
          Grading Breakdown
        </h3>
        <div style={{ marginTop: '15px' }}>
          {grading.homework !== null && (
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ width: '150px' }}>Homework:</strong>
              <div style={{ flex: 1, backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.homework}%`,
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {formatPercent(grading.homework)}
                </div>
              </div>
            </div>
          )}
          {grading.tests !== null && (
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ width: '150px' }}>Tests:</strong>
              <div style={{ flex: 1, backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.tests}%`,
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {formatPercent(grading.tests)}
                </div>
              </div>
            </div>
          )}
          {grading.project !== null && (
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ width: '150px' }}>Project:</strong>
              <div style={{ flex: 1, backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.project}%`,
                    backgroundColor: '#ffc107',
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {formatPercent(grading.project)}
                </div>
              </div>
            </div>
          )}
          {grading.quizzes !== null && (
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ width: '150px' }}>Quizzes:</strong>
              <div style={{ flex: 1, backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.quizzes}%`,
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {formatPercent(grading.quizzes)}
                </div>
              </div>
            </div>
          )}
          {totalGrading > 0 && (
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#6c757d' }}>
              <strong>Total:</strong> {totalGrading}%
            </p>
          )}
        </div>
      </div>

      {/* Course Events */}
      {events.length > 0 && (
        <div
          style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#343a40', borderBottom: '2px solid #ffc107', paddingBottom: '8px' }}>
            Course Events ({events.length})
          </h3>

          {Object.entries(groupedEvents).map(([type, eventList]) => (
            <div key={type} style={{ marginTop: '20px' }}>
              <h4 style={{ textTransform: 'capitalize', color: '#495057', marginBottom: '10px' }}>
                {type}s ({eventList.length})
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Release Date</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Due Date</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #dee2e6' }}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventList.map((event, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa' }}>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{event.name}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{formatDate(event.release_date)}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{formatDate(event.due_date)}</td>
                        <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{formatPercent(event.weight)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Policies */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#343a40', borderBottom: '2px solid #6f42c1', paddingBottom: '8px' }}>
          Course Policies
        </h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Late Days Policy:</strong>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              {policies.late_days_total !== null && (
                <span>Total late days: <strong>{policies.late_days_total}</strong></span>
              )}
              {policies.late_days_total !== null && policies.late_days_per_hw !== null && ' | '}
              {policies.late_days_per_hw !== null && (
                <span>Per assignment: <strong>{policies.late_days_per_hw}</strong></span>
              )}
              {policies.late_days_total === null && policies.late_days_per_hw === null && 'Not specified'}
            </p>
          </div>
          <div>
            <strong>Generative AI Policy:</strong>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              {policies.genai_allowed !== null ? (
                <span>
                  <strong style={{ color: policies.genai_allowed ? '#28a745' : '#dc3545' }}>
                    {policies.genai_allowed ? 'Allowed' : 'Not Allowed'}
                  </strong>
                  {policies.genai_notes && (
                    <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                      - {policies.genai_notes}
                    </span>
                  )}
                </span>
              ) : (
                'Not specified'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
