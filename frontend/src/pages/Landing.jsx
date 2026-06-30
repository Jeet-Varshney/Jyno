import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ShoeViewer from '../components/shoe/ShoeViewer'
import DesignCard from '../components/community/DesignCard'
import { getDesigns, getCreators } from '../api/client'
import './Landing.css'

const HERO_COLORS = [
  { upper: '#0A0A0B', sole: '#C8FF00', accent: '#FF3366', lace: '#fff' },
  { upper: '#00102A', sole: '#00D4FF', accent: '#8B5CF6', lace: '#fff' },
  { upper: '#1A0010', sole: '#FF3366', accent: '#FFD700', lace: '#fff' },
  { upper: '#0A1A00', sole: '#80FF00', accent: '#00D4FF', lace: '#ddd' },
]

const STATS = [
  { value: '120K+', label: 'Designers' },
  { value: '2.8M',  label: 'Designs Created' },
  { value: '$4.2M', label: 'Paid to Creators' },
  { value: '98%',   label: 'Satisfaction' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '✏️',
    title: 'Design',
    desc: 'Use our intuitive studio to design your dream shoe — choose templates, colors, materials, and upload custom artwork.',
    color: '#C8FF00',
  },
  {
    step: '02',
    icon: '🚀',
    title: 'Publish',
    desc: 'Share your creation with the Jyno community. Build your following and receive feedback from fellow sneaker enthusiasts.',
    color: '#00D4FF',
  },
  {
    step: '03',
    icon: '💰',
    title: 'Earn',
    desc: 'Set your price, list your design, and earn every time someone purchases your custom shoe. No limits on your income.',
    color: '#FFD700',
  },
]

const EARNINGS_FEATURES = [
  { icon: '🎨', text: 'Earn 70% of every sale' },
  { icon: '⚡', text: 'Instant payouts to your wallet' },
  { icon: '🌍', text: 'Sell globally, no shipping hassle' },
  { icon: '🔁', text: 'Passive income on every resale' },
]

