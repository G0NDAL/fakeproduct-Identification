import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ethers } from 'ethers';
import { useWeb3 } from '../utils/useWeb3';
import WalletConnect from '../components/WalletConnect';

const RegisterProduct = () => {
  const { productRegistry, account, isCorrectNetwork } = useWeb3();

  const [form, setForm] = useState({
    name: '', serialNumber: '', price: '', description: '', brand: '', pictures: [],
  });
  const [errors, setErrors]   = useState({});
  const [previews, setPreviews] = useState([]);
  const [qrData, setQrData]   = useState(null);
  const [txStatus, setTxStatus] = useState(''); // '', 'pending', 'success', 'error'
  const [txHash, setTxHash]   = useState('');

  // Custom cursor
  useEffect(() => {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) { cursor = document.createElement('div'); cursor.id = 'custom-cursor'; document.body.appendChild(cursor); }
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mousemove', move); };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name)         e.name         = 'Product name is required';
    if (!form.serialNumber) e.serialNumber = 'Serial number is required';
    if (!form.price || isNaN(form.price)) e.price = 'Valid price is required';
    if (!form.description)  e.description  = 'Description is required';
    if (!form.brand)        e.brand        = 'Brand is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'picture') {
      const arr = Array.from(files);
      setForm({ ...form, pictures: arr });
      setPreviews(arr.map(f => URL.createObjectURL(f)));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (!account) { setErrors({ submit: 'Please connect your wallet first.' }); return; }
    if (!isCorrectNetwork) { setErrors({ submit: 'Please switch to Sepolia network.' }); return; }
    if (!productRegistry)  { setErrors({ submit: 'Contracts not loaded. Check your .env addresses.' }); return; }

    setTxStatus('pending');
    setTxHash('');
    try {
      // Price stored as wei-equivalent (multiply by 100 to keep 2 decimal places as integer)
      const priceInt = Math.round(parseFloat(form.price) * 100);
      const tx = await productRegistry.registerProduct(
        form.serialNumber,
        form.name,
        form.brand,
        form.description,
        priceInt
      );
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('success');
      setQrData(JSON.stringify({ serialNumber: form.serialNumber, name: form.name }));

      // Also save to localStorage for QR display / invoice use
      const products = JSON.parse(localStorage.getItem('registeredProducts') || '[]');
      products.push({
        serialNumber: form.serialNumber,
        name: form.name,
        description: form.description,
        brand: form.brand,
        price: form.price,
        registeredDate: new Date().toISOString(),
        txHash: tx.hash,
      });
      localStorage.setItem('registeredProducts', JSON.stringify(products));
    } catch (err) {
      console.error(err);
      setTxStatus('error');
      setErrors({ submit: err.reason || err.message || 'Transaction failed' });
    }
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qr-svg-wrapper svg');
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `qr-${form.serialNumber}.png`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
  };

  return (
    <div className="register-product-container">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={() => { window.location.hash = '/manufacture'; }}
          style={{ background: 'linear-gradient(90deg,#2196f3 0%,#00eaff 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 7, padding: '0.5rem 1.5rem', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <WalletConnect />
      </div>

      <h2 className="register-product-title" style={{ textAlign: 'center', background: 'linear-gradient(90deg,#2196f3 0%,#00eaff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Register Product
      </h2>

      <form className="register-product-form" onSubmit={handleSubmit}>
        <div>
          <label>Product Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Nike Air Max 2024" />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        <div>
          <label>Product Serial Number</label>
          <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="e.g. SN1234567890" />
          {errors.serialNumber && <div className="error">{errors.serialNumber}</div>}
        </div>
        <div>
          <label>Product Price</label>
          <input type="text" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 199.99" />
          {errors.price && <div className="error">{errors.price}</div>}
        </div>
        <div>
          <label>Product Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the product..." />
          {errors.description && <div className="error">{errors.description}</div>}
        </div>
        <div>
          <label>Product Brand</label>
          <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Nike" />
          {errors.brand && <div className="error">{errors.brand}</div>}
        </div>
        <div>
          <label>Product Pictures (optional)</label>
          <input type="file" name="picture" accept="image/*" multiple onChange={handleChange} />
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {previews.map((src, i) => <img key={i} src={src} alt="" style={{ maxWidth: 70, maxHeight: 70, borderRadius: 6 }} />)}
            </div>
          )}
        </div>

        {errors.submit && <div className="error" style={{ textAlign: 'center' }}>{errors.submit}</div>}

        <button
          type="submit"
          disabled={txStatus === 'pending'}
          style={{ display: 'block', margin: '0 auto', background: txStatus === 'pending' ? '#334155' : 'linear-gradient(90deg,#2196f3 0%,#00eaff 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 7, padding: '0.8rem 2.5rem', fontSize: '1.1rem', cursor: txStatus === 'pending' ? 'not-allowed' : 'pointer' }}
        >
          {txStatus === 'pending' ? '⏳ Confirming on Blockchain...' : 'Register Product'}
        </button>
      </form>

      {/* TX status */}
      {txStatus === 'success' && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', borderRadius: 8, color: '#22c55e', textAlign: 'center' }}>
          ✅ Product registered on blockchain!
          {txHash && (
            <div style={{ marginTop: 6, fontSize: '0.85rem' }}>
              <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                View on Etherscan ↗
              </a>
            </div>
          )}
        </div>
      )}

      {/* QR Code */}
      {qrData && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div id="qr-svg-wrapper">
            <QRCodeSVG value={qrData} size={180} />
          </div>
          <button onClick={downloadQR} style={{ marginTop: 12, padding: '8px 20px', background: '#00aaff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterProduct;
