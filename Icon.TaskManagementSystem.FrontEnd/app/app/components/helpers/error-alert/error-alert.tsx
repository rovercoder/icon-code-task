import React from 'react';
import './error-alert.css';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onRetry, 
  showRetryButton = true 
}) => {
  return (
    <div className="error-alert-container">
      <div className="error-alert-content">
        <div className="error-icon">⚠️</div>
        <span className="error-message">{message}</span>
        {showRetryButton && onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;