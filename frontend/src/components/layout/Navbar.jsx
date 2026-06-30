import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Explore',    path: '/community' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Studio',     path: '/studio' },
  { label: 'AI Studio',  path: '/ai-studio' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [location])

  // Sync user state from localStorage
  useEffect(() => {
    const updateUser = () => {
      const userStr = localStorage.getItem('jyno_user')
      if (userStr) {
        try {
          setUser(JSON.parse(userStr))
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
    updateUser()
    window.addEventListener('storage', updateUser)
    return () => window.removeEventListener('storage', updateUser)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  function handleLogout() {
    localStorage.removeItem('jyno_user')
    localStorage.removeItem('jyno_token')
    setUser(null)
    setDropdownOpen(false)
    window.dispatchEvent(new Event('storage'))
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M2 20 Q8 8 14 12 Q20 16 26 4" stroke="#C8FF00" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="14" cy="22" r="4" fill="#C8FF00" opacity="0.3"/>
              <circle cx="14" cy="22" r="2" fill="#C8FF00"/>
            </svg>
          </span>
          <span className="navbar__logo-text">jyno</span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {NAV_LINKS.map(l => (
            <li key={l.path}>
              <Link
                to={l.path}
                className={`navbar__link ${location.pathname === l.path ? 'navbar__link--active' : ''}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user-menu" ref={dropdownRef}>
              <button
                className="navbar__avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="User Menu"
              >
                <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.75rem' }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              </button>
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <span className="navbar__dropdown-name">{user.name}</span>
                    <span className="navbar__dropdown-role">{user.role === 'admin' ? 'Administrator' : 'Creator'}</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/jyno-control" className="navbar__dropdown-item">🔒 Admin Panel</Link>
                  )}
                  <Link to="/dashboard" className="navbar__dropdown-item">👟 My Dashboard</Link>
                  <button className="navbar__dropdown-item text-pink" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm" style={{ marginRight: '10px' }}>
              Log In
            </Link>
          )}

          <Link to="/studio" className="btn btn-primary btn-sm">
            Start Designing
          </Link>
          
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map(l => (
            <li key={l.path}>
              <Link to={l.path} className="navbar__mobile-link">{l.label}</Link>
            </li>
          ))}
          {user ? (
            <>
              {user.role === 'admin' && (
                <li>
                  <Link to="/jyno-control" className="navbar__mobile-link">🔒 Admin Panel</Link>
                </li>
              )}
              <li>
                <Link to="/dashboard" className="navbar__mobile-link">Dashboard</Link>
              </li>
              <li>
                <button className="navbar__mobile-link text-pink" onClick={handleLogout} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '12px 24px', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="navbar__mobile-link">Log In</Link>
            </li>
          )}
          <li>
            <Link to="/studio" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              Start Designing
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