export default function Landing() {
  const [colorIdx, setColorIdx] = useState(0)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [allDesigns, setAllDesigns] = useState([])
  const [allCreators, setAllCreators] = useState([])
  const trending = allDesigns.filter(d => d.trending).slice(0, 6)

  // Fetch designs and creators from backend
  useEffect(() => {
    getDesigns().then(setAllDesigns).catch(console.error)
    getCreators().then(setAllCreators).catch(console.error)
  }, [])

  // Cycle hero shoe colors
  useEffect(() => {
    const id = setInterval(() => {
      setColorIdx(i => (i + 1) % HERO_COLORS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]))
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const c = HERO_COLORS[colorIdx]

  return (
    <div className="landing">
      <Navbar />

      {/* ======================== HERO ======================== */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__grid" />
        </div>

        <div className="container hero__inner">
          <div className="hero__content animate-fade-up">
            <div className="hero__eyebrow">
              <span className="badge badge-lime">✦ Now in Beta</span>
              <span className="badge badge-silver">120,000+ Designers</span>
            </div>

            <h1 className="display-xl hero__headline">
              Design Your<br/>
              <span className="gradient-lime">Dream Shoe.</span><br/>
              Own It.
            </h1>

            <p className="body-lg hero__sub">
              The world's first creator marketplace for custom sneakers.
              Design, share, sell — and earn from your creativity.
            </p>

            <div className="hero__ctas">
              <Link to="/studio" className="btn btn-primary btn-lg animate-pulse-glow">
                Start Designing Free
                <ArrowRightIcon />
              </Link>
              <Link to="/community" className="btn btn-secondary btn-lg">
                Explore Community
              </Link>
            </div>

            <div className="hero__social-proof">
              <div className="hero__avatars">
                {allCreators.slice(0, 5).map((creator, i) => (
                  <div
                    key={creator.id}
                    className="avatar avatar-sm avatar-placeholder"
                    style={{ fontSize: '0.7rem', marginLeft: i > 0 ? '-8px' : 0, zIndex: 5 - i, border: '2px solid var(--jyno-black)' }}
                  >
                    {creator.name[0]}
                  </div>
                ))}
              </div>
              <span className="body-sm">Join <strong className="text-white">120K+</strong> creators already earning</span>
            </div>
          </div>

          <div className="hero__visual animate-fade-up delay-2">
            <div className="hero__shoe-container">
              <ShoeViewer
                colorUpper={HERO_COLORS[colorIdx].upper}
                colorSole={HERO_COLORS[colorIdx].sole}
                colorAccent={HERO_COLORS[colorIdx].accent}
                colorLace={HERO_COLORS[colorIdx].lace}
                colorTongue={HERO_COLORS[colorIdx].tongue || '#2A2A35'}
                size="xl"
                animated={true}
                rotating={true}
              />
              {/* Floating stats */}
              <div className="hero__float-card hero__float-card--1">
                <span style={{ fontSize: '1.1rem' }}>🔥</span>
                <div>
                  <div className="heading-sm text-white">Trending Now</div>
                  <div className="body-sm">Cyberpunk Neon Runner</div>
                </div>
              </div>
              <div className="hero__float-card hero__float-card--2">
                <span style={{ fontSize: '1.1rem' }}>💰</span>
                <div>
                  <div className="heading-sm text-white">Latest Sale</div>
                  <div className="body-sm text-lime">$245 earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll">
          <div className="hero__scroll-mouse">
            <div className="hero__scroll-dot" />
          </div>
        </div>
      </section>

      {/* ======================== STATS BAR ======================== */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          {STATS.map((s, i) => (
            <div key={i} className="stats-bar__item">
              <span className="stats-bar__value mono">{s.value}</span>
              <span className="stats-bar__label label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ======================== TRENDING ======================== */}
      <section className="section trending" data-section="trending">
        <div className="container">
          <div className={`section-header ${visibleSections.has('trending') ? 'animate-fade-up' : 'opacity-0'}`}>
            <div>
              <div className="label text-pink" style={{ marginBottom: 8 }}>🔥 Community Picks</div>
              <h2 className="display-md">Trending Designs</h2>
            </div>
            <Link to="/community" className="btn btn-secondary btn-sm">
              View All <ArrowRightIcon />
            </Link>
          </div>

          <div className="trending__grid">
            {trending.map((d, i) => (
              <div key={d.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <DesignCard design={d} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className="section hiw" data-section="hiw">
        <div className="container">
          <div className={`section-header center ${visibleSections.has('hiw') ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="label text-cyan" style={{ marginBottom: 8 }}>Simple Process</div>
            <h2 className="display-md">How Jyno Works</h2>
            <p className="body-lg" style={{ maxWidth: 480, margin: '12px auto 0' }}>
              From idea to income in three steps. No design degree required.
            </p>
          </div>

          <div className="hiw__steps">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={i}
                className={`hiw__step animate-fade-up delay-${i + 1}`}
                style={{ '--step-color': step.color }}
              >
                <div className="hiw__step-num">{step.step}</div>
                <div className="hiw__step-icon">{step.icon}</div>
                <h3 className="heading-lg">{step.title}</h3>
                <p className="body-md">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FEATURED CREATORS ======================== */}
      <section className="section creators" data-section="creators">
        <div className="container">
          <div className={`section-header ${visibleSections.has('creators') ? 'animate-fade-up' : 'opacity-0'}`}>
            <div>
              <div className="label text-gold" style={{ marginBottom: 8 }}>⭐ Top Talent</div>
              <h2 className="display-md">Featured Creators</h2>
            </div>
            <Link to="/community" className="btn btn-secondary btn-sm hide-mobile">
              Discover Creators <ArrowRightIcon />
            </Link>
          </div>

          <div className="creators__grid">
            {allCreators.map((creator, i) => (
              <Link
                key={creator.id}
                to={`/creator/${creator.username}`}
                className={`creator-card animate-fade-up delay-${i % 4 + 1}`}
              >
                <div className="creator-card__avatar-wrap">
                  <div
                    className="creator-card__avatar"
                    style={{ background: `linear-gradient(135deg, ${creator.colorAccent}22, var(--jyno-elevated))` }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{creator.name[0]}</span>
                  </div>
                  {creator.badges.includes('verified') && (
                    <div className="creator-card__verified">✓</div>
                  )}
                </div>
                <h4 className="heading-sm text-white">{creator.name}</h4>
                <p className="body-sm" style={{ textAlign: 'center', fontSize: '0.78rem' }}>@{creator.username}</p>
                <div className="creator-card__stats">
                  <div className="creator-card__stat">
                    <span className="mono text-white">{(creator.followers / 1000).toFixed(1)}k</span>
                    <span className="label text-muted">Followers</span>
                  </div>
                  <div className="creator-card__stat">
                    <span className="mono text-white">{creator.totalDesigns}</span>
                    <span className="label text-muted">Designs</span>
                  </div>
                </div>
                {creator.badges.includes('top-creator') && (
                  <span className="badge badge-gold" style={{ marginTop: 4 }}>⭐ Top Creator</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== EARNINGS SECTION ======================== */}
      <section className="section earnings" data-section="earnings">
        <div className="container">
          <div className="earnings__inner">
            <div className="earnings__content animate-fade-up">
              <div className="label text-lime" style={{ marginBottom: 12 }}>💸 Creator Economy</div>
              <h2 className="display-md">
                Turn Your Designs<br/>
                <span className="gradient-lime">Into Income.</span>
              </h2>
              <p className="body-lg" style={{ marginTop: 16, marginBottom: 32 }}>
                Jyno's creator economy puts you first. Earn 70% of every sale,
                receive instant payouts, and build a global customer base —
                all without ever touching inventory.
              </p>
              <div className="earnings__features">
                {EARNINGS_FEATURES.map((f, i) => (
                  <div key={i} className="earnings__feature">
                    <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                    <span className="body-md text-white">{f.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40 }}>
                <Link to="/studio" className="btn btn-primary btn-lg">
                  Start Earning Today <ArrowRightIcon />
                </Link>
              </div>
            </div>

            <div className="earnings__visual animate-fade-up delay-2">
              <div className="earnings__card card-glass">
                <div className="earnings__card-header">
                  <span className="body-sm text-silver">This Month</span>
                  <span className="badge badge-lime">+42%</span>
                </div>
                <div className="earnings__amount">
                  <span className="mono" style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--jyno-white)' }}>$3,840</span>
                  <span className="body-sm text-silver">earned</span>
                </div>
                <div className="earnings__bars">
                  {[60, 80, 45, 90, 70, 100, 75].map((h, i) => (
                    <div key={i} className="earnings__bar-wrap">
                      <div
                        className="earnings__bar"
                        style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="earnings__breakdown">
                  {[
                    { label: 'Design Sales', val: '$2,400', color: 'var(--jyno-lime)' },
                    { label: 'Resale Royalties', val: '$840', color: 'var(--jyno-cyan)' },
                    { label: 'Creator Tips', val: '$600', color: 'var(--jyno-pink)' },
                  ].map((item, i) => (
                    <div key={i} className="earnings__breakdown-row">
                      <div className="earnings__breakdown-dot" style={{ background: item.color }} />
                      <span className="body-sm">{item.label}</span>
                      <span className="mono" style={{ color: item.color, marginLeft: 'auto' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA BANNER ======================== */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div className="cta-banner__bg" />
          <div className="cta-banner__content">
            <h2 className="display-md text-white" style={{ textAlign: 'center' }}>
              Ready to Create<br/>
              <span className="gradient-lime">Something Legendary?</span>
            </h2>
            <p className="body-lg" style={{ textAlign: 'center', marginTop: 12 }}>
              Join 120,000+ designers. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
              <Link to="/studio" className="btn btn-primary btn-lg">
                Design For Free
              </Link>
              <Link to="/marketplace" className="btn btn-secondary btn-lg">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  )
}
