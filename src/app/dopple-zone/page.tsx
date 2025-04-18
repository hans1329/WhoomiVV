'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import AutoChatDialog from '@/components/AutoChatDialog';
import { IoPlay } from 'react-icons/io5';
import { syncUserDopples, Dopple as SupabaseDopple } from '@/lib/supabase';

// 도플 데이터 타입 정의
interface DoppleData {
  id: number | string;
  name: string;
  owner: string;
  level: number;
  image: string;
  image_url?: string;
  likes: number;
  description: string;
  tags: string[];
  createdAt: string;
  xp: number;
  xpToNextLevel: number;
  gender?: string;
  ageGroup?: string;
  mbti?: string;
  traits?: string[];
  interests?: string[];
  emotionalExpression?: string;
  imageStyle?: string;
}

// 가상의 도플 데이터 (실제 구현에서는 API에서 가져옵니다)
const mockDopples: DoppleData[] = [
  {
    id: 1,
    name: 'Cyber Nova',
    owner: '0x1234...5678',
    level: 12,
    image: 'https://placehold.co/300x300/0abab5/ffffff?text=Nova',
    likes: 243,
    description: '사이버펑크 세계를 여행하는 AI 컴패니언',
    tags: ['사이버펑크', '모험가', '음악애호가'],
    createdAt: new Date().toISOString(),
    xp: 0,
    xpToNextLevel: 100
  },
  {
    id: 2,
    name: 'Luna',
    owner: '0xabcd...ef12',
    level: 8,
    image: 'https://placehold.co/300x300/204969/ffffff?text=Luna',
    likes: 187,
    description: '철학적인 대화를 좋아하는 달빛 도플',
    tags: ['철학', '명상', '문학'],
    createdAt: new Date().toISOString(),
    xp: 0,
    xpToNextLevel: 100
  },
  {
    id: 3,
    name: 'Neon',
    owner: '0x7890...1234',
    level: 15,
    image: 'https://placehold.co/300x300/ff2970/ffffff?text=Neon',
    likes: 356,
    description: '에너지 넘치는 댄서, 모든 파티의 중심',
    tags: ['댄서', '엔터테이너', '파티'],
    createdAt: new Date().toISOString(),
    xp: 0,
    xpToNextLevel: 100
  },
  {
    id: 4,
    name: 'Sage',
    owner: '0xfedc...ba98',
    level: 20,
    image: 'https://placehold.co/300x300/3a7d44/ffffff?text=Sage',
    likes: 420,
    description: '고대 지식의 수호자, 현명한 조언자',
    tags: ['지혜', '역사', '멘토'],
    createdAt: new Date().toISOString(),
    xp: 0,
    xpToNextLevel: 100
  },
  {
    id: 5,
    name: 'Echo',
    owner: '0x2468...1357',
    level: 6,
    image: 'https://placehold.co/300x300/6b4ce6/ffffff?text=Echo',
    likes: 98,
    description: '감성적인 음악가, 당신의 감정을 노래로 표현',
    tags: ['음악가', '감성적', '창의적'],
    createdAt: new Date().toISOString(),
    xp: 0,
    xpToNextLevel: 100
  },
  {
    id: 6,
    name: 'Pixel',
    owner: '0x1357...2468',
    level: 10,
    image: 'https://placehold.co/300x300/e67e22/ffffff?text=Pixel',
    likes: 156,
    description: '디지털 아티스트, 픽셀 세계의 창조자',
    tags: ['예술가', '창의적', '디지털'],
    createdAt: new Date().toISOString(),
    xp: 0,
    xpToNextLevel: 100
  },
];

// 추천 도플 데이터
const recommendedDopples = mockDopples.slice(0, 3);

// 인기 도플 데이터 (좋아요 기준 정렬)
const popularDopples = [...mockDopples].sort((a, b) => b.likes - a.likes).slice(0, 3);

