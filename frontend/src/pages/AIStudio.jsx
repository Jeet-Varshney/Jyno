import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ShoeViewer from '../components/shoe/ShoeViewer'
import './AIStudio.css'

const STYLE_SUGGESTIONS = [
  { icon: '⚡', text: 'Futuristic cyberpunk with neon blue accents' },
  { icon: '🌸', text: 'Cherry blossom Japanese streetwear' },
  { icon: '🌑', text: 'Dark stealth mode with chrome accents' },
  { icon: '🌈', text: 'Retro 90s colorblock with bold graphics' },
  { icon: '🔥', text: 'Fire and lava textured athletic shoe' },
  { icon: '🌊', text: 'Ocean wave inspired gradient sole' },
  { icon: '👾', text: 'Pixel art retro gaming sneaker' },
  { icon: '🦋', text: 'Holographic butterfly wings pattern' },
]

const MOCK_VARIATIONS = [
  { upper: '#0A0A1A', sole: '#00D4FF', accent: '#8B5CF6', lace: '#fff',    label: 'Cyber Void',     desc: 'Deep space tones with electric cyan sole' },
  { upper: '#1A000A', sole: '#FF3366', accent: '#FF6B00', lace: '#FFD700', label: 'Lava Strike',     desc: 'Volcanic heat with molten accents' },
  { upper: '#001A10', sole: '#00FF88', accent: '#00D4FF', lace: '#fff',    label: 'Digital Forest',  desc: 'Bio-neon with tech green energy' },
  { upper: '#1A1A1A', sole: '#C0C0C0', accent: '#888',   lace: '#E0E0E0', label: 'Chrome Ghost',    desc: 'Polished chrome meets midnight stealth' },
]

