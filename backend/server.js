import express from 'express'
import cors from 'cors'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

// In-memory data initialized from mockData
let designs = [
  {
    id: '1',
    title: 'Cyberpunk Neon Runner',
    creator: { name: 'Zara.exe', username: 'zaraexe', avatar: null, verified: true },
    image: null,
    colorA: '#00D4FF',
    colorB: '#8B5CF6',
    colorC: '#FF3366',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 4821,
    saves: 1203,
    comments: 89,
    views: 42100,
    price: 189,
    forSale: true,
    tags: ['cyberpunk', 'neon', 'futuristic'],
    template: 'runner',
    createdAt: '2 hours ago',
    trending: true,
  },
  {
    id: '2',
    title: 'Tokyo Cherry Drift',
    creator: { name: 'NovaKicks', username: 'novakicks', avatar: null, verified: true },
    image: null,
    colorA: '#FF6B9D',
    colorB: '#FFD700',
    colorC: '#FFF',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 3640,
    saves: 892,
    comments: 54,
    views: 31200,
    price: 220,
    forSale: true,
    tags: ['japan', 'sakura', 'pastel'],
    template: 'high-top',
    createdAt: '5 hours ago',
    trending: true,
  },
  {
    id: '3',
    title: 'Void Walker Low',
    creator: { name: 'KickCraft', username: 'kickcraft', avatar: null, verified: false },
    image: null,
    colorA: '#0A0A0B',
    colorB: '#C8FF00',
    colorC: '#1A1A1E',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 2910,
    saves: 740,
    comments: 33,
    views: 22800,
    price: 165,
    forSale: true,
    tags: ['minimal', 'dark', 'stealth'],
    template: 'low-top',
    createdAt: '1 day ago',
    trending: false,
  },
  {
    id: '4',
    title: 'Solar Flare Hi-Top',
    creator: { name: 'SunriseDesigns', username: 'sunrise', avatar: null, verified: true },
    image: null,
    colorA: '#FF6B00',
    colorB: '#FFD700',
    colorC: '#FF3366',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 5210,
    saves: 1890,
    comments: 112,
    views: 58000,
    price: 299,
    forSale: true,
    tags: ['fire', 'bold', 'statement'],
    template: 'high-top',
    createdAt: '2 days ago',
    trending: true,
  },
  {
    id: '5',
    title: 'Arctic Ghost Slip-On',
    creator: { name: 'IceLab', username: 'icelab', avatar: null, verified: false },
    image: null,
    colorA: '#E0F4FF',
    colorB: '#B0E0FF',
    colorC: '#FFFFFF',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 1870,
    saves: 430,
    comments: 21,
    views: 14600,
    price: 140,
    forSale: false,
    tags: ['minimal', 'white', 'clean'],
    template: 'slip-on',
    createdAt: '3 days ago',
    trending: false,
  },
  {
    id: '6',
    title: 'Graffiti Blast Trainer',
    creator: { name: 'UrbanCanvas', username: 'urbancanvas', avatar: null, verified: true },
    image: null,
    colorA: '#FF3366',
    colorB: '#C8FF00',
    colorC: '#00D4FF',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 7340,
    saves: 2100,
    comments: 198,
    views: 76400,
    price: 245,
    forSale: true,
    tags: ['streetwear', 'graffiti', 'colorful'],
    template: 'trainer',
    createdAt: '4 days ago',
    trending: true,
  },
  {
    id: '7',
    title: 'Midnight Sage Platform',
    creator: { name: 'GlitchWear', username: 'glitchwear', avatar: null, verified: false },
    image: null,
    colorA: '#4CAF50',
    colorB: '#1A2A1A',
    colorC: '#8FBC8F',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 2230,
    saves: 567,
    comments: 44,
    views: 19200,
    price: 175,
    forSale: true,
    tags: ['nature', 'platform', 'earthy'],
    template: 'platform',
    createdAt: '5 days ago',
    trending: false,
  },
  {
    id: '8',
    title: 'Chrome Future Racer',
    creator: { name: 'MetaKicks', username: 'metakicks', avatar: null, verified: true },
    image: null,
    colorA: '#C0C0C0',
    colorB: '#888',
    colorC: '#E8E8E8',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 6120,
    saves: 1780,
    comments: 156,
    views: 64300,
    price: 320,
    forSale: true,
    tags: ['chrome', 'metallic', 'futuristic'],
    template: 'racer',
    createdAt: '1 week ago',
    trending: true,
  },
  {
    id: '9',
    title: 'Pastel Dreamscape',
    creator: { name: 'SoftGlow', username: 'softglow', avatar: null, verified: false },
    image: null,
    colorA: '#FFB3E6',
    colorB: '#B3E5FF',
    colorC: '#E8FFB3',
    colorLace: '#ffffff',
    colorTongue: '#2A2A35',
    likes: 3480,
    saves: 990,
    comments: 67,
    views: 28900,
    price: 195,
    forSale: true,
    tags: ['pastel', 'dreamy', 'aesthetic'],
    template: 'low-top',
    createdAt: '1 week ago',
    trending: false,
  },
]

