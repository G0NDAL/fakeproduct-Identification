import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../utils/useWeb3';
import WalletConnect from '../components/WalletConnect';

const STATUS_LABELS = ['Manufactured', 'Sold to Seller', 'In Transit', 'In Stock', 'Sold to Consumer'];

// Still exported so SellProductToConsumer can call it (kept for invoice compatibility)
export function getProductHistory() { return []; }

const ProductHistory = () => {
  const { supplyChain, productRegistry } = useWeb3();

  const [serial, setSerial]     = useState('');
  const [error, setError]       = useState('');
  const [timeline, setTimeline] = useState(null);
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!serial.trim()) { setError('Product serial number is required'); return; }
    setError(''); setTimeline(null); setProduct(null); setLoading(true);

    if (!supplyChain || !productRegistry) {
      setError('Contracts not loaded. Check your .env addresses.');
      setLoading(false); return;
    }

    try {
      // Fetch product details
      const exists = await productRegistry.productExists(serial.trim());
      if (!exists) { setError('Product not found on blockchain.'); setLoading(false); return; }

      const prod    = await productRegistry.getProduct(serial.trim());
      const history = await supplyChain.getProductHistory(serial.trim());

      setProduct({
        name:  prod.name,
        brand: prod.brand,
        price: (Number(prod.price) / 100).toFixed(2),
        manufacturer: prod.manufacturer,
        registeredAt: new Date(Number(prod.registeredAt) * 1000).toLocaleString(),
      });

      if (history.length === 0) {
        // Product registered but no supply chain events yet
        setTimeline([{
          status:   'Manufactured',
          location: prod.brand,
          notes:    'Product registered on blockchain.',
          date:     new Date(Number(prod.registeredAt) * 1000).toLocaleString(),
          actor:    prod.manufacturer,
        }]);
      } else {
        setTimeline(history.map(h => ({
          status:   STATUS_LABELS[Number(h.status)] || 'Unknown',
          location: h.location,
          notes:    h.notes,
          date:     new Date(Number(h.timestamp) * 1000).toLocaleString(),
          actor:    h.actor,
        })));
      }
    } catch (err) {
      setError(err.reason || err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-supplychain-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem 0' }}>
        <button type="button" onClick={() => { window.location.hash = '/seller'; }}
          style={{ background: 'linear-gradient(90deg,#192447 0%,#233a7b 100%)', color: '#fff', border: 'none', borderRadius: 7, padding: '0.6rem 1.8rem', fontWeight: 700, cursor: 'pointer' }}>
          ← Back
        </button>
        <WalletConnect />
      </div>

      <div id="custom-cursor" aria-hidden="true"></div>
      <h1 className="update-supplychain-title">Product History</h1>

      <form onSubmit={handleSearch} className="update-supplychain-form" style={{ marginTop: 32 }}>
        <input type="text" placeholder="Enter Product Serial Number" value={serial} onChange={e => setSerial(e.target.value)} />
        <button type="submit" disabled={loading}>
          {loading ? 'Fetching...' : (
            <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.4em', height: '1.4em', verticalAlign: 'middle' }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg> Search</>
          )}
        </button>
      </form>

      {error && <div style={{ color: '#f87171', margin: '8px 2rem', fontWeight: 600 }}>{error}</div>}

      {product && (
        <div className="update-supplychain-product-card" style={{ marginTop: 16 }}>
          <h2>{product.name} <span style={{ color: '#94a3b8', fontSize: '1rem' }}>({product.brand})</span></h2>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 4 }}>
            Price: ${product.price} &nbsp;|&nbsp; Registered: {product.registeredAt}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4, fontFamily: 'monospace' }}>
            Manufacturer: {product.manufacturer}
          </div>
        </div>
      )}

      {timeline && (
        <div className="update-supplychain-product-card" style={{ marginTop: 16, position: 'relative', paddingLeft: 32 }}>
          <h2>Product Timeline</h2>
          <ul style={{ listStyle: 'none', padding: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 8, top: '2.2rem', bottom: '2.2rem', width: 3, background: '#22d3ee', opacity: 0.25 }} />
            {timeline.map((event, idx) => (
              <li key={idx} style={{ marginBottom: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: 18, height: 18, borderRadius: '50%', background: '#22d3ee', opacity: 0.8, border: '2px solid #fff' }} />
                <div style={{ marginLeft: 32 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#22d3ee' }}>{event.status}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '1rem' }}>{event.location}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{event.date}</div>
                  {event.notes && <div style={{ color: '#38bdf8', fontSize: '0.9rem', marginTop: 2 }}>{event.notes}</div>}
                  {event.actor && <div style={{ color: '#475569', fontSize: '0.78rem', fontFamily: 'monospace', marginTop: 2 }}>by: {event.actor}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductHistory;
