import { useEffect } from 'react';
import PageTransition from '../components/layout/PageTransition';
import { useNavbar } from '../components/layout/NavbarContext';

export default function AboutPage() {
  const { setShowSearch, setRandomClick } = useNavbar();

  useEffect(() => {
    // Hide search and random button on About page
    setShowSearch(false);
    setRandomClick(undefined);
  }, [setShowSearch, setRandomClick]);

  return (
    <PageTransition>
      <div
        style={{
          height: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#1A1A1A',
            lineHeight: 1.7,
          }}
        >
          {/* Header */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              fontStyle: 'italic',
              marginBottom: '16px',
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
            }}
          >
            About this project
          </h1>

          {/* Content */}
          <div style={{ fontSize: '1.05rem', color: '#4A4340' }}>
            <p style={{ marginBottom: '24px' }}>
              Hey there! Welcome to <strong>Lenny's Records</strong> — a little passion project
              that brings together all the amazing recommendations from{' '}
              <a
                href="https://www.lennysnewsletter.com/podcast"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DF5B24', textDecoration: 'underline' }}
              >
                Lenny's Podcast
              </a>{' '}
              lightning rounds.
            </p>

            <p style={{ marginBottom: '24px' }}>
              If you've ever listened to the show, you know that the lightning round at the end
              is pure gold – favorite books, life-changing products, binge-worthy shows, and those
              little nuggets of wisdom that stick with you. So I built this. A cozy little archive where you can browse{' '}
              <strong>302 episodes</strong> worth of recommendations.
            </p>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                fontStyle: 'italic',
                marginTop: '48px',
                marginBottom: '16px',
                color: '#1A1A1A',
              }}
            >
              How it works
            </h2>

            <p style={{ marginBottom: '16px' }}>
              Behind the scenes, there's a Python script that parses podcast transcripts with
              AI (Gemini and Groq API ) to extract all the recommendations. The web app
              is built with React, TypeScript, and a bunch of nice animations. Every recommendation links back to the original Substack article, so you can dive
              deeper into the full conversation. 
            </p>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                fontStyle: 'italic',
                marginTop: '48px',
                marginBottom: '24px',
                color: '#1A1A1A',
              }}
            >
              Made with care
            </h2>

            <p style={{ marginBottom: '32px' }}>
              This project was crafted by Iryna Tokarchuk with the help of Claude Code.
              It's open source, so feel free to{' '}
              <a
                href="https://github.com/irynatok/lennys-records"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DF5B24', textDecoration: 'underline' }}
              >
                peek under the hood
              </a>{' '}
              or contribute if you're into that sort of thing.
            </p>

            {/* Team section */}
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginTop: '40px',
                marginBottom: '48px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {/* Iryna */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <a
                  href="https://www.linkedin.com/in/irynatokarchuk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #DF5B24',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <img
                      src="/iryna.jpeg"
                      alt="Iryna Tokarchuk"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: '#1A1A1A',
                        marginBottom: '4px',
                      }}
                    >
                      Iryna Tokarchuk
                    </div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#6B6560',
                        fontStyle: 'italic',
                      }}
                    >
                      Product Manager
                    </div>
                  </div>
                </a>
              </div>

              {/* Claude Code */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <a
                  href="https://claude.ai/code"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #DF5B24',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      background: '#FEFEFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src="/claude.jpg"
                      alt="Claude Code"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: '#1A1A1A',
                        marginBottom: '4px',
                      }}
                    >
                      Claude Code
                    </div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#6B6560',
                        fontStyle: 'italic',
                      }}
                    >
                      AI Assistant
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <p style={{ marginBottom: '48px', textAlign: 'center', fontStyle: 'italic' }}>
              Hope you find something inspiring here. Happy browsing! ✨
            </p>

            {/* Footer note */}
            <div
              style={{
                marginTop: '64px',
                paddingTop: '24px',
                borderTop: '1px solid #EDE7D9',
                fontSize: '0.9rem',
                color: '#8B8580',
                fontStyle: 'italic',
              }}
            >
              <p>
                This is an unofficial fan project and is not affiliated with Lenny Rachitsky or
                Lenny's Newsletter. All content belongs to the original creators and guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
