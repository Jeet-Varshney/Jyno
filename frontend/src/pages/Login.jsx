import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/client'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await login(username, password)
      
      // Store user and token in localStorage
      localStorage.setItem('jyno_user', JSON.stringify(res.user))
      localStorage.setItem('jyno_token', res.token)

      // Dispatch auth change event so navbar and other components update immediately
      window.dispatchEvent(new Event('storage'))

      if (res.user.role === 'admin') {
        navigate('/jyno-control')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Navbar />
      <main className="login-container">
        <div className="login-card animate-fade-in">
          <div className="login-card__header">
            <svg className="login-card__logo" width="36" height="36" viewBox="0 0 28 28" fill="none">
              <path d="M2 20 Q8 8 14 12 Q20 16 26 4" stroke="#C8FF00" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="14" cy="22" r="4" fill="#C8FF00" opacity="0.3"/>
              <circle cx="14" cy="22" r="2" fill="#C8FF00"/>
            </svg>
            <h1 className="heading-xl text-white">Sign In to Jyno</h1>
            <p className="body-md text-muted">Access your dashboard, design studio, and sales metrics.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-form__error">⚠️ {error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="input login-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="input login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              className={`btn btn-primary btn-lg login-btn ${loading ? 'loading' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In ✦'}
            </button>
          </form>

          <div className="login-card__footer">
            <p className="body-sm text-muted">
              Don't have an account? <span className="text-lime" style={{ cursor: 'pointer' }}>Sign up as a Creator</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
