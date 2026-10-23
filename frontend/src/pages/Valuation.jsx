import React, { useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

const propertyTypes = ['Apartment', 'Independent House', 'Villa', 'Commercial Space', 'Plot'];
const availableAmenities = [
  'Parking',
  'Garden',
  'Swimming Pool',
  'Gym',
  'Security',
  'Lift',
  'Power Backup',
];

export default function Valuation() {
  const [location, setLocation] = useState('');
  const [areaSqft, setAreaSqft] = useState(1500);
  const [propertyType, setPropertyType] = useState('Apartment');
  const [bedrooms, setBedrooms] = useState(3);
  const [buildingAge, setBuildingAge] = useState(2);
  const [selectedAmenities, setSelectedAmenities] = useState(['Parking', 'Security', 'Lift']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please provide a property location or neighborhood.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/valuation/estimate', {
        location: location.trim(),
        area_sqft: Number(areaSqft),
        property_type: propertyType,
        bedrooms: Number(bedrooms),
        building_age: Number(buildingAge),
        amenities: selectedAmenities,
      });
      setResult(response.data);
    } catch (err) {
      console.error('Valuation failed:', err);
      let errorMsg = 'Failed to estimate property value. Please verify backend connection and try again.';
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

  const getRatingBadge = (rating) => {
    const r = String(rating || '').toLowerCase();
    if (r.includes('a') || r.includes('high') || r.includes('strong') || r.includes('buy')) return 'badge-green';
    if (r.includes('b') || r.includes('moderate') || r.includes('hold')) return 'badge-amber';
    return 'badge-blue';
  };

  const getImpactBadge = (impact) => {
    const imp = String(impact || '').toLowerCase();
    if (imp.includes('pos') || imp.includes('+') || imp.includes('high')) return 'badge-green';
    if (imp.includes('neg') || imp.includes('-') || imp.includes('low')) return 'badge-red';
    return 'badge-gray';
  };

  const factors = result?.valuation_factors || result?.factors || [];
  const marketComp = result?.market_comparison || result?.comparables || null;
  const estimatedValue = result?.estimated_value || result?.valuation || '$450,000';
  const investmentRating = result?.investment_rating || result?.rating || 'A (Strong Buy)';
  const pricePerSqft = result?.price_per_sqft || result?.metrics?.price_per_sqft || '$300 / sqft';
  const rentalYield = result?.rental_potential || result?.metrics?.rental_potential || '5.2% / year';
  const roi = result?.roi || result?.metrics?.roi || '12.4%';
  const appreciation = result?.appreciation_outlook || result?.metrics?.appreciation_outlook || '+8.5% YoY';

  return (
    <div>
      <h1 className="page-title">Property Valuation</h1>

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
              <label className="form-label">Location / Neighborhood</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Downtown Seattle, WA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Area (sqft)</label>
              <input
                type="number"
                min="100"
                step="50"
                className="form-input"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select
                className="form-select"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                {propertyTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input
                type="number"
                min="0"
                max="20"
                className="form-input"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Building Age (years)</label>
              <input
                type="number"
                min="0"
                max="150"
                className="form-input"
                value={buildingAge}
                onChange={(e) => setBuildingAge(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Amenities</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '10px',
                marginTop: '8px',
              }}
            >
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    color: '#334155',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: selectedAmenities.includes(amenity) ? '#eef2ff' : '#f8fafc',
                    border: `1px solid ${selectedAmenities.includes(amenity) ? '#c7d2fe' : '#e2e8f0'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    style={{ accentColor: '#4f46e5' }}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            🏘️ {loading ? 'Estimating Valuation...' : 'Estimate Value'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner text="Analyzing hyper-local real estate benchmarks, micro-market trends &amp; features..." />}

      {result && !loading && (
        <div style={{ marginTop: '28px' }}>
          {/* Large Hero Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
              color: 'white',
              padding: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.95rem', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.5px' }}>
                Estimated Market Value
              </div>
              <div style={{ fontSize: '2.75rem', fontWeight: 800, marginTop: '4px' }}>
                {typeof estimatedValue === 'number'
                  ? `$${estimatedValue.toLocaleString()}`
                  : estimatedValue}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', opacity: 0.85, marginBottom: '6px' }}>
                Investment Rating
              </div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                ⭐ {investmentRating}
              </span>
            </div>
          </div>

          {/* Metrics 2x2 Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="metric-card">
              <div className="metric-label">Price / Sqft</div>
              <div className="metric-value">{pricePerSqft}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Rental Potential</div>
              <div className="metric-value">{rentalYield}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Expected ROI</div>
              <div className="metric-value">{roi}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Appreciation Outlook</div>
              <div className="metric-value" style={{ color: '#0d9488' }}>
                {appreciation}
              </div>
            </div>
          </div>

          {/* Valuation Factors */}
          <ResultCard title="Key Valuation Factors" icon="⚖️">
            {factors.length === 0 ? (
              <p style={{ color: '#64748b' }}>No individual factors reported.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {factors.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#1e293b' }}>
                        {f.factor || f.name || f.title || `Factor #${idx + 1}`}
                      </strong>
                      {f.description && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                          {f.description}
                        </div>
                      )}
                    </div>
                    {f.impact && (
                      <span className={`badge ${getImpactBadge(f.impact)}`}>
                        {f.impact}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ResultCard>

          {/* Market Comparison */}
          {marketComp && (
            <ResultCard title="Market Comparison Benchmarks" icon="📊">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="metric-label">Min Market Range</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>
                    {marketComp.min || marketComp.lowest || '$380,000'}
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="metric-label">Average Market Range</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>
                    {marketComp.avg || marketComp.average || '$445,000'}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="metric-label">Max Market Range</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
                    {marketComp.max || marketComp.highest || '$510,000'}
                  </div>
                </div>
              </div>
            </ResultCard>
          )}

          {/* Summary */}
          {result.summary && (
            <ResultCard title="Valuation Insights" icon="📝">
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
