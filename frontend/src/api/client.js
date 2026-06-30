// Frontend API client — all backend calls go through here
const BASE_URL = 'http://localhost:5001/api'

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        const data = await res.clone().json()
        if (data && data.error) msg = data.error
      } catch (_) {}
      throw new Error(msg)
    }
    return res.json()
  } catch (err) {
    console.error(`API error [${path}]:`, err)
    throw err
  }
}

// ─── Designs ──────────────────────────────────────────────────────────────────

export const getDesigns = () => request('/designs')

export const getDesign = (id) => request(`/designs/${id}`)

export const createDesign = (design) =>
  request('/designs', { method: 'POST', body: JSON.stringify(design) })

export const likeDesign = (id) =>
  request(`/designs/${id}/like`, { method: 'POST' })

// ─── Creators ─────────────────────────────────────────────────────────────────

export const getCreators = () => request('/creators')

// ─── Auth & Admin Portal ──────────────────────────────────────────────────────

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })

export const signup = (name, username, password) =>
  request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, username, password }) })


export const deleteDesign = (id) =>
  request(`/designs/${id}`, { method: 'DELETE' })

export const updateDesign = (id, data) =>
  request(`/designs/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const toggleVerifyCreator = (id) =>
  request(`/creators/${id}/verify`, { method: 'POST' })

