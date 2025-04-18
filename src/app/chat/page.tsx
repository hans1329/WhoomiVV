'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { syncUserDopples } from '@/lib/supabase';
import { useLanguage } from '@/internationalization';
import Header from '@/components/Header';

interface Dopple {
  id: number | string;
  name: string;
  owner: string;
  level: number;
  image: string;
  image_url?: string;
  description: string;
  conversation_count?: number;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [userDopples, setUserDopples] = useState<Dopple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }

    const loadUserDopples = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userId = typeof user === 'string' ? user : user?.id;
        if (!userId) return;

        // 로컬 스토리지에서 도플 정보 확인
        if (typeof window !== 'undefined') {
          const cachedDopplesJSON = localStorage.getItem('userDopples');
          if (cachedDopplesJSON) {
            try {
              const cachedDopples = JSON.parse(cachedDopplesJSON);
              if (cachedDopples && cachedDopples.length > 0) {
                setUserDopples(cachedDopples);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing cached dopples:', e);
            }
          }
        }

        // Supabase에서 도플 정보 가져오기
        const dopples = await syncUserDopples(userId, true);
        if (dopples && Array.isArray(dopples) && dopples.length > 0) {
          setUserDopples(dopples as unknown as Dopple[]);
        }
      } catch (err) {
        console.error('Error fetching dopples:', err);
        setError('도플 정보를 불러오는 데 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (mounted && isAuthenticated) {
      loadUserDopples();
    }
  }, [user, isAuthenticated, isLoading, mounted, router]);

  if (!mounted || isLoading) return null;

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
      <main className="flex-grow pt-20 pb-16 px-2 sm:px-4 z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">채팅</h1>
            <p className="text-gray-400">대화할 도플을 선택하세요</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0abab5]"></div>
            </div>
          ) : error ? (
            <div className="glassmorphism-card p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white rounded-full text-sm"
              >
                대시보드로 돌아가기
              </button>
            </div>
          ) : userDopples.length === 0 ? (
            <div className="glassmorphism-card p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-4">아직 도플이 없습니다</h2>
              <p className="text-gray-400 mb-6">채팅을 시작하려면 먼저 도플을 생성해야 합니다.</p>
              <Link
                href="/my-dopple"
                className="px-6 py-3 bg-[#0abab5] hover:bg-[#0abab5]/80 text-white rounded-full text-sm font-medium transition-all transform hover:scale-105"
              >
                도플 생성하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userDopples.map((dopple) => (
                <div key={dopple.id} className="glassmorphism-card p-4 bg-black/20 border border-[#0abab5]/30 hover:border-[#0abab5]/60 transition-all cursor-pointer" onClick={() => router.push(`/chat/${dopple.id}`)}>
                  <div className="relative w-full aspect-square mb-4">
                    <img 
                      src={dopple.image_url || dopple.image || '/default-character.png'} 
                      alt={dopple.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error("Image load error for:", dopple.image_url || dopple.image);
                        e.currentTarget.src = "/default-character.png";
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-[#0abab5] text-xs px-2 py-1 rounded-full">
                      Lv. {dopple.level || 1}
                    </div>
                  </div>
                  <h3 className="text-white font-bold mb-1">{dopple.name}</h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{dopple.description || '대화를 통해 성장하는 AI 도플'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{dopple.conversation_count || 0} conversations</span>
                    <button 
                      className="px-3 py-1 bg-[#0abab5]/20 hover:bg-[#0abab5]/30 text-[#0abab5] rounded-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/chat/${dopple.id}`);
                      }}
                    >
                      채팅하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="border-t border-[#0abab5]/20 py-6">
            <div className="flex justify-center items-center">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} Whoomi. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 