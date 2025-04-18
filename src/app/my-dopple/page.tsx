'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCharacterCreation } from '@/store/characterCreation';
import WelcomeStep from '@/components/character-creation/WelcomeStep';
import AppearanceStep from '@/components/character-creation/AppearanceStep';
import PersonalityStep from '@/components/character-creation/PersonalityStep';
import InterestsStep from '@/components/character-creation/InterestsStep';
import StyleStep from '@/components/character-creation/StyleStep';
import ReviewStep from '@/components/character-creation/ReviewStep';
import { syncUserDopples, Dopple as SupabaseDopple } from '@/lib/supabase';

export default function MyDopple() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentStep, setIsFirstDopple, setCharacterData } = useCharacterCreation();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDoppleId, setEditDoppleId] = useState<string | null>(null);

  // URL 파라미터 감지 및 처리
  useEffect(() => {
    // URL 파라미터 확인 - edit=true인 경우 도플 편집 모드로 전환
    const editParam = searchParams.get('edit');
    const idParam = searchParams.get('id');
    
    console.log('URL parameters:', { editParam, idParam });
    
    if (editParam === 'true' && idParam) {
      setIsEditing(true);
      setEditDoppleId(idParam);
      // 페이지 맨 위로 스크롤
      window.scrollTo(0, 0);
      
      // Find the Dopple to edit
      if (mounted && typeof window !== 'undefined') {
        // 먼저 로컬 캐시 확인
        const fetchDoppleToEdit = async () => {
          try {
            // 사용자의 도플 목록 가져오기 (캐시 우선)
            const userId = typeof user === 'string' ? user : user?.id || '';
            if (!userId) return;
            
            const userDopples = await syncUserDopples(userId);
            
            // 편집할 도플 찾기
            const doppleToEdit = userDopples.find((d: SupabaseDopple) => d.id.toString() === idParam);
            
            if (doppleToEdit) {
              console.log('Found Dopple to edit:', doppleToEdit);
              
              // Pre-populate the character creation store with existing data
              setCharacterData({
                name: doppleToEdit.name || '',
                gender: doppleToEdit.metadata?.gender || 'neutral',
                ageGroup: doppleToEdit.metadata?.ageGroup || 'adult',
                mbti: doppleToEdit.mbti as any || 'INFJ',
                traits: (doppleToEdit.traits || []) as any[],
                interests: (doppleToEdit.interests || []) as any[],
                emotionalExpression: doppleToEdit.metadata?.emotionalExpression || 'balanced',
                imageStyle: doppleToEdit.metadata?.imageStyle || 'realistic',
                description: doppleToEdit.description || '',
                image: doppleToEdit.image_url || ''
              });
            } else {
              console.warn(`Dopple with ID ${idParam} not found`);
            }
          } catch (error) {
            console.error('Error fetching dopple to edit:', error);
            
            // 오류 시 로컬 스토리지 폴백
            const userDopplesJSON = localStorage.getItem('userDopples');
            if (userDopplesJSON) {
              const userDopples = JSON.parse(userDopplesJSON);
              const doppleToEdit = userDopples.find((d: any) => d.id.toString() === idParam);
              
              if (doppleToEdit) {
                console.log('Found Dopple to edit from localStorage:', doppleToEdit);
                setCharacterData({
                  name: doppleToEdit.name || '',
                  gender: doppleToEdit.gender || 'neutral',
                  ageGroup: doppleToEdit.ageGroup || 'adult',
                  mbti: doppleToEdit.mbti || 'INFJ',
                  traits: doppleToEdit.traits || [],
                  interests: doppleToEdit.interests || [],
                  emotionalExpression: doppleToEdit.emotionalExpression || 'balanced',
                  imageStyle: doppleToEdit.imageStyle || 'realistic',
                  description: doppleToEdit.description || '',
                  image: doppleToEdit.image_url || doppleToEdit.image || ''
                });
              }
            }
          }
        };
        
        fetchDoppleToEdit();
      }
    }
  }, [searchParams, mounted, setCharacterData, user]);

  useEffect(() => {
    setMounted(true);
    
    // 인증 상태 확인 - 로그인되지 않은 경우 메인 페이지로 리디렉션
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    const fetchUserDopples = async () => {
      if (isAuthenticated && user) {
        const userId = typeof user === 'string' ? user : user?.id || '';
        if (!userId) return;
        
        try {
          // 서버에서 도플 정보 가져오기 (캐시 우선)
          const dopples = await syncUserDopples(userId);
          
          const hasExistingDopples = dopples.length > 0;
          
          // Set the isFirstDopple flag based on whether user has existing dopples
          setIsFirstDopple(!hasExistingDopples);
          
          console.log(`User has ${dopples.length} dopples from Supabase. isFirstDopple set to ${!hasExistingDopples}`);
        } catch (error) {
          console.error('Error fetching user dopples:', error);
          setIsFirstDopple(true);
        }
      }
    };
    
    if (mounted && isAuthenticated && user) {
      fetchUserDopples();
    }
  }, [isAuthenticated, isLoading, mounted, user, router, setIsFirstDopple]);

  // 캐릭터 생성 UI 렌더링
  const renderCharacterCreation = () => {
    // Render the appropriate creation step
    let stepComponent;
    switch (currentStep) {
      case 1:
        stepComponent = <WelcomeStep isEditing={isEditing} />;
        break;
      case 2:
        stepComponent = <AppearanceStep isEditing={isEditing} />;
        break;
      case 3:
        stepComponent = <PersonalityStep isEditing={isEditing} />;
        break;
      case 4:
        stepComponent = <InterestsStep isEditing={isEditing} />;
        break;
      case 5: 
        stepComponent = <StyleStep isEditing={isEditing} />;
        break;
      case 6:
        stepComponent = <ReviewStep isEditing={isEditing} doppleId={editDoppleId || undefined} />;
        break;
      default:
        stepComponent = <WelcomeStep isEditing={isEditing} />;
        break;
    }
    
    return (
      <div className="w-full px-2 sm:px-4">
        {stepComponent}
      </div>
    );
  };

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
              <Link href="/dopple-zone" className="text-white text-sm hover:text-[#0abab5] transition-colors">Dopple Zone</Link>
              <Link href="/my-dopple" className="text-[#0abab5] text-sm font-medium">My Dopple</Link>
              <Link href="/chat" className="text-white text-sm hover:text-[#0abab5] transition-colors">Chat</Link>
              <Link href="/marketplace" className="text-white text-sm hover:text-[#0abab5] transition-colors">Marketplace</Link>
            </div>
            
            {/* Wallet Info */}
            {isAuthenticated && (
              <div className="flex items-center">
                <div className="text-xs px-3 py-1.5 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full flex items-center">
                  <span className="font-medium text-[#0abab5]">
                    {typeof user === 'string' 
                      ? `${user.slice(0, 6)}...${user.slice(-4)}` 
                      : user?.id && typeof user.id === 'string' ? `${user.id.slice(0, 6)}...${user.id.slice(-4)}` : 'Connected'}
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
          <div className="max-w-4xl mx-auto">
            {renderCharacterCreation()}
          </div>
        </div>
      </main>
    </div>
  );
} 