"use client";

import { useState, useEffect } from 'react';

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

interface Networks {
  [key: string]: NetworkConfig;
}

const networks: Networks = {
  "Ethereum Sepolia": {
    chainId: "0xaa36a7", // 11155111
    chainName: "Sepolia Testnet",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  "Linea Sepolia": {
    chainId: "0xe705", // 59141
    chainName: "Linea Sepolia Testnet",
    nativeCurrency: {
      name: "Linea Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://rpc.sepolia.linea.build"],
    blockExplorerUrls: ["https://sepolia.lineascan.build"]
  }
};

const Navbar = () => {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [currentNetwork, setCurrentNetwork] = useState<string>("");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    checkWalletConnection();
    checkNetwork();
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if navbar should be visible
      if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }
      
      // Set scrolled state for styling
      setIsScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [lastScrollY]);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentNetwork(
        chainId === "0xaa36a7" ? "Ethereum Sepolia" :
        chainId === "0xe705" ? "Linea Sepolia" :
        "Unsupported Network"
      );
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setCurrentAccount("");
    } else {
      setCurrentAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount("");
  };

  const switchNetwork = async (networkName: string) => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networks[networkName].chainId }],
      });
      setCurrentNetwork(networkName);
      setShowNetworkDropdown(false);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networks[networkName]],
          });
          setCurrentNetwork(networkName);
          setShowNetworkDropdown(false);
        } catch (addError) {
          console.error("Error adding network:", addError);
        }
      } else {
        console.error("Error switching network:", switchError);
      }
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const NetworkStatusDot = ({ network }: { network: string }) => {
    const isConnected = network !== "Unsupported Network" && network !== "";
    return (
      <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
    );
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-60 h-20 right-0 z-50 transition-all bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl duration-500 ease-in-out`}>
        
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 pointer-events-none" />
        
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <span className="text-black font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">T</span>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                  TNV Tools
                </h1>
                <p className="text-xs text-slate-400 -mt-1">Web3 Dashboard</p>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              
              {/* Network Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                  className="group relative bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/50 px-4 py-2.5 rounded-xl flex items-center transition-all duration-200 backdrop-blur-sm"
                >
                  <NetworkStatusDot network={currentNetwork} />
                  <span className="text-sm font-medium text-slate-200 mr-2">
                    {currentNetwork || "Select Network"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      showNetworkDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Network Dropdown */}
                {showNetworkDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-10 overflow-hidden">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                        Available Networks
                      </div>
                      {Object.keys(networks).map((network) => (
                        <button
                          key={network}
                          onClick={() => switchNetwork(network)}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-700/50 rounded-lg transition-colors duration-150 group flex items-center"
                        >
                          <NetworkStatusDot network={currentNetwork === network ? network : ""} />
                          <div>
                            <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                              {network}
                            </div>
                            <div className="text-xs text-slate-500">
                              {network.includes("Sepolia") ? "Testnet" : "Mainnet"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet Connection */}
              {currentAccount ? (
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                  <div className="flex items-center mr-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    <span className="text-sm font-mono text-slate-200">
                      {formatAddress(currentAccount)}
                    </span>
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-1"
                    title="Disconnect Wallet"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="relative group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-2.5 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="relative z-10">Connect Wallet</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;