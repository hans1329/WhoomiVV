'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface AuthErrorDisplayProps {
  onRetry?: () => void;
}

/**
 * 인증 오류를 표시하고 사용자에게 해결 방법을 제공하는 컴포넌트
 */
export default function AuthErrorDisplay({ onRetry }: AuthErrorDisplayProps) {
  const { connectionError, testConnection } = useAuth();
  const [showError, setShowError] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<'auth' | 'connection' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // 연결 오류가 있는 경우
    if (connectionError) {
      setShowError(true);
      setErrorType('connection');
      setErrorMessage(connectionError);
    }
  }, [connectionError]);

  // 인증 상태 수동 체크
  const handleRetry = async () => {
    setShowError(false);
    
    try {
      const connectionStatus = await testConnection();
      
      if (!connectionStatus.connected) {
        setShowError(true);
        setErrorType('connection');
        setErrorMessage('Supabase 서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
      } else if (!connectionStatus.authenticated) {
        setShowError(true);
        setErrorType('auth');
        setErrorMessage('인증 세션이 없거나 만료되었습니다. 다시 로그인해주세요.');
      } else {
        // 연결 성공 및 인증됨
        if (onRetry) {
          onRetry();
        }
      }
    } catch (error) {
      setShowError(true);
      setErrorType('connection');
      setErrorMessage('연결 확인 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // 로컬 스토리지 정리
    if (typeof window !== 'undefined') {
      // 인증 관련 데이터만 정리
      localStorage.removeItem('supabase.auth.token');
      
      // 페이지 새로고침하여 앱 상태 초기화
      window.location.href = '/';
    }
  };

  if (!showError) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-40 mx-auto max-w-lg px-4">
      <div className={`p-4 rounded-lg shadow-lg flex flex-col ${
        errorType === 'auth' ? 'bg-yellow-600/90' : 'bg-red-600/90'
      }`}>
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 mr-3">
            {errorType === 'auth' ? (
              <svg className="w-6 h-6 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              {errorType === 'auth' ? '인증 세션 오류' : '연결 오류'}
            </h3>
            <p className="text-xs text-white/90">
              {errorMessage}
            </p>
          </div>
        </div>
        
        {errorType === 'auth' && (
          <div className="text-xs text-white/80 mb-3">
            <p className="mb-1">다음과 같은 원인이 있을 수 있습니다:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>인증 세션이 만료되었습니다</li>
              <li>다른 브라우저나 디바이스에서 로그아웃되었습니다</li>
              <li>쿠키나 로컬 스토리지가 삭제되었습니다</li>
            </ul>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          {errorType === 'auth' && (
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
            >
              로그아웃
            </button>
          )}
          
          <button 
            onClick={handleRetry}
            className="px-3 py-1.5 text-xs bg-white text-gray-800 rounded-md font-medium hover:bg-white/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
} 