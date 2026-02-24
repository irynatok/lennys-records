interface ErrorStateProps {
  message: string;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Reusable error display component with optional retry button
 */
export default function ErrorState({
  message,
  error,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '500px',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
        }}
      >
        ⚠️
      </div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'oklch(0.3 0.05 270)',
          marginBottom: '0.5rem',
        }}
      >
        {message}
      </h2>
      {error && (
        <p
          style={{
            color: 'oklch(0.5 0.05 270)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          {error.message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'oklch(0.95 0.02 270)',
            border: '2px solid oklch(0.85 0.05 270)',
            borderRadius: '8px',
            color: 'oklch(0.3 0.05 270)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'oklch(0.9 0.05 270)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'oklch(0.95 0.02 270)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
