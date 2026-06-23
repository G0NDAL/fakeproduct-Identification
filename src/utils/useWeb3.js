import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

import ProductRegistryABI from '../contracts/ProductRegistry.json';
import SellerRegistryABI  from '../contracts/SellerRegistry.json';
import SupplyChainABI     from '../contracts/SupplyChain.json';

const PRODUCT_REGISTRY_ADDRESS = import.meta.env.VITE_PRODUCT_REGISTRY_ADDRESS;
const SELLER_REGISTRY_ADDRESS  = import.meta.env.VITE_SELLER_REGISTRY_ADDRESS;
const SUPPLY_CHAIN_ADDRESS     = import.meta.env.VITE_SUPPLY_CHAIN_ADDRESS;
const REQUIRED_CHAIN_ID        = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');

// Status enum matching the Solidity contract
export const ProductStatus = {
  0: 'Manufactured',
  1: 'Sold to Seller',
  2: 'In Transit',
  3: 'In Stock',
  4: 'Sold to Consumer',
};

export function useWeb3() {
  const [account, setAccount]       = useState(null);
  const [provider, setProvider]     = useState(null);
  const [signer, setSigner]         = useState(null);
  const [chainId, setChainId]       = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]           = useState(null);

  // Contract instances (read-only via provider, write via signer)
  const [productRegistry, setProductRegistry] = useState(null);
  const [sellerRegistry, setSellerRegistry]   = useState(null);
  const [supplyChain, setSupplyChain]         = useState(null);

  const isCorrectNetwork = chainId === REQUIRED_CHAIN_ID;

  // Build contract instances
  const buildContracts = useCallback((signerOrProvider) => {
    setProductRegistry(new ethers.Contract(PRODUCT_REGISTRY_ADDRESS, ProductRegistryABI, signerOrProvider));
    setSellerRegistry(new ethers.Contract(SELLER_REGISTRY_ADDRESS,   SellerRegistryABI,  signerOrProvider));
    setSupplyChain(new ethers.Contract(SUPPLY_CHAIN_ADDRESS,         SupplyChainABI,     signerOrProvider));
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install it from metamask.io');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = await web3Provider.getSigner();
      const address    = await web3Signer.getAddress();
      const network    = await web3Provider.getNetwork();
      const cId        = Number(network.chainId);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);
      setChainId(cId);
      buildContracts(web3Signer);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [buildContracts]);

  // Switch to Sepolia
  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });
    } catch (err) {
      setError('Please switch to Sepolia network in MetaMask');
    }
  }, []);

  // Disconnect (clears state)
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setProductRegistry(null);
    setSellerRegistry(null);
    setSupplyChain(null);
  }, []);

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        connectWallet();
      }
    };

    const onChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener('chainChanged', onChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  // Auto-reconnect if already connected
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts.length > 0) connectWallet();
    });
  }, [connectWallet]);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    error,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    productRegistry,
    sellerRegistry,
    supplyChain,
  };
}
