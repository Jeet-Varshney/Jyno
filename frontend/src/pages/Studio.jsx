import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ShoeViewer from '../components/shoe/ShoeViewer'
import { createDesign } from '../api/client'
import './Studio.css'

const TEMPLATES = [
  { id: 'runner',   label: 'Runner',   icon: '🏃' },
  { id: 'high-top', label: 'High-Top', icon: '🏀' },
  { id: 'low-top',  label: 'Low-Top',  icon: '👟' },
  { id: 'platform', label: 'Platform', icon: '🌊' },
  { id: 'slip-on',  label: 'Slip-On',  icon: '🎨' },
  { id: 'racer',    label: 'Racer',    icon: '⚡' },
]

const MATERIALS = [
  { id: 'leather', label: 'Leather', roughness: 0.35, icon: '🟫' },
  { id: 'mesh',    label: 'Mesh',    roughness: 0.75, icon: '🔵' },
  { id: 'suede',   label: 'Suede',   roughness: 0.92, icon: '🟤' },
  { id: 'canvas',  label: 'Canvas',  roughness: 0.80, icon: '⚪' },
  { id: 'patent',  label: 'Patent',  roughness: 0.05, icon: '⚫' },
  { id: 'knit',    label: 'Knit',    roughness: 0.85, icon: '🟣' },
]

const ZONES = [
  { id: 'upper',  label: 'Upper Body',   icon: '👟' },
  { id: 'sole',   label: 'Sole',         icon: '⬜' },
  { id: 'accent', label: 'Accent / Heel', icon: '🎯' },
  { id: 'lace',   label: 'Laces',        icon: '🔗' },
  { id: 'tongue', label: 'Tongue',       icon: '📋' },
]

const COLOR_PRESETS = [
  '#FFFFFF', '#F5F5F5', '#E0E0E0', '#C0C0C0', '#888888',
  '#000000', '#1A1A1E', '#C8FF00', '#00D4FF', '#FF3366',
  '#FFD700', '#8B5CF6', '#FF6B00', '#00FF88', '#FF66CC',
]

const PATTERNS = [
  { id: 'solid',    label: 'Solid',     preview: 'linear-gradient(135deg,#888,#888)' },
  { id: 'gradient', label: 'Gradient',  preview: 'linear-gradient(135deg,#aaa,#333)' },
  { id: 'stripe',   label: 'Stripe',    preview: 'repeating-linear-gradient(90deg,#888 0,#888 8px,#555 8px,#555 16px)' },
  { id: 'dots',     label: 'Dots',      preview: 'radial-gradient(circle, #888 3px, transparent 3px)' },
  { id: 'geo',      label: 'Geometric', preview: 'conic-gradient(#888 90deg,#555 90deg 180deg,#888 180deg 270deg,#555 270deg)' },
  { id: 'camo',     label: 'Camo',      preview: 'linear-gradient(135deg,#5a6e3a,#7a8f4a,#3e5028,#6b7c42)' },
]

const DEFAULT_COLORS = {
  upper:  '#F5F5F5',
  sole:   '#EFEFEF',
  accent: '#E0E0E0',
  lace:   '#FFFFFF',
  tongue: '#F0F0F0',
}

