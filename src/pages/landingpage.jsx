import React, { useEffect, useState } from "react";
import { loginUser } from "../utils/api";
import TrendingFakeNews from "./TrendingFakeNews";
import RegistrationForm from "./RegistrationForm";

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Animation hook for on-scroll fade-in
const useScrollFadeIn = () => {
  const ref = React.useRef();
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("fade-init");
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("fade-in");
        } else {
          el.classList.remove("fade-in");
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const LandingPage = () => {
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const move = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };

    const onOver = (e) => {
      const target = e.target;
      const el = target && target.closest ? target.closest('.hover-text') : null;
      if (el || (target.tagName === 'BUTTON') || (target.tagName === 'A')) {
        cursor.classList.add('cursor-hover');
        if (el) el.classList.add('hovered');
      }
    };

    const onOut = (e) => {
      const target = e.target;
      const el = target && target.closest ? target.closest('.hover-text') : null;
      if (el || (target.tagName === 'BUTTON') || (target.tagName === 'A')) {
        cursor.classList.remove('cursor-hover');
        if (el) el.classList.remove('hovered');
      }
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  const [showModal, setShowModal] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const closeModal = () => setShowModal(false);
  const openRegister = () => {
    setShowRegister(true);
  };
  const closeRegister = () => {
    setShowRegister(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const user = loginUser(loginEmail, loginPassword);
    if (!user) {
      setLoginError("Invalid email or password");
      return;
    }
    setUser(user);
    setShowModal(false);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    let roleRoute = "/";
    if (user.user_role === "manufacturer") roleRoute = "/manufacture";
    else if (user.user_role === "seller") roleRoute = "/seller";
    else if (user.user_role === "consumer") roleRoute = "/consumer";
    window.location.hash = roleRoute;
    window.location.reload();
  };


  // Helper to check if user is logged in
  const isLoggedIn = () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    try {
      const parsed = JSON.parse(user);
      return parsed && parsed.user_role;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d23] text-white font-sans" style={{ position: 'relative' }}>
      <div id="custom-cursor" aria-hidden="true"></div>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6">
        <div className="text-2xl font-bold text-[#00aaff]">BlockVerify</div>
        <ul className="flex gap-6 items-center" id="nav">
          <li id="nav-link" className="hover:opacity-70 cursor-pointer hover-text" onClick={() => {
            if (isLoggedIn()) {
              window.location.hash = '/';
            } else {
              setShowModal(true);
            }
          }}>Home</li>
          <li id="nav-link" className="hover:opacity-70 cursor-pointer hover-text" onClick={() => {
            if (isLoggedIn()) {
              // About page navigation (implement if exists)
            } else {
              setShowModal(true);
            }
          }}>About</li>
          <li id="nav-link" className="hover:opacity-70 cursor-pointer hover-text" onClick={() => {
            if (isLoggedIn()) {
              // Verify Product navigation (implement if exists)
            } else {
              setShowModal(true);
            }
          }}>Verify Product</li>
        </ul>
        <ul id="role" className="flex justify-between items-center px-12 py-6" >
          <li id="role-manufacture" className="px-3 py-1 border border-[#4b9cff] rounded text-[#4b9cff] cursor-pointer" onClick={() => {
            if (isLoggedIn()) {
              window.location.hash = '/manufacture';
            } else {
              setShowModal(true);
            }
          }}>
            Manufacturer
          </li>
          <li id="role-seller" className="px-3 py-1 border border-[#00ffaa] rounded text-[#00ffaa] cursor-pointer" onClick={() => {
            if (isLoggedIn()) {
              window.location.hash = '/seller';
            } else {
              setShowModal(true);
            }
          }}>
            Seller
          </li>
          <li id="role-consumer" className="px-3 py-1 border border-[#aa44ff] rounded text-[#aa44ff] cursor-pointer" onClick={() => {
            const user = localStorage.getItem('user');
            let role = null;
            if (user) {
              try {
                role = JSON.parse(user).user_role;
              } catch {}
            }
            if (role && (role.trim().toLowerCase() === 'consumer' || role.trim().toLowerCase() === 'admin')) {
              window.location.hash = '/consumer';
            } else {
              setShowModal(true);
            }
          }}>
            Consumer
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div id="hero-section" className="flex flex-col items-center justify-center text-center px-6 py-36 fade-init" ref={useScrollFadeIn()}>
        {/* Badge */}
        <div className=" badge inline-block mb-6 px-6 py-2 border border-[#00aaff] rounded-xl bg-[#1e40af] text-[#dbeafe] text-sm font-medium">
          Blockchain-Powered Verification
        </div>
        {/* Heading with gradient text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text hover-text">
          Fake Product Recognition Using Blockchain Technology
        </h1>
        {/* Subtext */}
        <p className="text-white mb-10 max-w-2xl">
          Eliminate counterfeit products and build trust with an immutable, <br />
          transparent supply chain verification system
        </p>
        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button className="hero-btn-primary">
            Verify Product →
          </button>
          <button className="hero-btn-secondary">
            Learn More
          </button>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mission-section max-w-4xl mx-auto fade-init" ref={useScrollFadeIn()}>
        <h2>Our Mission</h2>
        <p>BlockVerify aims to eliminate counterfeit products by leveraging blockchain technology for transparent and immutable product verification. Our platform empowers manufacturers, sellers, and consumers to verify product authenticity, ensuring trust throughout the supply chain.</p>
        <p>We resolve the issue of fake products by providing a decentralized, tamper-proof record of product origin and movement. Technologies used include React, Vite, Tailwind CSS, and blockchain integration for secure verification.</p>
      </div>

      {/* User Section */}
      <div className="user-section max-w-4xl mx-auto fade-init" ref={useScrollFadeIn()}>
        <h2>Our Users & Roles</h2>
        <div className="user-cards">
          <div className="user-card manufacturer">
            <h3>Manufacturer</h3>
            <p>Registers products on the blockchain, ensuring authenticity from the source.</p>
          </div>
          <div className="user-card seller">
            <h3>Seller</h3>
            <p>Verifies and sells genuine products, maintaining trust with customers.</p>
          </div>
          <div className="user-card consumer">
            <h3>Consumer</h3>
            <p>Checks product authenticity before purchase, protecting themselves from counterfeits.</p>
          </div>
        </div>
      </div>

      {/* Difference from Legacy Section */}
      <div className="difference-section max-w-4xl mx-auto fade-init" ref={useScrollFadeIn()}>
        <h2>How We Differ from Legacy Systems</h2>
        <p>Legacy systems rely on centralized databases and manual verification, which are prone to tampering and errors. BlockVerify uses blockchain for decentralized, transparent, and immutable records, eliminating single points of failure and reducing fraud.</p>
        <p>We resolve issues of data manipulation, lack of transparency, and slow verification processes, making product authentication fast, secure, and reliable.</p>
      </div>

      {/* Educational Videos Section */}
      <div className="videos-section max-w-4xl mx-auto fade-init" ref={useScrollFadeIn()}>
        <h2>Educational Videos</h2>
        <div className="video-cards">
          <div className="video-card">
            <iframe src="https://www.youtube.com/embed/ceZ2w_V78tc?si=PF0TVjIfrWB9mBir" title="Fake Product Documentary" frameBorder="0" allowFullScreen></iframe>
            <p>Fake Product Documentary</p>
          </div>
          <div className="video-card">
            <iframe src="https://www.youtube.com/embed/LsyPgNJDRKA?si=I03NjrZYi79GxAr7" title="Counterfeit Market Exposed" frameBorder="0" allowFullScreen></iframe>
            <p>Counterfeit Market Exposed</p>
          </div>
        </div>
      </div>

      {/* Trending Fake News Section */}
      <div className="trending-news-section max-w-4xl mx-auto fade-init" ref={useScrollFadeIn()}>
        <TrendingFakeNews />
      </div>

      {/* Footer Section */}
      <footer className="footer-section fade-init" ref={useScrollFadeIn()}>
        <div className="max-w-5xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand & Location */}
          <div>
            <div className="text-[#00aaff] font-bold text-2xl mb-2">BlockVerify</div>
            <div className="mb-2" style={{borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,170,255,0.10)'}}>
              <iframe
                title="Live Location"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2378.1504180686115!2d73.05081527593018!3d33.66604635289629!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df9570806ed9ed%3A0x894fbeb9e70954d4!2sNational%20University%20Of%20Modern%20Languages%20(NUML)!5e0!3m2!1sen!2sus!4v1768248088544!5m2!1sen!2sus"
                width="100%"
                height="180"
                style={{border:0}}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="text-gray-400 text-sm">contact@blockverify.com</div>
            <div className="text-gray-400 text-sm">+91 98765 43210</div>
          </div>
          {/* Quick Links */}
          <div>
            <div className="font-semibold text-lg mb-2 text-[#00ffaa]">Quick Links</div>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300">Home</a></li>
              <li><a href="#" className="text-gray-300">About</a></li>
              <li><a href="#" className="text-gray-300">Verify Product</a></li>
              <li><a href="#" className="text-gray-300">Contact</a></li>
            </ul>
          </div>
          {/* Social Media */}
          <div>
            <div className="font-semibold text-lg mb-2 text-[#aa44ff]">Follow Us</div>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fa-brands fa-twitter fa-lg" style={{color: '#1da1f2'}}></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fa-brands fa-facebook fa-lg" style={{color: '#1877f3'}}></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fa-brands fa-instagram fa-lg" style={{color: '#e1306c'}}></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin fa-lg" style={{color: '#0077b5'}}></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          © 2026 BlockVerify. All rights reserved. | Designed & Developed by BlockVerify Team
        </div>
      </footer>

      {/* Modal (login/register) */}
      {showModal && !showRegister && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-hidden={!showModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} aria-hidden={!showModal}>
            <div className="modal-header">
              <h3 className="text-xl font-semibold">Welcome to BlockVerify</h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>
            <form className="modal-body" onSubmit={handleLogin}>
              <p className="text-sm text-gray-200 mb-4">Sign in or register to start verifying products.</p>
              <input className="modal-input" placeholder="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoFocus />
              <input className="modal-input" placeholder="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              {loginError && <div style={{color:'#f87171',marginTop:4,marginBottom:2,fontWeight:600}}>{loginError}</div>}
              <div className="modal-actions">
                <button className="modal-btn-primary" type="submit">Login</button>
              </div>
              {/* Additional auth options as requested (keep existing modal CSS) */}
              <div className="modal-google" style={{display: 'flex', justifyContent: 'center'}}>
                <button
                  className="modal-btn-secondary"
                  onClick={() => alert('Connect with Google')}
                  aria-label="Connect with Google"
                  type="button"
                  style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px'}}>
                  <span>Connect with</span>
                  <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                    <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-36.3-4.4-53.5H272v101.2h147.1c-6.3 34-25 62.8-53.3 82v68.1h85.9c50.2-46.3 80.8-114.4 80.8-197z"/>
                    <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24 178.2-65.2l-85.9-68.1c-24 16.1-54.5 25.7-92.3 25.7-71 0-131.2-47.9-152.7-112.2H33.8v70.6C78.4 492.1 168.7 544.3 272 544.3z"/>
                    <path fill="#FBBC05" d="M119.3 322.5c-10.6-31.7-10.6-65.9 0-97.6V154.3H33.8c-38.6 76.9-38.6 168.6 0 245.5l85.5-77.3z"/>
                    <path fill="#EA4335" d="M272 107.7c39.6 0 75.1 13.6 103.1 40.4l77.3-77.3C405.6 24.6 344.6 0 272 0 168.7 0 78.4 52.2 33.8 129.1l85.5 70.6C140.8 155.6 201 107.7 272 107.7z"/>
                  </svg>
                </button>
              </div>
              <div style={{textAlign: 'center', marginTop: '6px'}}>
                <p style={{margin: 0, color: 'rgba(226,232,240,0.8)'}}>Don't have any account?</p>
                <div style={{marginTop: '6px'}}>
                  <button className="modal-btn-secondary" onClick={openRegister} type="button">Register</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {showModal && showRegister && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-hidden={!showModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: 480, width: '100%'}} aria-hidden={!showModal}>
            <div className="modal-header">
              <h3 className="text-xl font-semibold">Register</h3>
              <button className="modal-close" onClick={() => { closeRegister(); closeModal(); }} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <RegistrationForm />
              <div style={{textAlign: 'center', marginTop: 12}}>
                <button className="modal-btn-secondary" onClick={closeRegister}>Back to Login</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
