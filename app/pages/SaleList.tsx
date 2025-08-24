import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import { BrowserProvider } from 'ethers';
import { getAddress } from 'ethers';
import {
  FaRocket,
  FaCoins,
  FaCalendarAlt,
  FaInfoCircle,
  FaEthereum,
  FaWallet,
  FaEye,
  FaArrowRight,
  FaClock,
  FaUsers,
  FaShieldAlt,
  FaChartLine,
  FaExternalLinkAlt,
  FaCopy,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  HiSparkles,
  HiLightningBolt,
  HiCurrencyDollar,
  HiCalendar,
  HiUserGroup,
  HiDocumentText,
  HiRefresh
} from 'react-icons/hi';
import { BsCheckCircleFill, BsCircle, BsCopy, BsCheckCircle } from 'react-icons/bs';

// Type definitions
interface Sale {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress?: string;
  listingRate?: string;
  lpLaunchPrice?: string;
  softCap?: string;
  softcap?: string;
  hardCap?: string;
  hardcap?: string;
  startTime?: string | number;
  endTime?: string | number;
  publicStartDate?: string | number;
  publicEndDate?: string | number;
  createdBy?: string;
  hasWhitelist?: boolean;
  whitelist?: {
    whitelistAddresses: string[];
  };
}

interface SalesData {
  [user: string]: {
    launches: {
      [id: string]: Sale;
    };
  };
}

interface SaleListProps {
  onNavigate?: (path: string) => void;
}

