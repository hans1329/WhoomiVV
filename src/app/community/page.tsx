'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaUsers, FaComments, FaExchangeAlt, FaDiscord, FaTwitter, FaGithub } from 'react-icons/fa';

export default function CommunityPage() {
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Whoomi Community</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join the growing ecosystem of AI character enthusiasts, developers, and creators shaping the future of digital identity.
            </p>
          </div>
          
          {/* Community Sections */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* User Community */}
              <div className="glassmorphism-card text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <FaUsers className="w-8 h-8 text-[#0abab5]" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">User Community</h2>
                <p className="text-gray-300 mb-6">
                  Connect with fellow dopple creators, share experiences, and discover new ways to enhance your AI character.
                </p>
                <Link 
                  href="https://discord.gg/whoomi" 
                  target="_blank"
                  className="inline-block px-4 py-2 bg-[#0abab5]/20 hover:bg-[#0abab5]/30 text-[#0abab5] font-medium rounded-lg transition-all border border-[#0abab5]/30"
                >
                  Join Discord
                </Link>
              </div>
              
              {/* Discussion Forums */}
              <div className="glassmorphism-card text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <FaComments className="w-8 h-8 text-[#0abab5]" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">Discussion Forums</h2>
                <p className="text-gray-300 mb-6">
                  Participate in discussions about AI ethics, character development, and the future of digital identity technology.
                </p>
                <Link 
                  href="/forums" 
                  className="inline-block px-4 py-2 bg-[#0abab5]/20 hover:bg-[#0abab5]/30 text-[#0abab5] font-medium rounded-lg transition-all border border-[#0abab5]/30"
                >
                  Explore Forums
                </Link>
              </div>
              
              {/* Developer Hub */}
              <div className="glassmorphism-card text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <FaExchangeAlt className="w-8 h-8 text-[#0abab5]" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">Developer Hub</h2>
                <p className="text-gray-300 mb-6">
                  Access APIs, developer tools, and resources to build on the Whoomi platform or integrate dopples into your applications.
                </p>
                <Link 
                  href="/docs/api" 
                  className="inline-block px-4 py-2 bg-[#0abab5]/20 hover:bg-[#0abab5]/30 text-[#0abab5] font-medium rounded-lg transition-all border border-[#0abab5]/30"
                >
                  API Documentation
                </Link>
              </div>
            </div>
          </div>
          
          {/* Upcoming Events Section */}
          <div className="mb-16">
            <div className="glassmorphism-card">
              <h2 className="text-2xl font-bold mb-8 text-[#0abab5] text-center">Upcoming Community Events</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-700/50 p-4 rounded-lg bg-gray-800/30">
                  <div className="flex flex-col md:flex-row justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Dopple Creator Workshop</h3>
                    <span className="text-[#0abab5]">January 15, 2024 • Virtual</span>
                  </div>
                  <p className="text-gray-300 mb-3">Learn advanced techniques for creating more personalized and engaging dopples from our expert team.</p>
                  <Link 
                    href="/events/dopple-workshop" 
                    className="text-sm text-[#0abab5] hover:underline"
                  >
                    Register →
                  </Link>
                </div>
                
                <div className="border border-gray-700/50 p-4 rounded-lg bg-gray-800/30">
                  <div className="flex flex-col md:flex-row justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">AI Character Ethics Roundtable</h3>
                    <span className="text-[#0abab5]">February 3, 2024 • Virtual</span>
                  </div>
                  <p className="text-gray-300 mb-3">Join the discussion on ethical considerations in AI character development and usage with industry experts.</p>
                  <Link 
                    href="/events/ethics-roundtable" 
                    className="text-sm text-[#0abab5] hover:underline"
                  >
                    Register →
                  </Link>
                </div>
                
                <div className="border border-gray-700/50 p-4 rounded-lg bg-gray-800/30">
                  <div className="flex flex-col md:flex-row justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Connectome Technology Deep Dive</h3>
                    <span className="text-[#0abab5]">February 20, 2024 • Virtual</span>
                  </div>
                  <p className="text-gray-300 mb-3">Technical session exploring the architecture and capabilities of our Connectome technology.</p>
                  <Link 
                    href="/events/connectome-deep-dive" 
                    className="text-sm text-[#0abab5] hover:underline"
                  >
                    Register →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Channels */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Connect With Us</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                href="https://discord.gg/whoomi" 
                target="_blank"
                className="flex items-center px-6 py-3 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-white font-medium rounded-lg transition-all border border-[#5865F2]/30"
              >
                <FaDiscord className="w-5 h-5 mr-2 text-[#5865F2]" />
                Discord
              </Link>
              <Link 
                href="https://twitter.com/whoomiAI" 
                target="_blank"
                className="flex items-center px-6 py-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-white font-medium rounded-lg transition-all border border-[#1DA1F2]/30"
              >
                <FaTwitter className="w-5 h-5 mr-2 text-[#1DA1F2]" />
                Twitter
              </Link>
              <Link 
                href="https://github.com/whoomi-ai" 
                target="_blank"
                className="flex items-center px-6 py-3 bg-gray-700/20 hover:bg-gray-700/30 text-white font-medium rounded-lg transition-all border border-gray-700/30"
              >
                <FaGithub className="w-5 h-5 mr-2 text-white" />
                GitHub
              </Link>
            </div>
          </div>
          
          {/* Community Guidelines */}
          <div className="text-center mb-16">
            <div className="glassmorphism-card">
              <h2 className="text-2xl font-bold mb-6 text-[#0abab5]">Community Guidelines</h2>
              <p className="text-gray-300 mb-6">
                The Whoomi community is built on respect, creativity, and a shared passion for AI technology. We expect all community members to adhere to these core principles.
              </p>
              <ul className="text-left text-gray-300 space-y-2 mb-8 max-w-xl mx-auto">
                <li className="flex items-start">
                  <span className="text-[#0abab5] mr-2">•</span>
                  <span>Be respectful and inclusive of all members regardless of background or experience level</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0abab5] mr-2">•</span>
                  <span>Share knowledge and provide constructive feedback to help others improve</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0abab5] mr-2">•</span>
                  <span>Respect intellectual property and give appropriate credit when building on others' work</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0abab5] mr-2">•</span>
                  <span>Use AI characters responsibly and ethically in all community interactions</span>
                </li>
              </ul>
              <Link 
                href="/community-guidelines" 
                className="inline-block px-6 py-3 bg-transparent hover:bg-white/10 text-white border border-white/30 font-medium rounded-lg transition-all"
              >
                Full Community Guidelines
              </Link>
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
              <Link href="/community" className="text-sm text-gray-400 hover:text-[#0abab5]">Community</Link>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-[#0abab5]">Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 