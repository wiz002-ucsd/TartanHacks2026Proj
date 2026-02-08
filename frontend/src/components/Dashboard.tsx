import { useState, useEffect } from 'react';
import { theme } from '../theme';

const API_BASE_URL = 'http://localhost:3001';

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
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching AI advisor data...');
        const response = await fetch(`${API_BASE_URL}/api/ai-advisor`);

        if (!response.ok) {
          throw new Error('Failed to fetch AI advisor data');
        }

        const result = await response.json();
        console.log('✅ AI advisor data received:', result.snapshot?.student_overview);

        // Only update state if component is still mounted
        if (isMounted) {
          setData(result);
          console.log('✅ Data state updated successfully');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function - just mark component as unmounted
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Manual refresh: Fetching AI advisor data...');
      const response = await fetch(`${API_BASE_URL}/api/ai-advisor`);

      if (!response.ok) {
        throw new Error('Failed to fetch AI advisor data');
      }

      const result = await response.json();
      console.log('✅ AI advisor data received:', result.snapshot?.student_overview);
      setData(result);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
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
        padding: '80px 40px',
        textAlign: 'center',
        color: theme.colors.text.primary,
        fontSize: '18px',
        background: 'transparent',
      }}>
        <div style={{
          display: 'inline-block',
          width: '70px',
          height: '70px',
          border: '4px solid rgba(59, 130, 246, 0.2)',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px',
        }} />
        <p style={{
          marginTop: '20px',
          fontSize: '20px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🧠 AI is analyzing your academic workload...
        </p>
        <p style={{
          marginTop: '12px',
          fontSize: '15px',
          color: '#a3a3a3',
          fontWeight: '500',
        }}>
          This may take a few moments
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
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
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        color: theme.colors.danger,
        animation: 'fadeIn 0.5s ease-in',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          opacity: 0.8,
        }}>
          ⚠️
        </div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#e5e5e5',
        }}>
          Error Loading Dashboard
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#a3a3a3',
          maxWidth: '500px',
          margin: '0 auto 30px',
        }}>
          {error}
        </p>
        <button
          onClick={fetchDashboardData}
          style={{
            marginTop: '20px',
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
          }}
        >
          🔄 Try Again
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
      padding: '50px',
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: 'transparent',
      minHeight: '100vh',
      animation: 'fadeIn 0.6s ease-in',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '40px',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <h1 style={{
          color: theme.colors.text.primary,
          fontSize: '40px',
          fontWeight: '800',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #fff 0%, #a3a3a3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
        }}>
          Your Academic Dashboard
        </h1>
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: '16px',
          margin: 0,
          fontWeight: '500',
        }}>
          AI-powered insights and recommendations • Updated {new Date(snapshot.student_overview.snapshot_date).toLocaleDateString()}
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          animation: 'slideUp 0.5s ease-out 0.1s both',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.15)';
        }}>
          <div style={{
            fontSize: '13px',
            color: theme.colors.text.secondary,
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Active Courses
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {snapshot.student_overview.active_courses}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          animation: 'slideUp 0.5s ease-out 0.2s both',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.15)';
        }}>
          <div style={{
            fontSize: '13px',
            color: theme.colors.text.secondary,
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Upcoming Deadlines
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {snapshot.student_overview.upcoming_deadlines}
          </div>
        </div>

        <div style={{
          background: snapshot.student_overview.high_risk_window
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          padding: '28px',
          borderRadius: '20px',
          border: `1px solid ${snapshot.student_overview.high_risk_window ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          boxShadow: snapshot.student_overview.high_risk_window
            ? '0 8px 32px rgba(239, 68, 68, 0.15)'
            : '0 8px 32px rgba(16, 185, 129, 0.15)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          animation: 'slideUp 0.5s ease-out 0.3s both',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = snapshot.student_overview.high_risk_window
            ? '0 12px 40px rgba(239, 68, 68, 0.25)'
            : '0 12px 40px rgba(16, 185, 129, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = snapshot.student_overview.high_risk_window
            ? '0 8px 32px rgba(239, 68, 68, 0.15)'
            : '0 8px 32px rgba(16, 185, 129, 0.15)';
        }}>
          <div style={{
            fontSize: '13px',
            color: theme.colors.text.secondary,
            marginBottom: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Workload Status
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: snapshot.student_overview.high_risk_window ? theme.urgency.urgent : theme.urgency.future,
          }}>
            {snapshot.student_overview.high_risk_window ? '⚠️ High Pressure' : '✅ Manageable'}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        padding: '36px',
        borderRadius: '24px',
        marginBottom: '40px',
        border: '2px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideUp 0.6s ease-out 0.4s both',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
        }} />
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '26px',
          fontWeight: '800',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          letterSpacing: '-0.5px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            🧠 AI Summary
          </span>
        </h2>
        <p style={{
          color: theme.colors.text.primary,
          fontSize: '17px',
          lineHeight: '1.8',
          margin: 0,
          fontWeight: '400',
        }}>
          {analysis.summary}
        </p>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        marginBottom: '40px',
      }}>
        {/* Priority Tasks */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
          padding: '32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.5s both',
        }}>
          <h2 style={{
            color: theme.colors.text.primary,
            fontSize: '22px',
            fontWeight: '800',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '-0.5px',
          }}>
            🎯 Priority Order
          </h2>

          {analysis.priority_order.map((task, index) => (
            <div key={index} style={{
              background: index === 0
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '14px',
              border: index === 0 ? '2px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: index === 0 ? '0 4px 20px rgba(239, 68, 68, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = index === 0
                ? '0 6px 24px rgba(239, 68, 68, 0.3)'
                : '0 4px 16px rgba(59, 130, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = index === 0
                ? '0 4px 20px rgba(239, 68, 68, 0.2)'
                : '0 2px 8px rgba(0, 0, 0, 0.2)';
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '10px',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '17px',
                    fontWeight: '700',
                    color: theme.colors.text.primary,
                    marginBottom: '6px',
                    lineHeight: '1.3',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: index === 0
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#fff',
                      textAlign: 'center',
                      lineHeight: '26px',
                      fontSize: '14px',
                      fontWeight: '700',
                      marginRight: '10px',
                    }}>
                      {index + 1}
                    </span>
                    {task.task}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.text.secondary,
                    fontWeight: '500',
                    marginLeft: '36px',
                  }}>
                    {task.course}
                  </div>
                </div>
                <div style={{
                  background: `linear-gradient(135deg, ${getUrgencyColor(parseInt(task.deadline.match(/\d+/)?.[0] || '14'))} 0%, ${getUrgencyColor(parseInt(task.deadline.match(/\d+/)?.[0] || '14'))}dd 100%)`,
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 4px 12px ${getUrgencyColor(parseInt(task.deadline.match(/\d+/)?.[0] || '14'))}40`,
                }}>
                  {task.deadline}
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.secondary,
                lineHeight: '1.6',
                marginLeft: '36px',
                fontWeight: '400',
              }}>
                {task.reason}
              </div>
            </div>
          ))}
        </div>

        {/* Risks to Watch */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
          padding: '32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.6s ease-out 0.6s both',
        }}>
          <h2 style={{
            color: theme.colors.text.primary,
            fontSize: '22px',
            fontWeight: '800',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '-0.5px',
          }}>
            ⚠️ What to Watch Out For
          </h2>

          {analysis.risks.map((risk, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              padding: '18px 20px',
              borderRadius: '16px',
              marginBottom: '14px',
              borderLeft: '4px solid rgba(239, 68, 68, 0.6)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.15)';
            }}>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.primary,
                lineHeight: '1.6',
                fontWeight: '500',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  textAlign: 'center',
                  lineHeight: '24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginRight: '10px',
                }}>
                  {index + 1}
                </span>
                {risk.replace(/^Risk \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
        padding: '32px',
        borderRadius: '24px',
        marginBottom: '40px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        animation: 'slideUp 0.6s ease-out 0.7s both',
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '22px',
          fontWeight: '800',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          letterSpacing: '-0.5px',
        }}>
          ✅ Recommendations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {analysis.recommendations.map((rec, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              padding: '18px 20px',
              borderRadius: '16px',
              borderLeft: '4px solid rgba(16, 185, 129, 0.6)',
              display: 'flex',
              gap: '16px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.1)';
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {index + 1}
              </div>
              <div style={{
                fontSize: '15px',
                color: theme.colors.text.primary,
                lineHeight: '1.6',
                flex: 1,
                fontWeight: '400',
              }}>
                {rec.replace(/^Action \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
        padding: '32px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        marginBottom: '40px',
        animation: 'slideUp 0.6s ease-out 0.8s both',
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '22px',
          fontWeight: '800',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          letterSpacing: '-0.5px',
        }}>
          💡 Study Tips
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {analysis.study_tips.map((tip, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
              padding: '18px 20px',
              borderRadius: '16px',
              borderLeft: '4px solid rgba(6, 182, 212, 0.6)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 182, 212, 0.1)';
            }}>
              <div style={{
                fontSize: '14px',
                color: theme.colors.text.primary,
                lineHeight: '1.6',
                fontWeight: '400',
              }}>
                <span style={{
                  fontSize: '18px',
                  marginRight: '8px',
                }}>
                  💡
                </span>
                {tip.replace(/^Tip \d+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Load Overview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(45, 45, 61, 0.4) 0%, rgba(30, 30, 46, 0.2) 100%)',
        padding: '32px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        marginBottom: '40px',
        animation: 'slideUp 0.6s ease-out 0.9s both',
      }}>
        <h2 style={{
          color: theme.colors.text.primary,
          fontSize: '22px',
          fontWeight: '800',
          margin: '0 0 24px 0',
          letterSpacing: '-0.5px',
        }}>
          📚 Course Load Overview
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {snapshot.courses.map((course, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              padding: '24px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '14px',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '19px',
                    fontWeight: '700',
                    color: theme.colors.text.primary,
                    marginBottom: '6px',
                  }}>
                    {course.code}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.text.secondary,
                    fontWeight: '500',
                    lineHeight: '1.4',
                  }}>
                    {course.name}
                  </div>
                </div>
                <div style={{
                  background: `linear-gradient(135deg, ${getLoadColor(course.load_estimate)} 0%, ${getLoadColor(course.load_estimate)}dd 100%)`,
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: `0 4px 12px ${getLoadColor(course.load_estimate)}40`,
                  flexShrink: 0,
                }}>
                  {course.load_estimate}
                </div>
              </div>

              <div style={{
                fontSize: '13px',
                color: theme.colors.text.secondary,
                marginBottom: '14px',
                fontWeight: '500',
              }}>
                {course.upcoming_count} upcoming {course.upcoming_count === 1 ? 'deadline' : 'deadlines'}
              </div>

              {course.upcoming.slice(0, 2).map((task, taskIndex) => (
                <div key={taskIndex} style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  marginTop: '10px',
                  fontSize: '13px',
                  color: theme.colors.text.primary,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  <div style={{
                    fontWeight: '600',
                    marginBottom: '6px',
                  }}>
                    {task.name}
                  </div>
                  <div style={{
                    color: getUrgencyColor(task.days_until),
                    fontSize: '12px',
                    fontWeight: '600',
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
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        animation: 'fadeIn 1s ease-in',
      }}>
        <button
          onClick={fetchDashboardData}
          style={{
            padding: '14px 36px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
          }}
        >
          🔄 Refresh Analysis
        </button>
      </div>
    </div>
  );
}
