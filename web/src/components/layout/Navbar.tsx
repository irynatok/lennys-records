import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useNavbar } from './NavbarContext';

const links = [
  { to: '/', label: 'Guests' },
  { to: '/books', label: 'Books' },
  { to: '/movies', label: 'Movies & TV' },
  { to: '/products', label: 'Products' },
  { to: '/life-mottos', label: 'Life Mottos' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { search, setSearch, onRandomClick, showSearch } = useNavbar();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: '#FEFEFE',
        borderBottom: '1px solid #DF5B24',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '32px',
      }}
    >
      {/* Logo */}
      <NavLink
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <video
          src="/flame.mov"
          width={28}
          height={28}
          autoPlay
          loop
          muted
          playsInline
          style={{ imageRendering: 'pixelated' }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
          }}
        >
          Lenny's Records
        </span>
      </NavLink>

      {/* Desktop nav links */}
      <div
        className="hidden md:flex"
        style={{ alignItems: 'center', gap: '4px' }}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#DF5B24' : '#6B6560',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              background: isActive ? '#E8EEFA' : 'transparent',
              transition: 'background 0.12s, color 0.12s',
            })}
          >
            {link.label}
          </NavLink>
        ))}

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '20px',
            background: '#D4CCC0',
            margin: '0 8px',
          }}
        />

        {/* About link - slightly different style */}
        <NavLink
          to="/about"
          style={({ isActive }) => ({
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: isActive ? '#DF5B24' : '#8B8580',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            background: isActive ? '#E8EEFA' : 'transparent',
            transition: 'background 0.12s, color 0.12s',
            fontStyle: 'italic',
          })}
        >
          About
        </NavLink>
      </div>

      {/* Search & Surprise me - grouped together */}
      <div
        className="hidden md:flex"
        style={{
          alignItems: 'center',
          gap: '6px',
          marginLeft: 'auto',
        }}
      >
        {/* Search field */}
        {showSearch && (
          <div style={{ position: 'relative', width: '200px' }}>
            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#A09890', fontSize: '0.85rem', pointerEvents: 'none' }}>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="win-input"
              style={{ paddingLeft: '28px', width: '100%' }}
            />
          </div>
        )}

        {/* Surprise me button */}
        {onRandomClick && (
          <button
            onClick={onRandomClick}
            style={{
              fontSize: '0.875rem',
              padding: '7px 16px',
              background: '#DF5B24',
              color: '#FEFEFE',
              border: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'opacity 0.15s, transform 0.1s',
              userSelect: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✨ Surprise me
          </button>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          marginLeft: 'auto',
          padding: '8px',
          color: '#1A1A1A',
          fontSize: '1.25rem',
        }}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              right: 0,
              background: '#FEFEFE',
              borderBottom: '1px solid #DF5B24',
              padding: '8px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Mobile search */}
            {showSearch && (
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#A09890', fontSize: '0.85rem', pointerEvents: 'none' }}>
                  🔍
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="win-input"
                  style={{ paddingLeft: '28px', width: '100%' }}
                />
              </div>
            )}

            {/* Mobile random button */}
            {onRandomClick && (
              <button
                onClick={() => {
                  onRandomClick();
                  setMobileOpen(false);
                }}
                style={{
                  fontSize: '0.875rem',
                  padding: '8px 16px',
                  width: '100%',
                  background: '#DF5B24',
                  color: '#FEFEFE',
                  border: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  userSelect: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                ✨ Surprise me
              </button>
            )}

            {/* Divider if search or random button present */}
            {(showSearch || onRandomClick) && (
              <div style={{ height: '1px', background: '#EDE7D9', margin: '4px 0' }} />
            )}

            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  padding: '10px 12px',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  color: isActive ? '#4A78C4' : '#1A1A1A',
                  background: isActive ? '#E8EEFA' : 'transparent',
                  borderRadius: '4px',
                })}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Divider */}
            <div style={{ height: '1px', background: '#EDE7D9', margin: '8px 0' }} />

            {/* About link - mobile */}
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                padding: '10px 12px',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '0.95rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? '#4A78C4' : '#8B8580',
                background: isActive ? '#E8EEFA' : 'transparent',
                borderRadius: '4px',
                fontStyle: 'italic',
              })}
            >
              About
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
