'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// 인증 상태와 지갑 정보를 관리하는 컨텍스트
interface AuthContextType {
  authenticated: boolean;
  address: string | null;
  walletType: 'embedded' | 'external' | null;
  embeddedWalletAddress: string | null;
  isConnecting: boolean;
  showModal: boolean;
  login: (method: 'email' | 'wallet' | 'google' | 'apple') => void;
  loginWithEmail: (email: string) => Promise<void>;
  connectWallet: () => Promise<void>;
  logout: () => void;
  createEmbeddedWallet: () => Promise<void>;
  toggleModal: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 모의 데이터를 저장하기 위한 로컬 스토리지 키
const STORAGE_KEY = 'whoomi_mock_auth';

// AuthProvider 컴포넌트 - 실제 Privy 인증을 모방
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [embeddedWalletAddress, setEmbeddedWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'embedded' | 'external' | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 저장된 인증 정보 불러오기
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setAuthenticated(authData.authenticated);
      setAddress(authData.address);
      setEmbeddedWalletAddress(authData.embeddedWalletAddress);
      setWalletType(authData.walletType);
    }
  }, []);

  // 인증 정보 저장
  const saveAuthState = (data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // 이메일 로그인 처리
  const loginWithEmail = async (email: string) => {
    setIsConnecting(true);
    try {
      // 모의 이메일 로그인 프로세스 - 1초 후 로그인 성공
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 랜덤 주소 생성 (임베디드 지갑용)
      const newAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // 상태 업데이트
      setAuthenticated(true);
      setEmbeddedWalletAddress(newAddress);
      setAddress(newAddress);
      setWalletType('embedded');
      
      // 로컬 스토리지에 저장
      saveAuthState({
        authenticated: true,
        address: newAddress,
        embeddedWalletAddress: newAddress,
        walletType: 'embedded'
      });
      
      setShowModal(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // 외부 지갑 연결 처리
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // 모의 지갑 연결 프로세스 - 1초 후 연결 성공
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 랜덤 주소 생성 (외부 지갑용)
      const newAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // 상태 업데이트
      setAuthenticated(true);
      setAddress(newAddress);
      setWalletType('external');
      
      // 로컬 스토리지에 저장
      saveAuthState({
        authenticated: true,
        address: newAddress,
        embeddedWalletAddress,
        walletType: 'external'
      });
      
      setShowModal(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // 로그인 방식 선택 핸들러
  const login = (method: 'email' | 'wallet' | 'google' | 'apple') => {
    if (method === 'email') {
      // 이메일 입력 필드가 있는 모달을 표시해야 하지만, 
      // 간단하게 하기 위해 샘플 이메일로 바로 로그인
      loginWithEmail('user@example.com');
    } else if (method === 'wallet') {
      connectWallet();
    } else {
      // 구글, 애플 로그인 - 이메일 방식과 유사하게 처리
      loginWithEmail(`${method}_user@example.com`);
    }
  };

  // 임베디드 지갑 생성
  const createEmbeddedWallet = async () => {
    if (!authenticated) {
      console.error('로그인 상태에서만 임베디드 지갑을 생성할 수 있습니다.');
      return;
    }

    setIsConnecting(true);
    try {
      // 모의 지갑 생성 프로세스 - 1초 후 생성 성공
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 이미 임베디드 지갑이 있는 경우 생성하지 않음
      if (embeddedWalletAddress) return;
      
      // 랜덤 주소 생성
      const newWalletAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // 상태 업데이트
      setEmbeddedWalletAddress(newWalletAddress);
      
      // 외부 지갑 연결 상태가 아니면 임베디드 지갑 주소를 기본 주소로 설정
      if (walletType !== 'external') {
        setAddress(newWalletAddress);
        setWalletType('embedded');
      }
      
      // 로컬 스토리지에 저장
      saveAuthState({
        authenticated,
        address: walletType === 'external' ? address : newWalletAddress,
        embeddedWalletAddress: newWalletAddress,
        walletType: walletType || 'embedded'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // 로그아웃
  const logout = () => {
    setAuthenticated(false);
    setAddress(null);
    setEmbeddedWalletAddress(null);
    setWalletType(null);
    
    // 로컬 스토리지에서 인증 정보 제거
    localStorage.removeItem(STORAGE_KEY);
  };

  // 모달 토글
  const toggleModal = () => setShowModal(prev => !prev);
  
  // 모달 닫기
  const closeModal = () => setShowModal(false);

  const value = {
    authenticated,
    address,
    walletType,
    embeddedWalletAddress,
    isConnecting,
    showModal,
    login,
    loginWithEmail,
    connectWallet,
    logout,
    createEmbeddedWallet,
    toggleModal,
    closeModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 모의 Privy 훅 - 실제 usePrivy 훅을 모방
export function usePrivy() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('usePrivy must be used within an AuthProvider');
  }
  
  return {
    ready: true,
    authenticated: context.authenticated,
    user: context.authenticated ? {
      wallet: context.embeddedWalletAddress ? {
        address: context.embeddedWalletAddress
      } : null
    } : null,
    login: context.login,
    logout: context.logout,
    createWallet: context.createEmbeddedWallet,
    connectWallet: context.connectWallet,
    showModal: context.showModal,
    toggleModal: context.toggleModal,
    closeModal: context.closeModal,
    isConnecting: context.isConnecting
  };
}

// 모의 Wagmi 훅 - 실제 useAccount 훅을 모방
export function useAccount() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAccount must be used within an AuthProvider');
  }
  
  return {
    address: context.address,
    isConnected: context.authenticated && !!context.address,
    status: context.authenticated && !!context.address ? 'connected' : 'disconnected',
  };
}

// 지갑 잔액 정보 제공 - 모의 데이터
export function useBalance({ address }: { address?: string }) {
  return {
    data: { 
      formatted: '0.0', 
      symbol: 'ETH',
      decimals: 18,
      value: BigInt(0),
    },
    isLoading: false,
  };
}

// 네트워크 정보 제공 - 모의 데이터
export function useNetwork() {
  return {
    chain: { id: 1, name: 'Mainnet' },
    chains: [{ id: 1, name: 'Mainnet' }],
  };
} 