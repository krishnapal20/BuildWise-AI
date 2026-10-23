import React, { useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

const categories = [
  'All',
  'Structural',
  'Materials',
  'Safety',
  'Planning',
  'Concrete',
  'Foundation',
];

export default function KnowledgeBase() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async (queryToSearch) => {
    const q = (queryToSearch || question).trim();
    if (!q) {
      setError('Please enter a construction query.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/knowledge/ask', {
        question: q,
        category: selectedCategory,
      });
      setResult(response.data);
    } catch (err) {
      console.error('Knowledge search failed:', err);
      let errorMsg = 'Failed to retrieve answer. Please verify backend connection and try again.';
      if (typeof err.response?.data?.detail === 'string') {
        errorMsg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail)) {
        errorMsg = err.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      } else if (err.response?.data?.message) {
        errorMsg = String(err.response.data.message);
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(question);
  };

  const handleRelatedTopicClick = (topic) => {
    const text = typeof topic === 'string' ? topic : topic.title || topic.name;
    setQuestion(text);
    handleSearch(text);
  };

  const answer = result?.answer || result?.response || result?.content || '';
  const keyPoints = result?.key_points || result?.highlights || [];
  const references = result?.references || result?.sources || result?.codes || [];
  const relatedTopics = result?.related_topics || result?.topics || [];

  return (
    <div>
      <h1 className="page-title">Knowledge Hub</h1>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                border: 'none',
                padding: '8px 18px',
                borderRadius: '24px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                boxShadow: isActive
                  ? '0 2px 8px rgba(79, 70, 229, 0.3)'
                  : '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Input Card */}
      <div className="card">
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{
                flex: 1,
                minWidth: '280px',
                fontSize: '1.05rem',
                padding: '12px 18px',
              }}
              placeholder="Ask any construction question (e.g., minimum curing time for M25 concrete, shear wall design standards)..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !question.trim()}
              style={{ padding: '12px 28px' }}
            >
              🔍 {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Searching building codes, engineering standards, and scientific specifications..." />}

      {/* Results Card */}
      {result && !loading && (
        <div style={{ marginTop: '24px' }}>
          <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '14px' }}>
              💡 Answer
            </h2>

            {/* Answer Text */}
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: '#334155',
                whiteSpace: 'pre-line',
                marginBottom: '24px',
              }}
            >
              {answer || 'No direct answer returned.'}
            </p>

            {/* Key Points */}
            {keyPoints.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    color: '#1e293b',
                    marginBottom: '12px',
                    fontWeight: 700,
                  }}
                >
                  Key Takeaways
                </h3>
                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {keyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '8px',
                        color: '#334155',
                        fontSize: '0.95rem',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#4f46e5',
                          marginTop: '8px',
                          flexShrink: 0,
                        }}
                      />
                      <span>{typeof point === 'string' ? point : point.text || point.point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* References */}
            {references.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#64748b',
                    marginBottom: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Standards &amp; References
                </h3>
                <div className="chips-container">
                  {references.map((ref, idx) => (
                    <span
                      key={idx}
                      className="chip"
                      style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.85rem' }}
                    >
                      📖 {typeof ref === 'string' ? ref : ref.title || ref.code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#64748b',
                    marginBottom: '10px',
                    fontWeight: 600,
                  }}
                >
                  Explore Related Topics
                </h3>
                <div className="chips-container">
                  {relatedTopics.map((topic, idx) => {
                    const text = typeof topic === 'string' ? topic : topic.title || topic.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleRelatedTopicClick(text)}
                        className="chip"
                        style={{
                          background: '#eef2ff',
                          color: '#4338ca',
                          border: '1px solid #c7d2fe',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e0e7ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#eef2ff';
                        }}
                      >
                        🔍 {text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
