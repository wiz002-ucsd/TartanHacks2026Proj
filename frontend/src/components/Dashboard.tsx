import { useState, useEffect } from 'react';
import { theme } from '../theme';

interface UpcomingTask {
  name: string;
  type: string;
  due_date: string;
  days_until: number;
  weight: number;
}

interface Course {
  name: string;
  code: string;
  instructor: string;
  upcoming_count: number;
  upcoming: UpcomingTask[];
  load_estimate: string;
}

interface PriorityTask {
  task: string;
  reason: string;
  deadline: string;
  course: string;
}

interface AIAnalysis {
  summary: string;
  risks: string[];
  recommendations: string[];
  priority_order: PriorityTask[];
  study_tips: string[];
}

interface DashboardData {
  snapshot: {
    student_overview: {
      active_courses: number;
      upcoming_deadlines: number;
      high_risk_window: boolean;
      high_risk_weeks: string[];
      snapshot_date: string;
    };
    courses: Course[];
  };
  analysis: AIAnalysis;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/ai-advisor');

      if (!response.ok) {
        throw new Error('Failed to fetch AI advisor data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (daysUntil: number): string => {
    if (daysUntil <= 1) return theme.urgency.urgent;
    if (daysUntil <= 3) return theme.urgency.soon;
    if (daysUntil <= 7) return theme.urgency.upcoming;
    return theme.urgency.future;
  };

  const getLoadColor = (load: string): string => {
    switch (load) {
      case 'high': return theme.urgency.urgent;
      case 'medium': return theme.urgency.soon;
      case 'low': return theme.urgency.future;
      default: return theme.colors.text.secondary;
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: theme.colors.text.primary,
        fontSize: '18px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: `4px solid ${theme.colors.bg.elevated}`,
          borderTop: `4px solid ${theme.colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px' }}>🧠 AI is analyzing your academic workload...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: theme.colors.danger
      }}>
        <h2>⚠️ Error Loading Dashboard</h2>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.primary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { snapshot, analysis } = data;

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: theme.colors.bg.primary,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          color: theme.colors.text.primary,
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          📊 Your Academic Dashboard
        </h1>
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: '16px',
          margin: 0
        }}>
          AI-powered insights and recommendations • Updated {new Date(snapshot.student_overview.snapshot_date).toLocaleDateString()}
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: theme.colors.bg.elevated,
          padding: '24px',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.primary}`
        }}>
          <div style={{ fontSize: '14px', color: theme.colors.text.secondary, marginBottom: '8px' }}>
            Active Courses
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.primary }}>
            {snapshot.student_overview.active_courses}
          </div>
        </div>

        <div style={{
          backgroundColor: theme.colors.bg.elevated,
          padding: '24px',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.primary}`
        }}>
          <div style={{ fontSize: '14px', color: theme.colors.text.secondary, marginBottom: '8px' }}>
            Upcoming Deadlines
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: theme.urgency.soon }}>
            {snapshot.student_overview.upcoming_deadlines}
          </div>
        </div>

        <div style={{
          backgroundColor: theme.colors.bg.elevated,
          padding: '24px',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${snapshot.student_overview.high_risk_window ? theme.urgency.urgent : theme.colors.border.primary}`
        }}>
          <div style={{ fontSize: '14px', color: theme.colors.text.secondary, marginBottom: '8px' }}>
            Workload Status
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: snapshot.student_overview.high_risk_window ? theme.urgency.urgent : theme.urgency.future
          }}>
            {snapshot.student_overview.high_risk_window ? '⚠️ High Pressure' : '✅ Manageable'}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div style={{
        backgroundColor: theme.colors.bg.elevated,
        padding: '30px',
        borderRadius: theme.borderRadius.lg,
        marginBottom: '30px',
        border: `2px solid ${theme.colors.primary}`,
        boxShadow: theme.shadows.glow
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🧠 AI Summary
        </h2>
        <p style={{
          color: theme.colors.text.primary,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: 0
        }}>
          {analysis.summary}
        </p>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Priority Tasks */}
        <div style={{
          backgroundColor: theme.colors.bg.elevated,
          padding: '30px',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.primary}`
        }}>
          <h2 style={{
            color: theme.colors.text.primary,
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🎯 Priority Order
          </h2>

          {analysis.priority_order.map((task, index) => (
            <div key={index} style={{
              backgroundColor: theme.colors.bg.primary,
              padding: '16px',
              borderRadius: theme.borderRadius.md,
              marginBottom: '12px',
              border: `2px solid ${index === 0 ? theme.urgency.urgent : theme.colors.border.primary}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                    marginBottom: '4px'
                  }}>
                    {index + 1}. {task.task}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.text.secondary
                  }}>
                    {task.course}
                  </div>
                </div>
                <div style={{
                  backgroundColor: getUrgencyColor(parseInt(task.deadline.match(/\d+/)?.[0] || '14')),
                  color: theme.colors.text.inverse,
                  padding: '4px 12px',
                  borderRadius: theme.borderRadius.pill,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {task.deadline}
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                lineHeight: '1.5'
              }}>
                {task.reason}
              </div>
            </div>
          ))}
        </div>

        {/* Risks to Watch */}
        <div style={{
          backgroundColor: theme.colors.bg.elevated,
          padding: '30px',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.primary}`
        }}>
          <h2 style={{
            color: theme.colors.text.primary,
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚠️ What to Watch Out For
          </h2>

          {analysis.risks.map((risk, index) => (
            <div key={index} style={{
              backgroundColor: theme.colors.status.error,
              padding: '16px',
              borderRadius: theme.borderRadius.md,
              marginBottom: '12px',
              borderLeft: `4px solid ${theme.urgency.urgent}`
            }}>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.primary,
                lineHeight: '1.5'
              }}>
                <strong>Risk {index + 1}:</strong> {risk.replace(/^Risk \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{
        backgroundColor: theme.colors.bg.elevated,
        padding: '30px',
        borderRadius: theme.borderRadius.lg,
        marginBottom: '30px',
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ✅ Recommendations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {analysis.recommendations.map((rec, index) => (
            <div key={index} style={{
              backgroundColor: theme.colors.bg.primary,
              padding: '16px',
              borderRadius: theme.borderRadius.md,
              borderLeft: `4px solid ${theme.colors.success}`,
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                color: theme.colors.success,
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.primary,
                lineHeight: '1.5',
                flex: 1
              }}>
                {rec.replace(/^Action \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div style={{
        backgroundColor: theme.colors.bg.elevated,
        padding: '30px',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          💡 Study Tips
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '12px'
        }}>
          {analysis.study_tips.map((tip, index) => (
            <div key={index} style={{
              backgroundColor: theme.colors.bg.primary,
              padding: '16px',
              borderRadius: theme.borderRadius.md,
              borderLeft: `4px solid ${theme.colors.info}`
            }}>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.primary,
                lineHeight: '1.5'
              }}>
                {tip.replace(/^Tip \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Load Overview */}
      <div style={{
        backgroundColor: theme.colors.bg.elevated,
        padding: '30px',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 20px 0'
        }}>
          📚 Course Load Overview
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {snapshot.courses.map((course, index) => (
            <div key={index} style={{
              backgroundColor: theme.colors.bg.primary,
              padding: '20px',
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border.primary}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                    marginBottom: '4px'
                  }}>
                    {course.code}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.text.secondary
                  }}>
                    {course.name}
                  </div>
                </div>
                <div style={{
                  backgroundColor: getLoadColor(course.load_estimate),
                  color: theme.colors.text.inverse,
                  padding: '4px 12px',
                  borderRadius: theme.borderRadius.pill,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {course.load_estimate}
                </div>
              </div>

              <div style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                marginBottom: '12px'
              }}>
                {course.upcoming_count} upcoming {course.upcoming_count === 1 ? 'deadline' : 'deadlines'}
              </div>

              {course.upcoming.slice(0, 2).map((task, taskIndex) => (
                <div key={taskIndex} style={{
                  backgroundColor: theme.colors.bg.elevated,
                  padding: '8px 12px',
                  borderRadius: theme.borderRadius.sm,
                  marginTop: '8px',
                  fontSize: '13px',
                  color: theme.colors.text.primary
                }}>
                  <div style={{ fontWeight: 'bold' }}>{task.name}</div>
                  <div style={{
                    color: getUrgencyColor(task.days_until),
                    fontSize: '12px',
                    marginTop: '4px'
                  }}>
                    Due in {task.days_until} {task.days_until === 1 ? 'day' : 'days'} • {task.weight}%
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={fetchDashboardData}
          style={{
            padding: '12px 24px',
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.primary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary;
          }}
        >
          🔄 Refresh Analysis
        </button>
      </div>
    </div>
  );
}
