import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import DesignCard from '../components/community/DesignCard'
import { getCreators, getDesigns } from '../api/client'
import './CreatorProfile.css'

const BADGE_INFO = {
  'verified':      { label: 'Verified',      color: 'cyan',   icon: '✓' },
  'top-creator':   { label: 'Top Creator',    color: 'gold',   icon: '⭐' },
  'gold-seller':   { label: 'Gold Seller',    color: 'gold',   icon: '💰' },
  'early-adopter': { label: 'Early Adopter',  color: 'purple', icon: '🚀' },
}

const TABS = ['Designs', 'Collections', 'Sold', 'About']

export default function CreatorProfile() {
  const { username } = useParams()
  const [activeTab, setActiveTab] = useState('Designs')
  const [following, setFollowing] = useState(false)
  const [allCreators, setAllCreators] = useState([])
  const [allDesigns, setAllDesigns]   = useState([])

  useEffect(() => {
    getCreators().then(setAllCreators).catch(console.error)
    getDesigns().then(setAllDesigns).catch(console.error)
  }, [])

  const creator = allCreators.find(c => c.username === username) || allCreators[0] || {}
  const creatorDesigns = allDesigns.filter(d => d.creator.username === creator.username)
  // Fill up if too few
  const displayDesigns = creatorDesigns.length > 0 ? creatorDesigns : allDesigns.slice(0, 4)

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return n
  }

  return (
    <div className="creator-profile">
      <Navbar />

      {/* Cover */}
      <div className="creator-cover" style={{
        background: `linear-gradient(135deg, ${creator.colorAccent}18, transparent 60%), var(--jyno-dark)`
      }}>
        <div className="creator-cover__glow" style={{
          background: `radial-gradient(ellipse at 30% 50%, ${creator.colorAccent}25, transparent 60%)`
        }} />
      </div>

      {/* Profile Header */}
      <div className="container">
        <div className="creator-header">
          <div className="creator-header__left">
            <div className="creator-header__avatar-wrap">
              <div
                className="creator-header__avatar"
                style={{ background: `linear-gradient(135deg, ${creator.colorAccent}44, var(--jyno-elevated))` }}
              >
                <span style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {creator.name[0]}
                </span>
              </div>
              {creator.badges.includes('verified') && (
                <div className="creator-header__verified">✓</div>
              )}
            </div>

            <div className="creator-header__info">
              <div className="creator-header__name-row">
                <h1 className="display-md text-white" style={{ fontSize: '2rem' }}>{creator.name}</h1>
                <div className="creator-header__badges">
                  {creator.badges.map(b => {
                    const info = BADGE_INFO[b]
                    return info ? (
                      <span key={b} className={`badge badge-${info.color}`}>
                        {info.icon} {info.label}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
              <p className="body-sm" style={{ marginBottom: 8 }}>@{creator.username}</p>
              <p className="body-md" style={{ maxWidth: 460 }}>{creator.bio}</p>
              <p className="body-sm text-muted" style={{ marginTop: 8 }}>Member since {creator.joinedAt}</p>
            </div>
          </div>

          <div className="creator-header__right">
            <div className="creator-header__stats">
              {[
                { val: formatNum(creator.followers), label: 'Followers' },
                { val: formatNum(creator.following), label: 'Following' },
                { val: creator.totalDesigns, label: 'Designs' },
                { val: creator.totalSales, label: 'Sales' },
              ].map((s, i) => (
                <div key={i} className="creator-header__stat">
                  <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--jyno-white)' }}>
                    {s.val}
                  </span>
                  <span className="label text-muted">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="creator-header__actions">
              <button
                className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setFollowing(v => !v)}
              >
                {following ? 'Following ✓' : '+ Follow'}
              </button>
              <button className="btn btn-secondary btn-icon" title="Message">✉</button>
              <button className="btn btn-secondary btn-icon" title="Share">⬆</button>
            </div>
            <div className="creator-header__earnings">
              <span className="label text-muted">Total Earned</span>
              <span className="mono text-lime" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                ${creator.totalEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="creator-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`creator-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="creator-content">
          {activeTab === 'Designs' && (
            <div className="creator-designs-grid">
              {displayDesigns.map((d, i) => (
                <div key={d.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <DesignCard design={d} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'About' && (
            <div className="creator-about">
              <div className="creator-about__card card-glass">
                <h3 className="heading-md text-white">About {creator.name}</h3>
                <p className="body-lg" style={{ marginTop: 16 }}>{creator.bio}</p>
                <div className="creator-about__stats">
                  {[
                    { icon: '🎨', label: 'Total Designs', val: creator.totalDesigns },
                    { icon: '👥', label: 'Total Followers', val: formatNum(creator.followers) },
                    { icon: '💰', label: 'Designs Sold', val: creator.totalSales },
                    { icon: '⭐', label: 'Badges Earned', val: creator.badges.length },
                  ].map((s, i) => (
                    <div key={i} className="creator-about__stat">
                      <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                      <div>
                        <div className="mono text-white" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.val}</div>
                        <div className="label text-muted">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'Collections' || activeTab === 'Sold') && (
            <div className="creator-empty">
              <div style={{ fontSize: '3rem' }}>{activeTab === 'Collections' ? '📂' : '💳'}</div>
              <h3 className="heading-md text-white">
                {activeTab === 'Collections' ? 'Collections Coming Soon' : 'Sales History Private'}
              </h3>
              <p className="body-md">Check back later or browse their designs.</p>
              <button className="btn btn-secondary" onClick={() => setActiveTab('Designs')}>
                View Designs
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
