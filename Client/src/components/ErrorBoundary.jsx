import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
            <h2 className="title-md" style={{ color: 'var(--red)' }}>Something went wrong</h2>
            <p style={{ marginBottom: '1rem' }}>
              We're sorry, but something unexpected happened. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Refresh page
            </button>
            {this.props.showError && (
              <pre style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'var(--gray-100)',
                borderRadius: '4px',
                fontSize: '0.875rem',
                overflow: 'auto'
              }}>
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
