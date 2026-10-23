import React, { useState } from 'react';
import api from '../api/axios';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

export default function SafetyMonitor() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageSelect = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please upload a construction site photo before analyzing.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    if (context.trim()) {
      formData.append('construction_context', context.trim());
    }

    try {
      const response = await api.post('/safety/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Safety analysis failed:', err);
      let errorMsg = 'Failed to complete safety analysis. Please check your backend connection and try again.';
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

  const getRiskBadgeClass = (level) => {
    const l = String(level || '').toLowerCase();
    if (l.includes('high') || l.includes('crit') || l.includes('danger')) return 'badge-red';
    if (l.includes('med') || l.includes('mod') || l.includes('warn')) return 'badge-amber';
    if (l.includes('low') || l.includes('safe') || l.includes('min')) return 'badge-green';
    return 'badge-blue';
  };

  const renderPPEItems = (ppeData) => {
    if (!ppeData) return null;
    let items = [];

    if (Array.isArray(ppeData)) {
      items = ppeData.map((item, idx) => {
        if (typeof item === 'string') {
          return { name: item, compliant: true, notes: '' };
        }
        return {
          name: item.item || item.equipment || item.name || `Item #${idx + 1}`,
          compliant: item.compliant !== undefined ? item.compliant : item.status === 'compliant' || item.status === 'passed',
          notes: item.notes || item.detail || '',
        };
      });
    } else if (typeof ppeData === 'object') {
      items = Object.entries(ppeData).map(([key, value]) => {
        if (typeof value === 'boolean') {
          return { name: key, compliant: value, notes: '' };
        }
        if (typeof value === 'object' && value !== null) {
          return {
            name: key,
            compliant: value.compliant ?? (value.status === 'compliant'),
            notes: value.notes || value.detail || '',
          };
        }
        return {
          name: key,
          compliant: String(value).toLowerCase().includes('yes') || String(value).toLowerCase().includes('comp'),
          notes: String(value),
        };
      });
    }

    if (items.length === 0) {
      return <p style={{ color: '#64748b', fontStyle: 'italic' }}>No PPE data recorded.</p>;
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1.5px solid ${item.compliant ? '#bbf7d0' : '#fecaca'}`,
              background: item.compliant ? '#f0fdf4' : '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.compliant ? '✅' : '❌'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
                {item.name}
              </div>
              {item.notes && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const hazards = result?.hazards || result?.detected_hazards || [];
  const guidelines = result?.safety_guidelines || result?.guidelines || [];
  const immediateActions = result?.immediate_actions || result?.actions_required || [];
  const riskLevel = result?.risk_level || result?.overall_risk || 'Moderate';
  const safetyScore = result?.safety_score ?? result?.score ?? 78;

  return (
    <div>
      <h1 className="page-title">Safety Analysis</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Construction Context (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Describe site activities, ongoing operations, weather conditions, or specific safety concerns..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !imageFile}
            style={{ marginTop: '8px' }}
          >
            🛡️ {loading ? 'Analyzing Safety...' : 'Analyze Safety'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Scanning site image for hazards and PPE compliance..." />}

      {result && !loading && (
        <div style={{ marginTop: '32px' }}>
          {/* Top Row: Risk Level & Safety Score */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              borderLeft: '5px solid #4f46e5',
            }}
          >
            <div>
              <div className="metric-label">Overall Risk Level</div>
              <div style={{ marginTop: '6px' }}>
                <span className={`badge ${getRiskBadgeClass(riskLevel)}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
                  {riskLevel}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="metric-label">Safety Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {safetyScore}
                <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 500 }}> / 100</span>
              </div>
            </div>
          </div>

          {/* Hazards List */}
          <ResultCard title="Detected Hazards" icon="⚠️">
            {hazards.length === 0 ? (
              <p style={{ color: '#16a34a', margin: 0 }}>No critical safety hazards detected in the provided image.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {hazards.map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>
                        {h.hazard || h.name || h.description || `Hazard #${idx + 1}`}
                      </strong>
                      {(h.severity || h.risk) && (
                        <span className={`badge ${getRiskBadgeClass(h.severity || h.risk)}`}>
                          {h.severity || h.risk} Severity
                        </span>
                      )}
                    </div>
                    {h.location && (
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>
                        📍 <strong>Location:</strong> {h.location}
                      </div>
                    )}
                    {h.recommendation && (
                      <div style={{ fontSize: '0.92rem', color: '#334155', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                        💡 <strong>Recommendation:</strong> {h.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ResultCard>

          {/* PPE Compliance */}
          <ResultCard title="PPE Compliance Check" icon="🦺">
            {renderPPEItems(result.ppe_compliance || result.ppe)}
          </ResultCard>

          {/* Immediate Actions */}
          {immediateActions.length > 0 && (
            <div className="danger-box" style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🚨</span> Immediate Actions Required
              </h3>
              <ol style={{ paddingLeft: '20px', margin: 0, color: '#7f1d1d' }}>
                {immediateActions.map((action, i) => (
                  <li key={i} style={{ marginBottom: '8px', fontWeight: 500 }}>
                    {typeof action === 'string' ? action : action.action || action.description}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Safety Guidelines */}
          {guidelines.length > 0 && (
            <ResultCard title="Safety Guidelines &amp; Compliance Standards" icon="📋">
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155' }}>
                {guidelines.map((g, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>
                    {typeof g === 'string' ? g : g.guideline || g.description}
                  </li>
                ))}
              </ul>
            </ResultCard>
          )}

          {/* Summary */}
          {result.summary && (
            <ResultCard title="Executive Safety Summary" icon="📝">
              <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.98rem' }}>
                {result.summary}
              </p>
            </ResultCard>
          )}
        </div>
      )}
    </div>
  );
}
