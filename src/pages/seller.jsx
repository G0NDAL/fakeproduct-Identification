import React, { useEffect } from "react";
import ProfileDropdown from '../components/ProfileDropdown.jsx';
import WalletConnect from '../components/WalletConnect.jsx';
import {
  BanknotesIcon,
  ArrowPathIcon,
  ClockIcon,
  CubeIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

const SellerPage = () => {
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

      {/* Navbar */}
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
              color: '#fff',
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
        </div>
        <h2 id="seller-title" className="dashboard text-3xl font-bold mb-6">Seller Dashboard</h2>
        <p className="dashboard-tagline text-slate-500 mb-8">Manage product sales and supply chain updates</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-cards flex flex-row gap-6">
            {/* Sell Product to Consumer */}
            <button className="dashboard-card card-blue" onClick={() => window.location.hash = '/sell-product-to-consumer'}>
              <BanknotesIcon className="dashboard-card-icon icon-blue w-14 h-14" />
              <div>
                <h3 className="dashboard-card-title">Sell Product to Consumer</h3>
                <p className="dashboard-card-desc">Complete final product sale</p>
              </div>
            </button>

            {/* Update Supply Chain */}
            <button
              className="dashboard-card card-green"
              onClick={() => window.location.hash = '/update-supply-chain'}
            >
              <ArrowPathIcon className="dashboard-card-icon icon-green w-14 h-14" />
              <div>
                <h3 className="dashboard-card-title">Update Supply Chain</h3>
                <p className="dashboard-card-desc">Update product movement details</p>
              </div>
            </button>

            {/* Product History */}
            <button className="dashboard-card card-purple" onClick={() => window.location.hash = '/product-history'}>
              <ClockIcon className="dashboard-card-icon icon-purple w-14 h-14" />
              <div>
                <h3 className="dashboard-card-title">Product History</h3>
                <p className="dashboard-card-desc">View product transaction logs</p>
              </div>
            </button>
          </div>

          <div className="dashboard-stats flex flex-col gap-20">
            <div className="dashboard-stat-card" id="seller-dashboard-stat-card">
              <div className="dashboard-stat-card-icon icon-blue-result">
                <ArrowTrendingUpIcon className="w-12 h-12" />
              </div>
              <div className="dashboard-stat-number">92</div>
              <div className="dashboard-stat-text">Products Sold</div>
            </div>
            <div className="dashboard-stat-card" id="seller-dashboard-stat-card">
              <div className="dashboard-stat-card-icon icon-green-result">
                <CubeIcon className="w-12 h-12" />
              </div>
              <div className="dashboard-stat-number">36</div>
              <div className="dashboard-stat-text">Products In Stock</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Card - Modern Layout */}
        <div className="glassy-card mt-10 p-8 mx-5 bg-[#192447]">
          <h3 className="font-semibold text-2xl mb-6 text-left text-white">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-fixed">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/4">Product Serial Number</th>
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/3">Product Name</th>
                  <th className="py-2 px-4 text-sm text-gray-300 w-1/3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Get products from localStorage, show up to 5 most recent for seller
                  let products = [];
                  try {
                    products = JSON.parse(localStorage.getItem('registeredProducts') || '[]');
                  } catch {}
                  products = Array.isArray(products) ? products : [];
                  // Sort by status update date if available, else by registeredDate
                  products.sort((a, b) => {
                    const da = new Date(a.statusDate || a.registeredDate || 0);
                    const db = new Date(b.statusDate || b.registeredDate || 0);
                    return db - da;
                  });
                  return products.slice(0, 5).map((p, idx) => (
                    <tr key={p.serialNumber || idx} className="border-b border-gray-700 hover:bg-gray-800 transition">
                      <td className="py-2 px-4 text-sm text-gray-100">{p.serialNumber}</td>
                      <td className="py-2 px-4 text-sm text-gray-100">{p.name}</td>
                      <td className="py-2 px-4 text-sm text-gray-100">
                        <span
                          style={{
                            backgroundColor:
                              (p.status === 'Sold' || p.status === 'Sold to Consumer') ? '#22c55e' :
                              (p.status === 'In Transit' ? '#ef4444' : '#fde047'),
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
                          {p.status || 'In Stock'}
                        </span>
                      </td>
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

export default SellerPage;
