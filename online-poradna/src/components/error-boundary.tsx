import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="errorContainer">
      <h1>Technická chyba</h1>
      <p>Omlouváme se, něco se pokazilo. Zkuste to prosím později.</p>
      <pre className="errorDetails">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="retryButton">
        Zkusit znovu
      </button>
    </div>
  );
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
      onError={(error, info) => {
        console.error('ErrorBoundary zachycená chyba:', error);
        console.error('Info o chybě:', info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
