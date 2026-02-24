/**
 * Simple loading spinner component
 */
export default function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid oklch(0.9 0.05 270)',
          borderTopColor: 'oklch(0.5 0.1 270)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
