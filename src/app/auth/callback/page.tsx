'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [statusMessage, setStatusMessage] = useState('로그인 처리 중...');
  
  useEffect(() => {
    // Supabase의 OAuth 콜백에서는 해시 URL로 토큰이 전달됨
    const processHashParams = async () => {
      try {
        setStatusMessage('인증 정보 처리 중...');
        console.log('Auth callback 처리 시작');
        
        // URL에서 에러 파라미터 체크
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth 오류:', errorParam, errorDescription);
          setStatusMessage(`로그인 오류: ${errorDescription || errorParam}`);
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        // 1. 직접 해시 파라미터 추출 (Next.js Router는 해시를 처리하지 않음)
        if (!window.location.hash) {
          console.log('해시 파라미터 없음');
          
          // 해시 없이 직접 세션 확인
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('세션 확인 오류:', error);
            setStatusMessage('로그인 세션을 확인할 수 없습니다.');
            setTimeout(() => router.push('/'), 2000);
            return;
          }
          
          if (data.session) {
            console.log('이미 활성화된 세션 발견');
            setStatusMessage('로그인 성공! 리디렉션 중...');
            setTimeout(() => router.push('/dashboard'), 1500);
            return;
          }
          
          setStatusMessage('로그인 정보를 찾을 수 없습니다.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        console.log('해시 파라미터 발견, 처리 중...');
        
        // 2. 해시 파라미터 파싱
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // 3. 필요한 파라미터 추출
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || '';
        const expiresIn = hashParams.get('expires_in');
        const tokenType = hashParams.get('token_type');
        
        if (!accessToken) {
          console.error('액세스 토큰 없음');
          setStatusMessage('유효한 로그인 토큰이 없습니다.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        console.log('액세스 토큰 발견, 세션 설정 시도...');
        setStatusMessage('로그인 정보 검증 중...');
        
        // 4. Supabase 세션 설정
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('세션 설정 오류:', error);
          setStatusMessage('로그인 세션을 설정하는 도중 오류가 발생했습니다.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        // 5. 성공 시 리디렉션
        if (data?.session) {
          console.log('세션 설정 성공:', data.session.user.email);
          setStatusMessage('로그인 성공! 리디렉션 중...');
          
          // URL에서 해시 제거 (보안)
          window.history.replaceState(null, '', window.location.pathname);
          
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          console.error('세션 데이터 없음');
          setStatusMessage('로그인 세션을 만들 수 없습니다.');
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (err) {
        console.error('인증 콜백 처리 중 예외 발생:', err);
        setStatusMessage('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => router.push('/'), 2000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processHashParams();
  }, [router, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glassmorphism p-8 rounded-xl text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#0abab5] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white text-xl">{statusMessage}</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
} 