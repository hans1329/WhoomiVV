'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FaChevronDown, FaUserAlt, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useLanguage } from '@/internationalization';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const { t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close the user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to format wallet address for display
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Check if the current page is the active one
  const isActivePage = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Check if we're on the landing page (home page)
  const isLandingPage = pathname === '/';

  // Show public navigation items based on authentication status and current page
  const shouldShowPublicNav = !isAuthenticated || isLandingPage;

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-md border-b border-[#0abab5]/20 z-30">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
              <span className="text-sm font-semibold text-white">Whoomi</span>
            </Link>
          </div>
          
          {/* Public Navigation - About, Features, Community, Docs (Desktop) - Only for landing page or logged out */}
          {shouldShowPublicNav && (
            <div className="hidden md:flex items-center ml-8 space-x-6">
              <Link 
                href="/about" 
                className={`text-sm transition-colors ${isActivePage('/about') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                About
              </Link>
              <Link 
                href="/features" 
                className={`text-sm transition-colors ${isActivePage('/features') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Features
              </Link>
              <Link 
                href="/community" 
                className={`text-sm transition-colors ${isActivePage('/community') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Community
              </Link>
              <Link 
                href="/docs" 
                className={`text-sm transition-colors ${isActivePage('/docs') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Docs
              </Link>
            </div>
          )}
          
          {/* Desktop Navigation - Only for logged in users and non-landing pages */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/dashboard" 
                className={`text-sm transition-colors ${isActivePage('/dashboard') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/connectome" 
                className={`text-sm transition-colors ${isActivePage('/connectome') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Connectome
              </Link>
              <Link 
                href="/chat" 
                className={`text-sm transition-colors ${isActivePage('/dopple-zone') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Dopple Zone
              </Link>
              <Link 
                href="/chat" 
                className={`text-sm transition-colors ${isActivePage('/chat') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Chat
              </Link>
              <Link 
                href="/token-shop" 
                className={`text-sm transition-colors ${isActivePage('/token-shop') ? 'text-[#0abab5] font-medium' : 'text-white hover:text-[#0abab5]'}`}
              >
                Token Shop
              </Link>
            </div>
          )}
          
          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                {/* Token balance display - always visible on mobile and desktop */}
                <div className="flex items-center">
                  <div className="text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full flex items-center mr-2">
                    <svg className="w-3 h-3 mr-1 text-[#0abab5]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                    </svg>
                    <span className="font-medium text-[#0abab5]">
                      {user?.tokenBalance || 0} WHM
                    </span>
                  </div>
                  
                  {/* User Profile Button - hidden on mobile, visible on desktop */}
                  <button 
                    className="hidden md:flex items-center text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full text-[#0abab5] hover:bg-[#0abab5]/20 transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="font-medium mr-1">
                      {typeof user?.id === 'string' 
                        ? formatAddress(user?.id)
                        : 'User'}
                    </span>
                    <FaChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Mobile menu button - only visible on mobile */}
                  <button 
                    className="md:hidden flex items-center text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full text-[#0abab5] hover:bg-[#0abab5]/20 transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <FaChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="text-sm font-medium text-white">My Account</div>
                      <div className="text-xs text-gray-400 truncate">
                        {typeof user?.id === 'string' ? formatAddress(user?.id) : 'User'}
                      </div>
                    </div>
                    {/* Mobile only wallet address display */}
                    <div className="md:hidden px-4 py-2 border-b border-gray-700">
                      <div className="text-xs text-gray-400">Wallet Address</div>
                      <div className="text-xs font-medium text-[#0abab5]">
                        {typeof user?.id === 'string' ? formatAddress(user?.id) : 'User'}
                      </div>
                    </div>
                    
                    {/* Mobile only navigation links */}
                    <div className="md:hidden py-2 border-b border-gray-700">
                      <div className="px-4 py-1 text-xs text-gray-400">Navigation</div>
                      
                      {/* Public navigation for mobile - only for landing page or logged out */}
                      {shouldShowPublicNav && (
                        <>
                          <Link 
                            href="/about" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/about') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            About
                          </Link>
                          <Link 
                            href="/features" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/features') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Features
                          </Link>
                          <Link 
                            href="/community" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/community') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Community
                          </Link>
                          <Link 
                            href="/docs" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/docs') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Docs
                          </Link>
                        </>
                      )}
                      
                      {/* App navigation for mobile - only for logged in users */}
                      {isAuthenticated && (
                        <>
                          <Link 
                            href="/dashboard" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/dashboard') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link 
                            href="/connectome" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/connectome') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Connectome
                          </Link>
                          <Link 
                            href="/chat" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/dopple-zone') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dopple Zone
                          </Link>
                          <Link 
                            href="/chat" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/chat') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Chat
                          </Link>
                          <Link 
                            href="/token-shop" 
                            className={`flex items-center px-4 py-2 text-sm ${isActivePage('/token-shop') ? 'text-[#0abab5]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Token Shop
                          </Link>
                        </>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUserAlt className="w-3 h-3 mr-2" />
                        Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaCog className="w-3 h-3 mr-2" />
                        Settings
                      </Link>
                      <button 
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <FaSignOutAlt className="w-3 h-3 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="px-3 py-1.5 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white text-xs font-medium rounded-full border border-[#0abab5] transition-all"
                onClick={() => router.push('/login')}
              >
                {t('common.connect', 'Connect')}
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 