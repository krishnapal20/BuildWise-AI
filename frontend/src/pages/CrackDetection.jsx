import React, { useState } from 'react';
import api from '../api/axios';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

const buildingParts = ['Wall', 'Column', 'Beam', 'Slab', 'Foundation', 'Other'];

export default function CrackDetection() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [buildingPart, setBuildingPart] = useState('Wall');
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
      setError('Please upload an image of the structural element before analyzing.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('building_part', buildingPart);

    try {
      const response = await api.post('/crack/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Crack detection failed:', err);
      let errorMsg = 'Failed to perform crack diagnosis. Please check your backend connection and try again.';
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

  const getSeverityBadgeClass = (severity) => {
    const s = String(severity || '').toLowerCase();
    if (s.includes('high') || s.includes('severe') || s.includes('crit')) return 'badge-red';
    if (s.includes('med') || s.includes('mod')) return 'badge-amber';
    if (s.includes('low') || s.includes('minor') || s.includes('hairline')) return 'badge-green';
    return 'badge-blue';
  };

  const cracks = result?.cracks || result?.detected_cracks || [];
  const repairMethods = result?.repair_methods || result?.repairs || [];
  const preventiveMeasures = result?.preventive_measures || result?.prevention || [];
  const cracksDetected = result?.cracks_detected ?? (cracks.length > 0);
  const crackCount = result?.crack_count ?? cracks.length;
  const overallSeverity = result?.overall_severity || result?.severity || (cracksDetected ? 'Moderate' : 'None');
  const structuralScore = result?.structural_integrity_score ?? result?.integrity_score ?? 82;

  return (
    <div>
      <h1 className="page-title">Crack Diagnosis</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Building Part</label>
            <select
              className="form-select"
              value={buildingPart}
              onChange={(e) => setBuildingPart(e.target.value)}
            >
              {buildingParts.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !imageFile}
            style={{ marginTop: '8px' }}
          >
            🔍 {loading ? 'Analyzing Structure...' : 'Analyze Crack'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Running computer vision crack diagnostics &amp; severity model..." />}

      {result && !loading && (
        <div style={{ marginTop: '32px' }}>
          {/* Top Overview Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="card" style={{ margin: 0, padding: '20px' }}>
              <div className="metric-label">Cracks Detected</div>
              <div style={{ marginTop: '8px' }}>
                <span
                  className={`badge ${cracksDetected ? 'badge-red' : 'badge-green'}`}
                  style={{ fontSize: '0.95rem', padding: '6px 14px' }}
                >
                  {cracksDetected ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            <div className="card" style={{ margin: 0, padding: '20px' }}>
              <div className="metric-label">Crack Count</div>
              <div className="metric-value" style={{ marginTop: '4px' }}>
                {crackCount}
              </div>
            </div>

            <div className="card" style={{ margin: 0, padding: '20px' }}>
              <div className="metric-label">Overall Severity</div>
              <div style={{ marginTop: '8px' }}>
                <span
                  className={`badge ${getSeverityBadgeClass(overallSeverity)}`}
                  style={{ fontSize: '0.95rem', padding: '6px 14px' }}
                >
                  {overallSeverity}
                </span>
              </div>
            </div>

            <div className="card" style={{ margin: 0, padding: '20px' }}>
              <div className="metric-label">Structural Integrity Score</div>
              <div className="metric-value" style={{ marginTop: '4px', color: structuralScore > 75 ? '#15803d' : structuralScore > 50 ? '#b45309' : '#b91c1c' }}>
                {structuralScore}
                <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}> / 100</span>
              </div>
            </div>
          </div>

          {/* Crack Details */}
          <ResultCard title="Detailed Crack Assessment" icon="🔬">
            {cracks.length === 0 ? (
              <p style={{ color: '#16a34a', margin: 0 }}>
                No significant cracks detected on this {buildingPart.toLowerCase()} surface.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cracks.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '18px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>
                        {c.type || c.crack_type || `Crack #${idx + 1}`}
                      </strong>
                      {(c.severity || c.level) && (
                        <span className={`badge ${getSeverityBadgeClass(c.severity || c.level)}`}>
                          {c.severity || c.level}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '10px',
                        fontSize: '0.9rem',
                        marginBottom: '12px',
                      }}
                    >
                      {c.width && (
                        <div>
                          <span style={{ color: '#64748b' }}>Estimated Width: </span>
                          <strong style={{ color: '#1e293b' }}>{c.width}</strong>
                        </div>
                      )}
                      {c.location && (
                        <div>
                          <span style={{ color: '#64748b' }}>Location: </span>
                          <strong style={{ color: '#1e293b' }}>{c.location}</strong>
                        </div>
                      )}
                      {c.cause && (
                        <div>
                          <span style={{ color: '#64748b' }}>Probable Cause: </span>
                          <strong style={{ color: '#1e293b' }}>{c.cause}</strong>
                        </div>
                      )}
                    </div>

                    {c.risk && (
                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: '#b45309',
                          background: '#fffbeb',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          marginBottom: '8px',
                        }}
                      >
                        ⚠️ <strong>Risk Assessment:</strong> {c.risk}
                      </div>
                    )}

                    {c.action && (
                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: '#15803d',
                          background: '#f0fdf4',
                          padding: '8px 12px',
                          borderRadius: '6px',
                        }}
                      >
                        🛠️ <strong>Recommended Action:</strong> {c.action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ResultCard>

          {/* Repair Methods */}
          {repairMethods.length > 0 && (
            <ResultCard title="Recommended Repair Methods" icon="🔧">
              <ol style={{ paddingLeft: '20px', margin: 0, color: '#334155' }}>
                {repairMethods.map((m, i) => (
                  <li key={i} style={{ marginBottom: '10px', lineHeight: 1.5 }}>
                    {typeof m === 'string' ? m : m.method || m.step || m.description}
                  </li>
                ))}
              </ol>
            </ResultCard>
          )}

          {/* Preventive Measures */}
          {preventiveMeasures.length > 0 && (
            <ResultCard title="Preventive Measures" icon="🛡️">
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155' }}>
                {preventiveMeasures.map((pm, i) => (
                  <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>
                    {typeof pm === 'string' ? pm : pm.measure || pm.description}
                  </li>
                ))}
              </ul>
            </ResultCard>
          )}

          {/* Summary */}
          {result.summary && (
            <ResultCard title="Diagnostic Summary" icon="📋">
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
