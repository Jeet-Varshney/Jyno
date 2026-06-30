import { useState } from 'react'
import { Link } from 'react-router-dom'
import ShoeViewer from '../shoe/ShoeViewer'
import './DesignCard.css'

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
}

// Map colorA/B/C to shoe zones
function getShoeColors(design) {
  return {
    colorUpper:  design.colorA || '#1A1A1E',
    colorSole:   design.colorB || '#C8FF00',
    colorAccent: design.colorC || '#FF3366',
    colorLace:   design.colorLace || '#ffffff',
    colorTongue: design.colorTongue || '#2A2A35',
  }
}

export default function DesignCard({ design, compact = false }) {
  const [liked, setLiked]   = useState(false)
  const [saved, setSaved]   = useState(false)
  const [likeCount, setLikeCount] = useState(design.likes)

  function handleLike(e) {
    e.preventDefault()
    setLiked(v => !v)
    setLikeCount(c => liked ? c - 1 : c + 1)
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(v => !v)
  }

  const colors = getShoeColors(design)

  return (
    <Link to={`/design/${design.id}`} className={`design-card ${compact ? 'design-card--compact' : ''}`}>
      {/* Shoe Preview */}
      <div className="design-card__preview">
        <ShoeViewer {...colors} size="md" animated={true} />

        {/* Badges */}
        <div className="design-card__badges">
          {design.trending && <span className="badge badge-pink">🔥 Hot</span>}
          {design.forSale  && <span className="badge badge-lime">For Sale</span>}
        </div>

        {/* Hover actions */}
        <div className="design-card__hover-actions">
          <button
            className={`design-card__action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            <HeartIcon filled={liked} />
          </button>
          <button
            className={`design-card__action-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label="Save"
          >
            <BookmarkIcon filled={saved} />
          </button>
          <button
            className="design-card__action-btn"
            onClick={e => e.preventDefault()}
            aria-label="Share"
          >
            <ShareIcon />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="design-card__info">
        <div className="design-card__header">
          <h3 className="design-card__title">{design.title}</h3>
          {design.forSale && (
            <span className="design-card__price">${design.price}</span>
          )}
        </div>

        <div className="design-card__creator">
          <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.65rem', width: 24, height: 24, borderRadius: '50%' }}>
            {design.creator.name[0]}
          </div>
          <span className="body-sm">{design.creator.name}</span>
          {design.creator.verified && <VerifiedIcon />}
        </div>

        {!compact && (
          <div className="design-card__stats">
            <span className={`design-card__stat ${liked ? 'stat--liked' : ''}`}>
              <HeartIcon filled={liked} size={13} /> {formatNum(likeCount)}
            </span>
            <span className="design-card__stat">
              💬 {formatNum(design.comments)}
            </span>
            <span className="design-card__stat">
              👁️ {formatNum(design.views)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function HeartIcon({ filled, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? '#FF3366' : 'none'} stroke={filled ? '#FF3366' : 'currentColor'} strokeWidth="1.5">
      <path d="M8 14s-6-3.5-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4.5-6 8-6 8z"/>
    </svg>
  )
}
function BookmarkIcon({ filled, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? '#C8FF00' : 'none'} stroke={filled ? '#C8FF00' : 'currentColor'} strokeWidth="1.5">
      <path d="M3 2h10v12l-5-3-5 3V2z"/>
    </svg>
  )
}
function ShareIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="3" r="1.5"/><circle cx="4" cy="8" r="1.5"/><circle cx="12" cy="13" r="1.5"/>
      <line x1="5.5" y1="7" x2="10.5" y2="4"/><line x1="5.5" y1="9" x2="10.5" y2="12"/>
    </svg>
  )
}
function VerifiedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="#00D4FF">
      <path d="M8 1l1.9 2.1L12.5 2l.5 2.7L16 6l-1.5 2.5L16 11l-3 .3L12.5 14l-2.6-1.1L8 15l-1.9-2.1L3.5 14l-.5-2.7L0 10l1.5-2.5L0 5l3-.3L3.5 2l2.6 1.1z"/>
      <path d="M5.5 8l2 2 3-3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
