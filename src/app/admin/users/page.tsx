'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { UserDetails } from '@/types/admin';

export default function UsersManagementPage() {
  const { users, updateUserStatus, fetchUsers, isLoading, error } = useAdminStore();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Handle hydration mismatch and fetch users
  useEffect(() => {
    setIsClient(true);
    fetchUsers();
  }, [fetchUsers]);

  if (!isClient) {
    return null;
  }

  // Filter users based on search term and selected status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      user.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle user status update
  const handleStatusUpdate = (userId: string, newStatus: 'active' | 'suspended') => {
    updateUserStatus(userId, newStatus);
    setEditingUser(null);
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => fetchUsers()} 
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
          <span className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
            총 {users.length}명
          </span>
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
            <span className="text-[#0abab5]">사용자 데이터를 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-400">상태 필터:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedStatus === 'all'
                    ? 'bg-[#0abab5]/20 text-[#0abab5] border border-[#0abab5]/30'
                    : 'bg-gray-700 text-gray-300 border border-transparent hover:bg-gray-600'
                } transition-colors`}
              >
                전체
              </button>
              <button
                onClick={() => setSelectedStatus('active')}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedStatus === 'active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-700 text-gray-300 border border-transparent hover:bg-gray-600'
                } transition-colors`}
              >
                활성
              </button>
              <button
                onClick={() => setSelectedStatus('suspended')}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedStatus === 'suspended'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-gray-700 text-gray-300 border border-transparent hover:bg-gray-600'
                } transition-colors`}
              >
                정지
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="주소 또는 ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0abab5] focus:border-[#0abab5]"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glassmorphism-card border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID / 주소
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  도플 / 토큰
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  가입일
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  최근 활동
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-transparent">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">#{user.id}</div>
                      <div className="text-sm text-gray-400">{user.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <div className="flex items-center text-sm text-white">
                          <svg className="h-4 w-4 text-emerald-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {user.doppleCount > 0 ? user.doppleCount : "-"}
                        </div>
                        <div className="flex items-center text-sm text-white">
                          <svg className="h-4 w-4 text-purple-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {user.tokenBalance > 0 ? user.tokenBalance : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.createdAt ? formatDate(user.createdAt) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.lastActive ? formatDate(user.lastActive) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status === 'active' ? '활성' : '정지'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex justify-end space-x-2">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleStatusUpdate(user.id, 'suspended')}
                              disabled={isLoading}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              {isLoading ? '처리 중...' : '정지'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(user.id, 'active')}
                              disabled={isLoading}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              {isLoading ? '처리 중...' : '활성화'}
                            </button>
                          )}
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="text-[#0abab5] hover:text-[#0abab5]/80 transition-colors"
                        >
                          관리
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2 text-sm">검색 결과가 없습니다</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Information */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">사용자 관리 정보</h3>
            <p className="text-sm text-gray-400 mb-2">
              사용자 계정을 관리하고 문제가 있는 사용자를 정지시킬 수 있습니다. 정지된 사용자는 서비스에 접근할 수 없습니다.
            </p>
            <p className="text-sm text-gray-400">
              정지 조치는 사용자의 지갑 주소를 기반으로 하며, 영구적인 조치가 아닙니다. 필요시 언제든지 상태를 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 