let creators = [
  {
    id: '1',
    name: 'Zara.exe',
    username: 'zaraexe',
    avatar: null,
    bio: 'Digital artist × sneaker head. Designing the future one sole at a time. Tokyo-based.',
    followers: 48200,
    following: 312,
    totalDesigns: 87,
    totalSales: 1240,
    totalEarnings: 38600,
    badges: ['verified', 'top-creator', 'gold-seller'],
    popularDesigns: ['1', '4'],
    joinedAt: 'Jan 2024',
    colorAccent: '#00D4FF',
  },
  {
    id: '2',
    name: 'NovaKicks',
    username: 'novakicks',
    avatar: null,
    bio: 'Turning cultural moments into wearable art. NYC × Seoul.',
    followers: 31800,
    following: 198,
    totalDesigns: 54,
    totalSales: 820,
    totalEarnings: 24900,
    badges: ['verified', 'top-creator'],
    popularDesigns: ['2', '6'],
    joinedAt: 'Mar 2024',
    colorAccent: '#FF6B9D',
  },
  {
    id: '3',
    name: 'UrbanCanvas',
    username: 'urbancanvas',
    avatar: null,
    bio: 'Street art meets high fashion. Every shoe tells a story.',
    followers: 67400,
    following: 445,
    totalDesigns: 132,
    totalSales: 2100,
    totalEarnings: 67200,
    badges: ['verified', 'top-creator', 'gold-seller', 'early-adopter'],
    popularDesigns: ['6', '8'],
    joinedAt: 'Nov 2023',
    colorAccent: '#C8FF00',
  },
  {
    id: '4',
    name: 'MetaKicks',
    username: 'metakicks',
    avatar: null,
    bio: 'Chrome. Metal. Future. Designing shoes for the next dimension.',
    followers: 22100,
    following: 87,
    totalDesigns: 41,
    totalSales: 560,
    totalEarnings: 18900,
    badges: ['verified'],
    popularDesigns: ['8'],
    joinedAt: 'May 2024',
    colorAccent: '#C0C0C0',
  },
  {
    id: '5',
    name: 'SunriseDesigns',
    username: 'sunrise',
    avatar: null,
    bio: 'Bold colors, bolder statements. Inspired by the sun.',
    followers: 39600,
    following: 267,
    totalDesigns: 68,
    totalSales: 990,
    totalEarnings: 31400,
    badges: ['verified', 'top-creator'],
    popularDesigns: ['4'],
    joinedAt: 'Feb 2024',
    colorAccent: '#FF6B00',
  },
  {
    id: '6',
    name: 'KickCraft',
    username: 'kickcraft',
    avatar: null,
    bio: 'Stealth mode on. Minimalist designs for the discerning eye.',
    followers: 14300,
    following: 156,
    totalDesigns: 29,
    totalSales: 320,
    totalEarnings: 10800,
    badges: ['early-adopter'],
    popularDesigns: ['3'],
    joinedAt: 'Jul 2024',
    colorAccent: '#C8FF00',
  },
]

// GET all designs
app.get('/api/designs', (req, res) => {
  res.json(designs)
})

