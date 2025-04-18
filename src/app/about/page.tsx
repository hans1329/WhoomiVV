'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-60 h-60 bg-[#0abab5] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-60 h-60 bg-[#0abab5]/70 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-60 h-60 bg-[#0abab5]/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 mt-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">About Whoomi</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              The next generation AI character platform for creating and connecting with digital versions of yourself and others.
            </p>
          </div>
          
          {/* Vision Section */}
          <div className="mb-16">
            <div className="glassmorphism-card">
              <h2 className="text-2xl font-bold mb-6 text-[#0abab5]">Our Vision</h2>
              <p className="text-gray-300 mb-4">
                Whoomi is redefining the future of AI character interactions by creating a platform where users can develop, train, and interact with digital versions of themselves and others.
              </p>
              <p className="text-gray-300 mb-4">
                We envision a world where AI characters serve as digital extensions of ourselves, capable of preserving our thoughts, memories, and personality traits. These digital dopples can interact with the world on our behalf, enabling new forms of communication, creativity, and connection that transcend physical limitations.
              </p>
              <p className="text-gray-300">
                Our goal is to build the most advanced and intuitive platform for creating and interacting with AI characters, powered by cutting-edge language models and a unique connectome system that maps relationships between ideas, emotions, and memories.
              </p>
            </div>
          </div>
          
          {/* Key Values */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glassmorphism-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0abab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Privacy First</h3>
                <p className="text-gray-400">
                  We prioritize user privacy and data security, giving you full control over your digital identity.
                </p>
              </div>
              
              <div className="glassmorphism-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0abab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Innovation</h3>
                <p className="text-gray-400">
                  We're constantly pushing the boundaries of what's possible with AI character technology.
                </p>
              </div>
              
              <div className="glassmorphism-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0abab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Community</h3>
                <p className="text-gray-400">
                  We're building a diverse, inclusive community of creators, developers, and AI enthusiasts.
                </p>
              </div>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="mb-16">
            <div className="glassmorphism-card">
              <h2 className="text-2xl font-bold mb-6 text-[#0abab5]">Our Team</h2>
              <p className="text-gray-300 mb-8">
                Whoomi was founded by a team of AI researchers, developers, and entrepreneurs passionate about the future of human-AI interaction. With backgrounds spanning artificial intelligence, neuroscience, UI/UX design, and blockchain technology, our diverse team is uniquely positioned to build the next generation of AI character tools.
              </p>
              
              <div className="text-center">
                <Link 
                  href="/features" 
                  className="inline-block px-6 py-3 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white font-medium rounded-lg transition-all"
                >
                  Explore Our Features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 bg-black/60 border-t border-[#0abab5]/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center">
                <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold text-white">Whoomi</span>
              </Link>
              <p className="text-xs text-gray-400 mt-2">© 2023 Whoomi. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-400 hover:text-[#0abab5]">About</Link>
              <Link href="/features" className="text-sm text-gray-400 hover:text-[#0abab5]">Features</Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#0abab5]">Privacy</Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-[#0abab5]">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 