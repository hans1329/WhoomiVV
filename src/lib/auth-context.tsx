'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supabase, 
  getSession, 
  getCurrentUser, 
  getUserInfo, 
  signOut as supabaseSignOut
} from './supabase';
import { connectExternalWallet } from './wallet';

interface UserData {
  id: string;
  email?: string;
  walletAddress?: string;
  embeddedWalletAddress?: string;
  authProvider?: string;
  tokenBalance?: number;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  isModalOpen: boolean;
  connectionError: string | null;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  connectWallet: () => Promise<string | null>;
  testConnection: () => Promise<{ connected: boolean; authenticated: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // 인증 상태 확인 함수
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // 세션 확인
      const { session, error } = await getSession();
      if (error || !session) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // 사용자 정보 가져오기
      const { user: authUser, error: userError } = await getCurrentUser();
      if (userError || !authUser) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // DB에서 추가 사용자 정보 가져오기
      const { data: userData, error: fetchError } = await getUserInfo(authUser.id);
      
      setIsAuthenticated(true);
      setUser({
        id: authUser.id,
        email: authUser.email,
        walletAddress: userData?.wallet_address,
        embeddedWalletAddress: userData?.embedded_wallet_address,
        authProvider: authUser.app_metadata.provider as string,
        tokenBalance: userData?.token_balance || 0,
        displayName: userData?.display_name,
        bio: userData?.bio,
        avatarUrl: userData?.avatar_url
      });
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 정보 갱신
  const refreshUser = async () => {
    await checkAuth();
  };

  // 초기 인증 확인
  useEffect(() => {
    checkAuth();
    
    // Supabase 인증 상태 변경 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 로그인 모달 토글
  const openLoginModal = () => setIsModalOpen(true);
  const closeLoginModal = () => setIsModalOpen(false);

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabaseSignOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // 지갑 연결 (외부 지갑)
  const connectWallet = async (): Promise<string | null> => {
    return await connectExternalWallet();
  };

  // 연결 테스트
  const testConnection = async (): Promise<{ connected: boolean; authenticated: boolean }> => {
    try {
      setConnectionError(null);
      
      // 가장 기본적인 API 호출로 연결 확인
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Connection test failed:', sessionError.message);
        setConnectionError('Supabase 서버에 연결할 수 없습니다.');
        return { connected: false, authenticated: false };
      }
      
      const isSessionActive = !!data?.session;
      
      return { connected: true, authenticated: isSessionActive };
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionError('연결 테스트 중 오류가 발생했습니다.');
      return { connected: false, authenticated: false };
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    isModalOpen,
    connectionError,
    openLoginModal,
    closeLoginModal,
    signOut,
    refreshUser,
    connectWallet,
    testConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}