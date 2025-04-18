'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/internationalization';
import { useBalance, useNetwork } from '@/lib/mock-hooks';
import { WhoomiWallet } from '@/components/embedded-wallet';
import { syncUserDopples, Dopple as SupabaseDopple } from '@/lib/supabase';
import AuthErrorDisplay from '@/components/AuthErrorDisplay';
import Header from '@/components/Header';

interface Dopple {
  id: number | string;
  name: string;
  owner: string;
  level: number;
  image: string;
  likes: number;
  description: string;
  tags: string[];
  createdAt: string;
  xp: number;
  xpToNextLevel: number;
  image_url?: string;
  conversation_count?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut, connectionError, testConnection } = useAuth();
  const { t } = useLanguage();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({ address: user?.walletAddress });
  const [mounted, setMounted] = useState(false);
  const [hasDopple, setHasDopple] = useState(false);
  const [myDopple, setMyDopple] = useState<Dopple | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // 로딩 상태를 위한 플레이스홀더 캐릭터 데이터
  const [character, setCharacter] = useState({
    name: 'My Dopple',
    level: 5,
    exp: 750,
    nextLevelExp: 1000,
    conversations: 18,
    tokens: 324,
    image: '/default-character.png'
  });
  
  // 최근 활동 목록
  const [activities, setActivities] = useState([
    { id: 1, type: 'conversation', title: 'Morning Chat', date: '2024-04-01', reward: 15 },
    { id: 2, type: 'level-up', title: 'Reached Level 5', date: '2024-03-29', reward: 50 },
    { id: 3, type: 'conversation', title: 'Personal Goals Discussion', date: '2024-03-27', reward: 12 },
    { id: 4, type: 'conversation', title: 'Favorite Movies', date: '2024-03-26', reward: 10 },
    { id: 5, type: 'mint', title: 'Minted NFT #001', date: '2024-03-25', reward: 100 },
  ]);
  
  // 토큰 보상 내역
  const [rewards, setRewards] = useState([
    { id: 1, title: 'Daily Conversation Bonus', amount: 15, date: '2024-04-01' },
    { id: 2, type: 'level-up', title: 'Level 5 Achievement', amount: 50, date: '2024-03-29' },
    { id: 3, type: 'conversation', title: 'Conversation Streak (3 days)', amount: 45, date: '2024-03-29' },
    { id: 4, type: 'mint', title: 'First Character NFT Mint', amount: 100, date: '2024-03-25' },
    { id: 5, type: 'sign-up', title: 'Welcome Bonus', amount: 100, date: '2024-03-20' },
  ]);
  
  // 도플 데이터를 가져오는 함수를 컴포넌트 레벨 함수로 분리
  const fetchUserDopplesData = async () => {
    if (!user) return;
    
    const userAddress = typeof user === 'string' ? user : user?.id;
    if (!userAddress) return;
    
    try {
      // 로컬 스토리지에서 직접 도플 데이터 확인
      if (typeof window !== 'undefined') {
        const rawCachedData = localStorage.getItem('userDopples');
        if (rawCachedData) {
          try {
            const localDopples = JSON.parse(rawCachedData);
            console.log('Loaded dopples from localStorage:', localDopples);
            
            if (localDopples && Array.isArray(localDopples) && localDopples.length > 0) {
              // 로컬 스토리지에 데이터가 있는 경우
              setHasDopple(true);
              
              // 첫 번째 도플 사용
              const dopple = localDopples[0];
              
              if (dopple) {
                console.log("Setting active dopple from localStorage:", dopple);
                console.log("Dopple ID:", dopple.id);
                setMyDopple(dopple as unknown as Dopple);
                
                // 캐릭터 정보 업데이트
                setCharacter({
                  name: dopple.name && dopple.name.trim() !== '' ? dopple.name : 'My Dopple',
                  level: dopple.level || 1,
                  exp: dopple.xp || 0,
                  nextLevelExp: 100, // 기본값으로 설정
                  conversations: dopple.conversation_count || 0, // 서버 데이터 사용
                  tokens: 100, // 기본값
                  image: dopple.image_url || '/default-character.png'
                });
                
                console.log("Updated character with name from localStorage:", dopple.name || 'My Dopple');
                
                // 성공적으로 로컬 데이터를 사용했으므로 여기서 리턴
                return;
              }
            }
          } catch (e) {
            console.error('Error parsing local dopples:', e);
          }
        } else {
          console.log('No cached dopples in localStorage');
        }
      }
      
      // 로컬 스토리지에 데이터가 없는 경우에만 Supabase 조회 시도
      // 연결 테스트
      const connectionStatus = await testConnection();
      if (!connectionStatus.connected) {
        setLoadingError("Supabase 서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.");
        return;
      }
      
      // 새로운 syncUserDopples 함수 사용 - 서버 데이터 우선, 실패 시 로컬 캐시 사용
      const dopples = await syncUserDopples(userAddress, true); // 강제 새로고침
      console.log("Fetched dopples from Supabase:", dopples);
      
      if (dopples && Array.isArray(dopples) && dopples.length > 0) {
        // 사용자의 도플이 있음
        setHasDopple(true);
        
        // 첫 번째 도플 사용
        const dopple = dopples[0];
        
        if (dopple) {
          console.log("Setting active dopple:", dopple);
          console.log("Dopple ID:", dopple.id);
          setMyDopple(dopple as unknown as Dopple);
          
          // 캐릭터 정보 업데이트
          const doppleName = dopple.name && dopple.name.trim() !== '' ? dopple.name : 'My Dopple';
          
          setCharacter({
            name: doppleName,
            level: dopple.level || 1,
            exp: dopple.xp || 0,
            nextLevelExp: 100, // 기본값으로 설정
            conversations: dopple.conversation_count || 0, // 서버 데이터 사용
            tokens: 100, // 기본값
            image: dopple.image_url || '/default-character.png'
          });
          
          console.log("Updated character with name:", doppleName);
        }
      } else {
        // 사용자의 도플이 없음
        console.log("No dopples found for user:", userAddress);
        setHasDopple(false);
      }
    } catch (error) {
      console.error("Error fetching dopples:", error);
      setLoadingError("도플 정보를 불러오는 중 오류가 발생했습니다.");
      
      // 오류 발생 시 로컬 캐시 확인
      if (typeof window !== 'undefined') {
        const cachedDopplesJSON = localStorage.getItem('userDopples');
        if (cachedDopplesJSON) {
          try {
            const cachedDopples = JSON.parse(cachedDopplesJSON);
            if (cachedDopples && cachedDopples.length > 0) {
              console.log("Using cached dopples after error:", cachedDopples);
              setHasDopple(true);
              setMyDopple(cachedDopples[0]);
              
              // 캐릭터 정보 업데이트
              const dopple = cachedDopples[0];
              const doppleName = dopple.name && dopple.name.trim() !== '' ? dopple.name : 'My Dopple';
              
              setCharacter({
                name: doppleName,
                level: dopple.level || 1,
                exp: dopple.xp || 0,
                nextLevelExp: 100, // 기본값으로 설정
                conversations: dopple.conversation_count || 0,
                tokens: 100, // 기본값
                image: dopple.image_url || '/default-character.png'
              });
              
              console.log("Updated character from cache with name:", doppleName);
            } else {
              setHasDopple(false);
            }
          } catch (e) {
            console.error("Error parsing cached dopples:", e);
            setHasDopple(false);
          }
        } else {
          setHasDopple(false);
        }
      } else {
        setHasDopple(false);
      }
    }
  };

  useEffect(() => {
    console.log("Dashboard mounted, auth state:", { isAuthenticated, user });
    setMounted(true);
    
    // 지갑이 연결되지 않은 경우 메인 페이지로 리다이렉트
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    // Supabase에서 도플 데이터 가져오기
    fetchUserDopplesData();
  }, [isAuthenticated, isLoading, mounted, user, testConnection]);
  
  // 로그인 확인 및 리디렉션
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  // 컴포넌트 마운트 전에는 렌더링하지 않음
  if (!mounted || isLoading || !isAuthenticated) return null;
  
  // 경험치 백분율 계산
  const expPercentage = (character.exp / character.nextLevelExp) * 100;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-60 h-60 bg-[#0abab5] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-60 h-60 bg-[#0abab5]/70 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-60 h-60 bg-[#0abab5]/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* 새로운 인증 오류 표시 컴포넌트 */}
      <AuthErrorDisplay 
        onRetry={() => {
          fetchUserDopplesData();
        }} 
      />
      
      {/* 기존 연결 오류 알림 삭제 */}
      {loadingError && (
        <div className="fixed top-16 inset-x-0 z-40 mx-auto max-w-3xl">
          <div className="bg-red-600/80 text-white m-4 py-3 px-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{loadingError}</span>
            </div>
            <button 
              onClick={(e) => {
                setLoadingError(null);
                fetchUserDopplesData();
              }}
              className="text-sm bg-white/20 py-1 px-3 rounded-full hover:bg-white/30 transition-colors"
            >
              {t('common.retry', 'Try Again')}
            </button>
          </div>
        </div>
      )}
      
      {/* Header / Navigation */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-16 px-2 sm:px-4 z-10">
        <div className="container mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Left Column - Character Info or Create Character */}
            <div className="lg:col-span-1">
              <div className="glassmorphism-card w-full h-full">
                {hasDopple ? (
                  // 도플이 있는 경우 기존 컨텐츠 표시
                  <div className="flex flex-col items-center w-full sm:w-[90%] mx-auto">
                    <div className="relative w-full aspect-square mb-6">
                      <img 
                        src={character.image} 
                        alt={character.name} 
                        className="w-full h-full object-cover rounded-lg border-2 border-[#0abab5]/50"
                        onError={(e) => {
                          console.error("Image load error for:", character.image);
                          e.currentTarget.src = "https://placehold.co/600x400/0abab5/ffffff?text=AI+Dopple";
                        }}
                      />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-1">{character.name}</h2>
                    <p className="text-[#0abab5] text-sm mb-4">Level {character.level} Dopple</p>
                    
                    {/* Experience Bar */}
                    <div className="w-full mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>EXP: {character.exp}/{character.nextLevelExp}</span>
                        <span>{expPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0abab5] to-[#0abab5]/60 rounded-full" 
                          style={{ width: `${expPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Character Stats */}
                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">Conversations</p>
                        <p className="text-2xl font-bold text-white">{character.conversations}</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">Tokens</p>
                        <p className="text-2xl font-bold text-[#0abab5]">{character.tokens}</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                      <button 
                        className="flex-1 bg-[#0abab5] hover:bg-[#0abab5]/80 text-center py-2 px-4 rounded-full text-white text-sm font-medium transition-colors"
                        onClick={(e) => {
                          // 현재 도플 정보 로깅
                          console.log("Current dopple state:", myDopple);
                          
                          // 도플 ID가 유효한지 확인
                          if (myDopple && (myDopple.id || myDopple.id === 0)) {
                            console.log("Navigating to chat with dopple ID:", myDopple.id);
                            router.push(`/chat/${myDopple.id}`);
                          } else {
                            console.error("Missing dopple ID for chat redirect");
                            alert('도플 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
                            // 도플 데이터 다시 불러오기
                            fetchUserDopplesData();
                          }
                        }}
                      >
                        Chat Now
                      </button>
                      <Link 
                        href={myDopple && myDopple.id ? `/my-dopple?edit=true&id=${myDopple.id}` : '/my-dopple'} 
                        className="flex-1 bg-transparent border border-[#0abab5] hover:bg-[#0abab5]/10 text-center py-2 px-4 rounded-full text-[#0abab5] text-sm font-medium transition-colors"
                      >
                        Edit Dopple
                      </Link>
                    </div>
                  </div>
                ) : (
                  // 도플이 없는 경우 생성 안내 표시
                  <div className="flex flex-col items-center justify-center h-full w-full sm:w-[90%] mx-auto">
                    <div className="w-full aspect-square mb-6 border-2 border-dashed border-[#0abab5]/30 rounded-lg flex items-center justify-center bg-black/20">
                      <svg className="w-20 h-20 text-[#0abab5]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">You don't have a Dopple yet</h2>
                    <p className="text-sm text-gray-400 mb-8 text-center">
                      Create your digital twin powered by AI. Create a Dopple that grows through conversations.
                    </p>
                    
                    <Link 
                      href="/my-dopple" 
                      className="w-full px-6 py-3 bg-[#0abab5] hover:bg-[#0abab5]/80 text-center rounded-full text-white font-medium transition-all transform hover:scale-105"
                    >
                      Create Dopple
                    </Link>
                    
                    <div className="mt-6 w-full">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Reward:</span>
                        <span>+100 tokens</span>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg">
                        <p className="text-xs text-gray-400">You'll receive 100 tokens when you create your first Dopple.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Activity and Stats */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {/* 지갑 영역을 아래로 이동하기 위해 여기서 제거 */}

                {/* Connectome */}
                <div className="glassmorphism-card w-full">
                  <h2 className="text-lg font-bold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3c.764 0 1.5.12 2.2.35a6.96 6.96 0 013.907 3.8 6.91 6.91 0 01.543 2.85c0 1.285-.348 2.486-.958 3.527a7.833 7.833 0 00-1.144-1.545 6.707 6.707 0 01-.117-1.982 5.128 5.128 0 00-2.457-4.223A5.05 5.05 0 0012 5.2a5.037 5.037 0 00-3.972 1.958 5.139 5.139 0 00-.266 5.663 6.839 6.839 0 00-1.31 1.29A6.916 6.916 0 015.5 10a6.913 6.913 0 01.543-2.85 6.969 6.969 0 013.908-3.8A8.472 8.472 0 0112 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12c.342.966.984 1.78 1.848 2.34l-.31 1.54A6.989 6.989 0 019 14.62c-1.283-.328-2.393-1.064-3.298-2.062a6.958 6.958 0 01-1.747 2.189A6.91 6.91 0 017.88 18.5h8.24a6.909 6.909 0 013.925-3.754 6.95 6.95 0 01-1.747-2.188 7.062 7.062 0 01-3.302 2.062 6.989 6.989 0 01-1.539 1.261l-.31-1.542A4.996 4.996 0 0015 12" />
                    </svg>
                    {t('connectome.title', 'Connectome')}
                  </h2>
                  
                  <div className="space-y-4">
                    {myDopple && (
                      <>
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="flex items-center p-2 bg-black/30 rounded-lg">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0abab5]/20 text-[#0abab5] mr-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3c.764 0 1.5.12 2.2.35a6.96 6.96 0 013.907 3.8 6.91 6.91 0 01.543 2.85c0 1.285-.348 2.486-.958 3.527a7.833 7.833 0 00-1.144-1.545 6.707 6.707 0 01-.117-1.982 5.128 5.128 0 00-2.457-4.223A5.05 5.05 0 0012 5.2a5.037 5.037 0 00-3.972 1.958 5.139 5.139 0 00-.266 5.663 6.839 6.839 0 00-1.31 1.29A6.916 6.916 0 015.5 10a6.913 6.913 0 01.543-2.85 6.969 6.969 0 013.908-3.8A8.472 8.472 0 0112 3z" />
                              </svg>
                            </div>
                            <div className="text-xs">{t('connectome.personality_elements', 'Personality Elements')}: 12{t('connectome.count_suffix', '')}</div>
                          </div>
                          
                          <div className="flex items-center p-2 bg-black/30 rounded-lg">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0abab5]/20 text-[#0abab5] mr-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 3h-3m-4.5 7.5a9 9 0 019 9m-9-9c-1.105 0-2.191.15-3.225.45M6 10.5a9 9 0 009 9m-9-9a9 9 0 013.5 18 9 9 0 01-3.5 0" />
                              </svg>
                            </div>
                            <div className="text-xs">{t('connectome.relationships', 'Relationships')}: 25{t('connectome.count_suffix', '')}</div>
                          </div>
                          
                          <div className="flex items-center p-2 bg-black/30 rounded-lg">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0abab5]/20 text-[#0abab5] mr-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="text-xs">{t('connectome.network_complexity', 'Network Complexity')}: {t('connectome.complexity_medium', 'Medium')}</div>
                          </div>
                        </div>
                        
                        {/* Simplified connectome node preview */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {['Creative', 'Kindness', 'Empathy', 'Curiosity'].map((trait, index) => (
                            <div key={`trait-${index}`} className="px-3 py-1 bg-[#0abab5]/10 text-[#0abab5] rounded-full text-xs">
                              {trait}
                            </div>
                          ))}
                          {['Music', 'Movies', 'Travel'].map((interest, index) => (
                            <div key={`interest-${index}`} className="px-3 py-1 bg-[#0abab5]/20 text-[#0abab5]/90 rounded-full text-xs">
                              {interest}
                            </div>
                          ))}
                        </div>
                        
                        <Link 
                          href={myDopple && myDopple.id ? `/connectome/${myDopple.id}` : '/connectome'} 
                          className="block w-full bg-[#0abab5]/10 hover:bg-[#0abab5]/20 border border-[#0abab5]/30 text-center py-2 px-4 rounded-lg text-[#0abab5] text-sm font-medium transition-colors"
                        >
                          {t('connectome.view_detailed', 'View Detailed Connectome')}
                        </Link>
                      </>
                    )}
                    {!myDopple && (
                      <div className="flex flex-col items-center justify-center p-6">
                        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3c.764 0 1.5.12 2.2.35a6.96 6.96 0 013.907 3.8 6.91 6.91 0 01.543 2.85c0 1.285-.348 2.486-.958 3.527a7.833 7.833 0 00-1.144-1.545 6.707 6.707 0 01-.117-1.982 5.128 5.128 0 00-2.457-4.223A5.05 5.05 0 0012 5.2a5.037 5.037 0 00-3.972 1.958 5.139 5.139 0 00-.266 5.663 6.839 6.839 0 00-1.31 1.29A6.916 6.916 0 015.5 10a6.913 6.913 0 01.543-2.85 6.969 6.969 0 013.908-3.8A8.472 8.472 0 0112 3z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-sm text-center mb-4">
                          {t('connectome.create_dopple_first', 'Create a dopple and chat to develop its connectome.')}
                        </p>
                        <Link 
                          href="/my-dopple" 
                          className="text-[#0abab5] text-sm hover:underline"
                        >
                          {t('common.create_dopple', 'Create Dopple')}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Daily Tasks */}
                <div className="glassmorphism-card w-full">
                  <h2 className="text-lg font-bold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Daily Tasks
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-5 w-5 bg-[#0abab5]/20 border border-[#0abab5] rounded-md flex items-center justify-center mr-3">
                          <svg className="h-3 w-3 text-[#0abab5]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm">Daily conversation</span>
                      </div>
                      <span className="text-xs font-medium text-[#0abab5]">+15 tokens</span>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-5 w-5 bg-transparent border border-gray-600 rounded-md flex items-center justify-center mr-3">
                        </div>
                        <span className="text-sm">Level up your Dopple</span>
                      </div>
                      <span className="text-xs font-medium text-gray-400">+50 tokens</span>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-5 w-5 bg-transparent border border-gray-600 rounded-md flex items-center justify-center mr-3">
                        </div>
                        <span className="text-sm">Mint your Dopple as NFT</span>
                      </div>
                      <span className="text-xs font-medium text-gray-400">+100 tokens</span>
                    </li>
                  </ul>
                </div>
                
                {/* Recent Activity */}
                <div className="glassmorphism-card w-full md:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Activity
                    </h2>
                    <Link href="/activity" className="text-xs text-[#0abab5] hover:underline">View All</Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 border-b border-gray-800">
                          <th className="pb-2 font-medium">Type</th>
                          <th className="pb-2 font-medium">Description</th>
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium text-right">Reward</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity) => (
                          <tr key={activity.id} className="border-b border-gray-800 last:border-0">
                            <td className="py-3 pr-4">
                              <div className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  activity.type === 'conversation' ? 'bg-blue-400' :
                                  activity.type === 'level-up' ? 'bg-green-400' :
                                  activity.type === 'mint' ? 'bg-purple-400' : 'bg-gray-400'
                                }`}></span>
                                <span className="text-xs capitalize">{activity.type}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-xs font-medium">{activity.title}</td>
                            <td className="py-3 pr-4 text-xs text-gray-400">{activity.date}</td>
                            <td className="py-3 text-xs font-medium text-right text-[#0abab5]">+{activity.reward}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Wallet Info - 최근 활동 아래로 이동 */}
                <div className="glassmorphism-card w-full md:col-span-2">
                  <h2 className="text-lg font-bold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Wallet
                  </h2>
                  
                  {/* 탭 메뉴 제거하고 Whoomi Wallet만 표시 */}
                  <div className="space-y-4">
                    <WhoomiWallet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto">
        <div className="container mx-auto px-2 sm:px-4">
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