'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// Context 타입 정의
type SupabaseContextType = {
  supabase: SupabaseClient;
};

// Context 생성
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Provider Props 타입 정의
interface SupabaseProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() => getSupabaseClient());

  // 초기화 로깅
  useEffect(() => {
    console.log('Supabase 클라이언트가 초기화되었습니다. 단일 인스턴스 사용 중.');
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Custom Hook
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
} 