import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')

const USERS_FILE = path.join(DATA_DIR, 'users.json')
const DESIGNS_FILE = path.join(DATA_DIR, 'designs.json')
const CREATORS_FILE = path.join(DATA_DIR, 'creators.json')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

// SHA256 of 'password123'
const DEFAULT_PASS_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'

const DEFAULT_USERS = {
  'jyno_admin_portal': {
    username: 'jyno_admin_portal',
    name: 'System Admin',
    role: 'admin',
    passwordHash: '002788ab14570ba30e8e97b21910dc284dab2fc6429f8cd12eb90ad44441a2d3' // SHA256 of JynoSuperSecureAdmin2026!
  },
  'zara_creative_dir': {
    username: 'zaraexe',
    name: 'Zara.exe',
    role: 'creator',
    passwordHash: '8d977b1758ab08ab2777d8006dbfea04f0ffae133a855db9dcffc45811a57651' // SHA256 of ZaraSecureCreativeFlow99!
  },
  'zaraexe': {
    username: 'zaraexe',
    name: 'Zara.exe',
    role: 'creator',
    passwordHash: DEFAULT_PASS_HASH
  },
  'novakicks': {
    username: 'novakicks',
    name: 'NovaKicks',
    role: 'creator',
    passwordHash: DEFAULT_PASS_HASH
  },
  'urbancanvas': {
    username: 'urbancanvas',
    name: 'UrbanCanvas',
    role: 'creator',
    passwordHash: DEFAULT_PASS_HASH
  },
  'metakicks': {
    username: 'metakicks',
    name: 'MetaKicks',
    role: 'creator',
    passwordHash: DEFAULT_PASS_HASH
  },
  'sunrise': {
    username: 'sunrise',
    name: 'SunriseDesigns',
    role: 'creator',
    passwordHash: DEFAULT_PASS_HASH
  },
  'kickcraft': {
    username: 'kickcraft',
    name: 'KickCraft',
    role: 'creator',
    passwordHash: DEFAULT_PASS_HASH
  }
}

const DEFAULT_DESIGNS = [
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
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
    commentsList: []
  }
]

