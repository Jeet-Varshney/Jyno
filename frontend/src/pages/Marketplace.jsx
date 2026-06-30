import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ShoeViewer from '../components/shoe/ShoeViewer'
import { getDesigns, getCreators } from '../api/client'
import './Marketplace.css'

const CATS = ['All', 'Running', 'High-Top', 'Low-Top', 'Trainer', 'Platform', 'Racer']
const SORT_OPTIONS = ['Trending', 'Newest', 'Price: Low → High', 'Price: High → Low', 'Best Rated']

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#FFD700' : 'var(--jyno-muted)', fontSize: '0.75rem' }}>★</span>
      ))}
      <span className="mono" style={{ fontSize: '0.75rem', marginLeft: 4 }}>{rating}</span>
    </span>
  )
}

export default function Marketplace() {
  const [activecat, setActiveCat] = useState('All')
  const [sort, setSort]           = useState('Trending')
  const [search, setSearch]       = useState('')
  const [minPrice, setMinPrice]   = useState(0)
  const [maxPrice, setMaxPrice]   = useState(500)
  const [allDesigns, setAllDesigns] = useState([])
  const [allCreators, setAllCreators] = useState([])

  useEffect(() => {
    getDesigns().then(data => {
      // Enrich designs with product-like fields for marketplace display
      const RATINGS = [4.9, 4.8, 4.9, 4.7, 4.8, 4.6]
      const products = data.map((d, i) => ({
        ...d,
        category: d.template || 'runner',
        rating: RATINGS[i % RATINGS.length],
        reviews: Math.floor(d.likes / 20),
      }))
      setAllDesigns(products)
    }).catch(console.error)
    getCreators().then(setAllCreators).catch(console.error)
  }, [])

  const filtered = allDesigns.filter(p =>
    (activecat === 'All' || p.category === activecat.toLowerCase()) &&
    p.price >= minPrice && p.price <= maxPrice &&
    (search === '' || p.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="marketplace">
      <Navbar />

      {/* Hero Banner */}
      <div className="marketplace-hero">
        <div className="marketplace-hero__bg" />
        <div className="container marketplace-hero__inner">
          <div className="marketplace-hero__content">
            <span className="badge badge-pink" style={{ marginBottom: 16 }}>🛍️ New Drops Every Week</span>
            <h1 className="display-lg text-white">
              The Sneaker<br/>
              <span className="gradient-lime">Marketplace.</span>
            </h1>
            <p className="body-lg" style={{ marginTop: 12 }}>
              Buy exclusive, creator-designed sneakers. Every pair tells a story.
            </p>
          </div>
          <div className="marketplace-hero__shoe">
            <ShoeViewer
              colorUpper="#0A0A0B"
              colorSole="#C8FF00"
              colorAccent="#FF3366"
              size="lg"
              animated
            />
          </div>
        </div>
      </div>

      {/* Featured Drop Banner */}
      <div className="container" style={{ padding: 'var(--sp-6) var(--sp-6) 0' }}>
        <div className="marketplace-drop-banner">
          <div className="marketplace-drop-banner__content">
            <span className="badge badge-pink">🔥 Limited Drop</span>
            <h2 className="heading-lg text-white" style={{ marginTop: 8 }}>
              Graffiti Blast Trainer — <span className="text-lime">Last 12 pairs</span>
            </h2>
            <p className="body-sm" style={{ marginTop: 4 }}>By UrbanCanvas · 7,340 likes · 4.7★</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
            <span className="mono text-white" style={{ fontSize: '1.6rem', fontWeight: 700 }}>$245</span>
            <Link to="/design/6" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
      </div>

      <div className="container marketplace-body">
        {/* Sidebar */}
        <aside className="marketplace-sidebar">
          <div className="marketplace-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Search</div>
            <input
              className="input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="marketplace-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Category</div>
            <div className="marketplace-sidebar__cats">
              {CATS.map(c => (
                <button
                  key={c}
                  className={`tag ${activecat === c ? 'active' : ''}`}
                  onClick={() => setActiveCat(c)}
                  style={{ width: '100%', borderRadius: 'var(--r-md)', justifyContent: 'flex-start' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="marketplace-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Price Range</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontSize: '0.875rem' }}>${minPrice}</span>
                <span className="mono" style={{ fontSize: '0.875rem' }}>${maxPrice}</span>
              </div>
              <input type="range" min="0" max="500" value={maxPrice}
                onChange={e => setMaxPrice(+e.target.value)} style={{ accentColor: 'var(--jyno-lime)', width: '100%' }} />
            </div>
          </div>
          <div className="marketplace-sidebar__section">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Top Creator Shops</div>
            {allCreators.slice(0, 3).map(c => (
              <Link key={c.id} to={`/creator/${c.username}`} className="marketplace-creator-row">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${c.colorAccent}33, var(--jyno-elevated))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--jyno-white)', flexShrink: 0 }}>
                  {c.name[0]}
                </div>
                <div>
                  <div className="heading-sm" style={{ fontSize: '0.82rem' }}>{c.name}</div>
                  <div className="body-sm" style={{ fontSize: '0.72rem' }}>{c.totalSales} sold</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Product grid */}
        <main className="marketplace-main">
          <div className="marketplace-toolbar">
            <span className="body-sm text-silver">{filtered.length} products</span>
            <div className="marketplace-sort">
              <span className="label text-muted">Sort:</span>
              <select
                className="marketplace-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="marketplace-grid">
            {filtered.map((product, i) => (
              <Link
                key={product.id}
                to={`/design/${product.id}`}
                className={`product-card animate-fade-up`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="product-card__image">
                  <ShoeViewer
                    colorUpper={product.colorA}
                    colorSole={product.colorB}
                    colorAccent={product.colorC}
                    colorLace={product.colorLace}
                    colorTongue={product.colorTongue}
                    size="md"
                    animated
                  />
                  {product.trending && (
                    <span className="product-card__badge badge badge-pink">🔥 Hot</span>
                  )}
                  <div className="product-card__quick-buy">
                    <button className="btn btn-primary btn-sm"
                      onClick={e => e.preventDefault()}>
                      Quick Add
                    </button>
                  </div>
                </div>
                <div className="product-card__info">
                  <div className="product-card__name heading-sm">{product.title}</div>
                  <div className="product-card__creator body-sm text-silver">
                    by {product.creator.name}
                  </div>
                  <div className="product-card__row">
                    <span className="mono text-white" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      ${product.price}
                    </span>
                    <StarRating rating={product.rating} />
                  </div>
                  <div className="body-sm text-muted" style={{ fontSize: '0.72rem' }}>
                    {product.reviews} reviews
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
