
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fixed ErrorBoundary class to correctly recognize state and props generics
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare state property to satisfy TypeScript compiler
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Correctly accessing state property from the instance
    if (this.state.hasError) {
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
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Application Instance Error</h1>
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
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Fault Signature
            </p>
            <code style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#fca5a5' }}>
              {this.state.error?.message || "Unknown Runtime Error"}
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

    // Fixed: Properly accessing props defined in the interface
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // Providing App as a child ensures ErrorBoundaryProps is correctly satisfied
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error("Failed to find the root element");
}
