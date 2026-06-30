import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ShoeViewer from '../components/shoe/ShoeViewer'
import { getDesigns } from '../api/client'
import './Dashboard.css'

const SIDE_TABS = [
  { id: 'overview',    icon: '📊', label: 'Overview'  },
  { id: 'designs',     icon: '👟', label: 'My Designs' },
  { id: 'drafts',      icon: '📝', label: 'Drafts'    },
  { id: 'analytics',   icon: '📈', label: 'Analytics' },
  { id: 'sales',       icon: '💳', label: 'Sales'     },
  { id: 'earnings',    icon: '💰', label: 'Earnings'  },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
]

const OVERVIEW_STATS = [
  { label: 'Total Views',   value: '142,800', change: '+12%', color: 'var(--jyno-cyan)',   icon: '👁️' },
  { label: 'Total Likes',   value: '28,400',  change: '+8%',  color: 'var(--jyno-pink)',   icon: '❤️' },
  { label: 'Designs Sold',  value: '324',     change: '+24%', color: 'var(--jyno-lime)',   icon: '📦' },
  { label: 'Total Earned',  value: '$9,840',  change: '+18%', color: 'var(--jyno-gold)',   icon: '💰' },
]

const NOTIFICATIONS = [
  { icon: '❤️',  text: 'ZaraExe liked your "Void Walker Low"',       time: '2m ago',  unread: true },
  { icon: '💬',  text: 'NovaKicks commented on your design',          time: '15m ago', unread: true },
  { icon: '👥',  text: 'KickCraft started following you',            time: '1h ago',  unread: true },
  { icon: '💰',  text: 'Your design sold! +$165 added to earnings',  time: '3h ago',  unread: false },
  { icon: '⭐',  text: 'You earned the "Top Creator" badge',         time: '1d ago',  unread: false },
  { icon: '🔥',  text: '"Cyberpunk Neon Runner" is trending #3',     time: '2d ago',  unread: false },
]

