import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import {
  FaHistory,
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
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload
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

interface PurchaseHistoryItem {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  quantityPurchased?: number;
  amountPaid: string;
  saleId: string;
  saleOwner?: string;
  whitelistEnabled?: boolean;
  hasWhitelist?: boolean;
  softcap: string;
  hardcap: string;
  timestamp?: string;
}

export default function SaleHistory() {
  const [history, setHistory] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [wallet, setWallet] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredHistory, setFilteredHistory] = useState<PurchaseHistoryItem[]>([]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError('');
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length === 0) {
            setError('Please connect your wallet.');
            setLoading(false);
            return;
          }
          const walletAddress = accounts[0];
          setWallet(walletAddress);
          const historyRef = ref(database, `sales/${walletAddress}/history`);
          const snap = await get(historyRef);
          
          if (snap.exists()) {
            const data = snap.val();
            const arr: PurchaseHistoryItem[] = Object.keys(data).map((id) => ({
              id,
              ...data[id]
            }));
            
            // Fetch sale owners
            for (const item of arr) {
              const allSalesRef = ref(database, 'sales');
              const allSalesSnap = await get(allSalesRef);
              if (allSalesSnap.exists()) {
                const salesData = allSalesSnap.val();
                for (const user in salesData) {
                  if (salesData[user]?.launches?.[item.saleId]) {
                    item.saleOwner = user;
                    break;
                  }
                }
              }
            }
            
            // Sort by timestamp
            arr.sort((a, b) => {
              const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
              const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
              return dateB - dateA;
            });
            
            setHistory(arr);
            setFilteredHistory(arr);
          } else {
            setHistory([]);
            setFilteredHistory([]);
          }
        } else {
          setError('No Ethereum wallet detected.');
        }
      } catch (err) {
        setError('Failed to fetch history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, []);

  // Filter history based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(item =>
        item.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tokenAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.saleId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-300 mt-6 text-xl font-semibold">Loading Purchase History...</p>
          <p className="text-slate-400 text-sm mt-2">Fetching your transaction records</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading History</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <HiRefresh className="text-sm" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
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
              <FaHistory className="text-4xl text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-300 mb-4">No Purchase History</h2>
            <p className="text-slate-400 mb-6">
              You haven't made any token purchases yet. Start exploring active sales to build your portfolio!
            </p>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connected Wallet:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300 font-mono text-sm">
                    {wallet.substring(0, 6)}...{wallet.substring(38)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(wallet)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    title="Copy address"
                  >
                    {copiedAddress === wallet ? (
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 mb-6 shadow-2xl shadow-purple-500/25">
            <FaHistory className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Purchase History
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Track all your token purchases and investment history
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-6xl mx-auto mb-8 px-20">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                  <p className="text-slate-400 text-sm">Total purchases: {history.length}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by token name, symbol, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 w-80"
                  />
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-4 py-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="text-purple-400" />
                    <span className="text-purple-300 font-mono text-sm">
                      {wallet.substring(0, 6)}...{wallet.substring(38)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(wallet)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                      title="Copy address"
                    >
                      {copiedAddress === wallet ? (
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

        {/* Results Summary */}
        {searchTerm && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
              <p className="text-slate-300">
                Showing {filteredHistory.length} of {history.length} transactions
                {searchTerm && (
                  <span className="text-cyan-400"> matching "{searchTerm}"</span>
                )}
              </p>
            </div>
          </div> 
        )}

        {/* Purchase History Cards */}
        <div className="max-w-6xl mx-auto px-20">
          {filteredHistory.length === 0 && searchTerm ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-slate-600/30 mb-6">
                <FaSearch className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-300 mb-4">No Results Found</h3>
              <p className="text-slate-400 mb-6">No transactions match your search criteria.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
              {filteredHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Card glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                  <div className="relative">
                    {/* Transaction Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FaCoins className="text-xl text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                            {item.tokenName}
                          </h3>
                          <p className="text-slate-400 font-mono text-sm">({item.tokenSymbol})</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 px-3 py-1 rounded-xl mb-2">
                          <span className="text-green-400 text-sm font-semibold">PURCHASED</span>
                        </div>
                        {item.timestamp && (
                          <p className="text-slate-400 text-xs">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Transaction Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {/* Token Address */}
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaWallet className="text-slate-400" />
                            <span className="text-slate-300 text-sm">Token Address</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(item.tokenAddress)}
                            className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                            title="Copy address"
                          >
                            {copiedAddress === item.tokenAddress ? (
                              <BsCheckCircle className="text-green-400 text-xs" />
                            ) : (
                              <BsCopy className="text-slate-400 hover:text-white text-xs" />
                            )}
                          </button>
                        </div>
                        <span className="text-slate-400 font-mono text-xs break-all">
                          {item.tokenAddress}
                        </span>
                      </div>

                      {/* Amount Paid */}
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <HiCurrencyDollar className="text-green-400" />
                          <span className="text-slate-300 text-sm">Amount Paid</span>
                        </div>
                        <span className="text-green-400 font-semibold text-lg">
                          {item.amountPaid} ETH
                        </span>
                      </div>

                      {/* Quantity */}
                      {item.quantityPurchased && (
                        <div className="bg-slate-700/30 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaCoins className="text-blue-400" />
                            <span className="text-slate-300 text-sm">Quantity</span>
                          </div>
                          <span className="text-blue-400 font-semibold">
                            {item.quantityPurchased}
                          </span>
                        </div>
                      )}

                      {/* Whitelist Status */}
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaShieldAlt className="text-purple-400" />
                          <span className="text-slate-300 text-sm">Whitelist</span>
                        </div>
                        <span className={`font-semibold text-sm ${
                          item.whitelistEnabled || item.hasWhitelist ? 'text-purple-400' : 'text-slate-400'
                        }`}>
                          {item.whitelistEnabled || item.hasWhitelist ? 'Enabled' : 'Public Sale'}
                        </span>
                      </div>
                    </div>

                    {/* Sale Information */}
                    <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaChartLine className="text-cyan-400" />
                        <span className="text-slate-300 text-sm font-semibold">Sale Information</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Soft Cap:</span>
                          <span className="text-slate-300">{item.softcap} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hard Cap:</span>
                          <span className="text-slate-300">{item.hardcap} ETH</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-slate-400">Sale ID:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-300 font-mono">
                              {item.saleId.substring(0, 8)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.saleId)}
                              className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                              title="Copy sale ID"
                            >
                              {copiedAddress === item.saleId ? (
                                <BsCheckCircle className="text-green-400" />
                              ) : (
                                <BsCopy className="text-slate-400 hover:text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                        {item.saleOwner && (
                          <div className="flex justify-between col-span-2">
                            <span className="text-slate-400">Sale Owner:</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-300 font-mono">
                                {item.saleOwner.substring(0, 6)}...{item.saleOwner.substring(38)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(item.saleOwner!)}
                                className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                                title="Copy owner address"
                              >
                                {copiedAddress === item.saleOwner ? (
                                  <BsCheckCircle className="text-green-400" />
                                ) : (
                                  <BsCopy className="text-slate-400 hover:text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    {item.timestamp && (
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="flex items-center space-x-2">
                          <FaClock className="text-slate-400" />
                          <span className="text-slate-400 text-sm">Transaction Time</span>
                        </div>
                        <span className="text-slate-300 text-sm">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}