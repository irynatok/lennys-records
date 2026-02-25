import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Episode } from '../../data/types';
import { useModalKeyboard } from '../../hooks/useModalKeyboard';
import ModalBackdrop from '../shared/ModalBackdrop';
import ModalFooter from '../shared/ModalFooter';
import { Z_INDEX } from '../../constants/zIndex';
import { MODAL_DIMENSIONS } from '../../constants/modal';
import { isValidUrl } from '../../utils/urlValidator';

interface GuestModalProps {
  episode: Episode;
  accentColor: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

function Section({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A09890' }}>
          {title}
        </p>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${accentColor}, transparent)`, opacity: 0.4 }} />
      </div>
      {children}
    </div>
  );
}

function ReachChip({ text, accentColor }: { text: string; accentColor: string }) {
  const isUrl = isValidUrl(text);
  const href = isUrl ? (text.startsWith('http') ? text : `https://${text}`) : null;
  const style: React.CSSProperties = {
    display: 'inline-block',
    background: '#F5F0E8',
    border: '1px solid #DDD8CF',
    borderRadius: '4px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.78rem',
    padding: '3px 10px',
    color: href ? accentColor : '#1A1A1A',
    textDecoration: 'none',
  };
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{text} ↗</a>;
  return <span style={style}>{text}</span>;
}

// Helper component for styled recommendation cards inside the modal
function RecommendationCard({ title, subtitle, why, url, accentColor }: { title: string, subtitle?: string, why?: string | null, url?: string | null, accentColor: string }) {
  const [hovered, setHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FEFEFE',
        border: `1px solid ${hovered && url ? accentColor : '#EDE7D9'}`,
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '12px',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered && url ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        cursor: url ? 'pointer' : 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h3 style={{ margin: 0, lineHeight: 1.3 }}>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.05rem', fontWeight: 600, color: '#1A1A1A' }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#6B6560', fontWeight: 400, marginLeft: '6px' }}>
              {subtitle}
            </span>
          )}
        </h3>
        {url && (
          <span style={{ color: accentColor, fontSize: '1.2rem', lineHeight: 1, flexShrink: 0, paddingTop: '2px' }}>
            ↗
          </span>
        )}
      </div>
      {why && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#6B6560', lineHeight: 1.5, marginTop: '8px', marginBottom: 0 }}>
          {why}
        </p>
      )}
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </a>
    );
  }
  return content;
}

export default function GuestModal({ episode, accentColor, onClose, onNext, onPrevious }: GuestModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lr = episode.lightning_round;
  const names = episode.guests.map((g) => g.name).join(' & ');
  const titles = episode.guests.flatMap((g) => g.titles);

  useModalKeyboard({ onClose, onNext, onPrevious });


  return (
    <>
      <ModalBackdrop onClick={onClose} zIndex={Z_INDEX.GUEST_MODAL_BACKDROP} />

      {/* Modal */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.GUEST_MODAL, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: MODAL_DIMENSIONS.DESKTOP_PADDING }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ type: 'spring', damping: 30, stiffness: 380 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: MODAL_DIMENSIONS.MAX_WIDTH,
            maxHeight: MODAL_DIMENSIONS.MAX_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            background: '#FEFEFE',
            border: '1px solid #DDD8CF',
            borderTop: `6px solid ${accentColor}`, // Match folder color with thick top border
            borderRadius: '8px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            outline: 'none',
            overflow: 'hidden',
            margin: 'auto', // Ensure it explicitly centers
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid #EDE7D9', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.8rem', color: '#1A1A1A', lineHeight: 1.15 }}>
                {names}
              </h2>
              {titles.length > 0 && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#6B6560', marginTop: '4px' }}>
                  {titles.join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#A09890', padding: '4px', lineHeight: 1, flexShrink: 0, cursor: 'pointer', transition: 'color 0.12s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1A1A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A09890')}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '12px 32px 24px', overflowY: 'auto', flex: 1 }} onWheel={(e) => e.stopPropagation()}>

            {/* Books */}
            {lr.books && lr.books.length > 0 && (
              <Section title="Books" accentColor={accentColor}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {lr.books.map((book, i) => (
                    <RecommendationCard
                      key={`${book.title}-${i}`}
                      title={book.title}
                      subtitle={book.author ? `by ${book.author}` : undefined}
                      why={book.why}
                      url={book.url ?? undefined}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* TV & Movies */}
            {lr.tv_movies && lr.tv_movies.length > 0 && (
              <Section title="TV & Movies" accentColor={accentColor}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {lr.tv_movies.map((item, i) => (
                    <RecommendationCard
                      key={`${item.title}-${i}`}
                      title={item.title}
                      subtitle={item.type === 'tv_show' ? 'TV' : item.type}
                      why={item.why}
                      url={item.url ?? undefined}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Products */}
            {lr.products && lr.products.length > 0 && (
              <Section title="Products" accentColor={accentColor}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {lr.products.map((product, i) => (
                    <RecommendationCard
                      key={`${product.name}-${i}`}
                      title={product.name}
                      why={product.why}
                      url={product.url ?? undefined}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Life motto */}
            {lr.life_motto && (
              <Section title="Life Motto" accentColor={accentColor}>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.6 }}>
                  "{lr.life_motto}"
                </p>
              </Section>
            )}

            {/* Interview question */}
            {lr.interview_question && (
              <Section title="Favourite Interview Question" accentColor={accentColor}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.6 }}>{lr.interview_question}</p>
              </Section>
            )}

            {/* Productivity tip */}
            {lr.productivity_tip && (
              <Section title="Productivity Tip" accentColor={accentColor}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.6 }}>{lr.productivity_tip}</p>
              </Section>
            )}

            {/* Substack link */}
            {episode.substack_url && (
              <Section title="Episode" accentColor={accentColor}>
                <a
                  href={episode.substack_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: accentColor, fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', borderBottom: `1px solid ${accentColor}` }}
                >
                  Check the episode ↗
                </a>
              </Section>
            )}

            {/* Where to find */}
            {(() => {
              if (episode.where_to_find && episode.where_to_find.length > 0) {
                return (
                  <Section title="Where to Find" accentColor={accentColor}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {episode.where_to_find.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ ...({} as React.CSSProperties), display: 'inline-block', background: '#F5F0E8', border: '1px solid #DDD8CF', borderRadius: '4px', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', padding: '3px 10px', color: accentColor, textDecoration: 'none' }}>
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  </Section>
                );
              }
              const PLACEHOLDER_PATTERNS = /^@?handle\s+on\s+/i;
              const BARE_PLATFORM_NAMES = new Set(['twitter', 'linkedin', 'instagram', 'facebook', 'youtube', 'tiktok']);
              const reachItems = episode.guests
                .flatMap((g) => [...g.reach.platforms, ...g.reach.websites])
                .filter((item) => !PLACEHOLDER_PATTERNS.test(item) && !BARE_PLATFORM_NAMES.has(item.toLowerCase()));
              if (reachItems.length === 0) return null;
              return (
                <Section title="Where to Find" accentColor={accentColor}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {reachItems.map((link, i) => <ReachChip key={i} text={link} accentColor={accentColor} />)}
                  </div>
                </Section>
              );
            })()}
          </div>

          {/* Footer */}
          <ModalFooter
            onClose={onClose}
            onNext={onNext}
            onPrevious={onPrevious}
            buttonStyle="win-btn"
          />
        </motion.div>
      </div>
    </>
  );
}
