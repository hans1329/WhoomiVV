'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';

export default function AdminDashboard() {
  const { systemStats, settings, refreshStats, isLoading, error } = useAdminStore();
  const [isClient, setIsClient] = useState(false);
  
  // This ensures hydration mismatch is avoided
  useEffect(() => {
    setIsClient(true);
    // Refresh stats when the page loads
    refreshStats();
  }, [refreshStats]);
  
  if (!isClient) {
    return null;
  }
  
  // Dummy chart data for visualization
  const chatData = [480, 320, 550, 250, 400, 320, 360, 410, 490, 700, 510, 620];
  const tokenData = [20, 50, 30, 40, 60, 80, 45, 60, 70, 90, 50, 80];
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
          <button 
            onClick={refreshStats} 
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* 에러가 있을 경우 알림 표시 (기본 UI는 그대로 유지) */}
      {error && (
        <div className="w-full p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>일부 데이터를 가져오는데 실패했습니다. 최신 정보가 아닐 수 있습니다.</span>
          </div>
        </div>
      )}
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="w-full p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 animate-spin text-[#0abab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[#0abab5]">데이터베이스에서 최신 정보를 불러오는 중...</span>
          </div>
        </div>
      )}
      
      {/* Quick settings summary */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">토큰 정책</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">첫 도플 무료:</span>
                <span className={settings.tokenCosts.firstDoppleFree ? "text-green-500" : "text-red-500"}>
                  {settings.tokenCosts.firstDoppleFree ? "활성화" : "비활성화"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">도플 생성 비용:</span>
                <span>{settings.tokenCosts.createCharacterCost} 토큰</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">이미지 재생성 비용:</span>
                <span>{settings.tokenCosts.regenerateImageCost} 토큰</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">일일 토큰 충전량:</span>
                <span>{settings.tokenCosts.dailyTokenRefill || 10} 토큰</span>
              </div>
              <Link 
                href="/admin/token-policy"
                className="mt-2 text-[#0abab5] text-sm hover:underline inline-block"
              >
                토큰 정책 관리 →
              </Link>
            </div>
          </div>
          
          <div className="h-full border-l border-gray-700 hidden md:block" />
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">시스템 알림</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">컨텐츠 모더레이션:</span>
                <span className={settings.contentModeration.enableAutoModeration ? "text-green-500" : "text-yellow-500"}>
                  {settings.contentModeration.enableAutoModeration ? "활성화" : "비활성화"}
                </span>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <textarea 
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-300 placeholder-gray-500"
                  placeholder="시스템 공지 메시지를 작성하세요..."
                  rows={2}
                  value={settings.systemAnnouncement}
                  readOnly
                ></textarea>
              </div>
              <Link 
                href="/admin/settings"
                className="mt-2 text-[#0abab5] text-sm hover:underline inline-block"
              >
                시스템 설정 →
              </Link>
            </div>
          </div>
          
          <div className="h-full border-l border-gray-700 hidden md:block" />
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">서버 상태</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">OpenAI API:</span>
                <span className="text-green-500">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Supabase DB:</span>
                <span className="text-green-500">연결됨</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">이미지 생성 API:</span>
                <span className="text-green-500">활성화</span>
              </div>
              <Link 
                href="/admin/system-status"
                className="mt-2 text-[#0abab5] text-sm hover:underline inline-block"
              >
                시스템 상태 →
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">총 사용자</p>
              <h3 className="text-2xl font-bold">
                {systemStats.totalUsers > 0 ? systemStats.totalUsers.toLocaleString() : "-"}
              </h3>
              <p className="text-xs text-[#0abab5] mt-1">
                {systemStats.activeUsers > 0 ? systemStats.activeUsers.toLocaleString() : "-"} 활성 사용자
              </p>
            </div>
            <div className="p-2 bg-[#0abab5]/10 text-[#0abab5] rounded-lg h-fit">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">총 도플</p>
              <h3 className="text-2xl font-bold">
                {systemStats.totalDopples > 0 ? systemStats.totalDopples.toLocaleString() : "-"}
              </h3>
              <p className="text-xs text-emerald-400 mt-1">
                사용자 평균 {systemStats.totalUsers > 0 && systemStats.totalDopples > 0 
                  ? (systemStats.totalDopples / systemStats.totalUsers).toFixed(1) 
                  : "-"} 도플
              </p>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg h-fit">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">총 대화</p>
              <h3 className="text-2xl font-bold">
                {systemStats.totalChats > 0 ? systemStats.totalChats.toLocaleString() : "-"}
              </h3>
              <p className="text-xs text-blue-400 mt-1">실시간 활발한 대화</p>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg h-fit">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">소비된 토큰</p>
              <h3 className="text-2xl font-bold">
                {systemStats.tokensConsumed > 0 ? systemStats.tokensConsumed.toLocaleString() : "-"}
              </h3>
              <p className="text-xs text-purple-400 mt-1">지속적 토큰 소비 중</p>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg h-fit">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/token-policy"
          className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm hover:bg-[#0abab5]/10 hover:border-[#0abab5]/30 transition-all group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-[#0abab5]/10 text-[#0abab5] rounded-full mb-3 group-hover:bg-[#0abab5]/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-white mb-1">토큰 정책 관리</h3>
            <p className="text-sm text-gray-400">토큰 비용과 정책을 관리합니다</p>
          </div>
        </Link>
        
        <Link
          href="/admin/users"
          className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm hover:bg-[#0abab5]/10 hover:border-[#0abab5]/30 transition-all group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-[#0abab5]/10 text-[#0abab5] rounded-full mb-3 group-hover:bg-[#0abab5]/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-white mb-1">사용자 관리</h3>
            <p className="text-sm text-gray-400">사용자 목록 및 계정 상태를 관리합니다</p>
          </div>
        </Link>
        
        <Link
          href="/admin/dopples"
          className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm hover:bg-[#0abab5]/10 hover:border-[#0abab5]/30 transition-all group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-[#0abab5]/10 text-[#0abab5] rounded-full mb-3 group-hover:bg-[#0abab5]/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-white mb-1">도플 관리</h3>
            <p className="text-sm text-gray-400">생성된 도플 및 추천 도플을 관리합니다</p>
          </div>
        </Link>
      </div>
      
      {/* Recent activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
          <h3 className="text-lg font-medium mb-4">대화 통계 (최근 12일)</h3>
          <div className="h-64 flex items-end space-x-2">
            {chatData.map((value, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-[#0abab5]/30 to-[#0abab5]/10 rounded-t-sm"
                style={{ 
                  height: `${(value / Math.max(...chatData)) * 100}%`,
                  transition: 'height 0.5s ease' 
                }}
              >
                <div className="h-1 w-full bg-[#0abab5]/70 rounded-t-sm"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>12일 전</span>
            <span>6일 전</span>
            <span>오늘</span>
          </div>
        </div>
        
        <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
          <h3 className="text-lg font-medium mb-4">토큰 소비 (최근 12일)</h3>
          <div className="h-64 flex items-end space-x-2">
            {tokenData.map((value, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-purple-500/30 to-purple-500/10 rounded-t-sm"
                style={{ 
                  height: `${(value / Math.max(...tokenData)) * 100}%`,
                  transition: 'height 0.5s ease' 
                }}
              >
                <div className="h-1 w-full bg-purple-500/70 rounded-t-sm"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>12일 전</span>
            <span>6일 전</span>
            <span>오늘</span>
          </div>
        </div>
      </div>
    </div>
  );
} 