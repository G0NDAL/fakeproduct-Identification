
import React, { useEffect, useState } from "react";
import LandingPage from "./pages/landingpage.jsx";
import ManufacturePage from "./pages/manufacture.jsx";
import SellerPage from "./pages/seller.jsx";
import ConsumerPage from "./pages/consumer.jsx";
import RegisterProduct from "./pages/RegisterProduct.jsx";
import AddSeller from "./pages/AddSeller.jsx";
import SellProductToSeller from "./pages/SellProductToSeller.jsx";
import QuerySeller from "./pages/QuerySeller.jsx";
import SellProductToConsumer from "./pages/SellProductToConsumer.jsx";
import UpdateSupplyChain from "./pages/UpdateSupplyChain.jsx";
import ProductHistory from "./pages/ProductHistory.jsx";
import VerifyProduct from "./pages/VerifyProduct.jsx";
import ProductHistoryConsumer from "./pages/ProductHistoryConsumer.jsx";
import ProfileDropdown from "./components/ProfileDropdown.jsx";


function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem('user');
}

// Define which routes are accessible by which roles
const allowedRoutes = {
  manufacturer: [
    '/',
    '/manufacture',
    '/register-product',
    '/add-seller',
    '/sell-product-to-seller',
    '/query-seller',
  ],
  seller: [
    '/',
    '/seller',
    '/sell-product-to-consumer',
    '/product-history',
    '/update-supply-chain',
  ],
  consumer: [
    '/',
    '/consumer',
    '/verify-product',
    '/product-history-consumer',
  ],
  admin: [
    '/',
    '/manufacture',
    '/register-product',
    '/add-seller',
    '/sell-product-to-seller',
    '/query-seller',
    '/update-supply-chain',
    '/product-history',
    '/seller',
    '/sell-product-to-consumer',
    '/verify-product',
    '/product-history-consumer',
    '/consumer',
  ],
};



function App() {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/');
  const [user, setUserState] = useState(getUser());

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    // Listen for login/logout from other tabs
    const onStorage = () => setUserState(getUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Role-based route protection
  if (user) {
    let role = user.user_role;
    if (typeof role === 'string') role = role.trim().toLowerCase();
    // If admin, always use 'admin' key for allowedRoutes
    const allowed = allowedRoutes[role] || ['/'];
    if (!allowed.includes(route)) {
      window.location.hash = '/';
      return null;
    }
  }

  // Pass user and setUserState to pages that need them
  const commonProps = { user, setUserState };

  if (route === '/manufacture') return <ManufacturePage {...commonProps} />;
  if (route === '/seller') return <SellerPage {...commonProps} />;
  if (route === '/consumer') return <ConsumerPage {...commonProps} />;
  if (route === '/register-product') return <RegisterProduct {...commonProps} />;
  if (route === '/add-seller') return <AddSeller {...commonProps} />;
  if (route === '/sell-product-to-seller') return <SellProductToSeller {...commonProps} />;
  if (route === '/query-seller') return <QuerySeller {...commonProps} />;
  if (route === '/sell-product-to-consumer') return <SellProductToConsumer {...commonProps} />;
  if (route === '/update-supply-chain') return <UpdateSupplyChain {...commonProps} />;
  if (route === '/product-history') return <ProductHistory {...commonProps} />;
  if (route === '/verify-product') return <VerifyProduct {...commonProps} />;
  if (route === '/product-history-consumer') return <ProductHistoryConsumer {...commonProps} />;
  // Landing page
  return <LandingPage {...commonProps} />;
}

export default App;
