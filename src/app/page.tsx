'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/internationalization';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    console.log('Main page mounted');
    
    // Redirect to dashboard if user is already logged in
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleConnectWallet = async () => {
    console.log('Connect wallet button clicked');
    openLoginModal(); // Open login modal
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Don't render until component is mounted
  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-60 h-60 bg-[#0abab5] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-60 h-60 bg-[#0abab5]/70 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-60 h-60 bg-[#0abab5]/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-md border-b border-[#0abab5]/20 z-30">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center w-1/4">
              <Link href="/" className="flex items-center">
                <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold text-white">Whoomi</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center w-2/4">
              <div className="flex space-x-8">
                <Link href="/about" className="text-white text-sm hover:text-[#0abab5] transition-colors">About</Link>
                <Link href="/features" className="text-white text-sm hover:text-[#0abab5] transition-colors">Features</Link>
                <Link href="/community" className="text-white text-sm hover:text-[#0abab5] transition-colors">Community</Link>
                <Link href="/docs" className="text-white text-sm hover:text-[#0abab5] transition-colors">Docs</Link>
              </div>
            </div>
            
            {/* Wallet Button and Language Switcher */}
            <div className="hidden md:flex items-center justify-end w-1/4 space-x-3">
              <LanguageSwitcher />
              <button 
                className="px-3 py-1.5 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white text-xs font-medium rounded-full border border-[#0abab5] transition-all"
                onClick={handleConnectWallet}
              >
                {t('common.connect', 'Connect')}
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="text-white p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-16 bg-black/60 backdrop-blur-md border-b border-[#0abab5]/20 z-20">
              <div className="flex flex-col space-y-4 p-4">
                <Link href="/about" className="text-white text-sm hover:text-[#0abab5] py-2 transition-colors">About</Link>
                <Link href="/features" className="text-white text-sm hover:text-[#0abab5] py-2 transition-colors">Features</Link>
                <Link href="/community" className="text-white text-sm hover:text-[#0abab5] py-2 transition-colors">Community</Link>
                <Link href="/docs" className="text-white text-sm hover:text-[#0abab5] py-2 transition-colors">Docs</Link>
                
                {/* Language Switcher for Mobile */}
                <div className="py-2">
                  <LanguageSwitcher />
                </div>
                
                {/* Mobile Menu Wallet Button */}
                <div className="flex items-center">
                  <button 
                    className="flex-grow py-2 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white text-xs font-medium rounded-full border border-[#0abab5] transition-all"
                    onClick={handleConnectWallet}
                  >
                    {t('common.connect', 'Connect')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-3 md:px-8 z-10">
        <div className="flex flex-col items-center justify-center flex-grow max-w-4xl w-full">
          <h1 className="text-2xl md:text-4xl font-semibold text-center mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#0abab5]">
            {t('landing.title', 'Talk to the Doppel that mirrors you')}
          </h1>
          <p className="text-sm md:text-base text-center mb-6 font-light text-[#a8e4e3] max-w-3xl mx-auto">
            {t('landing.subtitle', 'You can create and network with your AI doppelgänger that reflects you and grows through conversation.')}
          </p>
          
          <div className="flex justify-center my-8">
            <div className="relative w-full max-w-xl">
              <img 
                src="/dopple-image.png" 
                alt="A person and their digital doppelgänger facing each other" 
                className="rounded-lg w-full max-h-[450px] object-contain"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-8">
            <button 
              className="px-12 py-3 min-w-[280px] bg-[#0abab5] hover:bg-[#0abab5]/80 text-white text-base font-medium rounded-full border border-[#0abab5] shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={handleConnectWallet}
            >
              {t('common.connect_with_myself', 'Connect with Myself')}
            </button>
            
            {error && (
              <div className="mt-3 p-2 bg-red-500/20 rounded-lg border border-red-500/30 text-white text-xs max-w-md text-center">
                {error}
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full max-w-4xl">
            <div className="glassmorphism-card group bg-black border border-[#0abab5]/40">
              <div className="p-5 md:p-6 h-full flex flex-col">
                <div className="w-8 h-8 mb-3 text-[#a8e4e3] bg-[#0abab5] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-base font-medium mb-2 group-hover:text-[#0abab5] transition-colors">
                  {t('landing.feature.growth', 'Growth Through Conversation')}
                </h2>
                <p className="font-light text-xs text-gray-300 group-hover:text-white transition-colors">
                  {t('landing.feature.growth.description', 'Your virtual human levels up and grows as you interact with the AI')}
                </p>
              </div>
            </div>
            <div className="glassmorphism-card group bg-black border border-[#0abab5]/40">
              <div className="p-5 md:p-6 h-full flex flex-col">
                <div className="w-8 h-8 mb-3 text-[#a8e4e3] bg-[#0abab5] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-medium mb-2 group-hover:text-[#0abab5] transition-colors">
                  {t('landing.feature.token', 'Token Rewards')}
                </h2>
                <p className="font-light text-xs text-gray-300 group-hover:text-white transition-colors">
                  {t('landing.feature.token.description', 'Earn Whoomi tokens by completing daily conversations and develop your character.')}
                </p>
              </div>
            </div>
            <div className="glassmorphism-card group bg-black border border-[#0abab5]/40">
              <div className="p-5 md:p-6 h-full flex flex-col">
                <div className="w-8 h-8 mb-3 text-[#a8e4e3] bg-[#0abab5] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h2 className="text-base font-medium mb-2 group-hover:text-[#0abab5] transition-colors">
                  {t('landing.feature.nft', 'NFT Minting')}
                </h2>
                <p className="font-light text-xs text-gray-300 group-hover:text-white transition-colors">
                  {t('landing.feature.nft.description', 'Mint your virtual human as an NFT whenever you want and prove your ownership.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-[#0abab5]/20 bg-black/60 backdrop-blur-md z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/logo.svg" alt="Whoomi Logo" className="h-4 w-4 mr-2" />
              <span className="text-xs text-white">© {new Date().getFullYear()} Whoomi. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-xs text-white hover:text-[#0abab5] transition-colors">Terms</a>
              <a href="#" className="text-xs text-white hover:text-[#0abab5] transition-colors">Privacy</a>
              <a href="#" className="text-xs text-white hover:text-[#0abab5] transition-colors">FAQ</a>
              <a href="#" className="text-xs text-white hover:text-[#0abab5] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 