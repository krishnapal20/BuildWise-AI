import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    path: '/safety',
    title: 'Safety Analysis',
    icon: '🛡️',
    description: 'Real-time safety hazard detection and PPE compliance monitoring from site photos.',
    color: '#ef4444',
  },
  {
    path: '/crack',
    title: 'Crack Diagnosis',
    icon: '🔍',
    description: 'Computer vision crack detection, severity assessment, and structural repair plans.',
    color: '#f59e0b',
  },
  {
    path: '/planning',
    title: 'Project Planner',
    icon: '📋',
    description: 'Automated material estimation, budget cost breakdown, and phase scheduling.',
    color: '#10b981',
  },
  {
    path: '/valuation',
    title: 'Property Valuation',
    icon: '🏘️',
    description: 'AI-driven market valuation, investment rating, and appreciation outlook analysis.',
    color: '#6366f1',
  },
  {
    path: '/assistant',
    title: 'Daily Assistant',
    icon: '📆',
    description: 'Daily site task prioritization, workforce allocation, and safety briefings.',
    color: '#06b6d4',
  },
  {
    path: '/weather',
    title: 'Weather Advisory',
    icon: '🌤️',
    description: 'Activity-specific weather risk checks, go/no-go decisions, and precautions.',
    color: '#3b82f6',
  },
  {
    path: '/knowledge',
    title: 'Knowledge Hub',
    icon: '📚',
    description: 'Instant answers to construction codes, structural methods, and material standards.',
    color: '#8b5cf6',
  },
  {
    path: '/chat',
    title: 'AI Chat',
    icon: '💬',
    description: 'Interactive multimodal conversational assistant for on-demand engineering guidance.',
    color: '#0d9488',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#1e293b',
            letterSpacing: '-0.5px',
            marginBottom: '8px',
          }}
        >
          Welcome to BuildWise AI
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: '#64748b',
            margin: 0,
          }}
        >
          AI-Powered Construction Intelligence Platform
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {features.map((feat) => (
          <div
            key={feat.path}
            onClick={() => navigate(feat.path)}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                lineHeight: 1,
              }}
            >
              {feat.icon}
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '8px',
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#64748b',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {feat.description}
              </p>
            </div>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#4f46e5',
              }}
            >
              <span>Explore feature</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