const SaleList: React.FC<SaleListProps> = ({ onNavigate }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [copiedAddress, setCopiedAddress] = useState<string>('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Helper function to get current IST time
  const getCurrentISTTime = (): Date => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
  };

  // Helper function to parse date and convert to IST for comparison
  const parseToISTDate = (dateValue: string | number | undefined): Date | null => {
    if (!dateValue) return null;
    
    try {
      let date: Date;
      
      // If the value matches 'DD/MM/YYYY HH:mm AM/PM', parse it
      const customPattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) (AM|PM)$/;
      
      if (typeof dateValue === 'string') {
        const customMatch = dateValue.match(customPattern);
        
        if (customMatch) {
          const [, day, month, year, hour, minute, ampm] = customMatch;
          let hour24 = parseInt(hour);
          if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
          if (ampm === 'AM' && hour24 === 12) hour24 = 0;
          
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minute));
        } else {
          // Check if it's already in locale format (like "8/24/2004, 6:35:00 AM")
          const localePattern = /^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (AM|PM)$/;
          if (localePattern.test(dateValue)) {
            date = new Date(dateValue);
          } else {
            // Try parsing as regular date string
            date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              // Try parsing as number if it's a numeric string
              const numericValue = Number(dateValue);
              if (!isNaN(numericValue)) {
                // Handle timestamp properly - check if it's in seconds or milliseconds
                if (numericValue < 1000000000000) {
                  // Timestamp in seconds, convert to milliseconds
                  date = new Date(numericValue * 1000);
                } else {
                  // Timestamp in milliseconds
                  date = new Date(numericValue);
                }
              }
            }
          }
        }
      } else if (typeof dateValue === 'number') {
        // Handle timestamp (both seconds and milliseconds)
        if (dateValue < 1000000000000) {
          // Timestamp in seconds, convert to milliseconds
          date = new Date(dateValue * 1000);
        } else {
          // Timestamp in milliseconds
          date = new Date(dateValue);
        }
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Additional validation: reject dates that are too old (before 2020) or too far in future (after 2030)
      const year = date.getFullYear();
      if (year < 2020 || year > 2030) {
        console.warn(`Date ${dateValue} parsed to year ${year}, which seems invalid. Rejecting.`);
        return null;
      }
      
      return date;
      
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  // Helper function to format date safely
  const formatDate = (dateValue: string | number | undefined): string => {
    if (!dateValue) return 'Not set';
    
    const parsedDate = parseToISTDate(dateValue);
    if (!parsedDate) return `Invalid date: ${dateValue}`;
    
    // Format to IST
    return parsedDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to check if sale is active based on IST
  const isSaleActive = (sale: Sale): boolean => {
    const currentIST = new Date(); // Current time
    const startTime = parseToISTDate(sale.startTime || sale.publicStartDate);
    const endTime = parseToISTDate(sale.endTime || sale.publicEndDate);
    
    // If we can't parse dates, exclude the sale (safer approach)
    if (!startTime || !endTime) {
      console.warn(`Sale ${sale.id} has invalid dates:`, {
        startTime: sale.startTime || sale.publicStartDate,
        endTime: sale.endTime || sale.publicEndDate
      });
      return false;
    }
    
    // Debug logging
    console.log(`Sale ${sale.id} - Start: ${startTime.toISOString()}, End: ${endTime.toISOString()}, Current: ${currentIST.toISOString()}`);
    
    // Check if current time is between start and end time
    const isActive = currentIST >= startTime && currentIST <= endTime;
    
    if (!isActive) {
      console.log(`Sale ${sale.id} is not active. Current: ${currentIST.toISOString()}, Start: ${startTime.toISOString()}, End: ${endTime.toISOString()}`);
    }
    
    return isActive;
  };

  // Connect wallet using ethers v6
  const connectWallet = async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setIsConnected(true);
      } else {
        setError("Please install MetaMask or another Ethereum wallet");
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  useEffect(() => {
    const fetchSales = async (): Promise<void> => {
      try {
        setLoading(true);
        // Fetch all sales for all users
        const allSalesRef = ref(database, 'sales');
        const allSalesSnap = await get(allSalesRef);
        let allSales: Sale[] = [];
        
        if (allSalesSnap.exists()) {
          const salesData: SalesData = allSalesSnap.val();
          // Flatten all launches from all users
          Object.entries(salesData).forEach(([user, launches]) => {
            if (launches && launches.launches) {
              Object.entries(launches.launches).forEach(([id, data]) => {
                allSales.push({
                  id,
                  ...data,
                  // Map the date fields to consistent names
                  startTime: data.startTime || data.publicStartDate,
                  endTime: data.endTime || data.publicEndDate,
                  createdBy: user // Ensure creator is attached to each sale
                });
              });
            }
          });
        }
        
        // Filter sales based on whitelist logic
        const whitelistFilteredSales = allSales.filter(sale => {
          if (!sale.hasWhitelist || !sale.whitelist) return true;
          if (!walletAddress) return false;
          // Show if wallet is in whitelist or is creator
          const isCreator = sale.createdBy && sale.createdBy.toLowerCase() === walletAddress.toLowerCase();
          const isWhitelisted = Array.isArray(sale.whitelist.whitelistAddresses) && 
            sale.whitelist.whitelistAddresses.map(addr => addr.toLowerCase()).includes(walletAddress.toLowerCase());
          return isCreator || isWhitelisted;
        });
        
        // Filter sales based on time (only show active sales based on IST)
        const activeFilteredSales = whitelistFilteredSales.filter(sale => isSaleActive(sale));
        
        setSales(activeFilteredSales);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSales();
  }, [walletAddress]);

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async (): Promise<void> => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleViewDetails = (saleId: string): void => {
    if (onNavigate) {
      onNavigate(`/sale/${saleId}`);
    } else if (typeof window !== 'undefined') {
      // Use Next.js client-side navigation
      window.location.href = `/sale/${saleId}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-300 mt-6 text-xl font-semibold">Loading Active Sales...</p>
          <p className="text-slate-400 text-sm mt-2">Fetching the latest presale opportunities</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 mb-6">
            <FaExclamationTriangle className="text-4xl text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          {typeof window !== 'undefined' && !window.ethereum && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <p className="text-slate-300 mb-4">MetaMask is required to view sales</p>
              <a
                href="https://metamask.io/download.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <span>Install MetaMask</span>
                <FaExternalLinkAlt className="text-sm" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 mb-8">
              <FaWallet className="text-4xl text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-slate-400 mb-8">
              Connect your MetaMask wallet to view and participate in active token sales
            </p>
            <button
              onClick={connectWallet}
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <FaWallet className="text-lg" />
                <span>Connect Wallet</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-slate-600/30 mb-8">
              <FaRocket className="text-4xl text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-300 mb-4">No Active Sales Found</h2>
            <p className="text-slate-400 mb-6">
              No active sales found for your wallet address. Check back later for new opportunities!
            </p>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connected Wallet:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300 font-mono text-sm">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    title="Copy address"
                  >
                    {copiedAddress === walletAddress ? (
                      <BsCheckCircle className="text-green-400" />
                    ) : (
                      <BsCopy className="text-slate-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 shadow-2xl shadow-cyan-500/25">
            <HiSparkles className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Active Token Sales
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover and participate in live token presales and launches
          </p>
        </div>

        {/* Status Bar */}
        <div className="max-w-6xl mx-auto mb-8 px-20">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
                  <p className="text-slate-400 text-sm">Showing sales active as of current IST time</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 px-4 py-2 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-cyan-400" />
                    <span className="text-cyan-300 font-semibold text-sm">
                      {currentTime.toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-4 py-2 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="text-purple-400" />
                    <span className="text-purple-300 font-mono text-sm">
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(walletAddress)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                      title="Copy address"
                    >
                      {copiedAddress === walletAddress ? (
                        <BsCheckCircle className="text-green-400" />
                      ) : (
                        <BsCopy className="text-slate-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Grid */}
        <div className="max-w-6xl mx-auto px-20">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {sales.map((sale, index) => (
              <div
                key={sale.id}
                className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Card glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                <div className="relative">
                  {/* Sale Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FaCoins className="text-xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                          {sale.tokenName}
                        </h3>
                        <p className="text-slate-400 font-mono text-sm">({sale.tokenSymbol})</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 px-3 py-1 rounded-xl">
                      <span className="text-green-400 text-xs font-semibold flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>ACTIVE</span>
                      </span>
                    </div>
                  </div>

                  {/* Sale Details */}
                  <div className="space-y-4">
                    {/* Token Address */}
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FaWallet className="text-slate-400" />
                          <span className="text-slate-300 text-sm">Token Address</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 font-mono text-xs">
                            {sale.tokenAddress ? sale.tokenAddress.substring(0, 12) + '...' : 'N/A'}
                          </span>
                          {sale.tokenAddress && (
                            <button
                              onClick={() => copyToClipboard(sale.tokenAddress!)}
                              className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                              title="Copy address"
                            >
                              {copiedAddress === sale.tokenAddress ? (
                                <BsCheckCircle className="text-green-400 text-xs" />
                              ) : (
                                <BsCopy className="text-slate-400 hover:text-white text-xs" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sale Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-700/30 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaChartLine className="text-green-400 text-sm" />
                          <span className="text-slate-400 text-xs">Listing Rate</span>
                        </div>
                        <span className="text-green-400 font-semibold text-sm">
                          {sale.listingRate || sale.lpLaunchPrice || 'N/A'}
                        </span>
                      </div>

                      <div className="bg-slate-700/30 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaUsers className="text-blue-400 text-sm" />
                          <span className="text-slate-400 text-xs">Soft Cap</span>
                        </div>
                        <span className="text-blue-400 font-semibold text-sm">
                          {sale.softCap || sale.softcap || 'N/A'}
                        </span>
                      </div>

                      <div className="bg-slate-700/30 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <HiLightningBolt className="text-yellow-400 text-sm" />
                          <span className="text-slate-400 text-xs">Hard Cap</span>
                        </div>
                        <span className="text-yellow-400 font-semibold text-sm">
                          {sale.hardCap || sale.hardcap || 'N/A'}
                        </span>
                      </div>

                      <div className="bg-slate-700/30 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaShieldAlt className="text-purple-400 text-sm" />
                          <span className="text-slate-400 text-xs">Whitelist</span>
                        </div>
                        <span className={`font-semibold text-sm ${sale.hasWhitelist ? 'text-purple-400' : 'text-slate-400'}`}>
                          {sale.hasWhitelist ? 'Enabled' : 'Public'}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaCalendarAlt className="text-cyan-400" />
                        <span className="text-slate-300 text-sm font-semibold">Sale Timeline</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Start:</span>
                          <span className="text-green-400 text-xs font-mono">
                            {formatDate(sale.startTime || sale.publicStartDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">End:</span>
                          <span className="text-red-400 text-xs font-mono">
                            {formatDate(sale.endTime || sale.publicEndDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                    <button
                      onClick={() => handleViewDetails(sale.id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                    >
                      <FaEye className="text-sm" />
                      <span>View Details</span>
                      <FaArrowRight className="text-sm" />
                    </button>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Sale ID</span>
                      <p className="text-xs text-slate-400 font-mono">{sale.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleList;