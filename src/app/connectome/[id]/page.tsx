'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ConnectomeVisualization from '@/components/ConnectomeVisualization';
import ConnectomeReport from '@/components/ConnectomeReport';
import { sampleConnectome } from '@/data/sampleConnectome';
import { Connectome } from '@/types/character';
import { getDoppleWithCache, saveDoppleWithCache, Dopple } from '@/lib/supabase';

// Improved Connectome detail page with better data handling
export default function ConnectomeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const doppleId = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dopple, setDopple] = useState<Dopple | null>(null);
  const [connectome, setConnectome] = useState<Connectome | null>(null);
  const [activeView, setActiveView] = useState<'view' | 'analyze'>('view');
  const [conversationCount, setConversationCount] = useState(0);
  const [lastInteractionDate, setLastInteractionDate] = useState<string | null>(null);

  // Fetch dopple data
  useEffect(() => {
    async function fetchDoppleData() {
      if (!doppleId) {
        setError('도플 ID가 유효하지 않습니다.');
        setIsLoading(false);
        return;
      }

      // Ensure user is authenticated
      if (!authLoading && !isAuthenticated) {
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get dopple data from cache or Supabase
        const fetchedDopple = await getDoppleWithCache(doppleId);
        
        if (!fetchedDopple) {
          setError('도플을 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }
        
        setDopple(fetchedDopple);
        
        // Set conversation stats if available in metadata
        if (fetchedDopple.metadata) {
          setConversationCount(fetchedDopple.metadata.conversation_count || 0);
          setLastInteractionDate(fetchedDopple.metadata.last_interaction_date || null);
        }
        
        // Check if dopple has connectome data
        if (fetchedDopple.connectome && 
            fetchedDopple.connectome.nodes && 
            fetchedDopple.connectome.nodes.length > 0) {
          setConnectome(fetchedDopple.connectome as Connectome);
        } else {
          // Generate default connectome based on dopple traits and interests
          const defaultConnectome = generateDefaultConnectome(fetchedDopple);
          setConnectome(defaultConnectome);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dopple data:', err);
        setError('도플 데이터를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    }
    
    if (!authLoading) {
      fetchDoppleData();
    }
  }, [doppleId, authLoading, isAuthenticated, router]);

  // Generate a default connectome based on dopple data
  function generateDefaultConnectome(dopple: Dopple): Connectome {
    // If dopple has traits, interests, or personality data, use them to create nodes
    const nodes: Connectome['nodes'] = [];
    const edges: Connectome['edges'] = [];
    
    // Extract traits if available or add default ones
    if (dopple.traits && Array.isArray(dopple.traits) && dopple.traits.length > 0) {
      dopple.traits.forEach((trait, index) => {
        nodes.push({
          id: `trait_${index+1}`,
          name: trait,
          type: 'trait',
          strength: 7 + Math.floor(Math.random() * 4), // Random strength between 7-10
        });
      });
    } else {
      // Add default traits
      const defaultTraits = ['창의성', '호기심', '감수성', '인내심', '개방성'];
      defaultTraits.forEach((trait, index) => {
        nodes.push({
          id: `trait_${index+1}`,
          name: trait,
          type: 'trait',
          strength: 7 + Math.floor(Math.random() * 4), // Random strength between 7-10
        });
      });
    }
    
    // Extract interests if available or add default ones
    if (dopple.interests && Array.isArray(dopple.interests) && dopple.interests.length > 0) {
      dopple.interests.forEach((interest, index) => {
        nodes.push({
          id: `interest_${index+1}`,
          name: interest,
          type: 'interest',
          strength: 6 + Math.floor(Math.random() * 5), // Random strength between 6-10
        });
      });
    } else {
      // Add default interests
      const defaultInterests = ['음악', '미술', '여행', '기술', '문학'];
      defaultInterests.forEach((interest, index) => {
        nodes.push({
          id: `interest_${index+1}`,
          name: interest,
          type: 'interest',
          strength: 6 + Math.floor(Math.random() * 5), // Random strength between 6-10
        });
      });
    }
    
    // Add default emotions and values
    const defaultEmotions = ['기쁨', '열정', '호기심', '행복'];
    const defaultValues = ['자유', '성장', '창의성', '진정성'];
    
    defaultEmotions.forEach((emotion, index) => {
      nodes.push({
        id: `emotion_${index+1}`,
        name: emotion,
        type: 'emotion',
        strength: 6 + Math.floor(Math.random() * 4), // Random strength between 6-9
      });
    });
    
    defaultValues.forEach((value, index) => {
      nodes.push({
        id: `value_${index+1}`,
        name: value,
        type: 'value',
        strength: 7 + Math.floor(Math.random() * 3), // Random strength between 7-9
      });
    });
    
    // Generate connections between nodes with more realistic patterns
    // Connect traits to interests
    nodes.filter(node => node.type === 'trait').forEach(traitNode => {
      nodes.filter(node => node.type === 'interest').forEach(interestNode => {
        // 40% chance for a trait to connect to an interest
        if (Math.random() < 0.4) {
          const weight = 2 + Math.floor(Math.random() * 6); // Positive connection 2-7
          edges.push({
            source: traitNode.id,
            target: interestNode.id,
            weight: weight
          });
        }
      });
    });
    
    // Connect traits to emotions
    nodes.filter(node => node.type === 'trait').forEach(traitNode => {
      nodes.filter(node => node.type === 'emotion').forEach(emotionNode => {
        // 30% chance for a trait to connect to an emotion
        if (Math.random() < 0.3) {
          const weight = Math.floor(Math.random() * 10) - 2; // -2 to 7
          if (weight !== 0) {
            edges.push({
              source: traitNode.id,
              target: emotionNode.id,
              weight: weight
            });
          }
        }
      });
    });
    
    // Connect interests to emotions (usually positive)
    nodes.filter(node => node.type === 'interest').forEach(interestNode => {
      nodes.filter(node => node.type === 'emotion').forEach(emotionNode => {
        // 35% chance for an interest to connect to an emotion
        if (Math.random() < 0.35) {
          const weight = 3 + Math.floor(Math.random() * 5); // Positive connection 3-7
          edges.push({
            source: interestNode.id,
            target: emotionNode.id,
            weight: weight
          });
        }
      });
    });
    
    // Connect values to traits and interests
    nodes.filter(node => node.type === 'value').forEach(valueNode => {
      // Connect values to traits
      nodes.filter(node => node.type === 'trait').forEach(traitNode => {
        // 30% chance
        if (Math.random() < 0.3) {
          const weight = 2 + Math.floor(Math.random() * 6); // Positive connection 2-7
          edges.push({
            source: valueNode.id,
            target: traitNode.id,
            weight: weight
          });
        }
      });
      
      // Connect values to interests
      nodes.filter(node => node.type === 'interest').forEach(interestNode => {
        // 25% chance
        if (Math.random() < 0.25) {
          const weight = 3 + Math.floor(Math.random() * 5); // Positive connection 3-7
          edges.push({
            source: valueNode.id,
            target: interestNode.id,
            weight: weight
          });
        }
      });
    });
    
    // Add some direct connections within types for complexity
    // Traits to traits
    for (let i = 0; i < nodes.filter(n => n.type === 'trait').length; i++) {
      for (let j = i + 1; j < nodes.filter(n => n.type === 'trait').length; j++) {
        if (Math.random() < 0.3) {
          const traitNodes = nodes.filter(n => n.type === 'trait');
          const weight = Math.floor(Math.random() * 10) - 2; // -2 to 7
          if (weight !== 0) {
            edges.push({
              source: traitNodes[i].id,
              target: traitNodes[j].id,
              weight: weight
            });
          }
        }
      }
    }
    
    // Add negative relationships between some emotions
    const emotionNodes = nodes.filter(n => n.type === 'emotion');
    if (emotionNodes.length >= 2) {
      // 50% chance to add one negative relationship between emotions
      if (Math.random() < 0.5) {
        const idx1 = Math.floor(Math.random() * emotionNodes.length);
        let idx2 = Math.floor(Math.random() * emotionNodes.length);
        while (idx1 === idx2) {
          idx2 = Math.floor(Math.random() * emotionNodes.length);
        }
        
        const weight = -1 * (1 + Math.floor(Math.random() * 5)); // Negative connection -1 to -5
        edges.push({
          source: emotionNodes[idx1].id,
          target: emotionNodes[idx2].id,
          weight: weight
        });
      }
    }
    
    return { nodes, edges };
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-[#0abab5] border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">도플 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dopple || !connectome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans pt-20 px-4 flex items-center justify-center">
        <div className="glassmorphism-card p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-4">{error || '데이터를 불러올 수 없습니다'}</h2>
          <p className="text-gray-400 mb-6">도플 데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.</p>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-2 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white rounded-lg transition-colors"
            >
              다시 시도
            </button>
            <Link href="/connectome" className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              컨넥텀 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/connectome" className="mr-3 p-2 hover:bg-gray-800/80 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">{dopple.name}의 컨넥텀</h1>
            </div>
            <p className="text-gray-400 ml-10">Lv. {dopple.level || 1} Dopple</p>
          </div>
        </div>
        
        {/* View Tabs */}
        <div className="mb-6">
          <div className="flex p-1 bg-gray-800/80 rounded-lg inline-flex">
            <button
              className={`px-4 py-1.5 rounded-md text-sm ${activeView === 'view' ? 'bg-[#0abab5] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveView('view')}
            >
              시각화
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-sm ${activeView === 'analyze' ? 'bg-[#0abab5] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveView('analyze')}
            >
              분석
            </button>
          </div>
        </div>
        
        {/* Dopple Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="glassmorphism-card p-4">
              <div className="flex items-center mb-4">
                <img
                  src={dopple.image_url}
                  alt={dopple.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/128x128/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${dopple.name.charAt(0)}`;
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold">{dopple.name}</h2>
                  <p className="text-sm text-[#0abab5]">Lv. {dopple.level || 1} Dopple</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                {dopple.description || '이 도플에 대한 설명이 없습니다.'}
              </p>
              
              {/* Conversation Stats */}
              <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                <h3 className="text-xs text-gray-400 mb-2">대화 통계</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">총 대화 횟수</span>
                  <span className="font-medium text-[#0abab5]">{conversationCount}회</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">마지막 대화</span>
                  <span className="font-medium text-[#0abab5]">
                    {lastInteractionDate 
                      ? new Date(lastInteractionDate).toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'}) 
                      : '없음'}
                  </span>
                </div>
              </div>
              
              {/* Connectome Stats */}
              <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                <h3 className="text-xs text-gray-400 mb-2">커넥텀 상태</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">성격 요소</span>
                  <span className="font-medium text-[#0abab5]">{connectome?.nodes.length || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">연결 관계</span>
                  <span className="font-medium text-[#0abab5]">{connectome?.edges.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">네트워크 복잡도</span>
                  <span className="font-medium text-[#0abab5]">
                    {connectome ? getNetworkComplexity(connectome) : '낮음'}
                  </span>
                </div>
              </div>
              
              {/* Node Type Distribution */}
              <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                <h3 className="text-xs text-gray-400 mb-2">성격 요소 유형 분포</h3>
                {connectome && ['trait', 'interest', 'emotion', 'value'].map(type => {
                  const count = connectome.nodes.filter(node => node.type === type).length;
                  const percentage = Math.round((count / connectome.nodes.length) * 100) || 0;
                  
                  return (
                    <div key={type} className="mb-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{getNodeTypeName(type)}</span>
                        <span>{count}개 ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${getNodeTypeColor(type)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Info about Connectome */}
              <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                <h3 className="text-xs text-white mb-2">커넥텀이란?</h3>
                <p className="text-xs text-gray-300 mb-2">
                  커넥텀은 대화를 통해 형성되는 도플의 내적 성격 구조입니다. 
                  다양한 성격 요소들과 그 연결 관계가 도플의 고유한 성격을 만듭니다.
                </p>
                <p className="text-xs text-[#0abab5]">
                  ✨ 도플과 더 많이 대화하여 커넥텀을 발전시키세요!
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-2">
                <Link
                  href={`/chat/${dopple.id}`}
                  className="block w-full text-center py-2 bg-[#0abab5]/10 hover:bg-[#0abab5]/20 border border-[#0abab5]/30 rounded-lg text-[#0abab5] text-sm transition-colors"
                >
                  이 도플과 대화하기
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="glassmorphism-card p-4" style={{ minHeight: '600px' }}>
              {activeView === 'view' && connectome && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">특성 연결망 시각화</h2>
                  <div className="bg-gray-800/50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-300">
                      <span className="text-[#0abab5] font-medium">커넥텀은 도플과의 대화를 통해 자동으로 형성됩니다.</span> 이 시각화는 
                      도플의 성격 특성, 관심사, 감정, 가치관이 어떻게 서로 연결되어 있는지 보여줍니다. 
                      더 많은 대화를 나눌수록 성격 요소와 그 연결 관계가 풍부해집니다.
                    </p>
                  </div>
                  <div className="h-[500px]">
                    <ConnectomeVisualization
                      connectome={connectome}
                      width={800}
                      height={500}
                      darkMode={true}
                    />
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#ff7b00] mr-2"></div>
                      <span className="text-xs text-gray-300">성격 특성</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#0066cc] mr-2"></div>
                      <span className="text-xs text-gray-300">관심사</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#e63946] mr-2"></div>
                      <span className="text-xs text-gray-300">감정</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#2a9d8f] mr-2"></div>
                      <span className="text-xs text-gray-300">가치관</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeView === 'analyze' && connectome && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">특성 연결망 분석</h2>
                  <div className="bg-gray-800/50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-300">
                      이 분석은 도플의 성격 요소와 연결 관계를 기반으로 도플의 성격적 특징과 경향을 보여줍니다.
                      <span className="block mt-2 text-[#0abab5]">대화를 통해 커넥텀이 진화함에 따라 이 분석 결과도 점차 변화합니다.</span>
                    </p>
                  </div>
                  <ConnectomeReport connectome={connectome} darkMode={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getNetworkComplexity(connectome: Connectome): string {
  const nodeCount = connectome.nodes.length;
  const edgeCount = connectome.edges.length;
  
  if (nodeCount > 15 && edgeCount > 30) return '매우 높음';
  if (nodeCount > 10 && edgeCount > 20) return '높음';
  if (nodeCount > 5 && edgeCount > 10) return '중간';
  return '낮음';
}

function getNodeTypeName(type: string): string {
  switch (type) {
    case 'trait': return '성격 특성';
    case 'interest': return '관심사';
    case 'emotion': return '감정';
    case 'value': return '가치관';
    default: return type;
  }
}

function getNodeTypeColor(type: string): string {
  switch (type) {
    case 'trait': return 'bg-[#ff7b00]';
    case 'interest': return 'bg-[#0066cc]';
    case 'emotion': return 'bg-[#e63946]';
    case 'value': return 'bg-[#2a9d8f]';
    default: return 'bg-gray-500';
  }
} 