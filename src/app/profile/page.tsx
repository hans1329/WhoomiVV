'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import { FaUser, FaEnvelope, FaWallet, FaEdit, FaImage } from 'react-icons/fa';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    avatarUrl: '/default-avatar.png'
  });

  // Format wallet address
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
    setMounted(true);
    
    // Redirect if not authenticated
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    // Initialize profile data from user
    if (user) {
      setProfileData({
        displayName: user.displayName || 'Whoomi User',
        email: user.email || '',
        bio: user.bio || 'No bio available.',
        avatarUrl: user.avatarUrl || '/default-avatar.png'
      });
    }
  }, [user, isAuthenticated, isLoading, mounted, router]);

  // Don't render anything until component is mounted and authenticated
  if (!mounted || isLoading || !isAuthenticated) return null;

  const handleSave = () => {
    // Would save profile data to backend here
    setEditMode(false);
  };

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
      <main className="flex-grow pt-24 pb-16 px-4 z-10">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-white">Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Sidebar */}
            <div className="md:col-span-1">
              <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden border-2 border-[#0abab5]/50">
                      <img 
                        src={profileData.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    {editMode && (
                      <button className="absolute bottom-0 right-0 bg-[#0abab5] rounded-full p-2 text-white">
                        <FaImage className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-1">{profileData.displayName}</h2>
                  
                  {user?.walletAddress && (
                    <div className="text-sm text-[#0abab5] mb-4 flex items-center">
                      <FaWallet className="w-3 h-3 mr-1" />
                      {formatAddress(user.walletAddress)}
                    </div>
                  )}
                  
                  <div className="w-full text-sm bg-gray-900/50 p-4 rounded-lg text-gray-300 mb-4">
                    {editMode ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        rows={4}
                      />
                    ) : (
                      <p>{profileData.bio}</p>
                    )}
                  </div>
                  
                  {!editMode ? (
                    <button 
                      onClick={() => setEditMode(true)}
                      className="w-full flex justify-center items-center px-4 py-2 bg-[#0abab5]/10 hover:bg-[#0abab5]/20 border border-[#0abab5]/30 rounded-lg text-[#0abab5] text-sm font-medium transition-colors"
                    >
                      <FaEdit className="w-3 h-3 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3 w-full">
                      <button 
                        onClick={() => setEditMode(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-[#0abab5] hover:bg-[#0abab5]/80 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="md:col-span-2">
              <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm mb-6">
                <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Personal Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                      />
                    ) : (
                      <div className="flex items-center text-white">
                        <FaUser className="w-4 h-4 text-[#0abab5] mr-2" />
                        <span>{profileData.displayName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                      />
                    ) : (
                      <div className="flex items-center text-white">
                        <FaEnvelope className="w-4 h-4 text-[#0abab5] mr-2" />
                        <span>{profileData.email || 'No email available'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                    <div className="flex items-center text-white">
                      <FaWallet className="w-4 h-4 text-[#0abab5] mr-2" />
                      <span className="font-mono text-sm">
                        {user?.walletAddress || 'No wallet connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Account Statistics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <div className="text-gray-400 text-sm mb-1">Token Balance</div>
                    <div className="text-2xl font-bold text-[#0abab5]">{user?.tokenBalance || 0}</div>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <div className="text-gray-400 text-sm mb-1">Dopples Created</div>
                    <div className="text-2xl font-bold text-white">1</div>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <div className="text-gray-400 text-sm mb-1">Member Since</div>
                    <div className="text-lg font-medium text-white">April 2024</div>
                  </div>
                </div>
              </div>
            </div>
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