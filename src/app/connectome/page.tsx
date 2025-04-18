'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ConnectomeVisualization from '@/components/ConnectomeVisualization';
import { simpleSampleConnectome } from '@/data/sampleConnectome';
import { Connectome } from '@/types/character';
import { syncUserDopples, Dopple as SupabaseDopple } from '@/lib/supabase';

interface Dopple {
  id: string | number;
  name: string;
  image?: string;
  image_url?: string;
  level?: number;
  description?: string;
  connectome?: any;
}

const ConnectomePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userDopples, setUserDopples] = useState<Dopple[]>([]);
  const [selectedDopple, setSelectedDopple] = useState<Dopple | null>(null);
  const [viewMode, setViewMode] = useState<'individual' | 'relation'>('individual');
  const [noDopples, setNoDopples] = useState(false);

  // Load user dopples on mount
  useEffect(() => {
    setMounted(true);
    
    // Authentication check
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    
    // Get user's dopples
    if (mounted && isAuthenticated && user) {
      const fetchUserDopples = async () => {
        try {
          const userId = typeof user === 'string' ? user : user?.id || '';
          if (!userId) return;
          
          // Get dopple info from server (cache first)
          const dopples = await syncUserDopples(userId);
          
          if (dopples && dopples.length > 0) {
            // Convert to Dopple type
            const formattedDopples: Dopple[] = dopples.map((d: SupabaseDopple): Dopple => ({
              id: d.id,
              name: d.name,
              image: d.image_url,
              image_url: d.image_url,
              level: d.level || 1,
              connectome: d.connectome
            }));
            
            setUserDopples(formattedDopples);
            setSelectedDopple(formattedDopples[0]);
            console.log("User dopples loaded:", formattedDopples.length);
          } else {
            console.log("User has no dopples.");
            setNoDopples(true);
          }
        } catch (error) {
          console.error("Error loading dopples:", error);
          
          // Use local storage on error
          const userDopplesJSON = localStorage.getItem('userDopples');
          if (userDopplesJSON) {
            try {
              const cachedDopples = JSON.parse(userDopplesJSON);
              
              // Format cached data
              const formattedCacheDopples: Dopple[] = cachedDopples.map((d: any): Dopple => ({
                id: d.id,
                name: d.name,
                image: d.image_url || d.image,
                image_url: d.image_url,
                level: d.level || 1,
                connectome: d.connectome
              }));
              
              setUserDopples(formattedCacheDopples);
              if (formattedCacheDopples.length > 0) {
                setSelectedDopple(formattedCacheDopples[0]);
              } else {
                setNoDopples(true);
              }
            } catch (e) {
              console.error("Error parsing local storage:", e);
              setNoDopples(true);
            }
          } else {
            setNoDopples(true);
          }
        }
      };
      
      fetchUserDopples();
    }
  }, [mounted, isAuthenticated, user, router]);

  // Don't render until component is mounted
  if (!mounted || isLoading) return null;
  
  // If user has no dopples
  if (noDopples) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Connectome Network</h1>
          
          <div className="glassmorphism-card p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Please Create a Dopple First</h2>
            <p className="text-gray-400 mb-6">You need a dopple to visualize the connectome network.</p>
            <Link
              href="/create-dopple"
              className="inline-block bg-[#0abab5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0abab5]/80 transition-colors"
            >
              Create Dopple
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Connectome Network</h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Whoomi's dopples form internal structures by connecting emotions, topics, and values through a semantic memory system called 'connectome'.
              This network evolves through conversation and visualizes how dopples understand users.
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="mt-4 md:mt-0 flex p-1 bg-gray-800 rounded-lg">
            <button
              className={`px-4 py-1.5 rounded-md text-sm ${viewMode === 'individual' ? 'bg-[#0abab5] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setViewMode('individual')}
            >
              Individual Dopple Connectome
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-sm ${viewMode === 'relation' ? 'bg-[#0abab5] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setViewMode('relation')}
            >
              Dopple Relationships
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Dopple Selection */}
          <div className="lg:col-span-1">
            <div className="glassmorphism-card p-4">
              <h2 className="text-xl font-semibold mb-4">My Dopples</h2>
              
              {/* Dopple Selection List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {userDopples.map(dopple => (
                  <button
                    key={dopple.id}
                    className={`w-full flex items-center p-3 rounded-lg transition-all ${
                      selectedDopple?.id === dopple.id
                        ? 'bg-[#0abab5]/20 border border-[#0abab5]'
                        : 'bg-gray-800/60 border border-gray-700 hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedDopple(dopple)}
                  >
                    <img
                      src={dopple.image}
                      alt={dopple.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/100x100/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${dopple.name.charAt(0)}`;
                      }}
                    />
                    <div className="text-left">
                      <p className="font-medium">{dopple.name}</p>
                      <p className="text-xs text-[#0abab5]">Lv. {dopple.level}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Detail Link */}
              {selectedDopple && (
                <div className="mt-4 space-y-2">
                  <Link
                    href={`/connectome/${selectedDopple.id}`}
                    className="block w-full text-center py-2 px-4 bg-[#0abab5]/10 hover:bg-[#0abab5]/20 border border-[#0abab5]/30 rounded-lg text-[#0abab5] transition-colors"
                  >
                    View Detailed Connectome
                  </Link>
                  <Link
                    href={`/chat/${selectedDopple.id}`}
                    className="block w-full text-center py-2 px-4 bg-[#0abab5]/5 hover:bg-[#0abab5]/10 border border-[#0abab5]/20 rounded-lg text-[#0abab5]/80 transition-colors"
                  >
                    Develop Connectome Through Conversation
                  </Link>
                </div>
              )}
            </div>
            
            {/* Connectome Explanation Card */}
            <div className="glassmorphism-card p-4 mt-4">
              <h2 className="text-base font-semibold mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#0abab5]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
                </svg>
                What is a Connectome?
              </h2>
              <p className="text-xs text-gray-300 mb-3">
                A connectome is a psychological network formed by dopples through conversation. Unlike simple memory storage, it analyzes semantic relationships
                between emotions and topics to help dopples understand users more deeply.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-[#0abab5] mt-1.5 mr-2"></div>
                  <p className="text-gray-300"><span className="text-[#0abab5] font-medium">Nodes</span>: Elements like emotions, topics, and values</p>
                </div>
                <div className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-[#0abab5] mt-1.5 mr-2"></div>
                  <p className="text-gray-300"><span className="text-[#0abab5] font-medium">Edges</span>: Connections and strengths between nodes</p>
                </div>
                <div className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-[#0abab5] mt-1.5 mr-2"></div>
                  <p className="text-gray-300"><span className="text-[#0abab5] font-medium">Memory Nodes</span>: Special nodes containing important memories</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="glassmorphism-card p-4">
              {viewMode === 'individual' ? (
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedDopple ? `${selectedDopple.name}'s Connectome` : 'Please select a dopple'}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Dopples form their personality through trait networks. Click on nodes to see detailed information.
                  </p>
                  
                  {/* Individual Connectome Visualization */}
                  <div className="h-[400px] w-full">
                    <ConnectomeVisualization
                      connectome={selectedDopple?.connectome || simpleSampleConnectome}
                      width={800}
                      height={400}
                      darkMode={true}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Relationship Network</h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Visualize relationships between dopples, analyzing trait similarities and interactions.
                  </p>
                  
                  {/* Relation View Placeholder */}
                  <div className="h-[400px] w-full flex flex-col items-center justify-center bg-gray-800/30 rounded-lg">
                    <div className="animate-pulse mb-2">
                      <svg className="w-16 h-16 text-[#0abab5]/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.5 10a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm-11 0a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM13 2a5 5 0 110 10 5 5 0 010-10z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-center">
                      Dopple relationship network is under development. Coming soon.
                    </p>
                    <p className="text-gray-500 text-sm mt-2 max-w-md text-center">
                      Future updates will visualize more complex social networks by analyzing relationships and conversation patterns between dopples.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Connectome Stats */}
            <div className="glassmorphism-card p-4 mt-4">
              <h2 className="text-xl font-semibold mb-3">Connectome Analysis</h2>
              
              {selectedDopple ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Trait Nodes</p>
                    <p className="text-xl font-bold text-[#0abab5]">
                      {selectedDopple?.connectome?.nodes?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Relationship Edges</p>
                    <p className="text-xl font-bold text-[#0abab5]">
                      {selectedDopple?.connectome?.edges?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Primary Trait</p>
                    <p className="text-base font-medium text-white truncate">
                      {selectedDopple?.connectome?.nodes?.[0]?.name || 'None'}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Network Complexity</p>
                    <p className="text-base font-medium text-white">
                      {getNetworkComplexity(selectedDopple?.connectome)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Select a dopple to see analysis results.</p>
              )}
            </div>
            
            {/* How Connectome Works */}
            <div className="glassmorphism-card p-4 mt-4">
              <h2 className="text-xl font-semibold mb-3">How Connectome Works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/40 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-[#0abab5]">Conversation Analysis</h3>
                  <p className="text-xs text-gray-300">
                    Extracts emotions, topics, and traits from conversations to create nodes. Repeated patterns strengthen nodes.
                  </p>
                </div>
                <div className="bg-gray-800/40 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-[#0abab5]">Relationship Formation</h3>
                  <p className="text-xs text-gray-300">
                    Nodes appearing in the same context connect to each other, strengthening or weakening through conversation.
                  </p>
                </div>
                <div className="bg-gray-800/40 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-[#0abab5]">Memory Formation</h3>
                  <p className="text-xs text-gray-300">
                    Important conversations become memory nodes that are preserved, with core connections maintained over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this helper function to calculate network complexity  
function getNetworkComplexity(connectome?: Connectome) {
  if (!connectome || !connectome.nodes || !connectome.edges) return 'Low';
  
  const nodeCount = connectome.nodes.length;
  const edgeCount = connectome.edges.length;
  
  // Complexity calculation (based on node count and edge count)
  if (nodeCount > 15 && edgeCount > 30) return 'Very High';
  if (nodeCount > 10 && edgeCount > 20) return 'High';
  if (nodeCount > 5 && edgeCount > 10) return 'Medium';
  return 'Low';
}

export default ConnectomePage; 