const DEFAULT_CREATORS = [
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

const DEFAULT_COMMENTS = [
  { id: 1, user: 'Zara.exe', text: 'This colorway is absolutely 🔥 genius!', time: '2 hours ago', likes: 34 },
  { id: 2, user: 'NovaKicks', text: 'The sole gradient is everything. Want this IRL.', time: '4 hours ago', likes: 21 },
  { id: 3, user: 'UrbanCanvas', text: 'Incredible attention to detail. Top-tier work.', time: '6 hours ago', likes: 18 },
  { id: 4, user: 'KickCraft', text: 'Can we get a midnight blue variation?', time: '1 day ago', likes: 12 },
]
DEFAULT_DESIGNS.forEach(d => {
  d.commentsList = [...DEFAULT_COMMENTS]
})

class Database {
  constructor() {
    this.users = {}
    this.designs = []
    this.creators = []
    this.analytics = { events: [] }
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    try {
      await fs.mkdir(DATA_DIR, { recursive: true })
    } catch (_) {}

    this.users = await this._loadJson(USERS_FILE, DEFAULT_USERS)
    this.designs = await this._loadJson(DESIGNS_FILE, DEFAULT_DESIGNS)
    this.creators = await this._loadJson(CREATORS_FILE, DEFAULT_CREATORS)
    this.analytics = await this._loadJson(ANALYTICS_FILE, null)

    if (!this.analytics || !this.analytics.events || this.analytics.events.length === 0) {
      console.log('Generating mock analytics events...')
      this.analytics = { events: this._generateMockEvents() }
      await this.saveAnalytics()
    }

    this.initialized = true
    console.log('JSON Database loaded and initialized successfully.')
  }

  async _loadJson(filePath, defaultValue) {
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      if (defaultValue !== null) {
        await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8')
      }
      return defaultValue
    }
  }

  async saveUsers() {
    await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8')
  }

  async saveDesigns() {
    await fs.writeFile(DESIGNS_FILE, JSON.stringify(this.designs, null, 2), 'utf-8')
  }

  async saveCreators() {
    await fs.writeFile(CREATORS_FILE, JSON.stringify(this.creators, null, 2), 'utf-8')
  }

  async saveAnalytics() {
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(this.analytics, null, 2), 'utf-8')
  }

  _generateMockEvents() {
    const events = []
    const now = new Date()
    const usernames = ['zaraexe', 'novakicks', 'urbancanvas', 'metakicks', 'sunrise', 'kickcraft']

    this.creators.forEach(creator => {
      const creatorDesigns = this.designs.filter(d => d.creator.username === creator.username)
      if (creatorDesigns.length === 0) return

      for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15)
        const popularityScale = creator.followers > 40000 ? 5 : creator.followers > 25000 ? 3 : 1
        const viewCount = Math.floor(Math.random() * 20 + 20) * popularityScale
        const likeCount = Math.floor(viewCount * (Math.random() * 0.15 + 0.05))
        const saveCount = Math.floor(viewCount * (Math.random() * 0.08 + 0.02))
        const buyCount = Math.floor(Math.random() * 3 + 1) * popularityScale

        // Views
        for (let i = 0; i < viewCount; i++) {
          const d = creatorDesigns[Math.floor(Math.random() * creatorDesigns.length)]
          const ts = new Date(monthDate.getTime() + (Math.random() - 0.5) * 10 * 24 * 60 * 60 * 1000)
          events.push({
            id: `ev_v_${Math.random().toString(36).substring(2, 9)}`,
            type: 'view',
            creatorUsername: creator.username,
            designId: d.id,
            timestamp: ts.toISOString(),
            username: usernames[Math.floor(Math.random() * usernames.length)]
          })
        }

        // Likes
        for (let i = 0; i < likeCount; i++) {
          const d = creatorDesigns[Math.floor(Math.random() * creatorDesigns.length)]
          const ts = new Date(monthDate.getTime() + (Math.random() - 0.5) * 10 * 24 * 60 * 60 * 1000)
          events.push({
            id: `ev_l_${Math.random().toString(36).substring(2, 9)}`,
            type: 'like',
            creatorUsername: creator.username,
            designId: d.id,
            timestamp: ts.toISOString(),
            username: usernames[Math.floor(Math.random() * usernames.length)]
          })
        }

        // Saves
        for (let i = 0; i < saveCount; i++) {
          const d = creatorDesigns[Math.floor(Math.random() * creatorDesigns.length)]
          const ts = new Date(monthDate.getTime() + (Math.random() - 0.5) * 10 * 24 * 60 * 60 * 1000)
          events.push({
            id: `ev_s_${Math.random().toString(36).substring(2, 9)}`,
            type: 'save',
            creatorUsername: creator.username,
            designId: d.id,
            timestamp: ts.toISOString(),
            username: usernames[Math.floor(Math.random() * usernames.length)]
          })
        }

        // Buys
        for (let i = 0; i < buyCount; i++) {
          const d = creatorDesigns[Math.floor(Math.random() * creatorDesigns.length)]
          const ts = new Date(monthDate.getTime() + (Math.random() - 0.5) * 10 * 24 * 60 * 60 * 1000)
          events.push({
            id: `ev_b_${Math.random().toString(36).substring(2, 9)}`,
            type: 'buy',
            creatorUsername: creator.username,
            designId: d.id,
            price: d.price || 150,
            timestamp: ts.toISOString(),
            username: usernames[Math.floor(Math.random() * usernames.length)]
          })
        }
      }
    })

    return events
  }

  // --- Users ---
  getUser(username) {
    return this.users[username.toLowerCase().trim()]
  }

  async addUser(user) {
    const norm = user.username.toLowerCase().trim()
    this.users[norm] = user
    await this.saveUsers()
  }

  // --- Designs ---
  getDesigns() {
    return this.designs
  }

  getDesignById(id) {
    return this.designs.find(d => d.id === id)
  }

  async addDesign(design) {
    this.designs.unshift(design)
    await this.saveDesigns()

    const creator = this.creators.find(c => c.username === design.creator.username)
    if (creator) {
      creator.totalDesigns += 1
      await this.saveCreators()
    }
  }

  async updateDesign(id, updates) {
    const idx = this.designs.findIndex(d => d.id === id)
    if (idx !== -1) {
      this.designs[idx] = { ...this.designs[idx], ...updates }
      await this.saveDesigns()
      return this.designs[idx]
    }
    return null
  }

  async deleteDesign(id) {
    const idx = this.designs.findIndex(d => d.id === id)
    if (idx !== -1) {
      const design = this.designs[idx]
      this.designs.splice(idx, 1)
      await this.saveDesigns()

      const creator = this.creators.find(c => c.username === design.creator.username)
      if (creator) {
        creator.totalDesigns = Math.max(0, creator.totalDesigns - 1)
        await this.saveCreators()
      }
      return true
    }
    return false
  }

  // --- Creators ---
  getCreators() {
    return this.creators
  }

  getCreatorByUsername(username) {
    return this.creators.find(c => c.username === username)
  }

  async addCreator(creator) {
    this.creators.push(creator)
    await this.saveCreators()
  }

  async updateCreator(username, updates) {
    const idx = this.creators.findIndex(c => c.username === username)
    if (idx !== -1) {
      this.creators[idx] = { ...this.creators[idx], ...updates }
      await this.saveCreators()
      return this.creators[idx]
    }
    return null
  }

  // --- Comments ---
  getComments(designId) {
    const d = this.getDesignById(designId)
    return d ? (d.commentsList || []) : []
  }

  async addComment(designId, commentData) {
    const d = this.getDesignById(designId)
    if (d) {
      if (!d.commentsList) d.commentsList = []
      const newComment = {
        id: Date.now(),
        user: commentData.user,
        text: commentData.text,
        time: 'Just now',
        likes: 0
      }
      d.commentsList.unshift(newComment)
      d.comments = d.commentsList.length
      await this.saveDesigns()
      
      await this.recordEvent('comment', d.creator.username, designId, {
        username: commentData.user,
        text: commentData.text
      })
      return newComment
    }
    return null
  }

  // --- Analytics & Events ---
  async recordEvent(type, creatorUsername, designId, data = {}) {
    const event = {
      id: `ev_${type.substring(0,1)}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      creatorUsername,
      designId,
      timestamp: new Date().toISOString(),
      username: data.username || 'guest',
      price: data.price,
      text: data.text
    }
    this.analytics.events.push(event)
    await this.saveAnalytics()

    const design = this.getDesignById(designId)
    if (design) {
      if (type === 'view') {
        design.views += 1
        await this.saveDesigns()
      } else if (type === 'like') {
        design.likes += 1
        await this.saveDesigns()
      } else if (type === 'save') {
        design.saves += 1
        await this.saveDesigns()
      }
    }

    if (type === 'buy') {
      const creator = this.getCreatorByUsername(creatorUsername)
      if (creator) {
        creator.totalSales += 1
        creator.totalEarnings += Number(data.price || 0)
        await this.saveCreators()
      }
    }

    if (type === 'follow') {
      const creator = this.getCreatorByUsername(creatorUsername)
      if (creator) {
        creator.followers += 1
        await this.saveCreators()
      }
    }

    return event
  }

  getCreatorAnalytics(username) {
    const creatorEvents = this.analytics.events.filter(e => e.creatorUsername === username)
    
    const totalViews = creatorEvents.filter(e => e.type === 'view').length
    const totalLikes = creatorEvents.filter(e => e.type === 'like').length
    const totalSaves = creatorEvents.filter(e => e.type === 'save').length
    const designsSold = creatorEvents.filter(e => e.type === 'buy').length
    const totalEarnings = creatorEvents.filter(e => e.type === 'buy').reduce((sum, e) => sum + (e.price || 0), 0)

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthEvents = creatorEvents.filter(e => new Date(e.timestamp) >= thisMonthStart)
    const lastMonthEvents = creatorEvents.filter(e => {
      const ts = new Date(e.timestamp)
      return ts >= lastMonthStart && ts < thisMonthStart
    })

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%'
      const pct = ((current - previous) / previous) * 100
      return (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%'
    }

    const viewsChange = calcChange(
      thisMonthEvents.filter(e => e.type === 'view').length,
      lastMonthEvents.filter(e => e.type === 'view').length
    )
    const likesChange = calcChange(
      thisMonthEvents.filter(e => e.type === 'like').length,
      lastMonthEvents.filter(e => e.type === 'like').length
    )
    const salesChange = calcChange(
      thisMonthEvents.filter(e => e.type === 'buy').length,
      lastMonthEvents.filter(e => e.type === 'buy').length
    )
    const earningsChange = calcChange(
      thisMonthEvents.filter(e => e.type === 'buy').reduce((sum, e) => sum + (e.price || 0), 0),
      lastMonthEvents.filter(e => e.type === 'buy').reduce((sum, e) => sum + (e.price || 0), 0)
    )

    const monthlyEarnings = Array(12).fill(0)
    const monthlyPerformance = Array(12).fill(0)

    creatorEvents.forEach(e => {
      const ts = new Date(e.timestamp)
      const diffTime = Math.abs(now - ts)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 365) {
        const monthIdx = ts.getMonth()
        if (e.type === 'buy') {
          monthlyEarnings[monthIdx] += (e.price || 0)
        }
        if (e.type === 'view') {
          monthlyPerformance[monthIdx] += 1
        }
      }
    })

    const recentEvents = [...creatorEvents]
      .filter(e => e.type !== 'view' && e.username !== username)
      .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 15)

    const notifications = recentEvents.map(e => {
      const design = this.getDesignById(e.designId)
      const title = design ? `"${design.title}"` : 'your design'
      let text = ''
      let icon = '🔔'
      
      if (e.type === 'like') {
        icon = '❤️'
        text = `${e.username} liked your ${title}`
      } else if (e.type === 'save') {
        icon = '🔖'
        text = `${e.username} saved your ${title}`
      } else if (e.type === 'comment') {
        icon = '💬'
        text = `${e.username} commented: "${e.text || 'nice design'}" on your ${title}`
      } else if (e.type === 'buy') {
        icon = '💰'
        text = `Your design ${title} was purchased! +$${e.price} added to earnings.`
      } else if (e.type === 'follow') {
        icon = '👥'
        text = `${e.username} started following you!`
      }

      const diffMs = now - new Date(e.timestamp)
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      let timeStr = 'Just now'
      if (diffDays > 0) timeStr = `${diffDays}d ago`
      else if (diffHours > 0) timeStr = `${diffHours}h ago`
      else if (diffMins > 0) timeStr = `${diffMins}m ago`

      return {
        icon,
        text,
        time: timeStr,
        unread: diffMs < 30 * 60 * 1000
      }
    })

    if (notifications.length === 0) {
      notifications.push(
        { icon: '⭐', text: 'Welcome to Jyno Creator Dashboard! Your database is safe & secure.', time: '1h ago', unread: true },
        { icon: '🔥', text: 'Your organic analytics engine is fully active tracking views and engagements.', time: '1h ago', unread: true }
      )
    }

    return {
      overviewStats: [
        { label: 'Total Views',   value: totalViews.toLocaleString(),   change: viewsChange, color: 'var(--jyno-cyan)',   icon: '👁️' },
        { label: 'Total Likes',   value: totalLikes.toLocaleString(),   change: likesChange, color: 'var(--jyno-pink)',   icon: '❤️' },
        { label: 'Designs Sold',  value: designsSold.toString(),        change: salesChange, color: 'var(--jyno-lime)',   icon: '📦' },
        { label: 'Total Earned',  value: `$${totalEarnings.toLocaleString()}`, change: earningsChange, color: 'var(--jyno-gold)',   icon: '💰' },
      ],
      earningsMonthly: monthlyEarnings,
      performanceMonthly: monthlyPerformance,
      notifications
    }
  }
}

const db = new Database()
export default db
