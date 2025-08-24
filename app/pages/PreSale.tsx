import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase'; // Update the path as needed
import { savePresaleLaunch } from '../firebase';
import {
  FaRocket,
  FaCoins,
  FaCalendarAlt,
  FaInfoCircle,
  FaEthereum,
  FaTwitter,
  FaTelegram,
  FaGlobe,
  FaPlus,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaWallet,
  FaChartLine,
  FaClock,
  FaUsers,
  FaShieldAlt,
  FaEdit,
  FaEye
} from 'react-icons/fa';
import {
  HiSparkles,
  HiLightningBolt,
  HiCurrencyDollar,
  HiCalendar,
  HiUserGroup,
  HiDocumentText
} from 'react-icons/hi';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';

interface Token {
  id: string;
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
}

interface Whitelist {
  whitelistSaleLimit: string;
  whitelistSalePrice: string;
  whitelistMinBuy: string;
  whitelistMaxBuy: string;
  whitelistAddresses: string[];
}

interface LaunchData {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  paymentCurrency: string;
  lpLaunchPrice: string;
  softcap: string;
  hardcap: string;
  preSaleLimit: string;
  publicStartDate: string | null;
  publicEndDate: string | null;
  hasWhitelist: boolean;
  whitelist: Whitelist | null;
  saleName: string;
  saleDescription: string;
  twitterId: string;
  telegramId: string;
  website: string;
  createdAt: string;
  status: string;
  salePrice?: string;
  minBuy?: string;
  maxBuy?: string;
}

