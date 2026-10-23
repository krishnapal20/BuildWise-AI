import React from 'react';

export default function LoadingSpinner({ text = 'Analyzing with AI...' }) {
  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.spinner} />
      <div style={styles.text}>{text}</div>
    </div>
  );
}

const styles = {
  overlay: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '12px',
    minHeight: '200px',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  text: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.2px',
  },
};
