import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { SiEthereum } from 'react-icons/si';
import { BsInfoCircle } from 'react-icons/bs';
import factoryAbi from '../abi-files/CreateToken.json';
import { saveTokenData } from '../firebase';

interface SepoliaChainParams {
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

interface TokenData {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  tokenAddress: string;
  network: string;
  timestamp: number;
}

const sepoliaChainId = '0xaa36a7';
const sepoliaChainParams: SepoliaChainParams = {
  chainId: sepoliaChainId,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

const TOKEN_FACTORY_ADDRESS = "0x3f2D1103Ff5c18bf4E153da811D3817F583c516E";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Home = () => {
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('');
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  const [isSepolia, setIsSepolia] = useState<boolean>(false);
  const [deployedTokenAddress, setDeployedTokenAddress] = useState<string>('');

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

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsSepolia(chainId === sepoliaChainId);
    } catch (error) {
      console.error(error);
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
      setIsSepolia(true);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [sepoliaChainParams],
          });
          setIsSepolia(true);
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
        }
      } else {
        console.error('Error switching to Sepolia network:', switchError);
      }
    }
  };

  const deployToken = async () => {
    if (!tokenName || !tokenSymbol || !totalSupply) {
      alert('Please fill all fields');
      return;
    }

    if (!isSepolia) {
      alert('Please switch to Sepolia network');
      return;
    }

    try {
      setIsLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const factory = new Contract(
        TOKEN_FACTORY_ADDRESS,
        factoryAbi,
        signer
      );

      let initialSupply;
      try {
        if (!/^\d+(\.\d+)?$/.test(totalSupply) || Number(totalSupply) <= 0) {
          throw new Error('Invalid supply number');
        }
        initialSupply = parseEther(totalSupply);
      } catch (e) {
        throw new Error('Please enter a valid whole number for supply');
      }

      const tx = await factory.createToken(
        tokenName,
        tokenSymbol,
        initialSupply
      );
      setTxHash(tx.hash);

      const receipt = await tx.wait();
      
      let tokenAddress = '';
      for (const log of receipt.logs) {
        try {
          const parsedLog = factory.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "TokenCreated") {
            tokenAddress = parsedLog.args.tokenAddress;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (tokenAddress) {
        setDeployedTokenAddress(tokenAddress);
        
        const tokenData: TokenData = {
          tokenName,
          tokenSymbol,
          totalSupply,
          tokenAddress,
          network: 'Ethereum Sepolia',
          timestamp: Date.now()
        };

        await saveTokenData(userAddress.toLowerCase(), tokenData);

        alert(`
          Token deployed successfully!
          Address: ${tokenAddress}
          Owner: ${userAddress}
          Supply: ${totalSupply} ${tokenSymbol}
        `);
      } else {
        alert('Token deployed but could not retrieve address from logs');
      }
    } catch (error: any) {
      console.error('Error deploying token:', error);
      alert(`Error deploying token: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setCurrentAccount(accounts[0] || '');
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setIsSepolia(chainId === sepoliaChainId);
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0"></div>
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto pt-25 px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4">
            Token Launch
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Deploy your custom ERC-20 tokens with enterprise-grade security and lightning-fast execution
          </p>
        </div>
        
        {/* Main card */}
        <div className="max-w-lg mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 group">
            {/* Header section */}
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
                <SiEthereum className="text-2xl text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">Create Token</h2>
                <p className="text-sm text-gray-400">Deploy on Ethereum Sepolia</p>
              </div>
            </div>

            {/* Wallet connection */}
            {!currentAccount ? (
              <button
                onClick={connectWallet}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative">Connect Wallet</span>
              </button>
            ) : (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-sm text-green-300 font-medium">Wallet Connected</p>
                <p className="text-sm text-gray-300 break-words font-mono">{currentAccount}</p>
              </div>
            )}

            {/* Network warning */}
            {currentAccount && !isSepolia && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-start">
                  <BsInfoCircle className="text-amber-300 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-amber-200 font-medium">Network Switch Required</p>
                    <p className="text-sm text-amber-300 mb-3">Please switch to Sepolia testnet</p>
                    <button
                      onClick={switchToSepolia}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      Switch Network
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-300 hover:bg-white/10"
                  placeholder="My Token"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-300 hover:bg-white/10"
                  placeholder="MAT"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Supply</label>
                <input
                  type="number"
                  value={totalSupply}
                  onChange={(e) => setTotalSupply(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-300 hover:bg-white/10"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-transparent cursor-not-allowed opacity-70"
                  disabled
                >
                  <option>Ethereum Sepolia (11155111)</option>
                </select>
              </div>

              <button
                onClick={deployToken}
                disabled={isLoading || !isSepolia}
                className={`w-full group relative overflow-hidden font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isLoading || !isSepolia
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white hover:shadow-xl'
                }`}
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-cyan-400/50 animate-pulse"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deploying...
                    </div>
                  ) : (
                    'Deploy Token'
                  )}
                </span>
              </button>
            </div>

            {/* Transaction details */}
            {txHash && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <h3 className="text-green-300 font-medium">Transaction Successful</h3>
                </div>
                
                <div>
                  <p className="text-sm text-gray-300 mb-1">Transaction Hash:</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 break-words hover:text-purple-300 transition-colors font-mono"
                  >
                    {txHash}
                  </a>
                </div>
                
                {deployedTokenAddress && (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Token Address:</p>
                    <a
                      href={`https://sepolia.etherscan.io/token/${deployedTokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-400 break-words hover:text-purple-300 transition-colors font-mono"
                    >
                      {deployedTokenAddress}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;