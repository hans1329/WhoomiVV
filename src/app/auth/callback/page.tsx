'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback 처리 중...');
        
        // URL에서 에러 파라미터 체크
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth 오류:', errorParam, errorDescription);
          alert(`로그인 오류: ${errorDescription || errorParam}`);
          router.push('/');
          return;
        }
        
        const supabase = getSupabaseClient();
        console.log('세션 설정 시도 중...');
        
        // 해시 파라미터에서 세션 설정 시도
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 설정 오류:', error);
          alert('로그인 세션을 설정하는 도중 오류가 발생했습니다.');
          router.push('/');
          return;
        }
        
        if (data.session) {
          console.log('세션 설정 성공:', data.session.user.email);
          router.push('/dashboard');
        } else {
          console.log('세션이 없음. 새로운 세션 교환 시도...');
          
          // 해시나 쿼리 파라미터에서 시도
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            console.log('액세스 토큰 발견, 세션 설정 시도...');
            const { data: sessionData, error: sessionError } = 
              await supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
            
            if (sessionError) {
              console.error('세션 설정 오류:', sessionError);
              alert('로그인 세션을 설정하는 도중 오류가 발생했습니다.');
            } else if (sessionData.session) {
              console.log('수동 세션 설정 성공');
              router.push('/dashboard');
              return;
            }
          }
          
          alert('로그인 세션을 찾을 수 없습니다. 다시 시도해주세요.');
          router.push('/');
        }
      } catch (err) {
        console.error('인증 콜백 처리 중 예외 발생:', err);
        alert('로그인 처리 중 오류가 발생했습니다.');
        router.push('/');
      }
    };
    
    handleCallback();
  }, [router, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glassmorphism p-8 rounded-xl text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#0abab5] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white text-xl">로그인 처리 중...</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
} 