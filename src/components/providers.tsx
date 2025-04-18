'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LanguageProvider } from '@/internationalization';
import LoginModal from './login-modal';
import { SupabaseProvider } from '@/lib/supabase-provider';

// 로그인 모달 컴포넌트
function AuthModal() {
  const { isModalOpen, closeLoginModal } = useAuth();
  return <LoginModal isOpen={isModalOpen} onClose={closeLoginModal} />;
}

// Providers setup with authentication and login modal
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="glassmorphism p-8 rounded-xl">
        <p className="text-xl font-medium text-white">Initializing connection...</p>
      </div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <AuthModal />
          </LanguageProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
} 