import React from 'react';

export default function ResultCard({ title, children, icon, style = {} }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
        borderLeft: '4px solid #4f46e5',
        marginBottom: '20px',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '10px',
          }}
        >
          {icon && (
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            {title}
          </h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
