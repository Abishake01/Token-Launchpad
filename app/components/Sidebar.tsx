'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaHome, 
  FaCoins, 
  FaPaperPlane, 
  FaBars,
  FaTimes,
  FaListAlt,
  FaChevronRight,
} from 'react-icons/fa';
import { MdFeaturedPlayList } from "react-icons/md";
import { HiRocketLaunch } from "react-icons/hi2";
import LG from '@/app/requirements/logo.png';
import { usePathname } from 'next/navigation';
import { MdOutlineManageHistory } from "react-icons/md";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { 
      name: "Home", 
      path: "/", 
      icon: <FaHome className="w-4 h-4" />,
    },
    { 
      name: "Token Creation", 
      path: "/create-token", 
      icon: <FaCoins className="w-4 h-4" />,
    },
    { 
      name: "Token Multisend", 
      path: "/multi-transfer", 
      icon: <FaPaperPlane className="w-4 h-4" />,
    },
    { 
      name: "Tokens list", 
      path: "/your-tokens", 
      icon: <MdFeaturedPlayList className="w-4 h-4" />,
    },
    { 
      name: "Launch Presale", 
      path: "/presale", 
      icon: <HiRocketLaunch className="w-4 h-4" />,
    },
    { 
      name: "Presale list", 
      path: "/sale", 
      icon: <FaListAlt className="w-4 h-4" />,
    },
    { 
      name: "Sales History", 
      path: "/sale-history", 
      icon: <MdOutlineManageHistory className="w-4 h-4" />,
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-2xl backdrop-blur-sm border border-white/20 lg:hidden hover:from-cyan-300 hover:to-blue-400 transition-all duration-500 hover:scale-110 hover:shadow-cyan-400/50 hover:rotate-12 group"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl opacity-50 group-hover:opacity-70 transition-all duration-500"></div>
        <div className="relative">
          {isOpen ? (
            <FaTimes size={18} className="transform rotate-0 transition-transform duration-500 group-hover:rotate-180" />
          ) : (
            <FaBars size={18} className="transform rotate-0 transition-transform duration-500 group-hover:rotate-12" />
          )}
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-700 z-40 backdrop-blur-2xl border-r border-cyan-400/20 shadow-2xl shadow-cyan-400/10
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0`}
      >
        
        <div className="relative h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-3.5 h-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl duration-500 ease-in-out relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 animate-pulse"></div>
            <div className="flex items-center group cursor-pointer relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transi tion-all duration-500 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20  rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                <Image
                  src={LG}
                  alt="Logo"
                  className="relative h-12 w-12 rounded-2xl border-2 border-cyan-400/30 shadow-2xl shadow-cyan-400/25 group-hover:shadow-cyan-400/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  width={48}
                  height={48}
                  priority
                />
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:cyan-500 transition-all duration-500">
                  Token Suite
                </span>
                <div className="text-sm text-cyan-300/80 font-medium tracking-wide">Launch Platform</div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path;
              return (
                <div
                  key={item.name}
                  className="relative group"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isOpen ? 'slideInLeft 0.7s ease-out forwards' : 'none',
                  }}
                >
                  {/* Active indicator with enhanced glow */}
                  <div className={`absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r-full shadow-lg shadow-cyan-400/70 transition-all duration-700 ease-out ${
                    isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r-full blur-sm opacity-60"></div>
                  </div>
                  
                  <Link
                    href={item.path}
                    className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-700 ease-out transform hover:scale-[1.03] group/link ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/60 to-blue-600/60 text-white shadow-2xl shadow-cyan-500/30 border border-cyan-400/30 translate-x-3 backdrop-blur-sm'
                        : 'hover:bg-gradient-to-r hover:from-cyan-900/30 hover:to-blue-900/30 text-gray-300 hover:text-white border border-transparent hover:border-cyan-400/20 translate-x-0 hover:translate-x-2 backdrop-blur-sm'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Enhanced background gradient animation */}
                    {/* <div className={`absolute inset-0 bg-gradient-to-r from-cyan-600/80 via-blue-600/80 to-purple-600/80 rounded-2xl transition-all duration-700 ease-out ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}></div> */}
                    
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-2xl blur-xl transition-all duration-700 ease-out ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover/link:opacity-50'
                    }`}></div>
                    
                    {/* Content with higher z-index */}
                    <div className="relative flex items-center z-10">
                      <div className={`p-3 rounded-xl transition-all duration-700 ease-out transform ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 text-white shadow-lg shadow-cyan-400/30 scale-110 rotate-6 border border-cyan-400/20'
                          : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 group-hover/link:bg-gradient-to-r group-hover/link:from-cyan-400/20 group-hover/link:via-blue-400/20 group-hover/link:to-purple-400/20 text-gray-400 group-hover/link:text-cyan-300 scale-100 rotate-0 border border-slate-700/50 group-hover/link:border-cyan-400/20'
                      }`}>
                        {item.icon}
                      </div>
                      <span className={`ml-4 font-semibold text-base tracking-wide transition-all duration-700 ease-out ${
                        isActive ? 'text-white font-bold' : 'text-gray-300 group-hover/link:text-cyan-300'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    
                    <div className="relative flex items-center space-x-3 z-10">
                      {item.badge && (
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-700 ease-out transform ${
                          item.badge === 'New' 
                            ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-emerald-900 shadow-lg shadow-emerald-400/50' 
                            : 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 shadow-lg shadow-amber-400/50'
                        } ${
                          isActive ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
                        } border border-white/20`}>
                          {item.badge}
                        </span>
                      )}
                      <FaChevronRight 
                        className={`w-4 h-4 transition-all duration-700 ease-out transform ${
                          isActive 
                            ? 'text-cyan-300 opacity-100 translate-x-3' 
                            : 'text-gray-500 opacity-0 group-hover/link:opacity-100 translate-x-0 rotate-0 group-hover/link:translate-x-2 group-hover/link:text-cyan-400'
                        }`} 
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Premium Footer */}
          <div className="p-6 border-t border-cyan-400/20 bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 animate-pulse"></div>
            <div className="text-center relative">
              <div className="mt-2 text-sm text-gray-400">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                  Token Launch Platform
                </span>
                <span className="block font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-1">
                  v1.0 
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-black/70 to-slate-900/80 backdrop-blur-md z-30 lg:hidden transition-all duration-700"
          onClick={() => setIsOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onKeyDown={(e) => e.key === 'Enter' && setIsOpen(false)}
        />
      )}

      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        /* Custom Scrollbar Styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6, #8b5cf6);
          border-radius: 10px;
          opacity: 0.8;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb, #7c3aed);
          opacity: 1;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 rgba(15, 23, 42, 0.5);
        }

        /* Additional glow effects */
        .group:hover .animate-pulse {
          animation-duration: 1s;
        }

        /* Enhance text gradient animations */
        .bg-clip-text {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;