interface EmptyStateProps {
    message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                padding: '40px 24px',
            }}
        >
            <span style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</span>
            <p
                style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9rem',
                    color: '#6B6560',
                    maxWidth: '280px',
                    lineHeight: 1.5,
                }}
            >
                {message}
            </p>
        </div>
    );
}
