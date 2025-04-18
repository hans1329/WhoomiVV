'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaBook, FaCode, FaUserCog, FaSearch, FaGithub, FaArrowRight } from 'react-icons/fa';

export default function DocsPage() {
  const router = useRouter();

  const popularDocs = [
    { title: "Getting Started with Whoomi", url: "/docs/getting-started", desc: "Learn the basics of creating and managing your dopples" },
    { title: "API Reference", url: "/docs/api", desc: "Complete reference for the Whoomi API endpoints" },
    { title: "Connectome Guide", url: "/docs/connectome", desc: "Understanding and leveraging the Connectome technology" },
    { title: "Authentication", url: "/docs/auth", desc: "Secure authentication methods for the Whoomi platform" }
  ];

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
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Whoomi Documentation</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Comprehensive guides, tutorials, and API reference for the Whoomi platform.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-gray-800/80 border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0abab5]/50 focus:border-transparent"
                  placeholder="Search documentation..."
                />
              </div>
            </div>
          </div>
          
          {/* Document Categories */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Guides */}
              <div className="glassmorphism-card">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-4">
                    <FaBook className="w-5 h-5 text-[#0abab5]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">User Guides</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Detailed guides for using the Whoomi platform and creating engaging AI characters.
                </p>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>
                    <Link href="/docs/getting-started" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Getting Started
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/character-creation" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Character Creation
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/chat-interactions" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Chat Interactions
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/user-guides" className="flex items-center text-white hover:text-[#0abab5]">
                      View all guides <FaArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* API Documentation */}
              <div className="glassmorphism-card">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-4">
                    <FaCode className="w-5 h-5 text-[#0abab5]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">API Reference</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Complete documentation for the Whoomi API, including endpoints, parameters, and response formats.
                </p>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>
                    <Link href="/docs/api/authentication" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Authentication
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api/dopples" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Dopples API
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api/connectome" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Connectome API
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api" className="flex items-center text-white hover:text-[#0abab5]">
                      View full API docs <FaArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Developer Guides */}
              <div className="glassmorphism-card">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-4">
                    <FaUserCog className="w-5 h-5 text-[#0abab5]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Developer Guides</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Technical resources for developers looking to integrate with or build on the Whoomi platform.
                </p>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>
                    <Link href="/docs/integration" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Integration Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/webhooks" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Webhooks
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/client-libraries" className="flex items-center text-[#0abab5] hover:underline">
                      <span className="mr-2">•</span>
                      Client Libraries
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/developers" className="flex items-center text-white hover:text-[#0abab5]">
                      View all resources <FaArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Popular Documentation */}
          <div className="mb-16">
            <div className="glassmorphism-card">
              <h2 className="text-2xl font-bold mb-8 text-[#0abab5]">Popular Documentation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularDocs.map((doc, index) => (
                  <Link key={index} href={doc.url} className="block p-4 border border-gray-700/50 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">{doc.title}</h3>
                    <p className="text-gray-400 text-sm">{doc.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* SDK and Libraries */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Official Libraries & SDKs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glassmorphism-card p-4 text-center">
                <div className="bg-gray-800/50 rounded-lg py-6 mb-4">
                  <img src="/logos/javascript.svg" alt="JavaScript" className="h-12 mx-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <h3 className="font-medium text-white">JavaScript</h3>
                <Link href="/docs/sdk/javascript" className="text-xs text-[#0abab5] hover:underline">View Docs</Link>
              </div>
              
              <div className="glassmorphism-card p-4 text-center">
                <div className="bg-gray-800/50 rounded-lg py-6 mb-4">
                  <img src="/logos/python.svg" alt="Python" className="h-12 mx-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <h3 className="font-medium text-white">Python</h3>
                <Link href="/docs/sdk/python" className="text-xs text-[#0abab5] hover:underline">View Docs</Link>
              </div>
              
              <div className="glassmorphism-card p-4 text-center">
                <div className="bg-gray-800/50 rounded-lg py-6 mb-4">
                  <img src="/logos/go.svg" alt="Go" className="h-12 mx-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <h3 className="font-medium text-white">Go</h3>
                <Link href="/docs/sdk/go" className="text-xs text-[#0abab5] hover:underline">View Docs</Link>
              </div>
              
              <div className="glassmorphism-card p-4 text-center">
                <div className="bg-gray-800/50 rounded-lg py-6 mb-4">
                  <img src="/logos/react.svg" alt="React" className="h-12 mx-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <h3 className="font-medium text-white">React</h3>
                <Link href="/docs/sdk/react" className="text-xs text-[#0abab5] hover:underline">View Docs</Link>
              </div>
            </div>
          </div>
          
          {/* GitHub CTA */}
          <div className="text-center mb-16">
            <div className="glassmorphism-card py-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Contribute to Our Documentation</h2>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Our documentation is open source. Find a typo, or want to clarify something? Contributions are welcome!
              </p>
              <Link 
                href="https://github.com/whoomi-ai/docs" 
                target="_blank"
                className="inline-flex items-center px-6 py-3 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white font-medium rounded-lg transition-all"
              >
                <FaGithub className="mr-2" />
                View on GitHub
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