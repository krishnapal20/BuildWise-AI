import React, { useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

const projectTypes = ['Residential', 'Commercial', 'Industrial', 'Institutional'];

export default function ProjectPlanning() {
  const [projectType, setProjectType] = useState('Residential');
  const [plotArea, setPlotArea] = useState('1200 sqft');
  const [floors, setFloors] = useState(2);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plotArea.trim()) {
      setError('Please provide a plot area.');
      return;
    }
    if (!city.trim()) {
      setError('Please specify the project location / city.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/planning/generate', {
        project_type: projectType,
        plot_area: plotArea.trim(),
        num_floors: Number(floors),
        floors: Number(floors),
        city: city.trim(),
      });
      setResult(response.data);
    } catch (err) {
      console.error('Project planning failed:', err);
      let errorMsg = 'Failed to generate project plan. Please check backend connection and inputs.';
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

  const materials = result?.materials || result?.material_estimate || [];

  // Parse cost breakdown
  const rawCosts = result?.cost_breakdown || result?.costs || result?.budget || [];
  let costItems = [];
  let totalCost = result?.total_estimated_cost || result?.total_cost || null;

  if (Array.isArray(rawCosts)) {
    costItems = rawCosts.map((c) => ({
      category: c.category || c.item || c.name || 'General',
      amount: c.amount || c.cost || c.total || 0,
      percentage: c.percentage || c.share || null,
      notes: c.description || c.notes || '',
    }));
  } else if (typeof rawCosts === 'object' && rawCosts !== null) {
    costItems = Object.entries(rawCosts)
      .filter(([k]) => k.toLowerCase() !== 'total' && k.toLowerCase() !== 'total_cost')
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return {
            category: k,
            amount: v.amount || v.cost || 0,
            percentage: v.percentage || null,
            notes: v.notes || '',
          };
        }
        return {
          category: k,
          amount: v,
          percentage: null,
          notes: '',
        };
      });
    if (!totalCost && rawCosts.total) totalCost = rawCosts.total;
    if (!totalCost && rawCosts.total_cost) totalCost = rawCosts.total_cost;
  }

  const schedule = result?.schedule || result?.phases || result?.project_schedule || [];

  return (
    <div>
      <h1 className="page-title">Project Planner</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="form-group">
              <label className="form-label">Project Type</label>
              <select
                className="form-select"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                {projectTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Plot Area (e.g., 1200 sqft)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 1200 sqft"
                value={plotArea}
                onChange={(e) => setPlotArea(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Floors</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-input"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Austin, TX or Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            📋 {loading ? 'Generating Comprehensive Plan...' : 'Generate Plan'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Calculating material requirements, localized costings, and construction phases..." />}

      {result && !loading && (
        <div style={{ marginTop: '28px' }}>
          {/* Tab Navigation */}
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              📦 Materials Estimation
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`}
              onClick={() => setActiveTab('cost')}
            >
              💰 Cost Breakdown
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              📅 Schedule &amp; Phases
            </button>
          </div>

          {/* TAB 1: Materials */}
          {activeTab === 'materials' && (
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.15rem', color: '#1e293b' }}>
                Required Materials &amp; Quantities
              </h3>
              {materials.length === 0 ? (
                <p style={{ color: '#64748b' }}>No specific material line items available.</p>
              ) : (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{m.item || m.material || m.name}</td>
                          <td>{m.quantity || m.qty || '-'}</td>
                          <td>{m.unit_cost || m.rate || m.cost_per_unit || '-'}</td>
                          <td style={{ fontWeight: 600, color: '#0d9488' }}>
                            {m.total_cost || m.total || m.cost || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Cost Breakdown */}
          {activeTab === 'cost' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                {costItems.map((c, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      margin: 0,
                      borderLeft: '4px solid #0d9488',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div className="metric-label">{c.category}</div>
                      {c.notes && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                          {c.notes}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                      }}
                    >
                      <span className="metric-value" style={{ fontSize: '1.4rem' }}>
                        {typeof c.amount === 'number'
                          ? `$${c.amount.toLocaleString()}`
                          : c.amount}
                      </span>
                      {c.percentage && (
                        <span className="badge badge-blue">{c.percentage}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalCost && (
                <div
                  className="card"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 32px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.5px' }}>
                      Total Estimated Project Cost
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px' }}>
                      {typeof totalCost === 'number'
                        ? `$${totalCost.toLocaleString()}`
                        : totalCost}
                    </div>
                  </div>
                  <span style={{ fontSize: '2.5rem' }}>🏗️</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Schedule */}
          {activeTab === 'schedule' && (
            <div className="card">
              <h3 style={{ marginBottom: '20px', fontSize: '1.15rem', color: '#1e293b' }}>
                Phase Timeline &amp; Work Breakdown
              </h3>
              {schedule.length === 0 ? (
                <p style={{ color: '#64748b' }}>No schedule phases generated.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {schedule.map((ph, idx) => {
                    const phaseTasks = ph.tasks || ph.activities || [];
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '16px 20px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '8px',
                              marginBottom: '8px',
                            }}
                          >
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b' }}>
                              {ph.phase || ph.name || `Phase ${idx + 1}`}
                            </h4>
                            {(ph.duration || ph.timeline) && (
                              <span className="badge badge-blue">
                                ⏱️ {ph.duration || ph.timeline}
                              </span>
                            )}
                          </div>

                          {ph.description && (
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 10px 0' }}>
                              {ph.description}
                            </p>
                          )}

                          {phaseTasks.length > 0 && (
                            <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '0.92rem' }}>
                              {phaseTasks.map((t, ti) => (
                                <li key={ti} style={{ marginBottom: '4px' }}>
                                  {typeof t === 'string' ? t : t.task || t.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Summary Paragraph below tabs */}
          {result.summary && (
            <ResultCard title="Executive Project Summary" icon="📑">
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