// GET single design
app.get('/api/designs/:id', (req, res) => {
  const d = designs.find(item => item.id === req.params.id)
  if (d) {
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// POST new design
app.post('/api/designs', (req, res) => {
  const newDesign = {
    id: String(designs.length + 1),
    title: req.body.title || 'My Jyno Design',
    creator: req.body.creator || { name: 'You', username: 'you', avatar: null, verified: true },
    image: null,
    colorA: req.body.colorUpper || req.body.colorA || '#1A1A1E',
    colorB: req.body.colorSole || req.body.colorB || '#C8FF00',
    colorC: req.body.colorAccent || req.body.colorC || '#FF3366',
    colorLace: req.body.colorLace || '#ffffff',
    colorTongue: req.body.colorTongue || '#2A2A35',
    likes: 0,
    saves: 0,
    comments: 0,
    views: 1,
    price: req.body.price || 150,
    forSale: req.body.forSale !== undefined ? req.body.forSale : true,
    tags: req.body.tags || ['custom'],
    template: req.body.template || 'runner',
    createdAt: 'Just now',
    trending: false,
  }
  designs.unshift(newDesign)
  res.status(201).json(newDesign)
})

// POST like a design
app.post('/api/designs/:id/like', (req, res) => {
  const d = designs.find(item => item.id === req.params.id)
  if (d) {
    d.likes += 1
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// GET all creators
app.get('/api/creators', (req, res) => {
  res.json(creators)
})

// ─── AUTHENTICATION & ADMIN PORTAL SERVICES ──────────────────────────────────
const USERS_DB = {
  'jyno_admin_portal': {
    username: 'jyno_admin_portal',
    name: 'System Admin',
    role: 'admin',
    passwordHash: '002788ab14570ba30e8e97b21910dc284dab2fc6429f8cd12eb90ad44441a2d3' // SHA256 of JynoSuperSecureAdmin2026!
  },
  'zara_creative_dir': {
    username: 'zara_creative_dir',
    name: 'Zara.exe',
    role: 'creator',
    passwordHash: '8d977b1758ab08ab2777d8006dbfea04f0ffae133a855db9dcffc45811a57651' // SHA256 of ZaraSecureCreativeFlow99!
  }
}

// POST Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  const user = USERS_DB[username]
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const hash = crypto.createHash('sha256').update(password).digest('hex')
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  res.json({
    user: {
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: null
    },
    token: 'mock-jwt-token-xyz-' + user.role
  })
})

// POST Signup
app.post('/api/auth/signup', (req, res) => {
  const { username, name, password } = req.body
  if (!username || !name || !password) {
    return res.status(400).json({ error: 'Username, name, and password are required' })
  }
  
  const normalizedUsername = username.trim().toLowerCase()
  if (USERS_DB[normalizedUsername]) {
    return res.status(400).json({ error: 'Username is already taken' })
  }
  
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
  
  // Register in USERS_DB
  USERS_DB[normalizedUsername] = {
    username: normalizedUsername,
    name: name.trim(),
    role: 'creator',
    passwordHash: passwordHash
  }
  
  // Register in creators list
  const newCreator = {
    id: String(creators.length + 1),
    name: name.trim(),
    username: normalizedUsername,
    avatar: null,
    bio: 'Digital artist × sneaker head. Designing the future one sole at a time.',
    followers: 0,
    following: 0,
    totalDesigns: 0,
    totalSales: 0,
    totalEarnings: 0,
    badges: [],
    popularDesigns: [],
    joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    colorAccent: ['#00D4FF', '#FF6B9D', '#C8FF00', '#FF6B00', '#8B5CF6', '#FF3366'][Math.floor(Math.random() * 6)]
  }
  creators.push(newCreator)
  
  res.status(201).json({
    user: {
      username: normalizedUsername,
      name: name.trim(),
      role: 'creator',
      avatar: null
    },
    token: 'mock-jwt-token-xyz-creator'
  })
})


// ADMIN: Delete a design
app.delete('/api/designs/:id', (req, res) => {
  const idx = designs.findIndex(item => item.id === req.params.id)
  if (idx !== -1) {
    designs.splice(idx, 1)
    res.json({ success: true, message: 'Design deleted successfully' })
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// ADMIN: Update design parameters (price, title, tags, forSale, trending)
app.put('/api/designs/:id', (req, res) => {
  const d = designs.find(item => item.id === req.params.id)
  if (d) {
    if (req.body.title !== undefined) d.title = req.body.title
    if (req.body.price !== undefined) d.price = Number(req.body.price)
    if (req.body.tags !== undefined) d.tags = req.body.tags
    if (req.body.forSale !== undefined) d.forSale = !!req.body.forSale
    if (req.body.trending !== undefined) d.trending = !!req.body.trending
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// ADMIN: Toggle verify state of a creator
app.post('/api/creators/:id/verify', (req, res) => {
  const creator = creators.find(item => item.id === req.params.id)
  if (creator) {
    const isVerified = creator.badges.includes('verified')
    if (isVerified) {
      creator.badges = creator.badges.filter(b => b !== 'verified')
    } else {
      creator.badges.push('verified')
    }
    // Update matching creator property on designs as well
    designs.forEach(d => {
      if (d.creator.username === creator.username) {
        d.creator.verified = !isVerified
      }
    })
    res.json(creator)
  } else {
    res.status(404).json({ error: 'Creator not found' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
