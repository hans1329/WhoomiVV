'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaBrain, FaRobot, FaUserFriends, FaLock, FaMobileAlt } from 'react-icons/fa';

export default function FeaturesPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Whoomi Features</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover the innovative tools and capabilities that make Whoomi the leading platform for AI character creation and interaction.
            </p>
          </div>
          
          {/* Key Features */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Connectome Feature */}
              <div className="glassmorphism-card">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-4">
                    <FaBrain className="w-5 h-5 text-[#0abab5]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Connectome Technology</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Our proprietary Connectome technology maps relationships between ideas, emotions, and memories, creating a neural-inspired network that represents your digital identity.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-[#0abab5] mr-2">•</span>
                    <span className="text-gray-300">Dynamic relationship mapping between concepts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0abab5] mr-2">•</span>
                    <span className="text-gray-300">Self-evolving knowledge representation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0abab5] mr-2">•</span>
                    <span className="text-gray-300">Contextual understanding of personal preferences</span>
                  </li>
                </ul>
                <div className="h-40 bg-[#0abab5]/5 rounded-lg border border-[#0abab5]/20 flex items-center justify-center">
                  <img 
                    src="/images/connectome-preview.svg" 
                    alt="Connectome Visualization" 
                    className="h-32 opacity-70"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              </div>
              
              {/* AI Character Creation */}
              <div className="glassmorphism-card">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-4">
                    <FaRobot className="w-5 h-5 text-[#0abab5]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">AI Character Creation</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Create highly personalized AI characters (dopples) that reflect your personality, interests, and communication style.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-[#0abab5] mr-2">•</span>
                    <span className="text-gray-300">Intuitive character creation wizard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0abab5] mr-2">•</span>
                    <span className="text-gray-300">Customizable personality traits and interests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0abab5] mr-2">•</span>
                    <span className="text-gray-300">AI-generated profile images</span>
                  </li>
                </ul>
                <div className="h-40 bg-[#0abab5]/5 rounded-lg border border-[#0abab5]/20 flex items-center justify-center">
                  <img 
                    src="/images/character-preview.svg" 
                    alt="Character Creation" 
                    className="h-32 opacity-70"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* More Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Additional Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dopple Zone */}
              <div className="glassmorphism-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <FaUserFriends className="w-6 h-6 text-[#0abab5]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Dopple Zone</h3>
                <p className="text-gray-400">
                  Explore a growing community of AI characters created by other users. Interact with dopples that share your interests or offer unique perspectives.
                </p>
              </div>
              
              {/* Data Privacy */}
              <div className="glassmorphism-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <FaLock className="w-6 h-6 text-[#0abab5]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Advanced Privacy</h3>
                <p className="text-gray-400">
                  State-of-the-art encryption and privacy controls give you complete ownership over your data and dopple interactions.
                </p>
              </div>
              
              {/* Cross-Platform */}
              <div className="glassmorphism-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0abab5]/20 flex items-center justify-center">
                  <FaMobileAlt className="w-6 h-6 text-[#0abab5]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Cross-Platform</h3>
                <p className="text-gray-400">
                  Access your dopples from any device with our responsive web app, and soon via native mobile applications.
                </p>
              </div>
            </div>
          </div>
          
          {/* Feature Comparison */}
          <div className="mb-16">
            <div className="glassmorphism-card">
              <h2 className="text-2xl font-bold mb-8 text-[#0abab5]">How Whoomi Compares</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-4 text-gray-300">Feature</th>
                      <th className="pb-4 text-[#0abab5]">Whoomi</th>
                      <th className="pb-4 text-gray-300">Traditional AI Assistants</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-4 text-gray-400">Personalization</td>
                      <td className="py-4 text-white">Deep personal customization with Connectome</td>
                      <td className="py-4 text-gray-400">Limited persona options</td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-4 text-gray-400">Learning</td>
                      <td className="py-4 text-white">Continuously learns from interactions</td>
                      <td className="py-4 text-gray-400">Static capabilities with periodic updates</td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-4 text-gray-400">Memory</td>
                      <td className="py-4 text-white">Maintains context across conversations</td>
                      <td className="py-4 text-gray-400">Limited conversation history</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-400">Privacy</td>
                      <td className="py-4 text-white">User-controlled data and selective sharing</td>
                      <td className="py-4 text-gray-400">Corporate data ownership models</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mb-16">
            <div className="glassmorphism-card py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Ready to Create Your Dopple?</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Join Whoomi today and start creating your personal AI character that reflects your unique personality and interests.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/login" 
                  className="px-8 py-3 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white font-medium rounded-lg transition-all"
                >
                  Get Started
                </Link>
                <Link 
                  href="/about" 
                  className="px-8 py-3 bg-transparent hover:bg-white/10 text-white border border-white/30 font-medium rounded-lg transition-all"
                >
                  Learn More
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