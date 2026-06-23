import React, { useState, useEffect } from "react";

const ProductHistoryConsumer = () => {
  const [consumerCode, setConsumerCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetProduct = async () => {
    setLoading(true);
    setError("");
    setProduct(null);
    setTimeout(() => {
      if (!consumerCode) {
        setProduct(null);
        setError("Please enter a consumer code.");
        setLoading(false);
        return;
      }
      // Fetch products from localStorage
      const products = JSON.parse(localStorage.getItem('registeredProducts') || '[]');
      const found = products.find(p => p.consumerCode === consumerCode);
      if (found) {
        setProduct({
          photo: (found.pictures && found.pictures.length > 0) ? found.pictures[0] : "https://via.placeholder.com/150",
          name: found.name || "No name",
          brand: found.brand || "No brand",
          desc: found.description || "No description available.",
          authenticity: found.status === 'Sold' ? 'Authentic' : 'Counterfeit',
        });
        setError("");
      } else {
        setProduct({
          photo: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Fake",
          name: "Unknown",
          brand: "Unknown",
          desc: "This product is suspected to be counterfeit or not found.",
          authenticity: "Counterfeit",
        });
        setError("");
      }
      setLoading(false);
    }, 700);
  };

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
    <div className="phc-container" style={{ background: 'linear-gradient(120deg, #0b0d23 60%, #1e293b 100%)', position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <button
        type="button"
        style={{
          position: 'absolute',
          left: '2rem',
          top: '2rem',
          padding: '0.7rem 2.2rem',
          background: 'linear-gradient(120deg, #0b0d23 60%, #1e293b 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.7rem',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 2px 12px rgba(33,34,59,0.13)',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'background 0.2s, color 0.2s, transform 0.18s',
        }}
        onClick={() => { window.location.hash = '/consumer'; }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ← Back to Dashboard
      </button>
      <div id="custom-cursor" aria-hidden="true"></div>
      <div style={{width: '100%', maxWidth: 480, marginTop: 32}}>
        <h1 className="phc-heading" style={{textAlign: 'center', marginLeft: 0,marginTop: '5rem'}}>Product History</h1>
        <label className="phc-label" style={{marginLeft: 0}}>Consumer Code</label>
        <input
          type="text"
          className="phc-input"
          style={{marginLeft: 0}}
          value={consumerCode}
          onChange={e => setConsumerCode(e.target.value)}
          placeholder="Enter consumer code"
        />
        <button
          className="phc-btn"
          style={{marginLeft: 0, display: 'block', marginRight: 'auto'}} 
          onClick={handleGetProduct}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Product"}
        </button>
        {error && <div className="phc-error" style={{marginLeft: 0}}>{error}</div>}
        {product && (
          <div className="phc-card" style={{marginLeft: 0}}>
            <img src={product.photo} alt="Product" />
            <div style={{fontWeight:600, fontSize:'1.1rem', marginBottom:2}}>{product.name}</div>
            <div style={{color:'#64748b', fontSize:'0.98rem', marginBottom:6}}>{product.brand}</div>
            <div className="phc-card-desc">{product.desc}</div>
            <div className={`phc-auth${product.authenticity === "Counterfeit" ? " counterfeit" : ""}`}>
              {product.authenticity}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHistoryConsumer;
