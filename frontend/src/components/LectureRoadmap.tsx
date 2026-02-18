
interface Lecture {
  id: number;
  lecture_number: number;
  title: string;
  date: string | null;
  topics: string[];
  description: string | null;
}

interface LectureRoadmapProps {
  lectures: Lecture[];
}

export default function LectureRoadmap({ lectures }: LectureRoadmapProps) {
  // Sort lectures by lecture_number
  const sortedLectures = [...lectures].sort((a, b) => a.lecture_number - b.lecture_number);

  if (lectures.length === 0) {
    return (
      <div style={{
        padding: '40px',
        backgroundColor: '#2d2d2d',
        border: '1px solid #404040',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, color: '#a3a3a3', fontSize: '16px' }}>
          No lecture schedule available
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '30px',
        bottom: '30px',
        width: '2px',
        background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
      }} />

      {/* Lecture nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sortedLectures.map((lecture, index) => (
          <div
            key={lecture.id}
            style={{
              position: 'relative',
              paddingLeft: '56px',
              animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* Node circle */}
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '12px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              border: '3px solid #0a0a0a',
              boxShadow: '0 0 0 3px #2d2d2d',
              zIndex: 1,
            }} />

            {/* Lecture card */}
            <div style={{
              padding: '20px',
              backgroundColor: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a3a';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2d2d';
              e.currentTarget.style.borderColor = '#404040';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: '#1e3a8a',
                      color: '#60a5fa',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                      Lecture {lecture.lecture_number}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#e5e5e5' }}>
                      {lecture.title}
                    </h3>
                  </div>
                  {lecture.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#a3a3a3', lineHeight: '1.5' }}>
                      {lecture.description}
                    </p>
                  )}
                </div>
                {lecture.date && (
                  <div style={{
                    padding: '6px 12px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#3b82f6',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatDate(lecture.date)}
                  </div>
                )}
              </div>

              {/* Topics */}
              {lecture.topics.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#737373', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Topics Covered
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {lecture.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: '#404040',
                          color: '#e5e5e5',
                          borderRadius: '6px',
                          fontSize: '13px',
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