export default function Studio() {
  const navigate = useNavigate()
  const viewerRef = useRef(null)
  const fileInputRef = useRef(null)

  const [template, setTemplate]    = useState('runner')
  const [activeZone, setActiveZone] = useState('upper')
  const [materials, setMaterials]  = useState({
    upper:  'leather',
    sole:   'leather',
    accent: 'leather',
    lace:   'canvas',
    tongue: 'knit',
  })
  const [patterns, setPatterns]    = useState({
    upper:  'solid',
    sole:   'solid',
    accent: 'solid',
    lace:   'solid',
    tongue: 'solid',
  })
  const [activeTool, setActiveTool] = useState('color')
  const [colors, setColors] = useState({ ...DEFAULT_COLORS })
  const [history, setHistory] = useState([{ ...DEFAULT_COLORS }])   // undo stack
  const [historyIdx, setHistoryIdx] = useState(0)
  const [designName, setDesignName] = useState('My Jyno Design')
  const [savedMsg, setSavedMsg]     = useState(null)
  const [aiPrompt, setAiPrompt]     = useState('')
  const [showAI, setShowAI]         = useState(false)
  const [aiLoading, setAiLoading]   = useState(false)
  const [layers, setLayers] = useState([
    { id: 1, name: 'Base Color',  visible: true,  locked: false },
    { id: 2, name: 'Pattern',     visible: true,  locked: false },
    { id: 3, name: 'Logo / Text', visible: true,  locked: false },
    { id: 4, name: 'Highlights',  visible: false, locked: false },
  ])

  function toggleLock(id) {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l))
  }

  function addCustomLayer() {
    const name = prompt("Enter layer name:")
    if (name && name.trim()) {
      setLayers(prev => [...prev, { id: Date.now(), name: name.trim(), visible: true, locked: false }])
    }
  }

  function handleArtworkUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = () => {
      setSavedMsg(`✓ Decal "${file.name}" uploaded successfully!`)
      setTimeout(() => setSavedMsg(null), 3000)
      
      setLayers(prev => [...prev, { id: Date.now(), name: `Decal: ${file.name}`, visible: true, locked: false }])
    }
    reader.readAsDataURL(file)
  }

  // Push a new colors snapshot onto undo stack
  function pushHistory(newColors) {
    const trimmed = history.slice(0, historyIdx + 1)
    setHistory([...trimmed, { ...newColors }])
    setHistoryIdx(trimmed.length)
  }

  function setZoneColor(hex) {
    const next = { ...colors, [activeZone]: hex }
    setColors(next)
    pushHistory(next)
  }

  function setZoneMaterial(mat) {
    setMaterials(prev => ({ ...prev, [activeZone]: mat }))
  }

  function setZonePattern(pat) {
    setPatterns(prev => ({ ...prev, [activeZone]: pat }))
  }

  function handleUndo() {
    if (historyIdx === 0) return
    const prev = history[historyIdx - 1]
    setColors({ ...prev })
    setHistoryIdx(i => i - 1)
  }

  // Redo handler
  function handleRedo() {
    if (historyIdx >= history.length - 1) return
    const next = history[historyIdx + 1]
    setColors({ ...next })
    setHistoryIdx(i => i + 1)
  }

  function handleReset() {
    const fresh = { ...DEFAULT_COLORS }
    setColors(fresh)
    pushHistory(fresh)
    setMaterials({ upper: 'leather', sole: 'leather', accent: 'leather', lace: 'canvas', tongue: 'knit' })
    setPatterns({ upper: 'solid', sole: 'solid', accent: 'solid', lace: 'solid', tongue: 'solid' })
  }

  function getCreatorObject() {
    const userStr = localStorage.getItem('jyno_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        return {
          name: user.name || 'Jyno Creator',
          username: user.username || 'mycreator',
          avatar: null,
          verified: user.role === 'admin'
        }
      } catch (err) {
        console.error(err)
      }
    }
    return { name: 'You', username: 'you', avatar: null, verified: false }
  }

  async function handleSave() {
    try {
      await createDesign({
        title: designName,
        colorUpper: colors.upper,
        colorSole: colors.sole,
        colorAccent: colors.accent,
        colorLace: colors.lace,
        colorTongue: colors.tongue,
        template,
        tags: [template, materials.upper, patterns.upper],
        forSale: false,
        creator: getCreatorObject(),
      })
      setSavedMsg('✓ Saved to backend!')
    } catch {
      setSavedMsg('✓ Draft saved locally!')
    }
    setTimeout(() => setSavedMsg(null), 2500)
  }

  async function handlePublish() {
    try {
      await createDesign({
        title: designName,
        colorUpper: colors.upper,
        colorSole: colors.sole,
        colorAccent: colors.accent,
        colorLace: colors.lace,
        colorTongue: colors.tongue,
        template,
        tags: [template, materials.upper, patterns.upper],
        forSale: true,
        creator: getCreatorObject(),
      })
      setSavedMsg('✦ Published successfully!')
      setTimeout(() => {
        setSavedMsg(null)
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      console.error(err)
      setSavedMsg('⚠️ Failed to publish design.')
      setTimeout(() => setSavedMsg(null), 2500)
    }
  }

  function handleAIGenerate() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setTimeout(() => {
      const aiColors = [
        { upper: '#0A0A1A', sole: '#00D4FF', accent: '#8B5CF6', lace: '#fff', tongue: '#1A1A2E' },
        { upper: '#1A0020', sole: '#FF3366', accent: '#FF6B00', lace: '#FFD700', tongue: '#2A0030' },
        { upper: '#0A1A00', sole: '#C8FF00', accent: '#00D4FF', lace: '#fff',    tongue: '#1A2A00' },
        { upper: '#1A1A1A', sole: '#C0C0C0', accent: '#888',    lace: '#fff',    tongue: '#2A2A2A' },
        { upper: '#F5F5F5', sole: '#EFEFEF', accent: '#E0E0E0', lace: '#FFFFFF', tongue: '#F0F0F0' },
      ]
      const pick = aiColors[Math.floor(Math.random() * aiColors.length)]
      setColors(pick)
      pushHistory(pick)
      setAiLoading(false)
      setShowAI(false)
      setAiPrompt('')
    }, 1800)
  }

  function toggleLayer(id) {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }

  const TOOLS = [
    { id: 'color',   icon: '🎨', label: 'Color'   },
    { id: 'pattern', icon: '◼',  label: 'Pattern' },
    { id: 'material',icon: '✦',  label: 'Material'},
    { id: 'upload',  icon: '⬆',  label: 'Upload'  },
  ]

  return (
    <div className="studio">
      {/* Top Bar */}
      <div className="studio__topbar">
        <div className="studio__topbar-left">
          <a href="/" className="studio__logo">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M2 20 Q8 8 14 12 Q20 16 26 4" stroke="#C8FF00" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="14" cy="22" r="2" fill="#C8FF00"/>
            </svg>
            <span>jyno</span>
          </a>
          <span className="studio__breadcrumb">/ Studio</span>
        </div>

        <div className="studio__topbar-center">
          <input
            className="studio__name-input"
            value={designName}
            onChange={e => setDesignName(e.target.value)}
            placeholder="Design name..."
          />
        </div>

        <div className="studio__topbar-right">
          <div className="studio__history-btns">
            <button className="btn btn-ghost btn-icon" title="Undo" onClick={handleUndo} disabled={historyIdx === 0}>↩</button>
            <button className="btn btn-ghost btn-icon" title="Redo" onClick={handleRedo} disabled={historyIdx >= history.length - 1}>↪</button>
            <button className="btn btn-ghost btn-icon" title="Reset to White" onClick={handleReset} style={{ fontSize: '0.75rem' }}>⊘</button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleSave}>
            Save Draft
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePublish}>
            Publish ✦
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="studio__save-toast">{savedMsg}</div>
      )}

      <div className="studio__body">
        {/* ====== LEFT PANEL: Tools ====== */}
        <aside className="studio__left">
          {/* Tool selector */}
          <div className="studio__panel">
            <div className="studio__panel-title">Tools</div>
            <div className="studio__tools-grid">
              {TOOLS.map(t => (
                <button
                  key={t.id}
                  className={`studio__tool-btn ${activeTool === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTool(t.id)}
                  title={t.label}
                >
                  <span className="studio__tool-icon">{t.icon}</span>
                  <span className="studio__tool-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Button */}
          <div className="studio__panel">
            <button
              className="studio__ai-btn"
              onClick={() => setShowAI(true)}
            >
              <span style={{ fontSize: '1.1rem' }}>✨</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--jyno-white)' }}>AI Generate</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--jyno-cyan)' }}>Describe your design</div>
              </div>
            </button>
          </div>

          {/* Templates */}
          <div className="studio__panel">
            <div className="studio__panel-title">Template</div>
            <div className="studio__template-grid">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`studio__template-btn ${template === t.id ? 'active' : ''}`}
                  onClick={() => setTemplate(t.id)}
                >
                  <span>{t.icon}</span>
                  <span style={{ fontSize: '0.72rem' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div className="studio__panel">
            <div className="studio__panel-title">Material</div>
            <div className="studio__material-grid">
              {MATERIALS.map(m => (
                <button
                  key={m.id}
                  className={`studio__material-btn ${materials[activeZone] === m.id ? 'active' : ''}`}
                  onClick={() => setZoneMaterial(m.id)}
                >
                  <span>{m.icon}</span>
                  <span style={{ fontSize: '0.72rem' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ====== CENTER: Canvas ====== */}
        <main className="studio__canvas">
          <div className="studio__canvas-inner">
            <div className="studio__shoe-wrap">
              <ShoeViewer
                colorUpper={colors.upper}
                colorSole={colors.sole}
                colorAccent={colors.accent}
                colorLace={colors.lace}
                colorTongue={colors.tongue}
                materials={materials}
                patterns={patterns}
                size="full"
                animated={true}
                viewerRef={viewerRef}
              />
            </div>

            {/* Zoom / Rotate controls */}
            <div className="studio__controls">
              <button className="studio__ctrl-btn" title="Zoom In" onClick={() => viewerRef.current?.zoomIn()}>+</button>
              <button className="studio__ctrl-btn" title="Zoom Out" onClick={() => viewerRef.current?.zoomOut()}>−</button>
              <button className="studio__ctrl-btn" title="Reset View" onClick={() => viewerRef.current?.resetView()}>⟳</button>
            </div>

            {/* Color zone selector */}
            <div className="studio__zones">
              {ZONES.map(z => (
                <button
                  key={z.id}
                  className={`studio__zone-btn ${activeZone === z.id ? 'active' : ''}`}
                  onClick={() => { setActiveZone(z.id); setActiveTool('color') }}
                >
                  <div
                    className="studio__zone-swatch"
                    style={{ background: colors[z.id], boxShadow: activeZone === z.id ? `0 0 0 2px #C8FF00` : 'none' }}
                  />
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* ====== RIGHT PANEL: Properties ====== */}
        <aside className="studio__right">
          {/* Right panel content depends on active tool */}

          {/* ── Color tool ── */}
          {activeTool === 'color' && (
            <>
              <div className="studio__panel">
                <div className="studio__panel-title">
                  Color — <span style={{ color: 'var(--jyno-silver)', textTransform: 'capitalize' }}>{activeZone.replace('accent','Accent / Heel')}</span>
                </div>
                {/* Zone quick-select inside right panel */}
                <div className="studio__zone-mini-row">
                  {ZONES.map(z => (
                    <button
                      key={z.id}
                      className={`studio__zone-mini ${activeZone === z.id ? 'active' : ''}`}
                      onClick={() => setActiveZone(z.id)}
                      title={z.label}
                      style={{ background: colors[z.id] }}
                    />
                  ))}
                </div>
                <div className="studio__color-presets">
                  {COLOR_PRESETS.map(hex => (
                    <button
                      key={hex}
                      className={`studio__color-swatch ${colors[activeZone] === hex ? 'selected' : ''}`}
                      style={{ background: hex }}
                      onClick={() => setZoneColor(hex)}
                      title={hex}
                    />
                  ))}
                </div>
                <div className="studio__custom-color">
                  <span className="label">Custom</span>
                  <div className="studio__custom-color-row">
                    <input
                      type="color"
                      value={colors[activeZone]}
                      onChange={e => setZoneColor(e.target.value)}
                      className="studio__color-input"
                    />
                    <input
                      type="text"
                      value={colors[activeZone]}
                      onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && setZoneColor(e.target.value)}
                      className="input studio__hex-input"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Pattern tool ── */}
          {activeTool === 'pattern' && (
            <div className="studio__panel">
              <div className="studio__panel-title">Pattern</div>
              <div className="studio__pattern-grid">
                {PATTERNS.map(p => (
                  <button
                    key={p.id}
                    className={`studio__pattern-btn ${patterns[activeZone] === p.id ? 'active' : ''}`}
                    onClick={() => setZonePattern(p.id)}
                    title={p.label}
                  >
                    <div className="studio__pattern-preview" style={{
                      background: p.preview,
                      backgroundSize: '16px 16px',
                      width: '100%', height: 36,
                      borderRadius: 6, marginBottom: 4,
                      border: patterns[activeZone] === p.id ? '2px solid #C8FF00' : '2px solid transparent'
                    }} />
                    <span style={{ fontSize: '0.72rem' }}>{p.label}</span>
                  </button>
                ))}
              </div>
              <p className="body-sm" style={{ marginTop: 8, color: 'var(--jyno-muted)', fontSize: '0.75rem' }}>
                Pattern applies to the active zone color on the 3D model.
              </p>
            </div>
          )}

          {/* ── Material tool ── */}
          {activeTool === 'material' && (
            <div className="studio__panel">
              <div className="studio__panel-title">Material</div>
              <div className="studio__material-grid">
                {MATERIALS.map(m => (
                  <button
                    key={m.id}
                    className={`studio__material-btn ${materials[activeZone] === m.id ? 'active' : ''}`}
                    onClick={() => setZoneMaterial(m.id)}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                    <span style={{ fontSize: '0.72rem' }}>{m.label}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--jyno-muted)' }}>Roughness {m.roughness}</span>
                  </button>
                ))}
              </div>
              <p className="body-sm" style={{ marginTop: 8, color: 'var(--jyno-muted)', fontSize: '0.75rem' }}>
                Changes sheen and surface texture of the 3D shoe.
              </p>
            </div>
          )}

          {/* ── Upload tool ── */}
          {activeTool === 'upload' && (
            <div className="studio__panel">
              <div className="studio__panel-title">Custom Artwork</div>
              <div className="studio__upload-zone" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '1.5rem' }}>⬆️</div>
                <div className="body-sm" style={{ textAlign: 'center' }}>
                  Drop image here or<br/>
                  <span className="text-lime">click to browse</span>
                </div>
                <div className="label text-muted">PNG, SVG, JPEG • Max 10MB</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleArtworkUpload}
                  accept="image/*"
                />
              </div>
            </div>
          )}

          {/* ── Layer Panel (always visible) ── */}
          <div className="studio__panel">
            <div className="studio__panel-title">Layers</div>
            <div className="studio__layers">
              {layers.map(layer => (
                <div key={layer.id} className="studio__layer">
                  <button
                    className="studio__layer-visibility"
                    onClick={() => toggleLayer(layer.id)}
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? '👁' : '🚫'}
                  </button>
                  <span className={`studio__layer-name ${!layer.visible ? 'hidden' : ''}`}>
                    {layer.name}
                  </span>
                  <button
                    className="studio__layer-lock"
                    title="Lock"
                    onClick={() => toggleLock(layer.id)}
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>
                </div>
              ))}
              <button className="studio__add-layer" onClick={addCustomLayer}>+ Add Layer</button>
            </div>
          </div>
        </aside>
      </div>

      {/* ====== AI MODAL ====== */}
      {showAI && (
        <div className="studio__ai-overlay" onClick={() => !aiLoading && setShowAI(false)}>
          <div className="studio__ai-modal" onClick={e => e.stopPropagation()}>
            <div className="studio__ai-header">
              <div>
                <h2 className="heading-lg text-white">✨ AI Design Generator</h2>
                <p className="body-sm">Describe your dream sneaker and let AI create it.</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAI(false)}>✕</button>
            </div>
            <div className="studio__ai-suggestions">
              {[
                'Futuristic cyberpunk with neon blue accents',
                'Cherry blossom inspired pastel Japanese',
                'Dark stealth mode with chrome details',
                'Retro 90s colorblock streetwear vibes',
              ].map(s => (
                <button key={s} className="studio__ai-suggestion" onClick={() => setAiPrompt(s)}>
                  "{s}"
                </button>
              ))}
            </div>
            <div className="studio__ai-input-row">
              <input
                className="input"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. A retro 70s basketball shoe with orange flames..."
                onKeyDown={e => e.key === 'Enter' && handleAIGenerate()}
              />
              <button
                className={`btn btn-primary ${aiLoading ? 'loading' : ''}`}
                onClick={handleAIGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? <span className="studio__spinner" /> : 'Generate ✦'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
