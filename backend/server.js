import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import db from './db.js'

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

// GET all designs
app.get('/api/designs', (req, res) => {
  res.json(db.getDesigns())
})

// GET single design
app.get('/api/designs/:id', (req, res) => {
  const d = db.getDesignById(req.params.id)
  if (d) {
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// POST new design
app.post('/api/designs', async (req, res) => {
  const newDesign = {
    id: String(db.getDesigns().length + 1),
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
    commentsList: []
  }
  await db.addDesign(newDesign)
  res.status(201).json(newDesign)
})

// POST like a design
app.post('/api/designs/:id/like', async (req, res) => {
  const d = db.getDesignById(req.params.id)
  if (d) {
    const user = req.body.username || 'guest'
    await db.recordEvent('like', d.creator.username, d.id, { username: user })
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// POST view a design
app.post('/api/designs/:id/view', async (req, res) => {
  const d = db.getDesignById(req.params.id)
  if (d) {
    const user = req.body.username || 'guest'
    await db.recordEvent('view', d.creator.username, d.id, { username: user })
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// POST save a design
app.post('/api/designs/:id/save', async (req, res) => {
  const d = db.getDesignById(req.params.id)
  if (d) {
    const user = req.body.username || 'guest'
    await db.recordEvent('save', d.creator.username, d.id, { username: user })
    res.json(d)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// POST buy a design
app.post('/api/designs/:id/buy', async (req, res) => {
  const d = db.getDesignById(req.params.id)
  if (d) {
    const user = req.body.username || 'guest'
    await db.recordEvent('buy', d.creator.username, d.id, { username: user, price: d.price || 150 })
    res.json({ success: true, design: d })
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// GET design comments
app.get('/api/designs/:id/comments', (req, res) => {
  res.json(db.getComments(req.params.id))
})

// POST design comment
app.post('/api/designs/:id/comments', async (req, res) => {
  const { user, text } = req.body
  if (!user || !text) {
    return res.status(400).json({ error: 'User and text are required' })
  }
  const newComment = await db.addComment(req.params.id, { user, text })
  if (newComment) {
    res.status(201).json(newComment)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// GET all creators
app.get('/api/creators', (req, res) => {
  res.json(db.getCreators())
})

// POST follow a creator
app.post('/api/creators/:username/follow', async (req, res) => {
  const creator = db.getCreatorByUsername(req.params.username)
  if (creator) {
    const user = req.body.username || 'guest'
    await db.recordEvent('follow', creator.username, null, { username: user })
    res.json(creator)
  } else {
    res.status(404).json({ error: 'Creator not found' })
  }
})

// GET creator analytics
app.get('/api/creators/:username/analytics', (req, res) => {
  const analytics = db.getCreatorAnalytics(req.params.username)
  res.json(analytics)
})

// GET Check Username Availability
app.get('/api/auth/check-username', (req, res) => {
  const { username } = req.query
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' })
  }
  const normalized = username.trim().toLowerCase()
  const exists = db.getUser(normalized) || db.getCreatorByUsername(normalized)
  res.json({ available: !exists })
})

// POST Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  const user = db.getUser(username)
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
app.post('/api/auth/signup', async (req, res) => {
  const { username, name, password } = req.body
  if (!username || !name || !password) {
    return res.status(400).json({ error: 'Username, name, and password are required' })
  }
  
  const normalizedUsername = username.trim().toLowerCase()
  
  // Validate username format (alphanumeric + underscores only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(normalizedUsername)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores.' })
  }

  // Ensure username uniqueness against both users and creators lists
  if (db.getUser(normalizedUsername) || db.getCreatorByUsername(normalizedUsername)) {
    return res.status(400).json({ error: 'Username already exists' })
  }

  // Enforce password criteria: min 6 characters, at least 1 number
  if (password.length < 6 || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long and contain at least one number.' })
  }
  
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
  
  const newUser = {
    username: normalizedUsername,
    name: name.trim(),
    role: 'creator',
    passwordHash: passwordHash
  }
  await db.addUser(newUser)
  
  const newCreator = {
    id: String(db.getCreators().length + 1),
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
  await db.addCreator(newCreator)
  
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
app.delete('/api/designs/:id', async (req, res) => {
  const success = await db.deleteDesign(req.params.id)
  if (success) {
    res.json({ success: true, message: 'Design deleted successfully' })
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// ADMIN: Update design parameters (price, title, tags, forSale, trending)
app.put('/api/designs/:id', async (req, res) => {
  const updates = {}
  if (req.body.title !== undefined) updates.title = req.body.title
  if (req.body.price !== undefined) updates.price = Number(req.body.price)
  if (req.body.tags !== undefined) updates.tags = req.body.tags
  if (req.body.forSale !== undefined) updates.forSale = !!req.body.forSale
  if (req.body.trending !== undefined) updates.trending = !!req.body.trending

  const updated = await db.updateDesign(req.params.id, updates)
  if (updated) {
    res.json(updated)
  } else {
    res.status(404).json({ error: 'Design not found' })
  }
})

// ADMIN: Toggle verify state of a creator
app.post('/api/creators/:id/verify', async (req, res) => {
  const creators = db.getCreators()
  const creator = creators.find(item => item.id === req.params.id)
  if (creator) {
    const isVerified = creator.badges.includes('verified')
    if (isVerified) {
      creator.badges = creator.badges.filter(b => b !== 'verified')
    } else {
      creator.badges.push('verified')
    }
    await db.saveCreators()

    // Update matching creator property on designs as well
    const designs = db.getDesigns()
    designs.forEach(d => {
      if (d.creator.username === creator.username) {
        d.creator.verified = !isVerified
      }
    })
    await db.saveDesigns()

    res.json(creator)
  } else {
    res.status(404).json({ error: 'Creator not found' })
  }
})

db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error("Failed to initialize database:", err)
})
