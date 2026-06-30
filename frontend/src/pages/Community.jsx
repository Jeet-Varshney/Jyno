import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import DesignCard from '../components/community/DesignCard'
import { getDesigns, getCreators } from '../api/client'
import { Link } from 'react-router-dom'
import './Community.css'

const TABS   = ['Trending', 'New', 'Popular', 'Following']
const CATS   = ['All', 'Running', 'Basketball', 'Casual', 'High-Top', 'Platform']
const SORT   = ['Most Liked', 'Most Recent', 'Most Viewed', 'Price: Low', 'Price: High']

export default function Community() {
  const [activeTab, setActiveTab]    = useState('Trending')
  const [activeCat, setActiveCat]    = useState('All')
  const [sortBy, setSortBy]          = useState('Most Liked')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)
  const [allDesigns, setAllDesigns]  = useState([])
  const [allCreators, setAllCreators] = useState([])
  const loaderRef = useRef(null)

  // Fetch from backend on mount
  useEffect(() => {
    getDesigns().then(setAllDesigns).catch(console.error)
    getCreators().then(setAllCreators).catch(console.error)
  }, [])

  // Simulated infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(v => Math.min(v + 3, allDesigns.length))
      }
    }, { threshold: 0.5 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [allDesigns.length])

  const filtered = allDesigns
    .filter(d => searchQuery === '' || d.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, visibleCount)

  return (
    <div className="community-page">
      <Navbar />

      {/* Header */}
      <div className="community-header">
        <div className="container">
          <div className="community-header__inner">
            <div>
              <div className="label text-lime" style={{ marginBottom: 8 }}>🌐 Community</div>
              <h1 className="display-md text-white">Explore Designs</h1>
              <p className="body-md" style={{ marginTop: 8 }}>
                {allDesigns.length * 140}+ designs from creators worldwide
              </p>
            </div>
            <Link to="/studio" className="btn btn-primary">
              + Create Design
            </Link>
          </div>

          {/* Search */}
          <div className="community-search">
            <div className="community-search__icon">🔍</div>
            <input
              className="input input-search community-search__input"
              placeholder="Search designs, creators, styles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container community-body">
        {/* Sidebar */}
        <aside className="community-sidebar">
          <div className="community-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Filter by Category</div>
            <div className="community-sidebar__cats">
              {CATS.map(c => (
                <button
                  key={c}
                  className={`tag ${activeCat === c ? 'active' : ''}`}
                  onClick={() => setActiveCat(c)}
                  style={{ justifyContent: 'flex-start', width: '100%', borderRadius: 'var(--r-md)' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="community-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Sort By</div>
            <div className="community-sidebar__cats">
              {SORT.map(s => (
                <button
                  key={s}
                  className={`tag ${sortBy === s ? 'active' : ''}`}
                  onClick={() => setSortBy(s)}
                  style={{ justifyContent: 'flex-start', width: '100%', borderRadius: 'var(--r-md)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="community-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Price Range</div>
            <div className="community-sidebar__price">
              <span className="body-sm">$0</span>
              <input type="range" min="0" max="500" defaultValue="500" className="community-slider" />
              <span className="body-sm">$500</span>
            </div>
          </div>

          {/* Featured Creators */}
          <div className="community-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Top Creators</div>
            {allCreators.slice(0, 4).map(creator => (
              <Link key={creator.id} to={`/creator/${creator.username}`} className="community-creator-mini">
                <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: '0.7rem', background: `linear-gradient(135deg, ${creator.colorAccent}22, var(--jyno-elevated))` }}>
                  {creator.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="heading-sm" style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {creator.name}
                  </div>
                  <div className="body-sm" style={{ fontSize: '0.72rem' }}>
                    {(creator.followers / 1000).toFixed(1)}k followers
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ padding: '3px 10px', fontSize: '0.72rem' }}
                  onClick={e => e.preventDefault()}>
                  Follow
                </button>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main feed */}
        <main className="community-feed">
          {/* Tabs */}
          <div className="community-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`community-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t === 'Trending' && '🔥 '}{t}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="community-grid">
            {filtered.map((d, i) => (
              <div key={d.id} className="animate-fade-up" style={{ animationDelay: `${(i % 3) * 0.08}s` }}>
                <DesignCard design={d} />
              </div>
            ))}
          </div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="community-loader">
            {visibleCount < allDesigns.length ? (
              <div className="community-loader__spinner" />
            ) : (
              <p className="body-sm text-muted">You've seen it all ✓</p>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
