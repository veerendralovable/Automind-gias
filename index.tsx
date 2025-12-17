
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  // Make children optional to satisfy TS check when component is used in JSX
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fixed class definition with explicit state property to resolve property access errors
// Added explicit inheritance from React.Component to ensure props and state are correctly typed and recognized by the compiler
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Runtime Error:", error, errorInfo);
  }

  render() {
    // Destructuring state and props to avoid direct access issues and resolve TS property errors
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#0f172a', 
          color: '#ef4444', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Application Logic Error</h1>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#1e293b', 
            borderRadius: '0.5rem', 
            border: '1px solid #334155',
            maxWidth: '600px',
            width: '100%',
            overflow: 'auto',
            textAlign: 'left'
          }}>
            <code style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#fca5a5' }}>
              {error?.message || "Unknown Runtime Error"}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Restart Engine
          </button>
        </div>
      );
    }

    return children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Fatal: Root container not found in DOM.");
}
