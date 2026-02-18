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
          border: '2px solid #10b981',
          borderRadius: '8px',
          backgroundColor: '#065f46',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', color: '#e5e5e5' }}>
          Syllabus Analyzed Successfully
        </h2>
        <p style={{ margin: '0', color: '#e5e5e5' }}>{message}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#e5e5e5' }}>
          <strong>Database ID:</strong> {courseId}
        </p>
      </div>

      {/* Course Information */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #404040',
          borderRadius: '8px',
          backgroundColor: '#2d2d2d',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#e5e5e5', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
          Course Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <strong style={{ color: '#e5e5e5' }}>Course Name:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px', color: '#e5e5e5' }}>{course.name}</p>
          </div>
          <div>
            <strong style={{ color: '#e5e5e5' }}>Course Code:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px', color: '#e5e5e5' }}>{course.code}</p>
          </div>
          <div>
            <strong style={{ color: '#e5e5e5' }}>Term:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px', color: '#e5e5e5' }}>{course.term}</p>
          </div>
          <div>
            <strong style={{ color: '#e5e5e5' }}>Units:</strong>
            <p style={{ margin: '5px 0', fontSize: '16px', color: '#e5e5e5' }}>{course.units ?? 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Grading Breakdown */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #404040',
          borderRadius: '8px',
          backgroundColor: '#2d2d2d',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#e5e5e5', borderBottom: '2px solid #10b981', paddingBottom: '8px' }}>
          Grading Breakdown
        </h3>
        <div style={{ marginTop: '15px' }}>
          {grading.homework !== null && (
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ width: '150px', color: '#e5e5e5' }}>Homework:</strong>
              <div style={{ flex: 1, backgroundColor: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.homework}%`,
                    backgroundColor: '#3b82f6',
                    color: '#e5e5e5',
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
              <strong style={{ width: '150px', color: '#e5e5e5' }}>Tests:</strong>
              <div style={{ flex: 1, backgroundColor: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.tests}%`,
                    backgroundColor: '#ef4444',
                    color: '#e5e5e5',
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
              <strong style={{ width: '150px', color: '#e5e5e5' }}>Project:</strong>
              <div style={{ flex: 1, backgroundColor: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.project}%`,
                    backgroundColor: '#f59e0b',
                    color: '#0a0a0a',
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
              <strong style={{ width: '150px', color: '#e5e5e5' }}>Quizzes:</strong>
              <div style={{ flex: 1, backgroundColor: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${grading.quizzes}%`,
                    backgroundColor: '#06b6d4',
                    color: '#e5e5e5',
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
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#a3a3a3' }}>
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
            border: '1px solid #404040',
            borderRadius: '8px',
            backgroundColor: '#2d2d2d',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#e5e5e5', borderBottom: '2px solid #f59e0b', paddingBottom: '8px' }}>
            Course Events ({events.length})
          </h3>

          {Object.entries(groupedEvents).map(([type, eventList]) => (
            <div key={type} style={{ marginTop: '20px' }}>
              <h4 style={{ textTransform: 'capitalize', color: '#a3a3a3', marginBottom: '10px' }}>
                {type}s ({eventList.length})
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a1a1a' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Release Date</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Due Date</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #404040', color: '#e5e5e5' }}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventList.map((event, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#2d2d2d' : '#1a1a1a' }}>
                        <td style={{ padding: '8px', border: '1px solid #404040', color: '#e5e5e5' }}>{event.name}</td>
                        <td style={{ padding: '8px', border: '1px solid #404040', color: '#a3a3a3' }}>{formatDate(event.release_date)}</td>
                        <td style={{ padding: '8px', border: '1px solid #404040', color: '#a3a3a3' }}>{formatDate(event.due_date)}</td>
                        <td style={{ padding: '8px', border: '1px solid #404040', color: '#a3a3a3' }}>{formatPercent(event.weight)}</td>
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
          border: '1px solid #404040',
          borderRadius: '8px',
          backgroundColor: '#2d2d2d',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#e5e5e5', borderBottom: '2px solid #8b5cf6', paddingBottom: '8px' }}>
          Course Policies
        </h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#e5e5e5' }}>Late Days Policy:</strong>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#a3a3a3' }}>
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
            <strong style={{ color: '#e5e5e5' }}>Generative AI Policy:</strong>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#a3a3a3' }}>
              {policies.genai_allowed !== null ? (
                <span>
                  <strong style={{ color: policies.genai_allowed ? '#10b981' : '#ef4444' }}>
                    {policies.genai_allowed ? 'Allowed' : 'Not Allowed'}
                  </strong>
                  {policies.genai_notes && (
                    <span style={{ marginLeft: '10px', color: '#a3a3a3' }}>
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