export default function DoppleZone() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [myDopple, setMyDopple] = useState<DoppleData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Auto-chat related state
  const [showAutoChatDialog, setShowAutoChatDialog] = useState(false);
  const [autoChatDopple1, setAutoChatDopple1] = useState<DoppleData | null>(null);
  const [autoChatDopple2, setAutoChatDopple2] = useState<DoppleData | null>(null);
  
  // 모든 도플 및 필터링된 결과
  const [allDopples, setAllDopples] = useState(mockDopples);
  const [filteredDopples, setFilteredDopples] = useState(mockDopples);
  
  useEffect(() => {
    setMounted(true);
    
    // 인증 상태 확인 - 로그인되지 않은 경우 메인 페이지로 리디렉션
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    // 새로운 방식으로 사용자의 도플 가져오기
    const fetchUserDopples = async () => {
      if (isAuthenticated && user) {
        const userId = typeof user === 'string' ? user : user?.id || '';
        if (!userId) return;
        
        try {
          // 서버에서 도플 정보 가져오기 (캐시 우선)
          const dopples = await syncUserDopples(userId);
          
          const hasExistingDopples = dopples.length > 0;
          setMyDopple(hasExistingDopples ? dopples[0] as unknown as DoppleData : null);
          
          console.log(`User has ${dopples.length} dopples from Supabase.`);
          
          // 로컬 데이터에 제공하기 위해 필터링된 도플 목록과 모든 도플 목록 업데이트
          const formattedDopples = dopples.map((d: SupabaseDopple): DoppleData => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            image: d.image_url || '',
            image_url: d.image_url,
            owner: userId,
            level: d.level || 1,
            likes: d.likes || 0,
            tags: d.traits || [],
            createdAt: d.created_at || new Date().toISOString(),
            xp: d.xp || 0,
            xpToNextLevel: 100,
            mbti: d.mbti,
            traits: d.traits,
            interests: d.interests,
            // metadata에서 추가 속성 추출
            ...(d.metadata || {})
          }));
          
          // 목업 데이터와 서버 데이터 합치기
          const combinedDopples: DoppleData[] = [
            ...formattedDopples, 
            ...mockDopples.filter(m => !formattedDopples.some(f => String(f.id) === String(m.id)))
          ];
          setAllDopples(combinedDopples);
          setFilteredDopples(combinedDopples);
        } catch (error) {
          console.error('Error fetching user dopples:', error);
          
          // 오류 시 목업 데이터로 폴백
          const userDopples = mockDopples.filter(dopple => {
            const userAddress = typeof user === 'string' 
              ? user 
              : user?.id ? user.id : '';
              
            return dopple.owner === userAddress || 
                   dopple.owner === `0x${userAddress.slice(2, 6)}...${userAddress.slice(-4)}`;
          });
          
          const hasExistingDopples = userDopples.length > 0;
          setMyDopple(hasExistingDopples ? userDopples[0] as unknown as DoppleData : null);
          console.log(`Fallback: User has ${userDopples.length} dopples from mock.`);
        }
      }
    };
    
    if (mounted && isAuthenticated && user) {
      fetchUserDopples();
    }
  }, [isAuthenticated, isLoading, mounted, user, router]);
  
  // 검색 및 필터링 기능
  useEffect(() => {
    let filtered = allDopples;
    
    // 검색어로 필터링
    if (searchQuery) {
      filtered = filtered.filter(dopple => 
        dopple.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        dopple.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dopple.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // 카테고리로 필터링
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(dopple => 
        dopple.tags.some(tag => tag.toLowerCase() === categoryFilter.toLowerCase())
      );
    }
    
    setFilteredDopples(filtered);
  }, [searchQuery, categoryFilter, allDopples]);
  
  // 도플 카드 컴포넌트
  const DoppleCard = ({ dopple }: { dopple: DoppleData }) => {
    // Check if this dopple can interact with others (level 3+ and has partner)
    const canAutoChat = dopple.level >= 3 && allDopples.length > 1;
    
    // Start auto chat
    const handleStartAutoChat = () => {
      // Find a random partner dopple that's not this one
      const otherDopples = allDopples.filter(d => d.id !== dopple.id);
      if (otherDopples.length > 0) {
        const randomPartner = otherDopples[Math.floor(Math.random() * otherDopples.length)];
        setAutoChatDopple1(dopple);
        setAutoChatDopple2(randomPartner);
        setShowAutoChatDialog(true);
      }
    };
    
    // Ensure owner is treated as a string
    const ownerStr = typeof dopple.owner === 'string' ? dopple.owner : '';
    const displayOwner = ownerStr ? `${ownerStr.slice(0, 6)}...${ownerStr.slice(-4)}` : 'Unknown';
    
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-[#0abab5]/50 transition-all hover:shadow-lg hover:shadow-[#0abab5]/10">
        <div className="relative">
          <img 
            src={dopple.image_url || dopple.image} 
            alt={dopple.name} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error("Image load error for:", dopple.image_url || dopple.image);
              e.currentTarget.src = `https://placehold.co/300x300/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${dopple.name.charAt(0)}`;
            }}
          />
          <div className="absolute top-2 right-2 bg-black/60 text-[#0abab5] text-xs px-2 py-1 rounded-full">
            Lv. {dopple.level}
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-bold text-lg">{dopple.name}</h3>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-300">{dopple.likes}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-3">{dopple.description}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {dopple.tags.map((tag: string, index: number) => (
              <span 
                key={index} 
                className="text-xs bg-[#0abab5]/20 text-[#0abab5] px-2 py-0.5 rounded-full cursor-pointer hover:bg-[#0abab5]/30"
                onClick={() => setCategoryFilter(tag.toLowerCase())}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-500">by {displayOwner}</span>
            <div className="flex space-x-2">
              {canAutoChat && (
                <button 
                  onClick={handleStartAutoChat}
                  className="text-xs flex items-center bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-600/30 transition-colors"
                >
                  <IoPlay className="mr-1" size={12} />
                  Auto Chat
                </button>
              )}
              <Link href={`/chat/${dopple.id}`} className="text-xs flex items-center bg-[#0abab5]/20 text-[#0abab5] px-3 py-1 rounded-full hover:bg-[#0abab5]/30 transition-colors">
                Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 카테고리 목록 (태그 기반)
  const getUniqueCategories = () => {
    const allTags = allDopples.flatMap(dopple => dopple.tags);
    const uniqueTags = new Set(allTags.map(tag => tag.toLowerCase()));
    return ['all', ...Array.from(uniqueTags)];
  };
  
  // 도플존 메인 화면 렌더링
  const renderDoppleZone = () => (
    <div className="space-y-6 sm:space-y-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dopple Zone</h1>
          <p className="text-gray-400">Chat with a variety of dopples and get inspired</p>
        </div>
        
        {/* 내 도플 / 도플 생성하기 */}
        <div className="mt-4 md:mt-0">
          {myDopple ? (
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-[#0abab5]/20 border border-[#0abab5] rounded-full text-[#0abab5] hover:bg-[#0abab5]/30 transition-colors mr-3"
            >
              <span className="mr-2">View My Dopple</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : null}
          <Link 
            href="/create-dopple"
            className="inline-flex items-center px-4 py-2 bg-[#0abab5] rounded-full text-white hover:bg-[#0abab5]/80 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Dopple</span>
          </Link>
        </div>
      </div>
      
      {/* 검색 바 및 카테고리 필터 */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0abab5] focus:border-transparent"
            placeholder="Search by dopple name, description, or tags..."
          />
        </div>
        
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {getUniqueCategories().map((category, index) => (
            <button
              key={index}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                categoryFilter === category 
                  ? 'bg-[#0abab5] text-white' 
                  : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>
      
      {/* 인기 도플 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl font-bold text-white">Best Dopples</h2>
          <Link href="#" className="text-sm text-[#0abab5] hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {popularDopples.map(dopple => (
            <DoppleCard key={dopple.id} dopple={dopple} />
          ))}
        </div>
      </section>
      
      {/* 추천 도플 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl font-bold text-white">Recommended Dopples</h2>
          <Link href="#" className="text-sm text-[#0abab5] hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {recommendedDopples.map(dopple => (
            <DoppleCard key={dopple.id} dopple={dopple} />
          ))}
        </div>
      </section>
      
      {/* 모든 도플 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl font-bold text-white">All Dopples</h2>
        </div>
        {filteredDopples.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredDopples.map(dopple => (
              <DoppleCard key={dopple.id} dopple={dopple} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No search results found</p>
          </div>
        )}
      </section>
    </div>
  );

  if (!mounted || isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
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
              <Link href="/dopple-zone" className="text-[#0abab5] text-sm font-medium">Dopple Zone</Link>
              <Link href="/my-dopple" className="text-white text-sm hover:text-[#0abab5] transition-colors">My Dopple</Link>
              <Link href="/chat" className="text-white text-sm hover:text-[#0abab5] transition-colors">Chat</Link>
              <Link href="/marketplace" className="text-white text-sm hover:text-[#0abab5] transition-colors">Marketplace</Link>
            </div>
            
            {/* Wallet Info */}
            {isAuthenticated && (
              <div className="flex items-center">
                <div className="text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full flex items-center">
                  <span className="font-medium text-[#0abab5]">
                    {typeof user === 'string' 
                      ? (user ? `${(user as string).substring(0, 6)}...${(user as string).substring((user as string).length - 4)}` : 'Connected')
                      : user?.id && typeof user.id === 'string' ? `${user.id.substring(0, 6)}...${user.id.substring(user.id.length - 4)}` : 'Connected'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-16 px-2 sm:px-4 z-10 relative">
        <div className="container mx-auto">
          {renderDoppleZone()}
        </div>
      </main>
      
      {/* Auto Chat Dialog */}
      {showAutoChatDialog && autoChatDopple1 && autoChatDopple2 && (
        <AutoChatDialog 
          dopple1={autoChatDopple1 as any} 
          dopple2={autoChatDopple2 as any} 
          onClose={() => setShowAutoChatDialog(false)} 
        />
      )}
    </div>
  );
} 