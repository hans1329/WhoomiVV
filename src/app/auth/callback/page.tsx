'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, getCurrentUser, getUserInfo, updateUserInfo } from '@/lib/supabase';
import { createAndSaveEmbeddedWallet } from '@/lib/wallet';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. URL에서 세션 정보 확인
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!data.session) {
          throw new Error('Session not found');
        }
        
        // 2. 사용자 정보 가져오기
        const { user, error: userError } = await getCurrentUser();
        if (userError || !user) throw userError || new Error('Could not get user information');
        
        setMessage('Verifying user information...');
        
        // 3. 기존 사용자 정보 조회
        const { data: existingUserInfo, error: fetchError } = await getUserInfo(user.id);
        
        // 4. 임베디드 지갑 생성 여부 확인
        if (!existingUserInfo || !existingUserInfo.embedded_wallet_address) {
          setMessage('Setting up your account...');
          
          // 랜덤 패스워드 생성 (임시)
          const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
          
          // 임베디드 지갑 생성
          const walletAddress = await createAndSaveEmbeddedWallet(randomPassword);
          
          // 사용자 정보 업데이트
          await updateUserInfo(user.id, {
            id: user.id,
            email: user.email,
            auth_provider: user.app_metadata.provider || 'email',
            embedded_wallet_address: walletAddress,
            // 최초 생성 시 외부 지갑 주소도 임베디드 지갑 주소로 설정
            wallet_address: walletAddress
          });
          
          setMessage('Login successful!');
        } else {
          setMessage('Login successful!');
        }
        
        // 5. 대시보드로 리디렉션
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        setError((err as Error).message);
        setMessage('An error occurred');
        
        // 에러 발생 시 5초 후 홈으로 리디렉션
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white">
      <div className="glassmorphism-card p-8 rounded-lg max-w-md w-full">
        <div className="text-center">
          {loading ? (
            <>
              <div className="animate-spin h-10 w-10 border-4 border-[#0abab5] border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Authentication in Progress</h2>
              <p className="text-gray-300">{message}</p>
            </>
          ) : error ? (
            <>
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">An Error Occurred</h2>
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-gray-400">Redirecting to homepage in 5 seconds...</p>
            </>
          ) : (
            <>
              <div className="text-[#0abab5] text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold mb-2">Authentication Successful!</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-gray-400 mt-4">Redirecting to dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 