const TokenPresalePage = () => {
  const [stage, setStage] = useState<number>(1);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  // Stage 1 state
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [paymentCurrency, setPaymentCurrency] = useState<string>('Eth Sepolia');
  const [salePrice, setSalePrice] = useState<string>('');
  const [lpLaunchPrice, setLpLaunchPrice] = useState<string>('');
  const [minBuy, setMinBuy] = useState<string>('');
  const [maxBuy, setMaxBuy] = useState<string>('');
  const [softcap, setSoftcap] = useState<string>('');
  const [hardcap, setHardcap] = useState<string>('');
  const [preSaleLimit, setPreSaleLimit] = useState<string>('');
  
  // Stage 2 state
  const [publicStartDate, setPublicStartDate] = useState<string>('');
  const [publicStartTime, setPublicStartTime] = useState<string>('');
  const [publicStartAMPM, setPublicStartAMPM] = useState<string>('AM');
  const [publicEndDate, setPublicEndDate] = useState<string>('');
  const [publicEndTime, setPublicEndTime] = useState<string>('');
  const [publicEndAMPM, setPublicEndAMPM] = useState<string>('AM');
  const [hasWhitelist, setHasWhitelist] = useState<boolean>(false);
  const [whitelistSaleLimit, setWhitelistSaleLimit] = useState<string>('');
  const [whitelistSalePrice, setWhitelistSalePrice] = useState<string>('');
  const [whitelistMinBuy, setWhitelistMinBuy] = useState<string>('');
  const [whitelistMaxBuy, setWhitelistMaxBuy] = useState<string>('');
  const [whitelistAddresses, setWhitelistAddresses] = useState<string[]>(['']);
  const [whitelistAddressErrors, setWhitelistAddressErrors] = useState<boolean[]>([]);
  
  // Stage 3 state
  const [saleName, setSaleName] = useState<string>('');
  const [saleDescription, setSaleDescription] = useState<string>('');
  const [twitterId, setTwitterId] = useState<string>('');
  const [telegramId, setTelegramId] = useState<string>('');
  const [website, setWebsite] = useState<string>('');

  useEffect(() => {
    // Fetch tokens from Firebase
    const tokensRef = ref(database, 'tokens');
    onValue(tokensRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTokens(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const detectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            // Request connection if not connected
            const requestedAccounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            if (requestedAccounts.length > 0) {
              setWalletAddress(requestedAccounts[0]);
            }
          }
        } catch (error) {
          console.error('Error detecting wallet:', error);
        }
      }
    };

    detectWallet();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress('');
        setTokens([]);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      setTokens([]);
      setLoadingTokens(false);
      return;
    }

    setLoadingTokens(true);
    const tokensRef = ref(database, `users/${walletAddress}/tokens`);
    
    const unsubscribe = onValue(tokensRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const tokensArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...(value as Omit<Token, 'id'>)
          }));
          setTokens(tokensArray);
        } else {
          setTokens([]);
        }
      } catch (error) {
        console.error('Error processing tokens:', error);
        setTokens([]);
      } finally {
        setLoadingTokens(false);
      }
    });

    return () => unsubscribe();
  }, [walletAddress]);

  const handleAddWhitelistAddress = () => {
    setWhitelistAddresses([...whitelistAddresses, '']);
    setWhitelistAddressErrors([...whitelistAddressErrors, false]);
  };

  const handleRemoveWhitelistAddress = (index: number) => {
    const newAddresses = [...whitelistAddresses];
    newAddresses.splice(index, 1);
    setWhitelistAddresses(newAddresses);
    
    const newErrors = [...whitelistAddressErrors];
    newErrors.splice(index, 1);
    setWhitelistAddressErrors(newErrors);
  };

  // Ethereum address validation
  const isValidEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  };

  const handleWhitelistAddressChange = (index: number, value: string) => {
    const newAddresses = [...whitelistAddresses];
    newAddresses[index] = value;
    setWhitelistAddresses(newAddresses);

    // Validate address
    const errors = [...whitelistAddressErrors];
    errors[index] = value && !isValidEthAddress(value) ? true : false;
    setWhitelistAddressErrors(errors);
  };

  const validateStage1 = (): boolean => {
    return (
      !!selectedToken &&
      !!paymentCurrency &&
      !!salePrice &&
      !!lpLaunchPrice &&
      !!minBuy &&
      !!maxBuy &&
      !!softcap &&
      !!hardcap &&
      !!preSaleLimit
    );
  };

  const validateStage2 = (): boolean => {
    const validDates = !!publicStartDate && !!publicStartTime && !!publicEndDate && !!publicEndTime;
    if (!hasWhitelist) return validDates;
    
    // Check all whitelist addresses are valid
    const allValid = whitelistAddresses.every(addr => isValidEthAddress(addr));
    return (
      validDates &&
      !!whitelistSaleLimit &&
      !!whitelistSalePrice &&
      !!whitelistMinBuy &&
      !!whitelistMaxBuy &&
      whitelistAddresses.every(addr => addr.trim() !== '') &&
      allValid
    );
  };

  const validateStage3 = (): boolean => {
    return (
      !!saleName &&
      !!saleDescription &&
      !!twitterId &&
      !!telegramId
    );
  };

  const handleContinue = () => {
    if (stage === 1 && !validateStage1()) {
      alert('Please fill all fields in Stage 1');
      return;
    }
    if (stage === 2 && !validateStage2()) {
      alert('Please fill all required fields in Stage 2');
      return;
    }
    if (stage === 3 && !validateStage3()) {
      alert('Please fill all required fields in Stage 3');
      return;
    }
    setStage(stage + 1);
  };

  const handleBack = () => {
    setStage(stage - 1);
  };

  const handleLaunch = async () => {
    if (!validateStage1() || !validateStage2() || !validateStage3()) {
      alert('Please complete all required fields');
      return;
    }

    // Max buy must be more than min buy (sale parameter)
    if (!hasWhitelist && Number(maxBuy) <= Number(minBuy)) {
      alert('Maximum Buy must be greater than Minimum Buy in Sale Parameters.');
      return;
    }
    // Pre-sale limit must be greater than max buy
    if (!hasWhitelist && Number(preSaleLimit) <= Number(maxBuy)) {
      alert('Pre-Sale Limit must be greater than Maximum Buy.');
      return;
    }
    // Max buy must be more than min buy (whitelist)
    if (hasWhitelist && Number(whitelistMaxBuy) <= Number(whitelistMinBuy)) {
      alert('Whitelist Maximum Buy must be greater than Whitelist Minimum Buy.');
      return;
    }
    // Whitelist sale limit must be greater than whitelist max buy
    if (hasWhitelist && Number(whitelistSaleLimit) <= Number(whitelistMaxBuy)) {
      alert('Whitelist Sale Limit must be greater than Whitelist Maximum Buy.');
      return;
    }
    // Twitter handle must start with https://x.com/
    if (!twitterId.startsWith('https://x.com/')) {
      alert('Twitter handle must start with "https://x.com/"');
      return;
    }
    // Telegram handle must start with https://t.me/
    if (!telegramId.startsWith('https://t.me/')) {
      alert('Telegram handle must start with "https://t.me/"');
      return;
    }
    // Website must start with https:// (if provided)
    if (website && !website.startsWith('https://')) {
      alert('Website must start with "https://"');
      return;
    }

    if (!walletAddress) {
      alert('Wallet not connected');
      return;
    }

    // Check that publicStartDate/publicStartTime/publicStartAMPM is not in the past
    const getStartDateObj = (): Date | null => {
      if (!publicStartDate || !publicStartTime || !publicStartAMPM) return null;
      const [year, month, day] = publicStartDate.split('-');
      const [hourStr, minuteStr] = publicStartTime.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (publicStartAMPM === 'PM' && hour < 12) hour += 12;
      if (publicStartAMPM === 'AM' && hour === 12) hour = 0;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute, 0);
    };

    const getEndDateObj = (): Date | null => {
      if (!publicEndDate || !publicEndTime || !publicEndAMPM) return null;
      const [year, month, day] = publicEndDate.split('-');
      const [hourStr, minuteStr] = publicEndTime.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (publicEndAMPM === 'PM' && hour < 12) hour += 12;
      if (publicEndAMPM === 'AM' && hour === 12) hour = 0;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute, 0);
    };
    
    const startDateObj = getStartDateObj();
    const endDateObj = getEndDateObj();
    if (startDateObj && startDateObj < new Date()) {
      alert('Public Start Date & Time cannot be in the past.');
      return;
    }
    if (startDateObj && endDateObj && endDateObj <= startDateObj) {
      alert('Public End Date & Time must be after the Public Start Date & Time.');
      return;
    }

    // Hard cap must be greater than soft cap
    if (Number(hardcap) <= Number(softcap)) {
      alert('Hardcap must be greater than Softcap.');
      return;
    }

    try {
      // Find selected token object
      const selectedTokenObj = tokens.find(token => (token.tokenAddress || token.id) === selectedToken);
      const launchData: LaunchData = {
        // Stage 1 data
        tokenAddress: selectedToken,
        tokenName: selectedTokenObj?.tokenName || '',
        tokenSymbol: selectedTokenObj?.tokenSymbol || '',
        paymentCurrency,
        lpLaunchPrice,
        softcap,
        hardcap,
        preSaleLimit,
        // Stage 2 data
        publicStartDate: formatDateTime(publicStartDate, publicStartTime, publicStartAMPM),
        publicEndDate: formatDateTime(publicEndDate, publicEndTime, publicEndAMPM),
        hasWhitelist,
        whitelist: hasWhitelist
          ? {
              whitelistSaleLimit,
              whitelistSalePrice,
              whitelistMinBuy,
              whitelistMaxBuy,
              whitelistAddresses,
            }
          : null,
        // Stage 3 data
        saleName,
        saleDescription,
        twitterId,
        telegramId,
        website: website || '',
        // Metadata
        createdAt: new Date().toISOString(),
        status: 'pending', // You can add status tracking
      };
      
      if (!hasWhitelist) {
        launchData.salePrice = salePrice;
        launchData.minBuy = minBuy;
        launchData.maxBuy = maxBuy;
      }

      // Save to Firebase
      const launchId = await savePresaleLaunch(walletAddress, launchData);

      alert(`Presale launched successfully! ID: ${launchId}`);
      window.location.reload();
      // You might want to redirect or reset the form here
    } catch (error) {
      console.error('Error launching presale:', error);
      alert('Failed to launch presale. Please try again.');
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
          <p className="text-slate-300 mt-6 text-xl font-semibold">Loading Presale Platform...</p>
          <p className="text-slate-400 text-sm mt-2">Preparing your token launch experience</p>
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

      <div className="relative z-10 py-8 px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 mb-6 shadow-2xl shadow-purple-500/25">
            <FaRocket className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Launch Your Presale
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create and configure your token presale with our premium launch platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Premium Card Container */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>

            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden p-8">
              {/* Enhanced Progress Indicator */}
              <div className="mb-12">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-slate-700 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${((stage - 1) / 3) * 100}%` }}
                    ></div>
                  </div>

                  {[
                    { step: 1, icon: FaCoins, title: 'Token & Sale', subtitle: 'Parameters' },
                    { step: 2, icon: FaCalendarAlt, title: 'Schedule &', subtitle: 'Whitelist' },
                    { step: 3, icon: FaInfoCircle, title: 'Sale', subtitle: 'Information' },
                    { step: 4, icon: FaEye, title: 'Review &', subtitle: 'Launch' }
                  ].map(({ step, icon: Icon, title, subtitle }) => (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${
                          stage >= step
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 scale-110'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {stage > step ? (
                          <FaCheck className="text-lg" />
                        ) : (
                          <Icon className="text-lg" />
                        )}
                      </div>
                      <div className="text-center mt-3">
                        <div className={`text-sm font-semibold transition-colors duration-300 ${
                          stage >= step ? 'text-white' : 'text-slate-400'
                        }`}>
                          {title}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          stage >= step ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {stage === 1 && (
                <div className="space-y-8">
                  {/* Stage Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 mb-4">
                      <FaCoins className="text-2xl text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Token & Sale Parameters
                    </h2>
                    <p className="text-slate-400">Configure your token selection and sale pricing</p>
                  </div>

                  <div className="space-y-6">
                    {/* Token Selection */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <FaWallet className="text-purple-400 text-xl" />
                        <label className="text-lg font-semibold text-white">
                          Select Token
                        </label>
                      </div>
                      {!walletAddress ? (
                        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <FaInfoCircle className="text-yellow-400 text-xl flex-shrink-0" />
                            <div>
                              <p className="text-yellow-200 font-semibold">Wallet Connection Required</p>
                              <p className="text-yellow-100/80 text-sm">Please connect your wallet to view your tokens</p>
                            </div>
                          </div>
                        </div>
                      ) : loadingTokens ? (
                        <div className="p-4 bg-slate-700/50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-slate-400 border-t-cyan-400 rounded-full animate-spin"></div>
                            <p className="text-slate-300">Loading your tokens...</p>
                          </div>
                        </div>
                      ) : tokens.length === 0 ? (
                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <FaInfoCircle className="text-blue-400 text-xl flex-shrink-0" />
                            <div>
                              <p className="text-blue-200 font-semibold">No Tokens Found</p>
                              <p className="text-blue-100/80 text-sm">Please create a token first using our Token Creation platform</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={selectedToken}
                          onChange={(e) => setSelectedToken(e.target.value)}
                          className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          required
                        >
                          <option value="" className='bg-slate-800 text-slate-400'>Select a token</option>
                          {tokens.map((token) => (
                            <option key={token.id} className='bg-slate-800 text-white' value={token.tokenAddress || token.id}>
                              {token.tokenName || `Token ${token.id}`} ({token.tokenSymbol || 'No symbol'})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Payment Currency */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <FaEthereum className="text-cyan-400 text-xl" />
                        <label className="text-lg font-semibold text-white">
                          Payment Currency
                        </label>
                      </div>
                      <select
                        value={paymentCurrency}
                        onChange={(e) => setPaymentCurrency(e.target.value)}
                        className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                        required
                      >
                        <option value="Eth Sepolia" className='bg-slate-800 text-white'>Eth Sepolia</option>
                        <option value="Linea Sepolia" className='bg-slate-800 text-white'>Linea Sepolia</option>
                      </select>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <HiCurrencyDollar className="text-green-400 text-xl" />
                        <h3 className="text-lg font-semibold text-white">Pricing Configuration</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Sale Price (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={salePrice}
                              onChange={(e) => setSalePrice(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                              placeholder="0.0001"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            LP Launch Price (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={lpLaunchPrice}
                              onChange={(e) => setLpLaunchPrice(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                              placeholder="0.0002"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buy Limits Section */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <FaChartLine className="text-blue-400 text-xl" />
                        <h3 className="text-lg font-semibold text-white">Buy Limits</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Minimum Buy (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={minBuy}
                              onChange={(e) => setMinBuy(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              placeholder="0.01"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Maximum Buy (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={maxBuy}
                              onChange={(e) => setMaxBuy(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              placeholder="1"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caps Section */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <HiLightningBolt className="text-yellow-400 text-xl" />
                        <h3 className="text-lg font-semibold text-white">Sale Caps & Limits</h3>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Softcap (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={softcap}
                              onChange={(e) => setSoftcap(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                              placeholder="10"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Hardcap (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={hardcap}
                              onChange={(e) => setHardcap(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                              placeholder="100"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Pre-Sale Limit (ETH)
                          </label>
                          <div className="relative">
                            <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              min={0}
                              value={preSaleLimit}
                              onChange={(e) => setPreSaleLimit(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                              placeholder="Enter Pre-Sale Limit"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === 2 && (
                <div className="space-y-8">
                  {/* Stage Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                      <FaCalendarAlt className="text-2xl text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      Sale Schedule & Whitelist
                    </h2>
                    <p className="text-slate-400">Configure your presale timing and whitelist settings</p>
                  </div>

                  <div className="space-y-6">
                    {/* Schedule Section */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <HiCalendar className="text-blue-400 text-xl" />
                        <h3 className="text-lg font-semibold text-white">Sale Schedule</h3>
                      </div>

                      <div className="space-y-6">
                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-3">
                            Public Start Date & Time (IST)
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="date"
                              value={publicStartDate}
                              onChange={(e) => setPublicStartDate(e.target.value)}
                              className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              required
                            />
                            <input
                              type="time"
                              value={publicStartTime}
                              onChange={(e) => setPublicStartTime(e.target.value)}
                              className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              required
                            />
                            <select
                              value={publicStartAMPM}
                              onChange={(e) => setPublicStartAMPM(e.target.value)}
                              className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                            >
                              <option value="AM" className='bg-slate-800 text-white'>AM</option>
                              <option value="PM" className='bg-slate-800 text-white'>PM</option>
                            </select>
                          </div>
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-3">
                            Public End Date & Time (IST)
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="date"
                              value={publicEndDate}
                              onChange={(e) => setPublicEndDate(e.target.value)}
                              className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              required
                            />
                            <input
                              type="time"
                              value={publicEndTime}
                              onChange={(e) => setPublicEndTime(e.target.value)}
                              className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              required
                            />
                            <select
                              value={publicEndAMPM}
                              onChange={(e) => setPublicEndAMPM(e.target.value)}
                              className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                            >
                              <option value="AM" className='bg-slate-800 text-white'>AM</option>
                              <option value="PM" className='bg-slate-800 text-white'>PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Whitelist Toggle */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FaShieldAlt className="text-purple-400 text-xl" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">Whitelist Phase</h3>
                            <p className="text-slate-400 text-sm">Enable exclusive early access for selected addresses</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="hasWhitelist"
                            checked={hasWhitelist}
                            onChange={(e) => setHasWhitelist(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>
                    </div>

                    {hasWhitelist && (
                      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-center space-x-3 mb-6">
                          <HiUserGroup className="text-purple-400 text-xl" />
                          <h3 className="text-lg font-semibold text-white">Whitelist Configuration</h3>
                        </div>

                        <div className="space-y-6">
                          {/* Whitelist Pricing */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Whitelist Sale Limit (ETH)
                              </label>
                              <div className="relative">
                                <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                  type="number"
                                  value={whitelistSaleLimit}
                                  onChange={(e) => setWhitelistSaleLimit(e.target.value)}
                                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                                  placeholder="50"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Whitelist Sale Price (ETH)
                              </label>
                              <div className="relative">
                                <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                  type="number"
                                  value={whitelistSalePrice}
                                  onChange={(e) => setWhitelistSalePrice(e.target.value)}
                                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                                  placeholder="0.00005"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Whitelist Buy Limits */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Whitelist Minimum Buy (ETH)
                              </label>
                              <div className="relative">
                                <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                  type="number"
                                  value={whitelistMinBuy}
                                  onChange={(e) => setWhitelistMinBuy(e.target.value)}
                                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                                  placeholder="0.005"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Whitelist Maximum Buy (ETH)
                              </label>
                              <div className="relative">
                                <FaEthereum className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                  type="number"
                                  value={whitelistMaxBuy}
                                  onChange={(e) => setWhitelistMaxBuy(e.target.value)}
                                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                                  placeholder="0.5"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Whitelist Addresses */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="text-sm font-medium text-slate-300">
                                Whitelisted Addresses
                              </label>
                              <button
                                type="button"
                                onClick={handleAddWhitelistAddress}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                              >
                                <FaPlus className="text-sm" />
                                <span>Add Address</span>
                              </button>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                              {whitelistAddresses.map((address, index) => (
                                <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => handleWhitelistAddressChange(index, e.target.value)}
                                        className={`w-full p-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 ${
                                          whitelistAddressErrors[index]
                                            ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                                            : 'border-slate-600/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                                        }`}
                                        placeholder="0x..."
                                        required
                                      />
                                      {whitelistAddressErrors[index] && (
                                        <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                                          <FaInfoCircle />
                                          <span>Enter valid wallet address</span>
                                        </p>
                                      )}
                                    </div>
                                    {whitelistAddresses.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveWhitelistAddress(index)}
                                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 transform hover:scale-105"
                                        title="Remove address"
                                      >
                                        <FaTimes />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stage === 3 && (
                <div className="space-y-8">
                  {/* Stage Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 mb-4">
                      <FaInfoCircle className="text-2xl text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      Sale Information
                    </h2>
                    <p className="text-slate-400">Provide details about your presale and social links</p>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <HiDocumentText className="text-green-400 text-xl" />
                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Sale Name
                          </label>
                          <input
                            type="text"
                            value={saleName}
                            onChange={(e) => setSaleName(e.target.value)}
                            className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                            placeholder="My Awesome Token Presale"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Sale Description
                          </label>
                          <textarea
                            value={saleDescription}
                            onChange={(e) => setSaleDescription(e.target.value)}
                            className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 resize-none"
                            rows={4}
                            placeholder="Describe your token and presale details..."
                            required
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <FaUsers className="text-blue-400 text-xl" />
                        <h3 className="text-lg font-semibold text-white">Social Links</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Twitter Profile
                          </label>
                          <div className="relative">
                            <FaTwitter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
                            <input
                              type="text"
                              value={twitterId}
                              onChange={(e) => setTwitterId(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              placeholder="https://x.com/mytoken"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Telegram Channel
                          </label>
                          <div className="relative">
                            <FaTelegram className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
                            <input
                              type="text"
                              value={telegramId}
                              onChange={(e) => setTelegramId(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                              placeholder="https://t.me/mytokenchat"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Website <span className="text-slate-500">(optional)</span>
                          </label>
                          <div className="relative">
                            <FaGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-300"
                              placeholder="https://mytoken.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === 4 && (
                <div className="space-y-8">
                  {/* Stage Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 mb-4">
                      <FaEye className="text-2xl text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      Review & Launch
                    </h2>
                    <p className="text-slate-400">Review your presale configuration before launching</p>
                  </div>

                  <div className="space-y-6">
                    {/* Token & Sale Parameters */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <FaCoins className="text-purple-400 text-xl" />
                        <h3 className="text-xl font-semibold text-white">Token & Sale Parameters</h3>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Token:</span>
                            <span className="text-white font-medium">{selectedToken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Payment Currency:</span>
                            <span className="text-cyan-400 font-medium">{paymentCurrency}</span>
                          </div>
                          {!hasWhitelist && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Sale Price:</span>
                                <span className="text-green-400 font-medium">{salePrice} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Minimum Buy:</span>
                                <span className="text-blue-400 font-medium">{minBuy} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Maximum Buy:</span>
                                <span className="text-blue-400 font-medium">{maxBuy} ETH</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-400">LP Launch Price:</span>
                            <span className="text-yellow-400 font-medium">{lpLaunchPrice} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Softcap:</span>
                            <span className="text-orange-400 font-medium">{softcap} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Hardcap:</span>
                            <span className="text-red-400 font-medium">{hardcap} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pre-Sale Limit:</span>
                            <span className="text-purple-400 font-medium">{preSaleLimit} ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sale Schedule */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <FaCalendarAlt className="text-blue-400 text-xl" />
                        <h3 className="text-xl font-semibold text-white">Sale Schedule</h3>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Public Start:</span>
                            <span className="text-green-400 font-medium">{publicStartDate} {publicStartTime} {publicStartAMPM}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Public End:</span>
                            <span className="text-red-400 font-medium">{publicEndDate} {publicEndTime} {publicEndAMPM}</span>
                          </div>
                        </div>
                        {hasWhitelist && (
                          <div className="mt-6 pt-6 border-t border-slate-600/50">
                            <h4 className="text-lg font-semibold text-purple-400 mb-4">Whitelist Configuration</h4>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Whitelist Sale Limit:</span>
                                <span className="text-purple-400 font-medium">{whitelistSaleLimit} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Whitelist Sale Price:</span>
                                <span className="text-purple-400 font-medium">{whitelistSalePrice} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Whitelist Min Buy:</span>
                                <span className="text-purple-400 font-medium">{whitelistMinBuy} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Whitelist Max Buy:</span>
                                <span className="text-purple-400 font-medium">{whitelistMaxBuy} ETH</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium">Whitelisted Addresses ({whitelistAddresses.length}):</span>
                              <div className="mt-2 max-h-32 overflow-y-auto custom-scrollbar bg-slate-800/50 rounded-lg p-3">
                                {whitelistAddresses.map((addr, i) => (
                                  <div key={i} className="text-xs text-slate-300 font-mono break-all py-1 border-b border-slate-700/50 last:border-b-0">
                                    {addr}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sale Information */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-6">
                        <FaInfoCircle className="text-green-400 text-xl" />
                        <h3 className="text-xl font-semibold text-white">Sale Information</h3>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sale Name:</span>
                            <span className="text-white font-medium">{saleName}</span>
                          </div>
                          <div className="border-t border-slate-600/50 pt-3">
                            <span className="text-slate-400 block mb-2">Description:</span>
                            <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 rounded-lg p-3">{saleDescription}</p>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Twitter:</span>
                            <a href={twitterId} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                              {twitterId}
                            </a>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Telegram:</span>
                            <a href={telegramId} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                              {telegramId}
                            </a>
                          </div>
                          {website && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Website:</span>
                              <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                                {website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-700/50">
                {stage > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FaArrowLeft className="text-sm" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {stage < 4 ? (
                  <button
                    onClick={handleContinue}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  >
                    <span>Continue</span>
                    <FaArrowRight className="text-sm" />
                  </button>
                ) : (
                  <button
                    onClick={handleLaunch}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                  >
                    <FaRocket className="text-sm" />
                    <span>Launch Presale</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to format date, time, AM/PM as 'DD/MM/YYYY HH:mm AM/PM'
const formatDateTime = (date: string, time: string, ampm: string): string | null => {
  if (!date || !time || !ampm) return null;
  // date: 'YYYY-MM-DD', time: 'HH:mm', ampm: 'AM'/'PM'
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time} ${ampm}`;
};

export default TokenPresalePage;