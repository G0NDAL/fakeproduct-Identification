import React, { useEffect } from "react";
import { TruckIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CubeIcon, UserIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
// Import the profile dropdown from components
import ProfileDropdown from '../components/ProfileDropdown.jsx';
import WalletConnect from '../components/WalletConnect.jsx';

const ManufacturePage = ({ user, setUserState }) => {
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

  return (
    <div className="min-h-screen bg-[#0b0d23] text-white font-sans" style={{ position: 'relative' }}>
      <div id="custom-cursor" aria-hidden="true"></div>

      {/* Navbar with brand left, profile right, aligned to main content */}
      <nav
  className="flex items-center justify-between"
  style={{
    background: 'rgba(10,37,64,0.92)',
    borderBottom: '1.5px solid #00ffaa33',
    zIndex: 50,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: 80,
    padding: '0 48px',
  }}
>
        <div className="text-2xl font-bold text-[#00aaff]">BlockVerify</div>
        {/* Only show profile dropdown if user is logged in and not admin */}
        {(() => {
  const loggedInUser = user || JSON.parse(localStorage.getItem('user') || 'null');
  if (!loggedInUser) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: '64px' }}>
      <WalletConnect />
      <ProfileDropdown
        user={loggedInUser}
        onLogout={() => {
          localStorage.removeItem('user');
          setUserState && setUserState(null);
          window.location.hash = '/';
        }}
      />
    </div>
  );
})()}
      </nav>


      <main className="px-12 py-10" style={{ marginTop: 80 }}>
        <button
          onClick={() => { window.location.hash = '/'; }}
          style={{
            marginTop: 22,
            background: 'linear-gradient(90deg, #101830 60%, #00aaff 100%)',
            color: '#fff',
            fontWeight: 800,
            border: 'none',
            borderRadius: '10px',
            padding: '0.7rem 2.3rem',
            fontSize: '1.13rem',
            cursor: 'pointer',
            boxShadow: '0 4px 18px #00aaff22',
            transition: 'transform 0.18s, background 0.2s, color 0.2s',
            display: 'block',
            textAlign: 'left',
            maxWidth: 280,
            letterSpacing: 0.5
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.background = 'linear-gradient(90deg, #00aaff 0%, #101830 100%)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(90deg, #101830 60%, #00aaff 100%)';
            e.currentTarget.style.color = '#fff';
          }}
        >
          &#8592; Back to Home
        </button>
        <h2 id="manufacture-title" className=" dashboard text-3xl font-bold mb-6 ">Manufacturer Dashboard</h2>
        <p className="dashboard-tagline text-slate-500 mb-8">Manage your products and supply chain</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="dashboard-cards">

  {/* Register Product */}
  <button className="dashboard-card card-blue" onClick={() => window.location.hash = "#/register-product"}>
    <svg className="dashboard-card-icon icon-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    <div>
      <h3 className="dashboard-card-title">Register Product</h3>
      <p className="dashboard-card-desc">Add a new product inside the registry</p>
    </div>
  </button>

  {/* Add Seller */}
  <button className="dashboard-card card-green" onClick={() => window.location.hash = "#/add-seller"}>
    <svg className="dashboard-card-icon icon-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M5 9v10h14V9M9 19v-6h6v6" />
    </svg>
    <div>
      <h3 className="dashboard-card-title">Add Seller</h3>
      <p className="dashboard-card-desc">Authorize and manage sellers</p>
    </div>
  </button>

{/* Sell Product to Seller */}
<button className="dashboard-card card-yellow" onClick={() => window.location.hash = "#/sell-product-to-seller"}>
  <TruckIcon className="dashboard-card-icon icon-yellow w-15 h-15" />
  <div>
    <h3 className="dashboard-card-title">Sell Product to Seller</h3>
    <p className="dashboard-card-desc">Product sold to seller</p>
  </div>
</button>

  {/* Query Seller */}
  <button className="dashboard-card card-purple" onClick={() => window.location.hash = "#/query-seller"}>
    <svg className="dashboard-card-icon icon-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
    <div>
      <h3 className="dashboard-card-title">Query Seller</h3>
      <p className="dashboard-card-desc">Search and filter sellers</p>
    </div>
  </button>
</div>


<div className="dashboard-stats">
  <div className="dashboard-stat-card" id="manufacture-dashboard-stat-card">
    <div className="dashboard-stat-card-icon icon-blue-result">
      <CubeIcon className="w-12 h-12" />
    </div>
    <div className="dashboard-stat-number">128</div>
    <div className="dashboard-stat-text">Total Products Registered</div>
  </div>

  <div className="dashboard-stat-card" id="manufacture-dashboard-stat-card">
    <div className="dashboard-stat-card-icon icon-green-result">
      <UserIcon className="w-12 h-12" />
    </div>
    <div className="dashboard-stat-number">56</div>
    <div className="dashboard-stat-text">Total Active Sellers</div>
  </div>

  <div className="dashboard-stat-card" id="manufacture-dashboard-stat-card">
    <div className="dashboard-stat-card-icon icon-purple-result">
      <ArrowTrendingUpIcon className="w-12 h-12" />
    </div>
    <div className="dashboard-stat-number">74</div>
    <div className="dashboard-stat-text">Total Products Sold</div>
  </div>
</div>

        </div>
<div className="glassy-card mt-6 mx-5">
  {/* Card Title */}
  <h3 className="font-semibold text-lg mb-4">Recent Product Register</h3>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse table-fixed">
      <thead>
        <tr className="text-left border-b border-gray-600">
          <th className="py-2 px-4 text-sm text-gray-300 w-1/6">Product ID</th>
          <th className="py-2 px-4 text-sm text-gray-300 w-1/4">Product Name</th>
          <th className="py-2 px-4 text-sm text-gray-300 w-1/6">Product Brand</th>
          <th className="py-2 px-4 text-sm text-gray-300 w-1/4">Date</th>
          <th className="py-2 px-4 text-sm text-gray-300 w-1/6">Status</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          // Get products from localStorage, sort by registeredDate descending
          let products = [];
          try {
            products = JSON.parse(localStorage.getItem('registeredProducts') || '[]');
          } catch {}
          products = Array.isArray(products) ? products : [];
          // Sort by registeredDate (if available), fallback to most recent in array
          products.sort((a, b) => {
            const da = new Date(a.registeredDate || 0);
            const db = new Date(b.registeredDate || 0);
            return db - da;
          });
          // Show up to 5 most recent
          return products.slice(0, 5).map((p, idx) => (
            <tr key={p.serialNumber || idx} className="border-b border-gray-700 hover:bg-gray-800 transition">
              <td className="py-2 px-4 text-sm text-gray-100">{p.serialNumber}</td>
              <td className="py-2 px-4 text-sm text-gray-100">{p.name}</td>
              <td className="py-2 px-4 text-sm text-gray-100">{p.brand || '-'}</td>
              <td className="py-2 px-4 text-sm text-gray-100">{p.registeredDate ? new Date(p.registeredDate).toLocaleString() : '-'}</td>
              <td className="py-2 px-4 text-sm text-gray-100">{p.status || 'Registered'}</td>
            </tr>
          ));
        })()}
      </tbody>
    </table>
  </div>
</div>

      </main>
    </div>
  );
};

export default ManufacturePage;
