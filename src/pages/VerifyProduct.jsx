import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../utils/useWeb3';
import WalletConnect from '../components/WalletConnect';

const STATUS_LABELS = ['Manufactured', 'Sold to Seller', 'In Transit', 'In Stock', 'Sold to Consumer'];

const VerifyProduct = () => {
  const { supplyChain, productRegistry } = useWeb3();

  const [productId, setProductId]       = useState('');
  const [consumerCode, setConsumerCode] = useState('');
  const [error, setError]               = useState('');
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) { cursor = document.createElement('div'); cursor.id = 'custom-cursor'; document.body.appendChild(cursor); }
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!productId.trim() || !consumerCode.trim()) {
      setError('Both Product ID and Consumer Code are required');
      setResult(null); return;
    }
    setError(''); setResult(null); setLoading(true);

    if (!supplyChain || !productRegistry) {
      setError('Contracts not loaded. Check your .env addresses.');
      setLoading(false); return;
    }

    try {
      const [isAuthentic, statusCode] = await supplyChain.verifyProduct(productId.trim(), consumerCode.trim());
      const status = STATUS_LABELS[Number(statusCode)] || 'Unknown';

      let productDetails = null;
      try {
        const prod = await productRegistry.getProduct(productId.trim());
        productDetails = {
          name:  prod.name,
          brand: prod.brand,
          price: (Number(prod.price) / 100).toFixed(2),
          manufacturer: prod.manufacturer,
        };
      } catch {}

      setResult({ isAuthentic, status, product: productDetails });

      // Save to localStorage for consumer dashboard recent verifications
      let verified = [];
      try { verified = JSON.parse(localStorage.getItem('recentVerifiedProducts') || '[]'); } catch {}
      verified.unshift({
        serialNumber: productId.trim(),
        name: productDetails?.name || '-',
        status: isAuthentic ? 'Authentic' : 'Counterfeit',
        verifiedAt: new Date().toISOString(),
      });
      localStorage.setItem('recentVerifiedProducts', JSON.stringify(verified.slice(0, 10)));
    } catch (err) {
      setError(err.reason || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(90deg,#192447 0%,#233a7b 100%)', padding: '2.5rem 0', color: '#fff', fontFamily: 'Inter,Segoe UI,Arial,sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem 1rem' }}>
        <button type="button" onClick={() => { window.location.hash = '/consumer'; }}
          style={{ padding: '0.7rem 2.2rem', background: 'linear-gradient(90deg,#38bdf8 0%,#a78bfa 100%)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
          ← Back
        </button>
        <WalletConnect />
      </div>

      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.2rem', color: '#c084fc' }}>
        Verify Product Authenticity
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '2.5rem' }}>
        Enter the product serial number and your consumer code to verify authenticity on blockchain.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
        {/* Verification form */}
        <div style={{ background: 'rgba(24,28,40,0.38)', borderRadius: '1.2rem', boxShadow: '0 4px 32px rgba(0,0,0,0.18)', padding: '2.5rem 2rem', minWidth: 380, maxWidth: 420, width: '100%' }}>
          <form onSubmit={handleVerify}>
            <label style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff', display: 'block', marginBottom: 8 }}>Product Serial Number</label>
            <input
              type="text"
              placeholder="e.g. SN1234567890"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.7rem', background: '#192447', color: '#cbd5e1', fontSize: '1.1rem', border: 'none', marginBottom: '1.5rem', boxSizing: 'border-box' }}
            />
            <label style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff', display: 'block', marginBottom: 8 }}>Consumer Code</label>
            <input
              type="text"
              placeholder="Consumer Code"
              value={consumerCode}
              onChange={e => setConsumerCode(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.7rem', background: '#192447', color: '#cbd5e1', fontSize: '1.1rem', border: 'none', marginBottom: '1.5rem', boxSizing: 'border-box' }}
            />
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '1.1rem 0', background: loading ? '#334155' : 'linear-gradient(90deg,#a78bfa 0%,#ec4899 100%)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontSize: '1.1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Verifying on Blockchain...' : '🔍 Verify Now'}
            </button>
          </form>

          {error && <div style={{ color: '#f87171', marginTop: 12, fontWeight: 600 }}>{error}</div>}

          {/* Result */}
          {result && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '1rem', background: result.isAuthentic ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `1.5px solid ${result.isAuthentic ? '#22c55e' : '#ef4444'}` }}>
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: 8 }}>
                {result.isAuthentic ? '✅' : '❌'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.3rem', textAlign: 'center', color: result.isAuthentic ? '#22c55e' : '#ef4444' }}>
                {result.isAuthentic ? 'AUTHENTIC PRODUCT' : 'COUNTERFEIT / NOT VERIFIED'}
              </div>
              <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: 6, fontSize: '0.95rem' }}>
                Chain Status: {result.status}
              </div>
              {result.product && (
                <div style={{ marginTop: 12, borderTop: '1px solid #334155', paddingTop: 12 }}>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Name:</strong> {result.product.name}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Brand:</strong> {result.product.brand}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}><strong>Price:</strong> ${result.product.price}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace', marginTop: 4 }}>Manufacturer: {result.product.manufacturer}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR placeholder panel */}
        <div style={{ background: 'rgba(24,28,40,0.38)', borderRadius: '1.2rem', boxShadow: '0 4px 32px rgba(0,0,0,0.18)', padding: '2.5rem 2rem', minWidth: 380, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '1.2rem' }}>🧾 Scan QR Code</label>
          <div style={{ width: '100%', height: 220, borderRadius: '1rem', border: '2px dashed #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#192447', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '3rem', color: '#334155' }}>🟦🟦<br />🟦🟦</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '1rem', textAlign: 'center' }}>
            QR scanning coming soon. Use the form on the left to verify manually.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyProduct;
