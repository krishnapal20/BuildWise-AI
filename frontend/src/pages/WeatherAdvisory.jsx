import React, { useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

const activities = [
  'Concrete Pouring',
  'Painting',
  'Excavation',
  'Roofing',
  'Steel Work',
  'Brick Masonry',
  'Plastering',
  'Waterproofing',
  'Crane Operations',
  'Electrical Work',
];

export default function WeatherAdvisory() {
  const [activity, setActivity] = useState('Concrete Pouring');
  const [location, setLocation] = useState('Denver, CO');
  const [customConditions, setCustomConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please provide a city or site location.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/weather/advisory', {
        planned_activity: activity,
        activity: activity,
        city: location.trim(),
        location: location.trim(),
        custom_conditions: customConditions.trim(),
      });
      setResult(response.data);
    } catch (err) {
      console.error('Weather advisory check failed:', err);
      let errorMsg = 'Failed to retrieve weather advisory. Please check your backend connection and try again.';
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

  const getBannerDetails = (rec) => {
    const r = String(rec || '').toUpperCase();
    if (r.includes('NO-GO') || r.includes('STOP') || r.includes('HALT')) {
      return {
        className: 'banner-nogo',
        text: '⛔ NO-GO',
      };
    }
    if (r.includes('CAUTION') || r.includes('WARNING') || r.includes('PROCEED WITH CAUTION')) {
      return {
        className: 'banner-caution',
        text: '⚠️ PROCEED WITH CAUTION',
      };
    }
    return {
      className: 'banner-go',
      text: '✅ GO',
    };
  };

  const recommendation = result?.recommendation || result?.status || 'GO';
  const weather = result?.weather_data || result?.weather || {};
  const risks = result?.risks || result?.weather_risks || [];
  const precautions = result?.precautions || result?.recommended_precautions || [];
  const suitableActivities = result?.suitable_activities || result?.recommended_activities || [];
  const avoidActivities = result?.avoid_activities || result?.restricted_activities || [];
  const banner = getBannerDetails(recommendation);

  return (
    <div>
      <h1 className="page-title">Weather Advisory</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="form-group">
              <label className="form-label">Planned Activity</label>
              <select
                className="form-select"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              >
                {activities.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City / Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Denver, CO or Chicago, IL"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Custom Observations / Microclimate (optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="e.g., strong wind gusts on top floor, morning fog, high humidity..."
              value={customConditions}
              onChange={(e) => setCustomConditions(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            🌤️ {loading ? 'Evaluating Forecast & Feasibility...' : 'Check Conditions'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Analyzing hyper-local meteorological forecasts against engineering tolerances..." />}

      {result && !loading && (
        <div style={{ marginTop: '28px' }}>
          {/* LARGE Recommendation Banner */}
          <div className={`recommendation-banner ${banner.className}`}>
            {banner.text}
          </div>

          {/* Weather Data Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-label">🌡️ Temperature</div>
              <div className="metric-value">{weather.temperature || (weather.temperature_c != null ? `${weather.temperature_c}°C` : '28°C')}</div>
            </div>

            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-label">💧 Humidity</div>
              <div className="metric-value">{weather.humidity || (weather.humidity_percent != null ? `${weather.humidity_percent}%` : '50%')}</div>
            </div>

            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-label">💨 Wind Speed</div>
              <div className="metric-value">{weather.wind_speed || (weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : '10 km/h')}</div>
            </div>

            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-label">🌧️ Precipitation</div>
              <div className="metric-value">{weather.precipitation ?? (weather.precipitation_probability != null ? `${weather.precipitation_probability}%` : '10%')}</div>
            </div>

            <div className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-label">☀️ UV Index</div>
              <div className="metric-value">{weather.uv_index != null ? `${weather.uv_index}` : '5 (Mod)'}</div>
            </div>
          </div>

          {/* Two-Column Risks vs Precautions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Risks (Red-tinted) */}
            <div
              className="card"
              style={{
                margin: 0,
                borderLeft: '4px solid #ef4444',
                background: '#fffdfd',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', color: '#b91c1c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️</span> Weather &amp; Site Risks
              </h3>
              {risks.length === 0 ? (
                <p style={{ color: '#16a34a', margin: 0 }}>No severe weather risks identified for this activity.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#991b1b', fontSize: '0.92rem' }}>
                  {risks.map((r, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>
                      {typeof r === 'string' ? r : r.risk || r.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Precautions (Blue-tinted) */}
            <div
              className="card"
              style={{
                margin: 0,
                borderLeft: '4px solid #3b82f6',
                background: '#fdfefe',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', color: '#1d4ed8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> Mandatory Precautions
              </h3>
              {precautions.length === 0 ? (
                <p style={{ color: '#64748b', margin: 0 }}>Follow standard operating procedures.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#1e40af', fontSize: '0.92rem' }}>
                  {precautions.map((p, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>
                      {typeof p === 'string' ? p : p.precaution || p.action}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Suitable & Avoid Activities */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div className="card" style={{ margin: 0, padding: '20px' }}>
              <div className="metric-label" style={{ color: '#16a34a', marginBottom: '10px' }}>
                ✓ Highly Suitable Activities Right Now
              </div>
              <div className="chips-container">
                {(suitableActivities || []).map((act, i) => (
                  <span key={i} className="chip chip-green">
                    {typeof act === 'string' ? act : act.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="card" style={{ margin: 0, padding: '20px' }}>
              <div className="metric-label" style={{ color: '#dc2626', marginBottom: '10px' }}>
                ✕ Activities to Postpone or Avoid
              </div>
              <div className="chips-container">
                {(avoidActivities || []).map((act, i) => (
                  <span key={i} className="chip chip-red">
                    {typeof act === 'string' ? act : act.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <ResultCard title="Meteorological Engineering Summary" icon="📋">
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
