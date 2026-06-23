import React, { useEffect } from "react";
import ProfileDropdown from '../components/ProfileDropdown.jsx';
import WalletConnect from '../components/WalletConnect.jsx';
import { MagnifyingGlassIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, QrCodeIcon, CubeIcon } from "@heroicons/react/24/outline";

const ConsumerPage = () => {
  useEffect(() => {
    const cursor = document.getElementById("custom-cursor");
    if (!cursor) return;
    const move = (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };
    const onOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest(".hover-text")
      ) {
        cursor.classList.add("cursor-hover");
      }
    };
    const onOut = () => {
      cursor.classList.remove("cursor-hover");
    };
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0d23] text-white font-sans">
      <div id="custom-cursor" aria-hidden="true"></div>
      <nav className="flex justify-between items-center px-12 py-6">
        <div className="text-2xl font-bold text-[#00aaff]">BlockVerify</div>
        {(() => {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          return user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: '64px' }}>
              <WalletConnect />
              <ProfileDropdown user={user} onLogout={() => { localStorage.removeItem('user'); window.location.hash = '/'; }} />
            </div>
          ) : null;
        })()}
      </nav>
      <main className="px-12 py-10">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 24 }}>
          <button
            onClick={() => { window.location.hash = '/'; }}
            style={{
              marginTop: '100px',
              background: 'linear-gradient(90deg, #101830 60%, #00aaff 100%)',
              color: '#f1efef',
              fontWeight: 800,
              border: 'none',
              borderRadius: '10px',
              padding: '0.7rem 2.3rem',
              fontSize: '1.13rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px #00aaff22',
              transition: 'transform 0.18s, background 0.2s, color 0.2s',
              textAlign: 'left',
              maxWidth: 280,
              letterSpacing: 0.5,
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
        </div>
        <h2 id="consumer-title" className="dashboard text-3xl font-bold mb-6">Consumer Dashboard</h2>
        <p className="dashboard-tagline text-slate-500 mb-8">Verify and buy products securely</p>
        <div className="dashboard-cards flex flex-row gap-6 mb-8">
          {/* Verify Product */}
            <button className="dashboard-card card-blue" onClick={() => window.location.hash = '/verify-product'}>
              <MagnifyingGlassIcon className="dashboard-card-icon icon-blue w-14 h-14" />
              <div>
                <h3 className="dashboard-card-title">Verify Product</h3>
                <p className="dashboard-card-desc">Scan and verify product authenticity</p>
              </div>
            </button>
          {/* Product History */}
          <button className="dashboard-card card-purple" onClick={() => window.location.hash = '/product-history-consumer'}>
            <ClockIcon className="dashboard-card-icon icon-purple w-14 h-14" />
            <div>
              <h3 className="dashboard-card-title">Product History</h3>
              <p className="dashboard-card-desc">View your verification history</p>
            </div>
          </button>
        </div>
        <div className="dashboard-stats flex flex-row flex-nowrap gap-3 items-center mb-10 w-full justify-center">
          <div className="dashboard-stat-card p-2 min-w-[80px] max-w-[90px]" id="consumer-dashboard-stat-card">
            <div className="dashboard-stat-card-icon icon-blue-result">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div className="dashboard-stat-number text-base">120</div>
            <div className="dashboard-stat-text text-[10px]">Products Verified</div>
          </div>
          <div className="dashboard-stat-card p-2 min-w-[80px] max-w-[90px]" id="consumer-dashboard-stat-card">
            <div className="dashboard-stat-card-icon icon-green-result">
              <CubeIcon className="w-6 h-6" />
            </div>
            <div className="dashboard-stat-number text-base">110</div>
            <div className="dashboard-stat-text text-[10px]">Authentic Products</div>
          </div>
          <div className="dashboard-stat-card p-2 min-w-[80px] max-w-[90px]" id="consumer-dashboard-stat-card">
            <div className="dashboard-stat-card-icon" style={{ color: '#ef4444' }}>
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div className="dashboard-stat-number text-base">10</div>
            <div className="dashboard-stat-text text-[10px]">Counterfeits Detected</div>
          </div>
          <div className="dashboard-stat-card p-2 min-w-[80px] max-w-[90px]" id="consumer-dashboard-stat-card">
            <div className="dashboard-stat-card-icon icon-purple-result">
              <QrCodeIcon className="w-6 h-6" />
            </div>
            <div className="dashboard-stat-number text-base">200</div>
            <div className="dashboard-stat-text text-[10px]">Total Scans</div>
          </div>
        </div>
        {/* Recent Verified Products Table */}
        <div className="glassy-card mt-10 p-8 mx-5 bg-[#192447]">
          <h3 className="font-semibold text-2xl mb-6 text-left text-white">Recent Verified Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-fixed">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/4">Product Serial Number</th>
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/3">Product Name</th>
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/4">Status</th>
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/4">Verified At</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Get recent verified products from localStorage
                  let verified = [];
                  try {
                    verified = JSON.parse(localStorage.getItem('recentVerifiedProducts') || '[]');
                  } catch {}
                  verified = Array.isArray(verified) ? verified : [];
                  // Sort by verifiedAt descending
                  verified.sort((a, b) => new Date(b.verifiedAt || 0) - new Date(a.verifiedAt || 0));
                  return verified.slice(0, 5).map((v, idx) => (
                    <tr key={v.serialNumber || idx} className="border-b border-gray-700 hover:bg-gray-800 transition">
                      <td className="py-2 px-4 text-sm text-gray-100">{v.serialNumber}</td>
                      <td className="py-2 px-4 text-sm text-gray-100">{v.name}</td>
                      <td className="py-2 px-4 text-sm text-gray-100">
                        <span
                          style={{
                            backgroundColor: v.status === 'Authentic' ? '#22c55e' : v.status === 'Counterfeit' ? '#ef4444' : '#fde047',
                            color: '#fff',
                            borderRadius: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            fontWeight: 600,
                            fontSize: '0.98rem',
                            display: 'inline-block',
                            minWidth: 80,
                            textAlign: 'center',
                          }}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-100">{v.verifiedAt ? new Date(v.verifiedAt).toLocaleString() : '-'}</td>
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

export default ConsumerPage;
