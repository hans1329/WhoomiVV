'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { WalletScan } from '@/components/wallet-scan';

export default function WalletScanPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect to login page if not authenticated
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, mounted, router]);

  // Do not render until component is mounted and user is authenticated
  if (!mounted || isLoading || !isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
      {/* Background Elements */}
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
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold text-white">Whoomi</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-white text-sm hover:text-[#0abab5] transition-colors">Dashboard</Link>
              <Link href="/dopple-zone" className="text-white text-sm hover:text-[#0abab5] transition-colors">Dopple Zone</Link>
              <Link href="/wallet-scan" className="text-[#0abab5] text-sm font-medium">Wallet Scanner</Link>
              <Link href="/marketplace" className="text-white text-sm hover:text-[#0abab5] transition-colors">Marketplace</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-20 px-4 z-10">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Wallet Scanner</h1>
            <div className="ml-4 text-sm text-gray-400">Explore any wallet on the Optimism blockchain</div>
          </div>
          
          <div className="glassmorphism-card p-6">
            <WalletScan />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="border-t border-[#0abab5]/20 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center">
                <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold text-white">Whoomi</span>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-500 text-xs">
                  © {new Date().getFullYear()} Whoomi. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 