export default function AIStudio() {
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [variations, setVariations] = useState(null)
  const [selected, setSelected] = useState(0)
  const [history, setHistory] = useState([])
  const [styleSliders, setStyleSliders] = useState({
    futuristic: 70,
    bold:       60,
    dark:       80,
  })
  const inputRef = useRef(null)

  function handleGenerate(text) {
    const q = text || prompt
    if (!q.trim()) return
    setLoading(true)
    setVariations(null)

    setTimeout(() => {
      setVariations(MOCK_VARIATIONS)
      setSelected(0)
      setHistory(prev => [q, ...prev.slice(0, 4)])
      setLoading(false)
    }, 2200)
  }

  function useSuggestion(text) {
    setPrompt(text)
    inputRef.current?.focus()
  }

  const current = variations?.[selected]

  return (
    <div className="ai-studio">
      <Navbar />

      <div className="ai-studio__inner container">
        {/* Left: Chat interface */}
        <div className="ai-studio__left">
          <div className="ai-studio__header">
            <div className="ai-studio__header-icon">✨</div>
            <div>
              <h1 className="display-md text-white" style={{ fontSize: '1.8rem' }}>AI Design Studio</h1>
              <p className="body-md">Describe your dream sneaker. Watch it come to life.</p>
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="ai-studio__suggestions">
            <div className="label text-muted" style={{ marginBottom: 8 }}>Try these prompts</div>
            <div className="ai-studio__pills">
              {STYLE_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="ai-studio__pill"
                  onClick={() => useSuggestion(s.text)}
                >
                  <span>{s.icon}</span> {s.text}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="ai-studio__input-section">
            <textarea
              ref={inputRef}
              className="ai-studio__textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your dream sneaker in detail...&#10;&#10;e.g. A futuristic cyberpunk shoe with neon blue glowing soles, carbon fiber upper, and chrome accents inspired by Tron."
              rows={4}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey) handleGenerate()
              }}
            />
            <div className="ai-studio__input-footer">
              <span className="body-sm text-muted">⌘+Enter to generate</span>
              <button
                className={`btn btn-primary ${loading ? 'ai-loading' : ''}`}
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <span className="ai-studio__spinner-row">
                    <span className="ai-studio__spinner" /> Generating...
                  </span>
                ) : (
                  '✦ Generate Variations'
                )}
              </button>
            </div>
          </div>

          {/* Style sliders */}
          <div className="ai-studio__sliders">
            <div className="label text-muted" style={{ marginBottom: 12 }}>Style Controls</div>
            {[
              { key: 'futuristic', label: 'Retro', label2: 'Futuristic' },
              { key: 'bold',       label: 'Minimal', label2: 'Bold' },
              { key: 'dark',       label: 'Light', label2: 'Dark' },
            ].map(s => (
              <div key={s.key} className="ai-studio__slider-row">
                <span className="body-sm text-muted">{s.label}</span>
                <input
                  type="range"
                  min="0" max="100"
                  value={styleSliders[s.key]}
                  onChange={e => setStyleSliders(prev => ({ ...prev, [s.key]: +e.target.value }))}
                  className="ai-studio__slider"
                />
                <span className="body-sm text-muted">{s.label2}</span>
              </div>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="ai-studio__history">
              <div className="label text-muted" style={{ marginBottom: 8 }}>Recent Prompts</div>
              {history.map((h, i) => (
                <button
                  key={i}
                  className="ai-studio__history-item"
                  onClick={() => { setPrompt(h); handleGenerate(h); }}
                >
                  ↩ {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="ai-studio__right">
          {/* Loading state */}
          {loading && (
            <div className="ai-studio__loading">
              <div className="ai-studio__loading-orb" />
              <div className="ai-studio__loading-content">
                <h3 className="heading-lg text-white">Generating your design...</h3>
                <p className="body-md">AI is crafting 4 unique variations</p>
                <div className="ai-studio__loading-steps">
                  {['Analyzing prompt', 'Generating colorways', 'Refining details', 'Finalizing'].map((step, i) => (
                    <div key={i} className="ai-studio__loading-step">
                      <div className="ai-studio__step-dot" style={{ animationDelay: `${i * 0.5}s` }} />
                      <span className="body-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {variations && !loading && (
            <div className="ai-studio__result">
              <div className="ai-studio__result-header">
                <h3 className="heading-lg text-white">4 Variations Generated</h3>
                <span className="badge badge-cyan">AI Created</span>
              </div>

              {/* Large preview */}
              <div className="ai-studio__main-preview">
                {current && (
                  <>
                    <ShoeViewer
                      colorUpper={current.upper}
                      colorSole={current.sole}
                      colorAccent={current.accent}
                      colorLace={current.lace}
                      colorTongue={current.tongue || '#2A2A35'}
                      size="full"
                      animated
                      rotating
                    />
                    <div className="ai-studio__preview-label">
                      <h4 className="heading-md text-white">{current.label}</h4>
                      <p className="body-sm">{current.desc}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Variation thumbnails */}
              <div className="ai-studio__variations">
                {variations.map((v, i) => (
                  <button
                    key={i}
                    className={`ai-studio__variation ${selected === i ? 'active' : ''}`}
                    onClick={() => setSelected(i)}
                  >
                    <ShoeViewer
                      colorUpper={v.upper}
                      colorSole={v.sole}
                      colorAccent={v.accent}
                      colorLace={v.lace}
                      colorTongue={v.tongue || '#2A2A35'}
                      size="sm"
                      animated
                    />
                    <span className="ai-studio__variation-label">{v.label}</span>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="ai-studio__result-actions">
                <Link to="/studio" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  Edit in Studio →
                </Link>
                <button className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  Save to Drafts
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!variations && !loading && (
            <div className="ai-studio__empty">
              <div className="ai-studio__empty-visual">
                <div className="ai-studio__empty-orb" />
                <div style={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}>✨</div>
              </div>
              <h3 className="heading-lg text-white">Your Design Awaits</h3>
              <p className="body-lg" style={{ textAlign: 'center', maxWidth: 320 }}>
                Type a description and let our AI generate beautiful sneaker concepts for you.
              </p>
              <div className="ai-studio__empty-features">
                {['4 unique variations', 'Customizable after generation', 'Export directly to Studio'].map((f, i) => (
                  <div key={i} className="ai-studio__empty-feature">
                    <span className="text-lime">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
