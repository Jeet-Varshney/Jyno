import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M2 20 Q8 8 14 12 Q20 16 26 4" stroke="#C8FF00" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <circle cx="14" cy="22" r="2" fill="#C8FF00"/>
              </svg>
              <span>jyno</span>
            </Link>
            <p className="footer__tagline">
              The world's first creator marketplace<br/>for custom footwear.
            </p>
            <div className="footer__socials">
              {['𝕏', 'IG', 'TT', 'DC'].map(s => (
                <button key={s} className="footer__social-btn">{s}</button>
              ))}
            </div>
          </div>

          <div className="footer__links-grid">
            <div className="footer__col">
              <h4 className="footer__col-title">Platform</h4>
              <ul>
                <li><Link to="/studio">Design Studio</Link></li>
                <li><Link to="/community">Community</Link></li>
                <li><Link to="/marketplace">Marketplace</Link></li>
                <li><Link to="/ai-studio">AI Studio</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Creators</h4>
              <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><a href="#">Sell Designs</a></li>
                <li><a href="#">Creator Program</a></li>
                <li><a href="#">Earnings</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Legal</h4>
              <ul>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Cookies</a></li>
                <li><a href="#">IP Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="body-sm">© 2025 Jyno. All rights reserved.</span>
          <span className="body-sm">Made with ❤️ for creators worldwide.</span>
        </div>
      </div>
    </footer>
  )
}
