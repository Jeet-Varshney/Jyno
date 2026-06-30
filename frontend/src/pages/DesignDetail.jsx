import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ShoeViewer from '../components/shoe/ShoeViewer'
import DesignCard from '../components/community/DesignCard'
import { getDesign, getDesigns, getCreators, likeDesign } from '../api/client'
import './DesignDetail.css'

const MOCK_COMMENTS = [
  { id: 1, user: 'Zara.exe',    text: 'This colorway is absolutely 🔥 genius!', time: '2h ago', likes: 34 },
  { id: 2, user: 'NovaKicks',   text: 'The sole gradient is everything. Want this IRL.', time: '4h ago', likes: 21 },
  { id: 3, user: 'UrbanCanvas', text: 'Incredible attention to detail. Top-tier work.', time: '6h ago', likes: 18 },
  { id: 4, user: 'KickCraft',   text: 'Can we get a midnight blue variation?', time: '1d ago', likes: 12 },
]

export default function DesignDetail() {
  const { id } = useParams()
  const [liked, setLiked]   = useState(false)
  const [saved, setSaved]   = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [fullscreen, setFullscreen] = useState(false)
  const [design, setDesign]   = useState(null)
  const [similar, setSimilar]  = useState([])
  const [allCreators, setAllCreators] = useState([])

  useEffect(() => {
    getDesign(id).then(setDesign).catch(console.error)
    getDesigns().then(all => setSimilar(all.filter(d => d.id !== id).slice(0, 3))).catch(console.error)
    getCreators().then(setAllCreators).catch(console.error)
  }, [id])

  const creator = design
    ? (allCreators.find(c => c.username === design.creator.username) || allCreators[0] || {})
    : {}

  function addComment() {
    if (!comment.trim()) return
    setComments(prev => [{
      id: Date.now(), user: 'You', text: comment, time: 'just now', likes: 0
    }, ...prev])
    setComment('')
  }

  function handleLike() {
    if (!liked && design) {
      likeDesign(design.id).catch(console.error)
    }
    setLiked(l => !l)
  }

  return (
    <div className="design-detail">
      <Navbar />

      {!design ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--c-muted)' }}>
          Loading design…
        </div>
      ) : (

      <div className="container design-detail__inner">
        {/* Left: Preview */}
        <div className="design-detail__left">
          <div className={`design-detail__preview-card ${fullscreen ? 'fullscreen' : ''}`}>
            <button
              className="design-detail__fullscreen-btn"
              onClick={() => setFullscreen(v => !v)}
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? '⊠' : '⊡'}
            </button>
            <ShoeViewer
              colorUpper={design.colorA}
              colorSole={design.colorB}
              colorAccent={design.colorC}
              colorLace={design.colorLace}
              colorTongue={design.colorTongue}
              size="full"
              animated={true}
              rotating={true}
            />
          </div>

          {/* Tags */}
          <div className="design-detail__tags">
            {design.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>

          {/* Similar Designs */}
          <div className="design-detail__similar">
            <h3 className="heading-md text-white" style={{ marginBottom: 'var(--sp-5)' }}>
              Similar Designs
            </h3>
            <div className="design-detail__similar-grid">
              {similar.map(d => (
                <DesignCard key={d.id} design={d} compact />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info Panel */}
        <aside className="design-detail__right">
          <div className="design-detail__panel">
            {/* Badges */}
            <div className="design-detail__badges">
              {design.trending && <span className="badge badge-pink">🔥 Trending</span>}
              {design.forSale  && <span className="badge badge-lime">Available to Purchase</span>}
            </div>

            {/* Title */}
            <h1 className="display-md text-white" style={{ fontSize: '2rem', lineHeight: 1.1 }}>
              {design.title}
            </h1>

            {/* Stats row */}
            <div className="design-detail__quick-stats">
              <span className="design-detail__quick-stat">
                ❤️ {(liked ? design.likes + 1 : design.likes).toLocaleString()}
              </span>
              <span className="design-detail__quick-stat">
                💬 {design.comments}
              </span>
              <span className="design-detail__quick-stat">
                👁️ {design.views.toLocaleString()}
              </span>
              <span className="design-detail__quick-stat text-muted">
                {design.createdAt}
              </span>
            </div>

            {/* Creator */}
            <Link to={`/creator/${creator.username}`} className="design-detail__creator">
              <div
                className="creator-card__avatar"
                style={{
                  width: 48, height: 48,
                  background: `linear-gradient(135deg, ${creator.colorAccent}33, var(--jyno-elevated))`,
                  borderRadius: '50%',
                  border: '2px solid var(--jyno-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 700, color: 'var(--jyno-white)',
                  flexShrink: 0,
                }}
              >
                {creator.name[0]}
              </div>
              <div>
                <div className="heading-sm text-white">{creator.name}</div>
                <div className="body-sm">@{creator.username} · {(creator.followers / 1000).toFixed(1)}k followers</div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}
                onClick={e => e.preventDefault()}>
                Follow
              </button>
            </Link>

            {/* Actions */}
            <div className="design-detail__actions">
              <button
                className={`btn ${liked ? 'btn-danger' : 'btn-secondary'} flex-1`}
                onClick={() => setLiked(v => !v)}
                style={{ flex: 1 }}
              >
                {liked ? '❤️ Liked' : '🤍 Like'}
              </button>
              <button
                className={`btn ${saved ? 'btn-secondary' : 'btn-secondary'} flex-1`}
                onClick={() => setSaved(v => !v)}
                style={{ flex: 1, ...(saved ? { borderColor: 'var(--jyno-lime)', color: 'var(--jyno-lime)' } : {}) }}
              >
                {saved ? '🔖 Saved' : '🔖 Save'}
              </button>
              <button className="btn btn-secondary btn-icon" title="Share">⬆</button>
            </div>

            {/* BUY CTA */}
            {design.forSale && (
              <div className="design-detail__buy">
                <div className="design-detail__price-row">
                  <div>
                    <div className="label text-muted">Price</div>
                    <div className="mono text-white" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
                      ${design.price}
                    </div>
                  </div>
                  <div className="design-detail__price-badges">
                    <span className="badge badge-lime">Limited Edition</span>
                    <span className="badge badge-silver">Ships Worldwide</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  Buy This Shoe 👟
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--sp-2)' }}>
                  Add to Cart
                </button>
                <p className="body-sm text-muted" style={{ textAlign: 'center', marginTop: 'var(--sp-2)' }}>
                  🔒 Secure checkout · 30-day returns
                </p>
              </div>
            )}

            {/* Color Preview */}
            <div className="design-detail__colors">
              <div className="label text-muted" style={{ marginBottom: 8 }}>Color Zones</div>
              <div className="design-detail__color-swatches">
                {[
                  { label: 'Upper', color: design.colorA },
                  { label: 'Sole',  color: design.colorB },
                  { label: 'Accent',color: design.colorC },
                ].map(z => (
                  <div key={z.label} className="design-detail__color-swatch">
                    <div className="design-detail__swatch" style={{ background: z.color }} />
                    <span className="body-sm">{z.label}</span>
                    <span className="mono text-muted" style={{ fontSize: '0.7rem' }}>{z.color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="design-detail__comments">
              <h3 className="heading-md text-white" style={{ marginBottom: 'var(--sp-4)' }}>
                Comments ({comments.length})
              </h3>
              <div className="design-detail__comment-input">
                <input
                  className="input"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={e => e.key === 'Enter' && addComment()}
                />
                <button className="btn btn-primary btn-sm" onClick={addComment}>Post</button>
              </div>
              <div className="design-detail__comment-list">
                {comments.map(c => (
                  <div key={c.id} className="design-detail__comment">
                    <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.65rem', borderRadius: '50%', width: 30, height: 30 }}>
                      {c.user[0]}
                    </div>
                    <div className="design-detail__comment-body">
                      <div className="design-detail__comment-header">
                        <span className="heading-sm" style={{ fontSize: '0.82rem' }}>{c.user}</span>
                        <span className="body-sm text-muted" style={{ fontSize: '0.72rem' }}>{c.time}</span>
                      </div>
                      <p className="body-sm">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      )}

      <Footer />
    </div>
  )
}
