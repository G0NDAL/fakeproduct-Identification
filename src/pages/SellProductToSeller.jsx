import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { generateInvoicePDF } from '../utils/invoice';
import { useWeb3 } from '../utils/useWeb3';
import WalletConnect from '../components/WalletConnect';

const SellProductToSeller = () => {
  const { supplyChain, productRegistry, sellerRegistry, account, isCorrectNetwork } = useWeb3();

  const [serialNumber, setSerialNumber]   = useState('');
  const [sellerCode, setSellerCode]       = useState('');
  const [scannedQrImage, setScannedQrImage] = useState(null);
  const [showScanner, setShowScanner]     = useState(false);
  const [error, setError]                 = useState('');
  const [txStatus, setTxStatus]           = useState('');
  const [txHash, setTxHash]               = useState('');

  const scannerRef   = useRef(null);
  const html5QrRef   = useRef(null);
  const fileInputRef = useRef(null);
  const audioCtxRef  = useRef(null);

  useEffect(() => {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) { cursor = document.createElement('div'); cursor.id = 'custom-cursor'; document.body.appendChild(cursor); }
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const beep = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(1040, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); setTimeout(() => { osc.stop(); osc.disconnect(); gain.disconnect(); }, 300);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const tmp = new Html5Qrcode('temp-upload-qr-div');
    try {
      const result = await tmp.scanFile(file, true);
      let serial = result;
      try { const p = JSON.parse(result); if (p?.serialNumber) serial = p.serialNumber; } catch {}
      setSerialNumber(serial); setScannedQrImage(URL.createObjectURL(file)); beep();
    } catch { alert('Could not decode QR code from image.'); }
    tmp.clear();
  };

  useEffect(() => {
    if (showScanner && scannerRef.current) {
      if (!html5QrRef.current) html5QrRef.current = new Html5Qrcode(scannerRef.current.id);
      html5QrRef.current.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 },
        (decoded) => {
          let serial = decoded;
          try { const p = JSON.parse(decoded); if (p?.serialNumber) serial = p.serialNumber; } catch {}
          setSerialNumber(serial); setShowScanner(false); beep();
          html5QrRef.current?.stop();
        }, () => {}
      );
    }
    return () => { if (html5QrRef.current) { html5QrRef.current.stop().catch(() => {}); html5QrRef.current = null; } };
  }, [showScanner]);

  const handleSell = async (e) => {
    e.preventDefault();
    setError('');
    if (!serialNumber || !sellerCode) { setError('Both fields are required'); return; }
    if (!account)          { setError('Please connect your wallet first.'); return; }
    if (!isCorrectNetwork) { setError('Please switch to Sepolia network.'); return; }
    if (!supplyChain)      { setError('Contracts not loaded. Check your .env addresses.'); return; }

    setTxStatus('pending');
    try {
      // Verify product and seller exist on-chain before sending tx
      const pExists = await productRegistry.productExists(serialNumber);
      if (!pExists) { setError('Product not found on blockchain. Register it first.'); setTxStatus(''); return; }
      const sExists = await sellerRegistry.sellerExists(sellerCode);
      if (!sExists) { setError('Seller not found on blockchain. Add the seller first.'); setTxStatus(''); return; }

      const tx = await supplyChain.sellToSeller(serialNumber, sellerCode);
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('success');

      // Fetch product info for invoice
      const product  = await productRegistry.getProduct(serialNumber);
      const seller   = await sellerRegistry.getSeller(sellerCode);
      generateInvoicePDF(
        { serialNumber, name: product.name, description: product.description, brand: product.brand },
        { name: seller.name, code: sellerCode, phone: seller.phone, address: seller.sellerAddress }
      );
      setSerialNumber(''); setSellerCode('');
    } catch (err) {
      console.error(err);
      setTxStatus('error');
      setError(err.reason || err.message || 'Transaction failed');
    }
  };

  return (
    <div className="sell-product-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => { window.location.hash = '/manufacture'; }}
          style={{ background: 'linear-gradient(90deg,#2196f3 0%,#00eaff 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 7, padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
          ← Back
        </button>
        <WalletConnect />
      </div>

      <h2 className="sell-product-title">Sell Product to Seller</h2>

      {/* QR Scanner */}
      <div className="qr-scanner-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="qr-camera-box" style={{ position: 'relative', minHeight: 240, width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: scannedQrImage ? `url(${scannedQrImage}) center/cover no-repeat` : '#101830', border: '2px solid #00aaff', borderRadius: 16 }}>
          {showScanner ? (
            <>
              <div ref={scannerRef} id="qr-html5-scanner" style={{ width: 240, height: 180, margin: '0 auto', zIndex: 2 }} />
              <button type="button" style={{ position: 'absolute', top: 10, right: 10, background: '#101830cc', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', zIndex: 3 }}
                onClick={() => { setShowScanner(false); html5QrRef.current?.stop().catch(() => {}); html5QrRef.current = null; }}>Close</button>
            </>
          ) : !scannedQrImage ? (
            <span style={{ color: '#00aaff', fontWeight: 600, fontSize: '1.1rem', zIndex: 2 }}>Scan or Upload QR Code</span>
          ) : null}
          <div style={{ display: 'flex', gap: 10, position: 'absolute', bottom: 16, left: 0, right: 0, justifyContent: 'center', zIndex: 4 }}>
            <button type="button" style={{ width: 110, height: 40, background: '#101830cc', border: '2px solid #00aaff', color: '#00aaff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowScanner(true)} disabled={showScanner}>Camera Scanner</button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <button type="button" style={{ width: 110, height: 40, background: '#101830cc', border: '2px solid #00aaff', color: '#00aaff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>Upload QR</button>
          </div>
          <div id="temp-upload-qr-div" style={{ display: 'none' }} />
        </div>
      </div>

      <form className="sell-product-form" onSubmit={handleSell}>
        <input type="text" placeholder="Product Serial Number" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} />
        <input type="text" placeholder="Seller Code" value={sellerCode} onChange={e => setSellerCode(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={txStatus === 'pending'} style={{ opacity: txStatus === 'pending' ? 0.6 : 1, cursor: txStatus === 'pending' ? 'not-allowed' : 'pointer' }}>
          {txStatus === 'pending' ? '⏳ Confirming on Blockchain...' : 'Sell Product & Download Invoice'}
        </button>
      </form>

      {txStatus === 'success' && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', borderRadius: 8, color: '#22c55e', textAlign: 'center' }}>
          ✅ Sale recorded on blockchain! Invoice downloaded.
          {txHash && <div style={{ marginTop: 6, fontSize: '0.85rem' }}><a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>View on Etherscan ↗</a></div>}
        </div>
      )}
    </div>
  );
};

export default SellProductToSeller;
