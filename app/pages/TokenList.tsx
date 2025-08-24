import { useState, useEffect } from 'react';
import { SiEthereum } from 'react-icons/si';
import { BsInfoCircle, BsArrowUpRight, BsCopy, BsCheckCircle } from 'react-icons/bs';
import { FaCoins, FaExternalLinkAlt, FaWallet, FaNetworkWired, FaHashtag } from 'react-icons/fa';
import { HiSparkles, HiRefresh } from 'react-icons/hi';
import { getTokensByWallet } from '../firebase';

const sepoliaChainId = '0xaa36a7';

interface Token {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  network: string;
}

const TokenList = () => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isSepolia, setIsSepolia] = useState<boolean>(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        await fetchTokens(account);
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsSepolia(chainId === sepoliaChainId);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      await fetchTokens(accounts[0]);

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsSepolia(chainId === sepoliaChainId);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTokens = async (walletAddress: string) => {
    try {
      setLoading(true);
      const tokensData = await getTokensByWallet(walletAddress.toLowerCase());
      
      if (tokensData) {
        const tokensArray = Object.entries(tokensData).map(([address, token]) => ({
          address,
          ...(token as Omit<Token, 'address'>)
        }));
        setTokens(tokensArray);
      } else {
        setTokens([]);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setCurrentAccount(accounts[0] || '');
        if (accounts[0]) {
          fetchTokens(accounts[0]);
        } else {
          setTokens([]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setIsSepolia(chainId === sepoliaChainId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden py-20  ">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-28">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 shadow-2xl shadow-cyan-500/25">
            <HiSparkles className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Your Token Portfolio
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manage and monitor all your created tokens in one premium dashboard
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-30 ">
          {/* Premium Card Container */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>

            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Header Section */}
              <div className="relative p-8 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <FaCoins className="text-2xl text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Token Portfolio
                      </h2>
                      <p className="text-slate-400 mt-1">Powered by Ethereum Network</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <SiEthereum className="text-3xl text-cyan-400" />
                    {tokens.length > 0 && (
                      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2 rounded-xl border border-cyan-400/30">
                        <span className="text-cyan-300 font-semibold">{tokens.length} Token{tokens.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                {!currentAccount ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 mb-8">
                      <FaWallet className="text-4xl text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Connect your MetaMask wallet to view and manage your created tokens
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
                ) : (
                  <div className="mb-8">
                    {/* Connected Wallet Info */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <BsCheckCircle className="text-xl text-white" />
                          </div>
                          <div>
                            <p className="text-green-400 font-semibold">Wallet Connected</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm text-slate-300 font-mono break-all">{currentAccount}</p>
                              <button
                                onClick={() => copyToClipboard(currentAccount)}
                                className="p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                                title="Copy address"
                              >
                                {copiedAddress === currentAccount ? (
                                  <BsCheckCircle className="text-green-400" />
                                ) : (
                                  <BsCopy className="text-slate-400 hover:text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => fetchTokens(currentAccount)}
                          className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors duration-200"
                          title="Refresh tokens"
                        >
                          <HiRefresh className="text-xl text-slate-300" />
                        </button>
                      </div>
                    </div>

                    {/* Network Warning */}
                    {currentAccount && !isSepolia && (
                      <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BsInfoCircle className="text-xl text-white" />
                          </div>
                          <div>
                            <h4 className="text-yellow-400 font-semibold text-lg mb-2">Network Notice</h4>
                            <p className="text-yellow-200 mb-1">You're not connected to the Sepolia network</p>
                            <p className="text-yellow-100/80 text-sm">Token data will still display, but some features may not work properly</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                        <p className="text-slate-400 mt-6 text-lg">Loading your tokens...</p>
                        <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your portfolio</p>
                      </div>
                    ) : tokens.length > 0 ? (
                      <div className="space-y-6">
                        {/* Tokens Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {tokens.map((token, index) => (
                            <div
                              key={index}
                              className="group relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeInUp 0.6s ease-out forwards'
                              }}
                            >
                              {/* Card glow effect */}
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                              <div className="relative">
                                {/* Token Header */}
                                <div className="flex items-start justify-between mb-6">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                      <FaCoins className="text-xl text-white" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                                        {token.tokenName}
                                      </h3>
                                      <p className="text-slate-400 font-mono text-sm">({token.tokenSymbol})</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Token Details */}
                                <div className="space-y-4">
                                  {/* Total Supply */}
                                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center space-x-2">
                                      <FaHashtag className="text-slate-400" />
                                      <span className="text-slate-300 text-sm">Total Supply</span>
                                    </div>
                                    <span className="text-white font-semibold">{token.totalSupply}</span>
                                  </div>

                                  {/* Network */}
                                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center space-x-2">
                                      <FaNetworkWired className="text-slate-400" />
                                      <span className="text-slate-300 text-sm">Network</span>
                                    </div>
                                    <span className="text-cyan-400 font-semibold">{token.network}</span>
                                  </div>

                                  {/* Contract Address */}
                                  <div className="p-3 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <FaWallet className="text-slate-400" />
                                      <span className="text-slate-300 text-sm">Contract Address</span>
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                      <span className="text-slate-400 font-mono text-xs break-all">
                                        {token.address}
                                      </span>
                                      <div className="flex items-center space-x-1 flex-shrink-0">
                                        <button
                                          onClick={() => copyToClipboard(token.address)}
                                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                                          title="Copy address"
                                        >
                                          {copiedAddress === token.address ? (
                                            <BsCheckCircle className="text-green-400" />
                                          ) : (
                                            <BsCopy className="text-slate-400 hover:text-white" />
                                          )}
                                        </button>
                                        <a
                                          href={`https://sepolia.etherscan.io/address/${token.address}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200 text-slate-400 hover:text-cyan-400"
                                          title="View on Etherscan"
                                        >
                                          <FaExternalLinkAlt />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : currentAccount ? (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-slate-600/30 mb-8">
                          <FaCoins className="text-4xl text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-4">No Tokens Found</h3>
                        <p className="text-slate-400 mb-2">No tokens found for this wallet address.</p>
                        <p className="text-slate-500 text-sm">Create your first token using the Token Launch Platform</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenList;