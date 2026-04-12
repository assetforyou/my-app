import React from 'react';
import { Alert, Button, Container, Row, Col } from 'react-bootstrap';
import { RefreshCw, AlertTriangle, Bug, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Error Boundary component to catch and display errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // if (process.env.REACT_APP_SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    // }
    
    // Log to our own error tracking endpoint if available
    if (process.env.REACT_APP_ERROR_LOGGING_URL) {
      fetch(process.env.REACT_APP_ERROR_LOGGING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(err => console.error('Failed to log error:', err));
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page to reset the application state
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.navigate?.('/landing');
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5 error-boundary-container">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Alert variant="danger" className="text-center error-boundary-alert">
                <div className="error-icon mb-3">
                  <AlertTriangle size={48} className="text-danger" />
                </div>
                <Alert.Heading>Oops! Something went wrong</Alert.Heading>
                <p className="error-message">
                  We're sorry, but there was an error loading this section of the application.
                  This could be due to a temporary issue or invalid data.
                </p>
                
                <div className="error-actions d-flex justify-content-center gap-3 mt-4 flex-wrap">
                  <Button 
                    variant="outline-danger" 
                    onClick={this.handleReset}
                    className="d-flex align-items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh Page
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={this.handleGoHome}
                    className="d-flex align-items-center gap-2"
                  >
                    <Home size={16} />
                    Go to Dashboard
                  </Button>
                </div>

                {/* Show error details in development mode */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="error-details mt-4 text-start">
                    <details>
                      <summary className="text-muted cursor-pointer">
                        <Bug size={16} className="me-2" />
                        Error Details (Development Mode)
                      </summary>
                      <div className="error-info mt-3 p-3 bg-light rounded">
                        <h6 className="text-danger mb-2">Error:</h6>
                        <pre className="mb-3" style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          fontSize: '12px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {this.state.error.toString()}
                        </pre>
                        
                        <h6 className="text-muted mb-2">Component Stack:</h6>
                        <pre className="component-stack" style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          fontSize: '12px',
                          maxHeight: '300px',
                          overflow: 'auto'
                        }}>
                          {this.state.errorInfo?.componentStack}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </Alert>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for ErrorBoundary to use with React Router
 */
const ErrorBoundaryWithRouter = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

export default ErrorBoundaryWithRouter;
export { ErrorBoundary };