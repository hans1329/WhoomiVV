'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Token package type definition
interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  discount: number;
  popular: boolean;
  features: string[];
}

// Token package product data
const tokenPackages: TokenPackage[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    tokens: 100,
    price: 0.01,
    discount: 0,
    popular: false,
    features: [
      'Create Dopple (1 time)',
      'Dopple chat (50 times)',
      'Image regeneration (5 times)'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Package',
    tokens: 500,
    price: 0.04,
    discount: 20,
    popular: true,
    features: [
      'Create Dopple (5 times)',
      'Dopple chat (250 times)',
      'Image regeneration (25 times)',
      'Dopple NFT minting (2 times)'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Package',
    tokens: 1000,
    price: 0.07,
    discount: 30,
    popular: false,
    features: [
      'Create Dopple (10 times)',
      'Dopple chat (500 times)',
      'Unlimited image regeneration',
      'Dopple NFT minting (5 times)',
      'VIP special style options'
    ]
  }
];

export default function TokenShop() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Check authentication status - redirect to main page if not logged in
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    // 현재 토큰 잔액 불러오기
    if (mounted && user) {
      const userId = typeof user === 'string' ? user : user?.id;
      try {
        const tokenData = localStorage.getItem(`token_balance_${userId}`);
        if (tokenData) {
          setTokenBalance(JSON.parse(tokenData));
        }
      } catch (error) {
        console.error('Error loading token balance:', error);
      }
    }
  }, [isAuthenticated, isLoading, mounted, router, user]);

  // 토큰 추가 함수
  const addTokensToBalance = (amount: number) => {
    if (!user) return;
    
    const userId = typeof user === 'string' ? user : user?.id;
    const newBalance = tokenBalance + amount;
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`token_balance_${userId}`, JSON.stringify(newBalance));
    setTokenBalance(newBalance);
  };

  // Token purchase handler
  const handlePurchase = async () => {
    if (!selectedPackage) {
      setStatusMessage('Please select a package');
      return;
    }

    setIsPurchasing(true);
    setPurchaseStatus('idle');
    setStatusMessage('');

    try {
      // In a real implementation, connect to Ethereum payment transaction
      // Here we simulate with a mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set 90% chance of success, 10% chance of failure
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        // 구매한 패키지 찾기
        const purchasedPackage = tokenPackages.find(pkg => pkg.id === selectedPackage);
        
        if (purchasedPackage) {
          // 토큰 잔액에 추가
          addTokensToBalance(purchasedPackage.tokens);
        }
        
        setPurchaseStatus('success');
        setStatusMessage(`토큰 ${purchasedPackage?.tokens}개 구매 완료! 현재 잔액: ${tokenBalance + (purchasedPackage?.tokens || 0)} WHM`);
        
        // Redirect to dashboard after purchase (after 3 seconds)
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setPurchaseStatus('error');
        setStatusMessage('An error occurred during token purchase. Please try again.');
      }
    } catch (error) {
      console.error('Token purchase error:', error);
      setPurchaseStatus('error');
      setStatusMessage('A network error occurred. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Calculate original price (before discount)
  const calculateOriginalPrice = (price: number, discount: number) => {
    return discount > 0 ? price / (1 - discount / 100) : price;
  };

  // Format address function
  const formatAddress = (address: string | undefined | null): string => {
    if (!address) return 'Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!mounted || isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-60 h-60 bg-[#0abab5] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-0 -right-20 w-60 h-60 bg-[#0abab5]/70 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 left-20 w-60 h-60 bg-[#0abab5]/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
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
              <Link href="/chat" className="text-white text-sm hover:text-[#0abab5] transition-colors">Chat</Link>
              <Link href="/token-shop" className="text-[#0abab5] text-sm font-medium">Token Shop</Link>
            </div>
            
            {/* Wallet Info */}
            {isAuthenticated && (
              <div className="flex items-center">
                {/* 토큰 잔액 표시 */}
                <div className="text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full flex items-center mr-2">
                  <svg className="w-3 h-3 mr-1 text-[#0abab5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                  <span className="font-medium text-[#0abab5]">{tokenBalance} WHM</span>
                </div>
                
                <div className="text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full flex items-center">
                  <span className="font-medium text-[#0abab5]">
                    {typeof user === 'string' 
                      ? formatAddress(user)
                      : formatAddress(user?.id)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-20 px-4 z-10 relative">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-2 text-white">토큰 충전</h1>
          <p className="text-gray-400 mb-8">WHM 토큰을 구매하여 더 많은 기능을 이용해보세요</p>
          
          {/* 현재 토큰 잔액 */}
          <div className="bg-black/40 border border-[#0abab5]/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#0abab5]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
              현재 토큰 잔액
            </h2>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-[#0abab5]">{tokenBalance} <span className="text-lg font-normal text-gray-400">WHM</span></div>
              <div className="text-gray-400 text-sm">토큰 구매 후 자동으로 잔액에 추가됩니다</div>
            </div>
          </div>
          
          {/* Token Usage Guide */}
          <div className="bg-black/40 border border-[#0abab5]/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              WHM Token Usage Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#0abab5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Dopple Chat</h3>
                <p className="text-sm text-gray-400">Chatting with Dopples costs 2 tokens per message. Get more tokens for deeper conversations.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#0abab5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Dopple Creation & Images</h3>
                <p className="text-sm text-gray-400">Creating a new Dopple costs 50 tokens, and image regeneration costs 20 tokens.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#0abab5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">NFT Minting</h3>
                <p className="text-sm text-gray-400">Minting a Dopple as an NFT costs 100 tokens. Own your special Dopple permanently.</p>
              </div>
            </div>
          </div>
          
          {/* Package Selection */}
          <h2 className="text-xl font-bold mb-4 text-white">패키지 선택</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tokenPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`bg-black/40 border-2 rounded-xl p-6 backdrop-blur-sm transition-all cursor-pointer hover:shadow-lg ${
                  selectedPackage === pkg.id 
                    ? 'border-[#0abab5]' 
                    : 'border-transparent hover:border-[#0abab5]/50'
                } ${pkg.popular ? 'relative overflow-hidden' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#0abab5] text-white text-xs px-3 py-1 rounded-bl-lg">
                      Popular
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  <div className="flex items-baseline mt-2">
                    <span className="text-2xl font-bold text-white">{pkg.price} ETH</span>
                    {pkg.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        {calculateOriginalPrice(pkg.price, pkg.discount).toFixed(2)} ETH
                      </span>
                    )}
                  </div>
                  {pkg.discount > 0 && (
                    <span className="inline-block bg-[#0abab5]/20 text-[#0abab5] text-xs rounded px-2 py-1 mt-2">
                      Save {pkg.discount}%
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#0abab5]/10 flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-[#0abab5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-[#0abab5]">{pkg.tokens} WHM</span>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4 mb-4">
                  <h4 className="text-sm font-medium mb-2">Includes:</h4>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-[#0abab5] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    selectedPackage === pkg.id
                      ? 'bg-[#0abab5] text-white'
                      : 'bg-white/10 text-white hover:bg-[#0abab5]/80'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPackage(pkg.id);
                  }}
                >
                  {selectedPackage === pkg.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
          
          {/* Payment Section */}
          <div className="bg-black/40 border border-[#0abab5]/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-medium mb-6">Complete Purchase</h2>
            
            {selectedPackage ? (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h3 className="font-medium">
                      {tokenPackages.find(pkg => pkg.id === selectedPackage)?.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {tokenPackages.find(pkg => pkg.id === selectedPackage)?.tokens} WHM Tokens
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="text-xl font-bold text-white">
                      {tokenPackages.find(pkg => pkg.id === selectedPackage)?.price} ETH
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="font-bold">
                      {tokenPackages.find(pkg => pkg.id === selectedPackage)?.price} ETH
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-6">
                    Payments are processed securely via Ethereum blockchain
                  </div>
                </div>
                
                <button 
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isPurchasing
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#0abab5] hover:bg-[#0abab5]/80'
                  }`}
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Purchase Now'
                  )}
                </button>
                
                {purchaseStatus !== 'idle' && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    purchaseStatus === 'success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {statusMessage}
                  </div>
                )}
                
                {statusMessage === '' && selectedPackage && (
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    By clicking "Purchase Now", you agree to our Terms of Service and Privacy Policy
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">Please select a package to continue</div>
              </div>
            )}
          </div>
          
          {/* FAQ Section */}
          <div className="bg-black/40 border border-[#0abab5]/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-medium mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">What are WHM tokens?</h3>
                <p className="text-sm text-gray-400">
                  WHM tokens are the utility tokens used within the Whoomi platform. They allow you to interact with Dopples, create new ones, and unlock premium features.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">How can I pay for tokens?</h3>
                <p className="text-sm text-gray-400">
                  Currently, we accept Ethereum (ETH) for token purchases. We plan to add more payment methods in the future.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Do tokens expire?</h3>
                <p className="text-sm text-gray-400">
                  No, WHM tokens do not expire. Once purchased, they remain in your account until used.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Can I transfer tokens to another account?</h3>
                <p className="text-sm text-gray-400">
                  Not at this time. WHM tokens are linked to your account and cannot be transferred to other users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/60 border-t border-[#0abab5]/20 py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
              <span className="text-sm font-semibold text-white">Whoomi</span>
            </div>
            
            <div className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Whoomi Technologies. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 