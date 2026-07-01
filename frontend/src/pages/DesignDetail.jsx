import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ShoeViewer from '../components/shoe/ShoeViewer'
import DesignCard from '../components/community/DesignCard'
import {
  getDesign, getDesigns, getCreators, likeDesign,
  viewDesign, saveDesign, buyDesign, followCreator,
  getComments, addComment as apiAddComment
} from '../api/client'
import './DesignDetail.css'

export default function DesignDetail() {
  const { id } = useParams()
  const [liked, setLiked]   = useState(false)
  const [saved, setSaved]   = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [fullscreen, setFullscreen] = useState(false)
  const [design, setDesign]   = useState(null)
  const [similar, setSimilar]  = useState([])
  const [allCreators, setAllCreators] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [buying, setBuying] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [creatorFollowing, setCreatorFollowing] = useState(false)
  const [creatorFollowersCount, setCreatorFollowersCount] = useState(0)

  useEffect(() => {
    const userStr = localStorage.getItem('jyno_user')
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr))
      } catch (err) {
        console.error(err)
      }
    }
  }, [])

  useEffect(() => {
    getDesign(id).then(data => {
      setDesign(data)
      const userStr = localStorage.getItem('jyno_user')
      let user = 'guest'
      if (userStr) {
        try { user = JSON.parse(userStr).username } catch (_) {}
      }
      viewDesign(id, user).catch(console.error)
    }).catch(console.error)

    getDesigns().then(all => setSimilar(all.filter(d => d.id !== id).slice(0, 3))).catch(console.error)
    getCreators().then(setAllCreators).catch(console.error)
    getComments(id).then(setComments).catch(console.error)
  }, [id])

  const creator = design
    ? (allCreators.find(c => c.username === design.creator.username) || allCreators[0] || {})
    : {}

  useEffect(() => {
    if (creator) {
      setCreatorFollowersCount(creator.followers || 0)
    }
  }, [creator])

  async function handleAddComment() {
    if (!comment.trim() || !design) return
    const commentatorName = currentUser?.name || 'Guest'
    try {
      const newComment = await apiAddComment(design.id, commentatorName, comment.trim())
      setComments(prev => [newComment, ...prev])
      setDesign(prev => prev ? { ...prev, comments: prev.comments + 1 } : null)
      setComment('')
    } catch (err) {
      console.error("Post comment failed:", err)
    }
  }

  async function handleLike() {
    if (!design) return
    const username = currentUser?.username || 'guest'
    if (!liked) {
      likeDesign(design.id, username).catch(console.error)
      setDesign(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
    }
    setLiked(l => !l)
  }

  async function handleSave() {
    if (!design) return
    const username = currentUser?.username || 'guest'
    if (!saved) {
      saveDesign(design.id, username).catch(console.error)
      setDesign(prev => prev ? { ...prev, saves: prev.saves + 1 } : null)
    }
    setSaved(s => !s)
  }

  async function handleBuy() {
    if (!design) return
    setBuying(true)
    const username = currentUser?.username || 'guest'
    try {
      await buyDesign(design.id, username)
      setShowSuccessModal(true)
      // Increment views count locally as a proxy or just update it
      setDesign(prev => prev ? { ...prev, views: prev.views + 1 } : null)
    } catch (err) {
      console.error("Purchase failed:", err)
      alert("Purchase failed. Please try again.")
    } finally {
      setBuying(false)
    }
  }

  async function handleFollow(e) {
    e.preventDefault()
    if (!creator?.username) return
    const username = currentUser?.username || 'guest'
    try {
      await followCreator(creator.username, username)
      setCreatorFollowing(true)
      setCreatorFollowersCount(prev => prev + 1)
    } catch (err) {
      console.error("Follow failed:", err)
    }
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
                <div className="heading-sm text-white">{creator.name || design.creator.name}</div>
                <div className="body-sm">@{creator.username || design.creator.username} · {creatorFollowersCount.toLocaleString()} followers</div>
              </div>
              <button
                className={`btn ${creatorFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                style={{ marginLeft: 'auto' }}
                onClick={handleFollow}
                disabled={creatorFollowing}
              >
                {creatorFollowing ? 'Following ✓' : '+ Follow'}
              </button>
            </Link>

            {/* Actions */}
            <div className="design-detail__actions">
              <button
                className={`btn ${liked ? 'btn-danger' : 'btn-secondary'} flex-1`}
                onClick={handleLike}
                style={{ flex: 1 }}
              >
                {liked ? '❤️ Liked' : '🤍 Like'}
              </button>
              <button
                className={`btn ${saved ? 'btn-secondary' : 'btn-secondary'} flex-1`}
                onClick={handleSave}
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
                <button
                  className={`btn btn-primary btn-lg ${buying ? 'loading' : ''}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleBuy}
                  disabled={buying}
                >
                  {buying ? 'Processing Transaction...' : 'Buy This Shoe 👟'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--sp-2)' }}
                  onClick={handleBuy}
                  disabled={buying}
                >
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
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddComment}>Post</button>
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

      {showSuccessModal && (
        <div className="success-modal-overlay animate-fade-in" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal-card" onClick={e => e.stopPropagation()}>
            <div className="success-modal-icon">🎉</div>
            <h2 className="heading-lg text-white" style={{ marginTop: '10px' }}>Purchase Successful!</h2>
            <p className="body-md text-silver" style={{ marginTop: '10px', textAlign: 'center' }}>
              You bought <strong>{design?.title}</strong> for <span className="text-lime font-mono" style={{ fontWeight: 700 }}>${design?.price}</span>!
            </p>
            <p className="body-sm text-muted" style={{ marginTop: '8px', textAlign: 'center' }}>
              The creator <strong>{creator?.name || design?.creator?.name}</strong> has been credited. A secure confirmation email is on the way.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%' }}>
              <button className="btn btn-primary flex-1" style={{ justifyContent: 'center' }} onClick={() => setShowSuccessModal(false)}>
                Awesome
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
