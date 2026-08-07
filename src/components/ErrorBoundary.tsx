import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

const isChunkLoadError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /chunk|dynamically imported module|failed to fetch/i.test(message);
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Derivcash render error', error, errorInfo);

    if (isChunkLoadError(error) && sessionStorage.getItem('derivcash_chunk_reload') !== 'done') {
      sessionStorage.setItem('derivcash_chunk_reload', 'done');
      window.location.reload();
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('derivcash_chunk_reload');
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ color: '#f3374b', fontWeight: 900, fontSize: '1.5rem', marginBottom: 12 }}>
            Derivcash
          </div>
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 10px' }}>Chargement interrompu</h1>
          <p style={{ color: '#64748b', lineHeight: 1.55, margin: '0 0 22px' }}>
            La page n'a pas pu se charger correctement. Rechargez pour reprendre votre session.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '13px 18px',
              background: '#f3374b',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
}
