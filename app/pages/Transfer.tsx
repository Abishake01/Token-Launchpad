"use client";

import React, { useState, useEffect } from 'react';
import { ethers, Contract, BrowserProvider } from 'ethers';
import { FaPlus, FaMinus, FaWallet, FaCoins, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import batchTransferAbi from '@/app/abi-files/MultiTransfer.json';

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Recipient {
  id: number;
  address: string;
  amount: string;
}

const contractAddress = "0x1a08E27ff306AaE145FA729EeE6E48f4FA9704fe";

const erc20Abi = [
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

export default function Transfer() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, address: "", amount: "" }
  ]);
  const [decimals, setDecimals] = useState<number>(18);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [totalAmount, setTotalAmount] = useState<bigint>(0n);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [account, setAccount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<string>("");

  // Connect wallet handler
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        setShowError("Wallet connection failed");
        console.error("Wallet connection failed:", error);
      }
    } else {
      setShowError("No Ethereum provider found");
    }
  };

  // Detect and handle account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount("");
      }
    };

    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Fetch token details
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!tokenAddress || !ethers.isAddress(tokenAddress)) return;
      if (!account) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
        const dec = await tokenContract.decimals();
        setDecimals(Number(dec));

        const allowanceAmount = await tokenContract.allowance(
          account,
          contractAddress
        );
        setAllowance(allowanceAmount);
      } catch (error) {
        console.error("Error fetching token details:", error);
      }
    };

    fetchTokenDetails();
  }, [tokenAddress, account]);

  // Calculate total amount
  useEffect(() => {
    let total = 0n;
    recipients.forEach(recipient => {
      if (recipient.amount) {
        try {
          const amountWei = ethers.parseUnits(recipient.amount, decimals);
          total += amountWei;
        } catch (e) {
          console.error("Invalid amount:", recipient.amount);
        }
      }
    });
    setTotalAmount(total);
  }, [recipients, decimals]);

  // Add recipient
  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now(), address: "", amount: "" }
    ]);
  };

  // Remove recipient
  const removeRecipient = (id: number) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  // Update recipient
  const updateRecipient = (id: number, field: keyof Recipient, value: string) => {
    setRecipients(
      recipients.map(recipient => 
        recipient.id === id ? { ...recipient, [field]: value } : recipient
      )
    );
  };

  // Approve tokens
  const approveTokens = async () => {
    setIsApproving(true);
    setShowError("");
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new Contract(tokenAddress, erc20Abi, signer);
      
      const tx = await tokenContract.approve(contractAddress, totalAmount);
      await tx.wait();
      
      // Update allowance
      const newAllowance = await tokenContract.allowance(account, contractAddress);
      setAllowance(newAllowance);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Approval failed:", error);
      setShowError(error.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  // Execute batch transfer
  const executeBatchTransfer = async () => {
    setIsTransferring(true);
    setShowError("");
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const batchContract = new Contract(contractAddress, batchTransferAbi, signer);

      const addresses = recipients.map(r => r.address);
      const amounts = recipients.map(r => 
        ethers.parseUnits(r.amount, decimals)
      );

      const tx = await batchContract.batchTransfer(
        tokenAddress,
        addresses,
        amounts
      );
      await tx.wait();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Transfer failed:", error);
      setShowError(error.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden py-8 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto md:ml-96 md:mt-20 mt-28">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Batch Token Transfer
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Send tokens to multiple recipients in a single transaction
          </p>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl backdrop-blur-sm animate-slide-down">
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-400" />
              <span className="text-green-300">Transaction successful!</span>
            </div>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm animate-slide-down">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-red-400" />
              <span className="text-red-300">{showError}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 animate-fade-in-up">
          {!account ? (
            <div className="text-center py-12">
              <FaWallet className="text-6xl text-slate-400 mx-auto mb-6" />
              <p className="text-xl text-slate-300 mb-4">Please connect your wallet to use this application</p>
              <button
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Connected Account */}
              <div className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-2xl border border-slate-600/50">
                <FaWallet className="text-green-400 text-xl" />
                <div>
                  <p className="text-sm text-slate-400">Connected Wallet</p>
                  <p className="text-lg font-mono">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
              </div>

              {/* Token Address */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-lg font-medium">
                  <FaCoins className="text-purple-400" />
                  <span>Token Address</span>
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all duration-300"
                  placeholder="0x..."
                />
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-2 text-lg font-medium">
                    <FaPaperPlane className="text-cyan-400" />
                    <span>Recipients ({recipients.length})</span>
                  </label>
                  <button 
                    onClick={addRecipient}
                    className="group flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 hover:border-green-400/50 text-green-400 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <FaPlus className="group-hover:rotate-180 transition-transform duration-300" />
                    <span>Add Recipient</span>
                  </button>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recipients.map((recipient, index) => (
                    <div 
                      key={recipient.id} 
                      className="flex gap-4 items-center p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 animate-slide-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={recipient.address}
                          onChange={(e) => 
                            updateRecipient(recipient.id, 'address', e.target.value)
                          }
                          className="w-full p-3 bg-slate-600/50 border border-slate-500/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all duration-300"
                          placeholder="Recipient wallet address"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="text"
                          value={recipient.amount}
                          onChange={(e) => 
                            updateRecipient(recipient.id, 'amount', e.target.value)
                          }
                          className="w-full p-3 bg-slate-600/50 border border-slate-500/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all duration-300"
                          placeholder="Amount"
                        />
                      </div>
                      <button 
                        onClick={() => removeRecipient(recipient.id)}
                        disabled={recipients.length <= 1}
                        className="group p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-400/50 text-red-400 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaMinus className="group-hover:rotate-180 transition-transform duration-300" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/50">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Total Amount</h3>
                  <p className="text-2xl font-bold text-white">{ethers.formatUnits(totalAmount, decimals)} tokens</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl border border-cyan-500/50">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">Current Allowance</h3>
                  <p className="text-2xl font-bold text-white">{ethers.formatUnits(allowance, decimals)} tokens</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {allowance < totalAmount ? (
                  <button
                    onClick={approveTokens}
                    disabled={isApproving || !account}
                    className={`flex-1 group relative overflow-hidden px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isApproving || !account
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <FaCheckCircle className={`${isApproving ? 'animate-spin' : ''}`} />
                      <span>{isApproving ? 'Approving...' : 'Approve Tokens'}</span>
                    </span>
                    {!isApproving && !(!account) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={executeBatchTransfer}
                    disabled={isTransferring || !account}
                    className={`flex-1 group relative overflow-hidden px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isTransferring || !account
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-700 hover:from-green-600 hover:to-emerald-600 text-white'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <FaPaperPlane className={`${isTransferring ? 'animate-bounce' : ''}`} />
                      <span>{isTransferring ? 'Processing...' : 'Execute Batch Transfer'}</span>
                    </span>
                    {!isTransferring && !(!account) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}