'use client';

import { useState, useEffect, useCallback } from 'react';
import { signInWithGoogle } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 패스키 관련 유틸리티 함수 추가
/**
 * Base64URL 문자열을 ArrayBuffer로 변환
 */
function base64URLToBuffer(base64URL: string): ArrayBuffer {
  // "-"를 "+"로, "_"를 "/"로 변환하고 패딩 추가
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return buffer;
}

/**
 * PublicKeyCredential을 JSON 직렬화 가능한 객체로 변환
 */
function publicKeyCredentialToJSON(credential: PublicKeyCredential): any {
  if (!credential) return null;
  
  const { id, type, authenticatorAttachment } = credential;
  
  // 응답 정보 추출
  const response = credential.response as AuthenticatorAssertionResponse;
  
  return {
    id,
    type,
    authenticatorAttachment,
    response: {
      clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
      authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
      signature: arrayBufferToBase64URL(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : null,
    },
  };
}

/**
 * ArrayBuffer를 Base64URL 문자열로 변환
 */
function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // base64로 인코딩 후 URL 안전한 형식으로 변환
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  // 패스키 등록 핸들러
  const handlePasskeyRegistration = async () => {
    if (!email) {
      setStatusMessage('이메일을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('패스키 등록 준비 중...');
    
    try {
      // 1. 서버로부터 등록 옵션 요청
      const optionsRes = await fetch('/api/auth/webauthn/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!optionsRes.ok) {
        const { error } = await optionsRes.json();
        throw new Error(error || '등록 옵션 요청 실패');
      }
      
      // 서버로부터 받은 옵션 데이터
      const optionsJSON = await optionsRes.json();
      
      // 브라우저 프롬프트 안내 메시지
      setStatusMessage('패스키 등록 중... 브라우저 프롬프트를 확인해주세요.');
      
      // 2. 브라우저의 WebAuthn API로 패스키 생성
      // 주의: SimpleWebAuthn은 challenge를 base64url 문자열로 받지만
      // 내부적으로 이를 ArrayBuffer로 변환하여 사용함
      const attestationResponse = await startRegistration(optionsJSON);
      
      setStatusMessage('패스키 등록 검증 중...');
      
      // 3. 서버에 검증 요청
      const verificationRes = await fetch('/api/auth/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          attestationResponse 
        })
      });
      
      if (!verificationRes.ok) {
        const { error } = await verificationRes.json();
        throw new Error(error || '패스키 검증 실패');
      }
      
      // 4. 등록 성공, 자동으로 로그인
      const result = await verificationRes.json();
      
      // 성공 알림 표시
      alert('패스키 등록이 완료되었습니다!');
      
      setStatusMessage('패스키 등록 성공! 로그인 중...');
      
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 1000);
      
    } catch (err: any) {
      console.error('Passkey registration error:', err);
      
      // 실패 알림 표시
      alert(`패스키 등록 실패: ${err.message}`);
      
      setStatusMessage(`패스키 등록 중 오류: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  // 패스키 로그인 핸들러
  const handlePasskeyLogin = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('패스키 로그인 중...');
      
      // 1. 서버에서 인증 옵션 가져오기
      const optionsUrl = '/api/auth/webauthn/login-options';
      console.log('인증 옵션 요청 URL:', optionsUrl);
      console.log('로그인 이메일:', email);
      
      const optionsResponse = await fetch(optionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log('인증 옵션 응답 상태:', optionsResponse.status);
      
      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        console.error('인증 옵션 요청 실패:', errorData);
        throw new Error(errorData.error || '인증 옵션을 가져오는데 실패했습니다');
      }
      
      const options = await optionsResponse.json();
      console.log('인증 옵션 받음:', options);
      
      // 브라우저 프롬프트 안내 추가
      setStatusMessage('Authenticating with passkey... Please check browser prompt.');
      
      try {
        // 2. 브라우저 자격 증명 API로 사용자 인증 진행
        const credential = await startAuthentication(options);
        
        // 검증 중 메시지 추가
        setStatusMessage('Verifying passkey...');
        
        // 3. 인증 결과를 서버로 전송하여 검증
        console.log('Authentication response:', credential);
        
        const verificationResponse = await fetch('/api/auth/webauthn/login-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            assertionResponse: credential,
          }),
        });
        
        if (!verificationResponse.ok) {
          const errorData = await verificationResponse.json();
          throw new Error(errorData.error || '인증 검증에 실패했습니다');
        }
        
        const verification = await verificationResponse.json();
        console.log('인증 검증 결과:', verification);
        
        if (verification.verified) {
          console.log('로그인 성공!');
          
          // 성공 알림 추가
          alert('패스키 로그인에 성공했습니다!');
          
          setStatusMessage('로그인 성공! 페이지 이동 중...');
          
          // 로그인 성공 처리
          onClose();
          router.push('/dashboard');
        } else {
          throw new Error('인증에 실패했습니다');
        }
      } catch (credentialError: any) {
        console.error('Passkey login credential error:', credentialError);
        
        // NotAllowedError 처리
        if (credentialError.name === 'NotAllowedError') {
          const message = '인증 프로세스가 취소되었습니다. 다시 시도해주세요.';
          alert(message);
          setStatusMessage(message);
        } else {
          // 다른 오류 처리
          throw credentialError;
        }
      }
    } catch (error: any) {
      console.error('Passkey login error:', error);
      
      // 일반 오류 처리
      const errorMessage = error.name === 'NotAllowedError' 
        ? '인증 프로세스가 취소되었습니다. 다시 시도해주세요.' 
        : `패스키 로그인 실패: ${error.message || '로그인 중 오류가 발생했습니다'}`;
      
      alert(errorMessage);
      setStatusMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setStatusMessage('Google 로그인 중...');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      // 로그인 성공
      setStatusMessage('로그인 성공! 리디렉션 중...');
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Google login error:', err);
      setStatusMessage('Google 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 모달이 표시되지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    // 모달 백드롭
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* 모달 컨테이너 */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* 모달 헤더 */}
        <div className="relative border-b border-gray-800 p-5">
          <h2 className="text-xl font-bold text-center text-white">Login to Whoomi</h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-gray-900 p-6 rounded-lg max-w-sm w-full text-center">
              <div className="animate-spin h-10 w-10 border-4 border-[#0abab5] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white">{statusMessage}</p>
            </div>
          </div>
        )}
        
        {/* 모달 콘텐츠 */}
        <div className="p-6">
          <div className="space-y-6">
            {/* 이메일 입력 필드 */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0abab5]"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>
            
            {/* 패스키 버튼 */}
            <div className="space-y-3">
              <button
                onClick={handlePasskeyLogin}
                className="w-full flex items-center justify-center py-3 px-4 bg-[#0abab5] hover:bg-[#0abab5]/90 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading || !email}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h7" />
                  <path d="M12 12V5a2 2 0 0 1 2-2h2" />
                  <path d="M12 12v7" />
                </svg>
                Login with Passkey
              </button>
              
              <button
                onClick={handlePasskeyRegistration}
                className="w-full flex items-center justify-center py-3 px-4 bg-transparent border border-[#0abab5] text-[#0abab5] hover:bg-[#0abab5]/10 rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading || !email}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Register New Passkey
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>
            
            {/* Google 로그인 버튼 */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Login with Google
              </button>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              By logging in, you agree to Whoomi's <a href="#" className="text-[#0abab5] hover:underline">Terms of Service</a> and <a href="#" className="text-[#0abab5] hover:underline">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 