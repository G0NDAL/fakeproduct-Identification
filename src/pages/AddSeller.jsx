import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../utils/useWeb3';
import WalletConnect from '../components/WalletConnect';

const AddSeller = () => {
  const { sellerRegistry, account, isCorrectNetwork } = useWeb3();

  const [form, setForm] = useState({ name: '', code: '', brand: '', phone: '', address: '' });
  const [errors, setErrors]     = useState({});
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash]     = useState('');

  useEffect(() => {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) { cursor = document.createElement('div'); cursor.id = 'custom-cursor'; document.body.appendChild(cursor); }
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name)    e.name    = 'Seller name is required';
    if (!form.code)    e.code    = 'Seller code is required';
    if (!form.brand)   e.brand   = 'Seller brand is required';
    if (!form.phone || !/^\d{10,15}$/.test(form.phone)) e.phone = 'Valid phone number is required';
    if (!form.address) e.address = 'Seller address is required';
    return e;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (!account)          { setErrors({ submit: 'Please connect your wallet first.' }); return; }
    if (!isCorrectNetwork) { setErrors({ submit: 'Please switch to Sepolia network.' }); return; }
    if (!sellerRegistry)   { setErrors({ submit: 'Contracts not loaded. Check your .env addresses.' }); return; }

    setTxStatus('pending');
    setTxHash('');
    try {
      const tx = await sellerRegistry.registerSeller(
        form.code.trim(),
        form.name.trim(),
        form.brand.trim(),
        form.phone.trim(),
        form.address.trim()
      );
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('success');
      setForm({ name: '', code: '', brand: '', phone: '', address: '' });
    } catch (err) {
      console.error(err);
      setTxStatus('error');
      setErrors({ submit: err.reason || err.message || 'Transaction failed' });
    }
  };

  return (
    <div className="add-seller-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={() => { window.location.hash = '/manufacture'; }}
          style={{ background: 'linear-gradient(90deg,#2196f3 0%,#00eaff 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 7, padding: '0.5rem 1.5rem', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <WalletConnect />
      </div>

      <h2 className="add-seller-title">Add Seller</h2>

      <form className="add-seller-form" onSubmit={handleSubmit}>
        <div>
          <label>Seller Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Doe" />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        <div>
          <label>Seller Code</label>
          <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="e.g. S123456" autoComplete="off" />
          {errors.code && <div className="error">{errors.code}</div>}
        </div>
        <div>
          <label>Seller Brand</label>
          <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Nike" />
          {errors.brand && <div className="error">{errors.brand}</div>}
        </div>
        <div>
          <label>Seller Phone Number</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
          {errors.phone && <div className="error">{errors.phone}</div>}
        </div>
        <div>
          <label>Seller Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="e.g. 123 Main St, City" />
          {errors.address && <div className="error">{errors.address}</div>}
        </div>

        {errors.submit && <div className="error" style={{ textAlign: 'center' }}>{errors.submit}</div>}

        <button
          type="submit"
          disabled={txStatus === 'pending'}
          style={{ opacity: txStatus === 'pending' ? 0.6 : 1, cursor: txStatus === 'pending' ? 'not-allowed' : 'pointer' }}
        >
          {txStatus === 'pending' ? '⏳ Confirming on Blockchain...' : 'Add Seller'}
        </button>
      </form>

      {txStatus === 'success' && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', borderRadius: 8, color: '#22c55e', textAlign: 'center' }}>
          ✅ Seller registered on blockchain!
          {txHash && (
            <div style={{ marginTop: 6, fontSize: '0.85rem' }}>
              <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                View on Etherscan ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddSeller;
