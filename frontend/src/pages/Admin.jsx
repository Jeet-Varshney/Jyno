import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getDesigns, getCreators, deleteDesign, updateDesign, toggleVerifyCreator } from '../api/client'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)
  const [designs, setDesigns] = useState([])
  const [creators, setCreators] = useState([])
  const [activeTab, setActiveTab] = useState('designs')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Edit design modal state
  const [editingDesign, setEditingDesign] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState(150)
  const [editTrending, setEditTrending] = useState(false)
  const [editForSale, setEditForSale] = useState(true)

  // Verify authorization
  useEffect(() => {
    const userStr = localStorage.getItem('jyno_user')
    if (!userStr) {
      navigate('/login')
      return
    }
    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'admin') {
        setError('Access Denied. You do not have permission to view this page.')
        setLoading(false)
      } else {
        setAuthorized(true)
        loadData()
      }
    } catch {
      navigate('/login')
    }
  }, [navigate])

  async function loadData() {
    try {
      setLoading(true)
      const [dRes, cRes] = await Promise.all([getDesigns(), getCreators()])
      setDesigns(dRes)
      setCreators(cRes)
    } catch (err) {
      console.error(err)
      setError('Could not load portal data.')
    } finally {
      setLoading(false)
    }
  }

  // Delete design handler
  async function handleDeleteDesign(id) {
    if (!window.confirm('Are you sure you want to delete this design?')) return
    try {
      await deleteDesign(id)
      setDesigns(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      alert('Failed to delete design.')
    }
  }

  // Open Edit modal
  function openEditModal(design) {
    setEditingDesign(design)
    setEditTitle(design.title)
    setEditPrice(design.price)
    setEditTrending(design.trending || false)
    setEditForSale(design.forSale !== false)
  }

  // Save Edit design details
  async function handleSaveDesignEdit(e) {
    e.preventDefault()
    if (!editingDesign) return
    try {
      const updated = await updateDesign(editingDesign.id, {
        title: editTitle,
        price: Number(editPrice),
        trending: editTrending,
        forSale: editForSale
      })
      setDesigns(prev => prev.map(d => d.id === updated.id ? updated : d))
      setEditingDesign(null)
    } catch (err) {
      alert('Failed to update design.')
    }
  }

  // Toggle Creator verified badge
  async function handleToggleVerify(id) {
    try {
      const updated = await toggleVerifyCreator(id)
      setCreators(prev => prev.map(c => c.id === updated.id ? updated : c))
      // Update local designs array to match verification status
      setDesigns(prev => prev.map(d => {
        if (d.creator.username === updated.username) {
          return {
            ...d,
            creator: {
              ...d.creator,
              verified: updated.badges.includes('verified')
            }
          }
        }
        return d
      }))
    } catch (err) {
      alert('Failed to toggle verification.')
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="admin-loading">
          <div className="spinner" />
          <span>Securing portal session...</span>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="admin-error container">
          <div className="admin-error-card">
            <h2>⚠️ Access Error</h2>
            <p>{error}</p>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!authorized) return null

  // Compute stats
  const totalRevenue = designs.reduce((sum, d) => sum + (d.price || 0), 0) * 12
  const activeCreators = creators.length
  const totalDesigns = designs.length
  const verifiedCreators = creators.filter(c => c.badges.includes('verified')).length
  const verifiedRatio = activeCreators > 0 ? ((verifiedCreators / activeCreators) * 100).toFixed(0) : 0

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-main container">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1 className="heading-xl text-white">Administration Portal</h1>
            <p className="body-md text-muted">Jyno platform moderation, analytics dashboard, and system settings.</p>
          </div>
          <span className="badge badge-pink admin-security-badge">🔒 Secure Session</span>
        </header>

        {/* Dashboard Stats */}
        <section className="admin-stats">
          <div className="stat-card">
            <span className="stat-card__icon">💰</span>
            <div>
              <div className="stat-card__label">Est. Platform Volume</div>
              <div className="stat-card__value text-lime">${totalRevenue.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">👟</span>
            <div>
              <div className="stat-card__label">Total Shoe Designs</div>
              <div className="stat-card__value text-cyan">{totalDesigns}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">👑</span>
            <div>
              <div className="stat-card__label">Active Creators</div>
              <div className="stat-card__value text-pink">{activeCreators}</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">✅</span>
            <div>
              <div className="stat-card__label">Verified Ratio</div>
              <div className="stat-card__value text-white">{verifiedRatio}%</div>
            </div>
          </div>
        </section>

        {/* Platform Activity Chart (Raw SVG) */}
        <section className="admin-chart-section">
          <div className="chart-header">
            <h3 className="heading-md text-white">Daily Platform Sales Volume (30-day projection)</h3>
            <span className="text-muted body-sm">Daily Volume (USD)</span>
          </div>
          <div className="admin-chart-wrap">
            <svg viewBox="0 0 800 200" className="admin-svg-chart">
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="750" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="70" x2="750" y2="70" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="120" x2="750" y2="120" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="170" x2="750" y2="170" stroke="rgba(255,255,255,0.1)" />

              {/* Chart Line Gradient */}
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area Under Line */}
              <path
                d="M 50 170 L 50 120 Q 150 70 250 130 T 450 60 T 650 90 L 750 30 L 750 170 Z"
                fill="url(#chart-grad)"
              />

              {/* Stroke Line */}
              <path
                d="M 50 120 Q 150 70 250 130 T 450 60 T 650 90 L 750 30"
                fill="none"
                stroke="#C8FF00"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Dots on peak */}
              <circle cx="750" cy="30" r="5" fill="#00D4FF" />
              <circle cx="450" cy="60" r="4" fill="#C8FF00" />
            </svg>
            <div className="chart-labels">
              <span>May 30</span>
              <span>June 10</span>
              <span>June 20</span>
              <span>June 29</span>
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <section className="admin-tabs-section">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'designs' ? 'active' : ''}`}
              onClick={() => setActiveTab('designs')}
            >
              🎨 Shoe Designs ({totalDesigns})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'creators' ? 'active' : ''}`}
              onClick={() => setActiveTab('creators')}
            >
              👑 Creators ({activeCreators})
            </button>
          </div>

          <div className="tab-content-wrap">
            {/* === DESIGNS TAB === */}
            {activeTab === 'designs' && (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Shoe Design</th>
                      <th>Creator</th>
                      <th>Base Model</th>
                      <th>Price</th>
                      <th>Trending</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designs.map(design => (
                      <tr key={design.id}>
                        <td>
                          <div className="admin-table-item">
                            <div className="admin-table-swatches">
                              <span className="swatch" style={{ background: design.colorA }} />
                              <span className="swatch" style={{ background: design.colorB }} />
                              <span className="swatch" style={{ background: design.colorC }} />
                            </div>
                            <div>
                              <strong className="text-white">{design.title}</strong>
                              <div className="body-sm text-muted">ID: {design.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="creator-cell">
                            <span>{design.creator.name}</span>
                            {design.creator.verified && <span className="admin-verified-badge" title="Verified Creator">✓</span>}
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{design.template}</td>
                        <td>${design.price}</td>
                        <td>
                          <span className={`badge ${design.trending ? 'badge-pink' : 'badge-silver'}`}>
                            {design.trending ? '🔥 Hot' : 'Standard'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${design.forSale !== false ? 'badge-lime' : 'badge-silver'}`}>
                            {design.forSale !== false ? 'Public Listing' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-row">
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(design)}>
                              Edit
                            </button>
                            <button className="btn btn-ghost btn-sm text-pink" onClick={() => handleDeleteDesign(design.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* === CREATORS TAB === */}
            {activeTab === 'creators' && (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Bio</th>
                      <th>Followers</th>
                      <th>Total Designs</th>
                      <th>Verified Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map(creator => (
                      <tr key={creator.id}>
                        <td>
                          <div>
                            <strong className="text-white">{creator.name}</strong>
                            <div className="body-sm text-muted">@{creator.username}</div>
                          </div>
                        </td>
                        <td className="admin-table-bio">{creator.bio}</td>
                        <td>{creator.followers.toLocaleString()}</td>
                        <td>{creator.totalDesigns}</td>
                        <td>
                          <span className={`badge ${creator.badges.includes('verified') ? 'badge-lime' : 'badge-silver'}`}>
                            {creator.badges.includes('verified') ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn ${creator.badges.includes('verified') ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            onClick={() => handleToggleVerify(creator.id)}
                            style={{ minWidth: 100 }}
                          >
                            {creator.badges.includes('verified') ? 'Revoke Verify' : 'Verify ✓'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Edit Design Modal */}
      {editingDesign && (
        <div className="admin-modal-overlay" onClick={() => setEditingDesign(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="heading-lg text-white">Edit Design Details</h3>
              <button className="close-btn" onClick={() => setEditingDesign(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveDesignEdit}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">Design Title</label>
                <input
                  id="edit-title"
                  type="text"
                  className="input"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-price">Listing Price ($)</label>
                <input
                  id="edit-price"
                  type="number"
                  className="input"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  required
                  min="0"
                />
              </div>

              <div className="form-row-checkbox">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={editTrending}
                    onChange={e => setEditTrending(e.target.checked)}
                  />
                  <span className="checkbox-label text-white">Featured / Trending (🔥 Hot)</span>
                </label>
              </div>

              <div className="form-row-checkbox">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={editForSale}
                    onChange={e => setEditForSale(e.target.checked)}
                  />
                  <span className="checkbox-label text-white">List for Sale (Public Listing)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDesign(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
