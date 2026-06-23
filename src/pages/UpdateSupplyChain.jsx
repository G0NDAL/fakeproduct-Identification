import React, { useState } from 'react';
import { useWeb3 } from '../utils/useWeb3';
import WalletConnect from '../components/WalletConnect';

// Matches SupplyChain.sol ProductStatus enum
const STATUS_OPTIONS = [
  { label: 'In Transit', value: 2 },
  { label: 'In Stock',   value: 3 },
];

const UpdateSupplyChain = () => {
  const { supplyChain, account, isCorrectNetwork } = useWeb3();

  const [sellerCode, setSellerCode]     = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [productInfo, setProductInfo]   = useState(null);
  const [fetchError, setFetchError]     = useState('');
  const [isFetching, setIsFetching]     = useState(false);

  const [newStatus, setNewStatus]   = useState(2);
  const [location, setLocation]     = useState('');
  const [notes, setNotes]           = useState('');
  const [txStatus, setTxStatus]     = useState('');
  const [txHash, setTxHash]         = useState('');
  const [submitError, setSubmitError] = useState('');

  React.useEffect(() => {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) { cursor = document.createElement('div'); cursor.id = 'custom-cursor'; document.body.appendChild(cursor); }
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!sellerCode.trim() || !serialNumber.trim()) return;
    setFetchError(''); setProductInfo(null); setIsFetching(true);

    if (!supplyChain) { setFetchError('Contracts not loaded. Check your .env addresses.'); setIsFetching(false); return; }

    try {
      const state = await supplyChain.getProductState(serialNumber.trim());
      if (!state.exists) { setFetchError('Product not found on blockchain.'); setIsFetching(false); return; }
      if (state.currentSellerCode !== sellerCode.trim()) { setFetchError('Seller code does not match the current owner of this product.'); setIsFetching(false); return; }

      const statusMap = ['Manufactured', 'Sold to Seller', 'In Transit', 'In Stock', 'Sold to Consumer'];
      setProductInfo({
        serialNumber: serialNumber.trim(),
        sellerCode: state.currentSellerCode,
        currentStatus: statusMap[state.currentStatus] || 'Unknown',
        statusCode: Number(state.currentStatus),
      });
    } catch (err) {
      setFetchError(err.reason || err.message || 'Failed to fetch product state');
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitError(''); setTxStatus('');
    if (!location.trim()) { setSubmitError('Location is required'); return; }
    if (!account)          { setSubmitError('Please connect your wallet first.'); return; }
    if (!isCorrectNetwork) { setSubmitError('Please switch to Sepolia network.'); return; }
    if (!supplyChain)      { setSubmitError('Contracts not loaded.'); return; }

    setTxStatus('pending');
    try {
      const tx = await supplyChain.updateSupplyChain(
        productInfo.serialNumber,
        productInfo.sellerCode,
        newStatus,
        location.trim(),
        notes.trim()
      );
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('success');
      const statusMap = ['Manufactured', 'Sold to Seller', 'In Transit', 'In Stock', 'Sold to Consumer'];
      setProductInfo(prev => ({ ...prev, currentStatus: statusMap[newStatus], statusCode: newStatus }));
    } catch (err) {
      console.error(err);
      setTxStatus('error');
      setSubmitError(err.reason || err.message || 'Transaction failed');
    }
  };

  return (
    <div className="update-supplychain-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem 0' }}>
        <button type="button" onClick={() => { window.location.hash = '/seller'; }}
          style={{ background: 'linear-gradient(90deg,#0f172a 0%,#334155 100%)', color: '#fff', border: 'none', borderRadius: 7, padding: '0.6rem 1.8rem', fontWeight: 700, cursor: 'pointer' }}>
          ← Back
        </button>
        <WalletConnect />
      </div>

      <h1 className="update-supplychain-title">Update Supply Chain</h1>
      <p className="update-supplychain-desc">Record product movement and update status on blockchain</p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="update-supplychain-form" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Seller Code" value={sellerCode} onChange={e => setSellerCode(e.target.value)} style={{ flex: '1 1 200px' }} />
        <input type="text" placeholder="Product Serial Number" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} style={{ flex: '1 1 200px' }} />
        <button type="submit" style={{ flex: '0 0 140px' }} disabled={isFetching}>
          {isFetching ? 'Searching...' : 'Verify Now'}
        </button>
      </form>

      {fetchError && <div style={{ color: '#f87171', margin: '8px 2rem', fontWeight: 600 }}>{fetchError}</div>}

      {productInfo && (
        <>
          {/* Product info card */}
          <div className="update-supplychain-product-card">
            <h2>Product Information</h2>
            <div className="update-supplychain-product-grid">
              <div>
                <div className="update-supplychain-label">Product Serial Number</div>
                <div className="update-supplychain-link">{productInfo.serialNumber}</div>
                <div className="update-supplychain-label" style={{ marginTop: '1rem' }}>Current Status</div>
                <span className="update-supplychain-status">{productInfo.currentStatus}</span>
              </div>
              <div>
                <div className="update-supplychain-label">Seller Code</div>
                <div className="update-supplychain-value">{productInfo.sellerCode}</div>
              </div>
            </div>
          </div>

          {/* Update form */}
          <div className="update-supplychain-product-card" style={{ marginTop: 24 }}>
            <h2>Update Product Status</h2>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="update-supplychain-label">New Status *</label><br />
                <select value={newStatus} onChange={e => setNewStatus(Number(e.target.value))} required
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.7rem', background: '#0f172a', color: '#f1f5f9', fontSize: '1.1rem', border: 'none', marginTop: '0.5rem' }}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="update-supplychain-label">Current Location *</label><br />
                <input value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Your Store, City, Country"
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.7rem', background: '#0f172a', color: '#f1f5f9', fontSize: '1.1rem', border: 'none', marginTop: '0.5rem' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="update-supplychain-label">Additional Notes</label><br />
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional information..."
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.7rem', background: '#0f172a', color: '#f1f5f9', fontSize: '1.1rem', border: 'none', marginTop: '0.5rem', minHeight: 100 }} />
              </div>

              {submitError && <div style={{ color: '#f87171', marginBottom: 12, fontWeight: 600 }}>{submitError}</div>}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={txStatus === 'pending'}
                  style={{ flex: 1, padding: '1.1rem 0', background: txStatus === 'pending' ? '#334155' : 'linear-gradient(90deg,#06b6d4 0%,#3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontSize: '1.1rem', fontWeight: 600, cursor: txStatus === 'pending' ? 'not-allowed' : 'pointer' }}>
                  {txStatus === 'pending' ? '⏳ Confirming on Blockchain...' : '⭳ Update Supply Chain'}
                </button>
                <button type="button" onClick={() => setProductInfo(null)}
                  style={{ flex: '0 0 120px', padding: '1.1rem 0', background: '#334155', color: '#fff', border: 'none', borderRadius: '0.7rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>

            {txStatus === 'success' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', borderRadius: 8, color: '#22c55e', textAlign: 'center' }}>
                ✅ Supply chain updated on blockchain!
                {txHash && <div style={{ marginTop: 6, fontSize: '0.85rem' }}><a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>View on Etherscan ↗</a></div>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateSupplyChain;
