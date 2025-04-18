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
    // 타임아웃 설정 - 최대 15초 후 홈으로 리디렉션
    const timeoutId = setTimeout(() => {
      if (isProcessing) {
        console.warn('로그인 처리 타임아웃 - 15초 초과');
        setStatusMessage('로그인 처리 시간이 초과되었습니다. 홈으로 이동합니다.');
        setTimeout(() => router.push('/'), 2000);
      }
    }, 15000);
    
    // Supabase의 OAuth 콜백에서는 해시 URL로 토큰이 전달됨
    const processHashParams = async () => {
      try {
        setStatusMessage('인증 정보 처리 중...');
        console.log('Auth callback 처리 시작', window.location.href.split('?')[0]);
        
        // URL에서 에러 파라미터 체크
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth 오류:', errorParam, errorDescription);
          setStatusMessage(`로그인 오류: ${errorDescription || errorParam}`);
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        // 현재 URL 디버깅
        console.log('현재 URL:', window.location.href);
        console.log('해시 존재 여부:', !!window.location.hash);
        
        // 1. 직접 해시 파라미터 추출 (Next.js Router는 해시를 처리하지 않음)
        if (!window.location.hash) {
          console.log('해시 파라미터 없음, 세션 확인 시도');
          
          // 해시 없이 직접 세션 확인
          const supabase = getSupabaseClient();
          
          try {
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
            
            console.log('세션 없음, 검색 파라미터 확인:', Object.fromEntries(searchParams.entries()));
            
            // 검색 파라미터에서 토큰 찾기 시도 (일부 흐름에서는 해시가 아닌 쿼리 파라미터로 전달될 수 있음)
            const urlToken = searchParams.get('access_token');
            if (urlToken) {
              console.log('쿼리 파라미터에서 토큰 발견');
              const refreshToken = searchParams.get('refresh_token') || '';
              
              try {
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: urlToken,
                  refresh_token: refreshToken,
                });
                
                if (sessionError) {
                  console.error('쿼리 파라미터 토큰으로 세션 설정 실패:', sessionError);
                } else if (sessionData.session) {
                  console.log('쿼리 파라미터 토큰으로 세션 설정 성공');
                  setStatusMessage('로그인 성공! 리디렉션 중...');
                  setTimeout(() => router.push('/dashboard'), 1500);
                  return;
                }
              } catch (e) {
                console.error('쿼리 파라미터 토큰 처리 오류:', e);
              }
            }
          } catch (sessionError) {
            console.error('세션 확인 중 예외 발생:', sessionError);
          }
          
          setStatusMessage('로그인 정보를 찾을 수 없습니다.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        
        console.log('해시 파라미터 발견, 처리 중...');
        
        // 2. 해시 파라미터 파싱
        const hash = window.location.hash.substring(1);
        console.log('원본 해시:', hash);
        
        const hashParams = new URLSearchParams(hash);
        
        // 3. 필요한 파라미터 추출
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || '';
        const expiresIn = hashParams.get('expires_in');
        const tokenType = hashParams.get('token_type');
        
        console.log('토큰 추출 결과:', { 
          accessToken: accessToken ? '존재함' : '없음', 
          refreshToken: refreshToken ? '존재함' : '없음',
          expiresIn, 
          tokenType 
        });
        
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
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('세션 설정 오류:', error);
            setStatusMessage('로그인 세션을 설정하는 도중 오류가 발생했습니다.');
            
            // 오류 상세 정보 확인
            console.log('오류 타입:', error.name);
            console.log('오류 메시지:', error.message);
            
            // 세션 설정 실패 시 대안 시도
            try {
              console.log('대체 방법으로 로그인 시도...');
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: 'temp@example.com',  // 임시 값
                password: 'p@ssw0rd',      // 임시 값
              });
              
              if (signInError) {
                console.log('대체 로그인 시도 실패:', signInError);
              }
            } catch (altError) {
              console.error('대체 인증 시도 중 예외 발생:', altError);
            }
            
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
        } catch (sessionError) {
          console.error('세션 설정 중 예외 발생:', sessionError);
          setStatusMessage('로그인 중 예기치 않은 오류가 발생했습니다.');
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (err) {
        console.error('인증 콜백 처리 중 예외 발생:', err);
        setStatusMessage('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => router.push('/'), 2000);
      } finally {
        // 타임아웃 정리
        clearTimeout(timeoutId);
        setIsProcessing(false);
      }
    };
    
    processHashParams();
    
    // 클린업 함수
    return () => {
      clearTimeout(timeoutId);
    };
  }, [router, searchParams, isProcessing]);
  
  const handleManualReturn = () => {
    router.push('/');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glassmorphism p-8 rounded-xl text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#0abab5] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white text-xl">{statusMessage}</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요.</p>
        
        {isProcessing && (
          <button 
            onClick={handleManualReturn}
            className="mt-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
} 