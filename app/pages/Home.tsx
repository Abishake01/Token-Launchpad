import Link from 'next/link';
import rocket from '../requirements/rocket.png';
import Image from 'next/image';
import { FaCoins, FaRocket, FaPaperPlane, FaChartLine, FaArrowRight } from "react-icons/fa";


export default function Home() {

  const features = [
    {
      icon: <FaCoins className="text-xl sm:text-2xl" />,
      title: "Token Creation",
      description: "Create custom tokens with advanced features and smart contract integration",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaRocket className="text-xl sm:text-2xl" />,
      title: "Launch Presale",
      description: "Launch sophisticated presales with built-in security and transparency",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaPaperPlane className="text-xl sm:text-2xl" />,
      title: "Multi-Send",
      description: "Distribute tokens efficiently to multiple addresses in a single transaction",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaChartLine className="text-xl sm:text-2xl" />,
      title: "Analytics",
      description: "Track performance with comprehensive analytics and real-time insights",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 lg:px-8 pt-10 pb-10">
        <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-8 lg:gap-16">
          
          {/* Left Side: Premium Content */}
          <div className="flex-1 flex flex-col items-start justify-center space-y-6 lg:space-y-8">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-sm mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ELITE TOKEN PLATFORM
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Welcome to
                </span>
                <span className="block bg-gradient-to-r from-cyan-400 to-cyan-700 bg-clip-text text-transparent">
                  Token Nexus
                </span>
              </h1>
              
              {/* Subtitle with premium styling */}
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-blue-200 rounded-full"></div>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl max-w-2xl text-slate-300 leading-relaxed font-light">
              Experience the future of digital asset creation. Deploy institutional-grade ERC-20 tokens on Ethereum Sepolia with 
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold"> zero coding expertise</span>. 
              Transform your vision into reality with our premium Web3 infrastructure.
            </p>

            {/* Premium CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/create-token">
                <button className="group relative bg-gradient-to-r from-cyan-600/60 to-blue-600/60 hover:to-cyan-600 text-white font-bold py-4 lg:py-5 px-8 lg:px-10 rounded-xl text-lg lg:text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25">
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Launch Your Token
                  </span>
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-8 pt-8 opacity-70">
              
            </div>
          </div>

          {/* Right Side: Premium Image Container */}
          <div className="flex-1 flex items-center justify-center mt-8 lg:mt-0">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-800 to-cyan-900 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
              
              {/* Rotating Border */}
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-full animate-spin-slow opacity-75 blur-sm"></div>
              
              {/* Inner Glow Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-700 rounded-full opacity-60 animate-pulse"></div>
              
              {/* Image Container */}
              <div className="relative bg-slate-900 rounded-full p-6 lg:p-8 backdrop-blur-xl border border-slate-700/50">
                <div className="relative overflow-hidden rounded-full">
                  <Image 
                    src={rocket} 
                    alt="Token Nexus - Premium Launchpad" 
                    width={300} 
                    height={300} 
                    className="object-contain transform group-hover:scale-110 transition-transform duration-700 filter drop-shadow-2xl lg:w-[400px] lg:h-[400px]" 
                  />
                  
                  {/* Floating Particles */}
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping delay-300 opacity-75"></div>
                  <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-700 opacity-75"></div>
                </div>
              </div>

              {/* Orbiting Elements */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute -top-4 left-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-cyan-500 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 left-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -left-4 w-2 h-2 bg-cyan-500 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Section - Moved outside hero */}
      <div className="relative z-10 px-4 lg:px-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-16">
            <div className="flex items-center space-x-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure</p>
                <p className="text-xs text-slate-400">Military-grade</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Instant</p>
                <p className="text-xs text-slate-400">Lightning fast</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Elite</p>
                <p className="text-xs text-slate-400">Professional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Standalone */}
      <section className="relative z-10 py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto px-4">
              Everything you need to create, launch, and manage successful token projects
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Token Creation */}
            <Link href = "/create-token">
              <div 
                className="group p-6 sm:p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: '0ms' }}
              >
                <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    <FaCoins className="text-xl sm:text-2xl" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  Token Creation
                </h3>
                
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed group-hover:text-slate-300 transition-colors mb-4 sm:mb-6">
                  Create custom tokens with advanced features and smart contract integration
                </p>
                
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium text-sm sm:text-base">Learn More</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform text-sm" />
                </div>
              </div>
            </Link>

            {/* Launch Presale */}
            <Link href="/presale">
              <div 
                className="group p-6 sm:p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: '200ms' }}
              >
                <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    <FaRocket className="text-xl sm:text-2xl" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  Launch Presale
                </h3>
                
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed group-hover:text-slate-300 transition-colors mb-4 sm:mb-6">
                  Launch sophisticated presales with built-in security and transparency
                </p>
                
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium text-sm sm:text-base">Learn More</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform text-sm" />
                </div>
              </div>
            </Link>

            {/* Multi-Send */}
            <Link href="/multi-transfer">
              <div 
                className="group p-6 sm:p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: '400ms' }}
              >
                <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    <FaPaperPlane className="text-xl sm:text-2xl" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  Multi-Send
                </h3>
                
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed group-hover:text-slate-300 transition-colors mb-4 sm:mb-6">
                  Distribute tokens efficiently to multiple addresses in a single transaction
                </p>
                
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium text-sm sm:text-base">Learn More</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform text-sm" />
                </div>
              </div>
            </Link>

            {/* Analytics */}
            <Link href = "/sale">
              <div 
                className="group p-6 sm:p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: '600ms' }}
              >
                <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    <FaChartLine className="text-xl sm:text-2xl" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  Analytics
                </h3>
                
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed group-hover:text-slate-300 transition-colors mb-4 sm:mb-6">
                  Track performance with comprehensive analytics and real-time insights
                </p>
                
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium text-sm sm:text-base">Learn More</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform text-sm" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}