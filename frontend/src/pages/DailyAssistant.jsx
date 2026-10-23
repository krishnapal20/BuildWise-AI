import React, { useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

export default function DailyAssistant() {
  const [siteName, setSiteName] = useState('Skyline Tower - Sector 4');
  const [currentTaskInput, setCurrentTaskInput] = useState('');
  const [tasks, setTasks] = useState([
    'Pour concrete for 3rd floor slab',
    'Erect rebar reinforcement on columns 12-16',
    'Quality inspection of electrical conduit embedding',
  ]);
  const [workforceCount, setWorkforceCount] = useState(24);
  const [siteConditions, setSiteConditions] = useState(
    'Partly cloudy, expected temperature 28°C, slight breeze. Concrete batching plant delivery scheduled at 10:00 AM.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAddTask = () => {
    if (currentTaskInput.trim()) {
      setTasks([...tasks, currentTaskInput.trim()]);
      setCurrentTaskInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleRemoveTask = (indexToRemove) => {
    setTasks(tasks.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteName.trim()) {
      setError('Please provide a site name.');
      return;
    }
    if (tasks.length === 0) {
      setError('Please add at least one planned task for the day.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/assistant/daily', {
        site_name: siteName.trim(),
        planned_tasks: tasks,
        tasks: tasks,
        workforce_count: Number(workforceCount),
        site_conditions: siteConditions.trim(),
      });
      setResult(response.data);
    } catch (err) {
      console.error('Daily assistant failed:', err);
      let errorMsg = 'Failed to generate daily plan. Please check backend connection and inputs.';
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

  const getPriorityBorderColor = (prio) => {
    const p = String(prio || '').toLowerCase();
    if (p.includes('high') || p.includes('urgent') || p.includes('crit')) return '#ef4444';
    if (p.includes('med') || p.includes('mod')) return '#f59e0b';
    return '#10b981';
  };

  const priorityTasks = result?.priorities || result?.priority_tasks || result?.tasks || [];
  const materials = result?.materials_needed || result?.materials || result?.required_materials || [];
  const equipment = result?.equipment_needed || result?.equipment || result?.required_equipment || [];
  const safetyChecks = result?.safety_checks || result?.safety_briefing || [];
  const riskAlerts = result?.risk_alerts || result?.risks || [];
  const workforce = result?.workforce_allocation || result?.crews || [];

  return (
    <div>
      <h1 className="page-title">Daily Assistant</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: result ? 'minmax(320px, 420px) minmax(400px, 1fr)' : '1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Input Form Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#1e293b' }}>
            Daily Site Briefing Inputs
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Site Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Riverside Complex B"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Planned Tasks</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter a task and click Add..."
                  value={currentTaskInput}
                  onChange={(e) => setCurrentTaskInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddTask}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Add Task
                </button>
              </div>

              <div className="chips-container">
                {tasks.map((task, idx) => (
                  <span key={idx} className="chip">
                    <span>{task}</span>
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={() => handleRemoveTask(idx)}
                      title="Remove task"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workforce Count</label>
              <input
                type="number"
                min="1"
                max="500"
                className="form-input"
                value={workforceCount}
                onChange={(e) => setWorkforceCount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Site &amp; Weather Conditions</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Site environment, weather updates, delays, constraints..."
                value={siteConditions}
                onChange={(e) => setSiteConditions(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              📆 {loading ? 'Planning Site Day...' : 'Generate Daily Plan'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Loading or Results */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner text="Generating resource allocations, safety briefings, and critical path sequence..." />
            </div>
          )}

          {result && !loading && (
            <div>
              {/* Priority Tasks */}
              <ResultCard title="Prioritized Task Sequence" icon="🎯">
                {priorityTasks.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No prioritized tasks returned.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {priorityTasks.map((pt, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          borderLeft: `5px solid ${getPriorityBorderColor(pt.priority || pt.level)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#1e293b' }}>
                            {typeof pt === 'string' ? pt : pt.task || pt.title || pt.name || pt.activity || 'Task Item'}
                          </strong>
                          {pt.notes && (
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                              {typeof pt.notes === 'string' ? pt.notes : ''}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {(pt.estimated_time || pt.duration) && (
                            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                              ⏱️ {String(pt.estimated_time || pt.duration)}
                            </span>
                          )}
                          {pt.priority && (
                            <span className="badge badge-amber">{typeof pt.priority === 'string' ? pt.priority : 'Priority'}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ResultCard>

              {/* Side-by-side Materials & Equipment */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div className="card" style={{ margin: 0, padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '12px' }}>
                    📦 Required Materials
                  </h3>
                  {materials.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Standard inventory.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '0.9rem' }}>
                      {materials.map((m, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>
                          {typeof m === 'string' ? m : `${m.name || m.item} (${m.quantity || 'as required'})`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card" style={{ margin: 0, padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '12px' }}>
                    🚜 Equipment &amp; Machinery
                  </h3>
                  {equipment.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No heavy machinery required.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '0.9rem' }}>
                      {equipment.map((eq, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>
                          {typeof eq === 'string' ? eq : `${eq.name || eq.tool} (${eq.count || eq.status || 'Ready'})`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Safety Checks */}
              {safetyChecks.length > 0 && (
                <ResultCard title="Pre-Shift Safety Checklist" icon="🦺">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {safetyChecks.map((sc, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.92rem',
                          color: '#1e293b',
                        }}
                      >
                        <span style={{ color: '#16a34a' }}>✓</span>
                        <span>{typeof sc === 'string' ? sc : sc.check || sc.item || sc.title || String(sc)}</span>
                      </div>
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* Risk Alerts */}
              {riskAlerts.length > 0 && (
                <div className="warning-box" style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span> Potential Site Risk Alerts
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '0.92rem' }}>
                    {riskAlerts.map((alert, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>
                        {typeof alert === 'string' ? alert : alert.risk || alert.description || alert.alert || String(alert)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Workforce Allocation */}
              {workforce.length > 0 && (
                <ResultCard title="Workforce Allocation" icon="👥">
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Crew / Trade</th>
                          <th>Workers</th>
                          <th>Assigned Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workforce.map((w, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{w.trade || w.crew || w.role || `Team ${i + 1}`}</td>
                            <td>{w.count || w.workers || '-'}</td>
                            <td>{w.task || w.activity || w.assignment || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResultCard>
              )}

              {/* Summary */}
              {result.summary && (
                <ResultCard title="Daily Briefing Summary" icon="📝">
                  <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {result.summary}
                  </p>
                </ResultCard>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
