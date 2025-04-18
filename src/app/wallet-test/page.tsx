'use client';

import { EmbeddedWallet } from '@/components/embedded-wallet';

export default function WalletTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">임베딩 지갑 테스트</h1>
            <p className="text-gray-400">
              이 페이지는 Privy를 사용한 임베딩 지갑 기능을 테스트합니다.
              이메일, 소셜 로그인 또는 기존 지갑을 사용하여 로그인하고 임베딩 지갑을 생성할 수 있습니다.
            </p>
          </div>

          <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">임베딩 지갑 연결/생성</h2>
            <EmbeddedWallet />
          </div>

          <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">임베딩 지갑 기능</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>이메일, 구글 또는 애플 계정으로 로그인</li>
              <li>기존 지갑(MetaMask, WalletConnect 등)으로 로그인</li>
              <li>사용자별 임베딩 지갑 생성</li>
              <li>사용자가 개인 키를 관리할 필요 없음</li>
              <li>로그인한 모든 기기에서 동일한 지갑 접근 가능</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 