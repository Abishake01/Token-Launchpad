"use client";

import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import { BrowserProvider } from 'ethers';
import Purchase from './Purchase';
import {
  FaRocket,
  FaCoins,
  FaCalendarAlt,
  FaInfoCircle,
  FaEthereum,
  FaWallet,
  FaEye,
  FaArrowLeft,
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
  FaTimes,
  FaShoppingCart
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

// Define interfaces for type safety
interface Whitelist {
  whitelistAddresses: string[];
  whitelistSaleLimit: string;
  whitelistSalePrice: string;
  whitelistMinBuy: string;
  whitelistMaxBuy: string;
}

interface Sale {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  totalSupply: string;
  paymentToken: string;
  presaleRate: string;
  listingRate: string;
  softCap: string;
  hardCap: string;
  preSaleLimit: string;
  startTime: string;
  endTime: string;
  minBuy: string;
  maxBuy: string;
  description: string;
  hasWhitelist: boolean;
  whitelist: Whitelist | null;
  createdAt: string;
  createdBy: string;
}

interface DetailItemProps {
  label: string;
  value: string;
  isAddress?: boolean;
}

const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showPurchaseTab, setShowPurchaseTab] = useState<boolean>(false);
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

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true);
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            // Fetch sale data (search all users)
            let found = false;
            const allSalesRef = ref(database, 'sales');
            const allSalesSnap = await get(allSalesRef);
            if (allSalesSnap.exists()) {
              const salesData = allSalesSnap.val();
              for (const user in salesData) {
                if (salesData[user].launches && salesData[user].launches[id]) {
                  const saleData = salesData[user].launches[id];
                  // Whitelist logic
                  if (saleData.hasWhitelist && saleData.whitelist && Array.isArray(saleData.whitelist.whitelistAddresses)) {
                    const isCreator = user && user.toLowerCase() === accounts[0].toLowerCase();
                    const isWhitelisted = saleData.whitelist.whitelistAddresses
                      .map((addr: string) => addr.toLowerCase())
                      .includes(accounts[0].toLowerCase());
                    if (!isCreator && !isWhitelisted) {
                      setError('You are not whitelisted for this sale.');
                      router.replace('/sale');
                      return;
                    }
                  }
                  const mappedSale: Sale = {
                    id,
                    tokenName: saleData.tokenName || 'N/A',
                    tokenSymbol: saleData.tokenSymbol || 'N/A',
                    tokenAddress: saleData.tokenAddress || id,
                    totalSupply: saleData.totalSupply || '',
                    paymentToken: saleData.paymentCurrency,
                    presaleRate: saleData.salePrice,
                    listingRate: saleData.lpLaunchPrice,
                    softCap: saleData.softcap,
                    hardCap: saleData.hardcap,
                    preSaleLimit: saleData.preSaleLimit || '',
                    startTime: saleData.publicStartDate,
                    endTime: saleData.publicEndDate,
                    minBuy: saleData.minBuy,
                    maxBuy: saleData.maxBuy,
                    description: saleData.saleDescription,
                    hasWhitelist: saleData.hasWhitelist,
                    whitelist: saleData.whitelist || null,
                    createdAt: saleData.createdAt,
                    createdBy: user
                  };
                  setSale(mappedSale);
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              setError('Sale not found');
              router.replace('/sales');
            }
          } else {
            setError('Wallet not connected');
            router.replace('/sales');
          }
        } else {
          setError('Wallet not detected');
        }
      } catch (err: unknown) {
        console.error('Error fetching sale:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sale details');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-300 mt-6 text-xl font-semibold">Loading Sale Details...</p>
          <p className="text-slate-400 text-sm mt-2">Fetching presale information</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">Sale Access Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/sale')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Sales</span>
          </button>
        </div>
      </div>
    );
  }

  if (!sale) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/sale')}
          className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all duration-300"
        >
          <FaArrowLeft className="text-cyan-400" />
          <span className="text-slate-300 hover:text-white">Back to All Sales</span>
        </button>

        {/* Enhanced Purchase Modal */}
        {showPurchaseTab && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full relative border border-slate-700/50">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 text-slate-400 hover:text-white"
                onClick={() => setShowPurchaseTab(false)}
              >
                <FaTimes className="text-lg" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 mb-4">
                  <FaShoppingCart className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Purchase Tokens
                </h3>
                <p className="text-slate-400 mt-2">Complete your token purchase</p>
              </div>

              {/* Sale Information */}
              <div className="bg-slate-700/30 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sale ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-white">{sale?.id.substring(0, 8)}...</span>
                    <button
                      onClick={() => copyToClipboard(sale?.id || '')}
                      className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                      title="Copy sale ID"
                    >
                      {copiedAddress === sale?.id ? (
                        <BsCheckCircle className="text-green-400 text-xs" />
                      ) : (
                        <BsCopy className="text-slate-400 hover:text-white text-xs" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sale Limit:</span>
                  <span className="text-cyan-400 font-semibold">
                    {sale?.hasWhitelist && sale?.whitelist
                      ? `${sale.whitelist.whitelistSaleLimit} tokens`
                      : `${sale?.preSaleLimit || "N/A"} ETH`}
                  </span>
                </div>

                {sale?.hasWhitelist && sale?.whitelist && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Whitelist Price:</span>
                    <span className="text-green-400 font-semibold">
                      {sale.whitelist.whitelistSalePrice} {sale.paymentToken}/{sale.whitelist.whitelistMinBuy} token
                    </span>
                  </div>
                )}
              </div>

              {/* Purchase Component */}
              <Purchase />
            </div>
          </div>
        )}

        {/* Main Sale Details Card */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>

          <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden p-8">
            {/* Sale Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaCoins className="text-2xl text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {sale.tokenName}
                  </h2>
                  <p className="text-slate-400 font-mono text-lg">({sale.tokenSymbol})</p>
                  <div className="mt-3">
                    {sale.hasWhitelist && sale.whitelist ? (
                      <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 px-3 py-1 rounded-xl">
                        <FaShieldAlt className="text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">Whitelist Enabled</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 px-3 py-1 rounded-xl">
                        <FaUsers className="text-blue-400" />
                        <span className="text-blue-400 text-sm font-semibold">Public Sale</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-4 py-2 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <FaEthereum className="text-purple-400" />
                    <span className="text-purple-300 font-semibold">{sale.paymentToken}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Created by</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-mono text-sm">
                      {sale.createdBy.substring(0, 6)}...{sale.createdBy.substring(38)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(sale.createdBy)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                      title="Copy creator address"
                    >
                      {copiedAddress === sale.createdBy ? (
                        <BsCheckCircle className="text-green-400 text-xs" />
                      ) : (
                        <BsCopy className="text-slate-400 hover:text-white text-xs" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {sale.description && (
              <div className="mb-8 bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                <div className="flex items-center space-x-3 mb-4">
                  <HiDocumentText className="text-cyan-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">Description</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{sale.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Token Details */}
              <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                <div className="flex items-center space-x-3 mb-6">
                  <FaCoins className="text-cyan-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">Token Details</h3>
                </div>
                <div className="space-y-4">
                  {sale.tokenAddress && (
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-slate-400 text-sm">Token Address:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-slate-300">
                          {sale.tokenAddress.substring(0, 6)}...{sale.tokenAddress.substring(sale.tokenAddress.length - 4)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(sale.tokenAddress)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                          title="Copy token address"
                        >
                          {copiedAddress === sale.tokenAddress ? (
                            <BsCheckCircle className="text-green-400 text-xs" />
                          ) : (
                            <BsCopy className="text-slate-400 hover:text-white text-xs" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <DetailItem label="Token Name" value={sale.tokenName} />
                  <DetailItem label="Token Symbol" value={sale.tokenSymbol} />
                </div>
              </div>

              {/* Sale Parameters */}
              <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                <div className="flex items-center space-x-3 mb-6">
                  <HiCurrencyDollar className="text-green-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">Sale Parameters</h3>
                </div>
                <div className="space-y-4">
                  {!sale.hasWhitelist && (
                    <DetailItem label="Presale Rate" value={`${sale.presaleRate} ${sale.paymentToken}/${sale.minBuy} token`} />
                  )}
                  <DetailItem label="Listing Rate" value={`${sale.listingRate} ${sale.paymentToken}/token`} />
                  <DetailItem label="Soft Cap" value={`${sale.softCap} ${sale.paymentToken}`} />
                  <DetailItem label="Hard Cap" value={`${sale.hardCap} ${sale.paymentToken}`} />
                  {sale.preSaleLimit && (
                    <DetailItem label="Pre-Sale Limit" value={`${sale.preSaleLimit} ${sale.paymentToken}`} />
                  )}
                </div>
              </div>
            </div>

            {/* Timing Section */}
            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <FaCalendarAlt className="text-blue-400 text-xl" />
                <h3 className="text-xl font-semibold text-white">Sale Timeline</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 text-sm">Start Time:</span>
                  <span className="text-green-400 font-semibold">{sale.startTime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 text-sm">End Time:</span>
                  <span className="text-red-400 font-semibold">{sale.endTime}</span>
                </div>
              </div>
            </div>

            {/* Investment Limits */}
            {!sale.hasWhitelist && (
              <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FaChartLine className="text-yellow-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">Investment Limits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Minimum Buy" value={`${sale.minBuy} ${sale.paymentToken}`} />
                  <DetailItem label="Maximum Buy" value={`${sale.maxBuy} ${sale.paymentToken}`} />
                </div>
              </div>
            )}

            {/* Whitelist Section */}
            {sale.hasWhitelist && sale.whitelist && (
              <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FaShieldAlt className="text-purple-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">Whitelist Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <DetailItem label="Whitelist Sale Limit" value={`${sale.whitelist.whitelistSaleLimit} token`} />
                  <DetailItem label="Whitelist Sale Price" value={`${sale.whitelist.whitelistSalePrice} ${sale.paymentToken}/${sale.whitelist.whitelistMinBuy} token`} />
                  <DetailItem label="Whitelist Minimum Buy" value={`${sale.whitelist.whitelistMinBuy} token`} />
                  <DetailItem label="Whitelist Maximum Buy" value={`${sale.whitelist.whitelistMaxBuy} token`} />
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FaUsers className="text-purple-400" />
                    <span className="text-white font-semibold">Whitelisted Addresses ({sale.whitelist.whitelistAddresses.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2">
                    {sale.whitelist.whitelistAddresses.map((addr: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                        <span className="font-mono text-sm text-slate-300 break-all">{addr}</span>
                        <button
                          onClick={() => copyToClipboard(addr)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors duration-200 ml-2"
                          title="Copy address"
                        >
                          {copiedAddress === addr ? (
                            <BsCheckCircle className="text-green-400 text-xs" />
                          ) : (
                            <BsCopy className="text-slate-400 hover:text-white text-xs" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Creation Info */}
            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <FaClock className="text-slate-400 text-xl" />
                <h3 className="text-lg font-semibold text-white">Creation Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Created at:</span>
                  <span className="text-slate-300">{new Date(sale.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Created by:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-300">{sale.createdBy.substring(0, 6)}...{sale.createdBy.substring(38)}</span>
                    <button
                      onClick={() => copyToClipboard(sale.createdBy)}
                      className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                      title="Copy creator address"
                    >
                      {copiedAddress === sale.createdBy ? (
                        <BsCheckCircle className="text-green-400 text-xs" />
                      ) : (
                        <BsCopy className="text-slate-400 hover:text-white text-xs" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowPurchaseTab(true)}
                className="group relative bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-green-500/25"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <FaShoppingCart className="text-lg" />
                  <span>Purchase Tokens</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, isAddress = false }) => (
  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
    <span className="text-slate-400 text-sm">{label}:</span>
    {isAddress ? (
      <span className="font-mono text-sm text-slate-300 break-all max-w-[180px] md:max-w-none">
        {value.substring(0, 6)}...{value.substring(value.length - 4)}
      </span>
    ) : (
      <span className="text-white font-semibold">{value}</span>
    )}
  </div>
);

export default SaleDetails;