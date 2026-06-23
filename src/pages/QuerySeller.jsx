import React, { useState, useEffect } from 'react';

const QuerySeller = () => {
  const [sellers, setSellers] = useState([]);
  const [sales, setSales] = useState([]);

  // Custom cursor logic
  useEffect(() => {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'custom-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderRadius = '50%';
      cursor.style.background = 'rgba(0,170,255,0.18)'; // more transparent
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = 9999;
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.transition = 'background 0.2s, transform 0.08s';
      document.body.appendChild(cursor);
    }
    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      if (cursor) cursor.remove();
    };
  }, []);

  useEffect(() => {
    // Load sellers from localStorage
    const sellersData = JSON.parse(localStorage.getItem('registeredSellers') || '[]');
    setSellers(sellersData);
    // Load sales records from localStorage
    const salesData = JSON.parse(localStorage.getItem('salesRecords') || '[]');
    setSales(salesData);
  }, []);

  // Get products sold to a seller
  const getProductsForSeller = (sellerCode) => {
    return sales
      .filter(sale => sale.sellerCode === sellerCode)
      .map(sale => sale.productInfo);
  };

  return (
    <div className="query-seller-container" style={{ padding: '32px', background: '#101830', minHeight: '100vh', color: '#fff' }}>
      <div id="custom-cursor-placeholder" style={{ display: 'none' }} />
      <button
        onClick={() => { window.location.hash = '/manufacture'; }}
        style={{
          marginTop: 10,
          marginBottom: 28,
          marginLeft: 0,
          background: 'linear-gradient(90deg, #2196f3 0%, #00eaff 100%)',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          borderRadius: '7px',
          padding: '0.6rem 2.1rem',
          fontSize: '1.05rem',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(33,150,243,0.10)',
          transition: 'transform 0.18s, background 0.2s, color 0.2s',
          display: 'block',
          textAlign: 'left',
          maxWidth: 260
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        &#8592; Back to Dashboard
      </button>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8, color: '#00aaff', textAlign: 'left', letterSpacing: 1 }}>Query Seller</h1>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, color: '#fff', textAlign: 'left', letterSpacing: 0.5 }}>Seller Records</h2>
      <div style={{ overflowX: 'auto', background: '#182040', borderRadius: 12, boxShadow: '0 2px 12px #0002', padding: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#223060', color: '#fff' }}>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #00aaff', textAlign: 'center' }}>Seller Name</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #00aaff', textAlign: 'center' }}>Seller Code</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #00aaff', textAlign: 'center' }}>Brand</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #00aaff', textAlign: 'center' }}>Phone</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #00aaff', textAlign: 'center' }}>Address</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #00aaff', textAlign: 'center' }}>Products Sold</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>No sellers registered yet.</td>
              </tr>
            )}
            {sellers.map((seller) => {
              const products = getProductsForSeller(seller.code);
              return (
                <tr key={seller.code} style={{ borderBottom: '1px solid #223060' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center', verticalAlign: 'middle' }}>{seller.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>{seller.code}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>{seller.brand}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>{seller.phone}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>{seller.address}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {products.length === 0 ? (
                      <span style={{ color: '#aaa' }}>No products sold</span>
                    ) : (
                      <table style={{ width: '100%', background: '#223060', borderRadius: 6, textAlign: 'center' }}>
                        <thead>
                          <tr style={{ color: '#00ffaa', fontSize: '0.95em' }}>
                            <th style={{ padding: '4px 6px', textAlign: 'center' }}>Name</th>
                            <th style={{ padding: '4px 6px', textAlign: 'center' }}>Serial</th>
                            <th style={{ padding: '4px 6px', textAlign: 'center' }}>Brand</th>
                            <th style={{ padding: '4px 6px', textAlign: 'center' }}>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'center' }}>{product.name}</td>
                              <td style={{ padding: '4px 6px', textAlign: 'center' }}>{product.serialNumber}</td>
                              <td style={{ padding: '4px 6px', textAlign: 'center' }}>{product.brand}</td>
                              <td style={{ padding: '4px 6px', textAlign: 'center' }}>{product.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuerySeller;