const EARNINGS_MONTHLY = [42, 65, 88, 55, 120, 95, 140, 110, 168, 200, 180, 240]
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [allDesigns, setAllDesigns] = useState([])

  useEffect(() => {
    getDesigns().then(setAllDesigns).catch(console.error)
  }, [])

  const myDesigns = allDesigns.slice(0, 6)
  const drafts    = allDesigns.slice(3, 6).map(d => ({ ...d, title: 'Draft: ' + d.title }))

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__top">
          <Link to="/" className="dashboard-logo">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M2 20 Q8 8 14 12 Q20 16 26 4" stroke="#C8FF00" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="14" cy="22" r="2" fill="#C8FF00"/>
            </svg>
            <span>jyno</span>
          </Link>
          <div className="dashboard-sidebar__user">
            <div className="avatar avatar-md avatar-placeholder" style={{ fontSize: '1rem' }}>J</div>
            <div>
              <div className="heading-sm text-white">Jyno Creator</div>
              <div className="body-sm">@mycreator</div>
            </div>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav">
          {SIDE_TABS.map(t => (
            <button
              key={t.id}
              className={`dashboard-nav-item ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="dashboard-nav-item__icon">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'notifications' && (
                <span className="dashboard-nav-badge">3</span>
              )}
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar__bottom">
          <Link to="/studio" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            + New Design
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h1 className="heading-lg text-white" style={{ textTransform: 'capitalize' }}>
            {SIDE_TABS.find(t => t.id === activeTab)?.icon} {SIDE_TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <Link to="/studio" className="btn btn-secondary btn-sm">Open Studio</Link>
            <Link to="/" className="btn btn-ghost btn-sm">← Back to Site</Link>
          </div>
        </div>

        <div className="dashboard-content">

          {/* ====== OVERVIEW ====== */}
          {activeTab === 'overview' && (
            <div className="db-overview">
              <div className="db-stats-grid">
                {OVERVIEW_STATS.map((s, i) => (
                  <div key={i} className="db-stat-card" style={{ '--stat-color': s.color }}>
                    <div className="db-stat-card__icon">{s.icon}</div>
                    <div className="db-stat-card__value mono">{s.value}</div>
                    <div className="db-stat-card__label label text-muted">{s.label}</div>
                    <div className="db-stat-card__change">
                      <span className="text-lime" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {s.change} this month
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="db-chart-card">
                <div className="db-chart-card__header">
                  <h3 className="heading-md text-white">Earnings Overview</h3>
                  <span className="badge badge-lime">2025</span>
                </div>
                <div className="db-chart">
                  {EARNINGS_MONTHLY.map((val, i) => (
                    <div key={i} className="db-chart__col">
                      <div
                        className="db-chart__bar"
                        style={{
                          height: `${(val / 240) * 100}%`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                      <span className="db-chart__label">{MONTH_LABELS[i]}</span>
                    </div>
                  ))}
                </div>
                <div className="db-chart-card__footer">
                  <div>
                    <span className="body-sm text-silver">Total 2025</span>
                    <span className="mono text-lime" style={{ marginLeft: 8, fontWeight: 700 }}>$9,840</span>
                  </div>
                  <div>
                    <span className="body-sm text-silver">Best Month</span>
                    <span className="mono text-white" style={{ marginLeft: 8, fontWeight: 700 }}>$240 (Dec)</span>
                  </div>
                </div>
              </div>

              {/* Recent designs */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sp-4)' }}>
                  <h3 className="heading-md text-white">Recent Designs</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('designs')}>
                    View All →
                  </button>
                </div>
                <div className="db-designs-mini">
                  {myDesigns.slice(0, 4).map(d => (
                    <Link key={d.id} to={`/design/${d.id}`} className="db-design-mini">
                      <div className="db-design-mini__preview">
                        <ShoeViewer colorUpper={d.colorA} colorSole={d.colorB} colorAccent={d.colorC} colorLace={d.colorLace} colorTongue={d.colorTongue} size="sm" animated />
                      </div>
                      <div className="db-design-mini__info">
                        <div className="heading-sm" style={{ fontSize: '0.82rem' }}>{d.title}</div>
                        <div className="body-sm">❤️ {d.likes.toLocaleString()} · 👁️ {d.views.toLocaleString()}</div>
                        {d.forSale && <span className="badge badge-lime" style={{ fontSize: '0.65rem' }}>For Sale · ${d.price}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== DESIGNS ====== */}
          {activeTab === 'designs' && (
            <div>
              <div className="db-grid">
                {myDesigns.map(d => (
                  <Link key={d.id} to={`/design/${d.id}`} className="db-design-card">
                    <div className="db-design-card__preview">
                      <ShoeViewer colorUpper={d.colorA} colorSole={d.colorB} colorAccent={d.colorC} colorLace={d.colorLace} colorTongue={d.colorTongue} size="md" animated />
                    </div>
                    <div className="db-design-card__info">
                      <div className="heading-sm">{d.title}</div>
                      <div className="db-design-card__stats">
                        <span>❤️ {d.likes.toLocaleString()}</span>
                        <span>👁️ {d.views.toLocaleString()}</span>
                        {d.forSale && <span className="text-lime">${d.price}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                        <Link to="/studio" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={e => e.stopPropagation()}>Edit</Link>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Delete</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ====== DRAFTS ====== */}
          {activeTab === 'drafts' && (
            <div>
              <div className="db-grid">
                {drafts.map(d => (
                  <div key={d.id} className="db-design-card" style={{ opacity: 0.7 }}>
                    <div className="db-design-card__preview" style={{ background: 'var(--jyno-dark)' }}>
                      <ShoeViewer colorUpper={d.colorA} colorSole={d.colorB} colorAccent={d.colorC} colorLace={d.colorLace} colorTongue={d.colorTongue} size="md" animated />
                      <span className="badge badge-silver" style={{ position: 'absolute', top: 8, left: 8 }}>Draft</span>
                    </div>
                    <div className="db-design-card__info">
                      <div className="heading-sm">{d.title}</div>
                      <div className="body-sm text-muted">Last edited 2h ago</div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                        <Link to="/studio" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={e => e.stopPropagation()}>Continue</Link>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== ANALYTICS ====== */}
          {activeTab === 'analytics' && (
            <div className="db-analytics">
              <div className="db-stats-grid">
                {OVERVIEW_STATS.map((s, i) => (
                  <div key={i} className="db-stat-card" style={{ '--stat-color': s.color }}>
                    <div className="db-stat-card__icon">{s.icon}</div>
                    <div className="db-stat-card__value mono">{s.value}</div>
                    <div className="db-stat-card__label label text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="db-chart-card">
                <div className="db-chart-card__header">
                  <h3 className="heading-md text-white">Monthly Performance</h3>
                </div>
                <div className="db-chart">
                  {EARNINGS_MONTHLY.map((val, i) => (
                    <div key={i} className="db-chart__col">
                      <div className="db-chart__bar" style={{ height: `${(val / 240) * 100}%`, animationDelay: `${i * 0.05}s` }} />
                      <span className="db-chart__label">{MONTH_LABELS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== EARNINGS / SALES ====== */}
          {(activeTab === 'earnings' || activeTab === 'sales') && (
            <div>
              <div className="db-earnings-hero">
                <div>
                  <div className="label text-muted">Total Earned</div>
                  <div className="mono text-lime" style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    $9,840
                  </div>
                  <div className="body-sm text-silver">Lifetime earnings · 324 sales</div>
                </div>
                <button className="btn btn-primary">Withdraw Earnings</button>
              </div>
              <div className="db-chart-card" style={{ marginTop: 'var(--sp-6)' }}>
                <div className="db-chart-card__header">
                  <h3 className="heading-md text-white">Revenue by Month</h3>
                </div>
                <div className="db-chart">
                  {EARNINGS_MONTHLY.map((val, i) => (
                    <div key={i} className="db-chart__col">
                      <div className="db-chart__bar" style={{ height: `${(val / 240) * 100}%`, animationDelay: `${i * 0.05}s` }} />
                      <span className="db-chart__label">{MONTH_LABELS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== NOTIFICATIONS ====== */}
          {activeTab === 'notifications' && (
            <div className="db-notifications">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className={`db-notification ${n.unread ? 'unread' : ''}`}>
                  <div className="db-notification__icon">{n.icon}</div>
                  <div className="db-notification__content">
                    <p className="body-md" style={{ color: 'var(--jyno-white)' }}>{n.text}</p>
                    <span className="body-sm text-muted">{n.time}</span>
                  </div>
                  {n.unread && <div className="db-notification__dot" />}
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
