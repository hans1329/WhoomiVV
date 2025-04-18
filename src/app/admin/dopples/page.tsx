'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Mock data for development
const mockDopples = [
  {
    id: '1',
    name: '소피아',
    ownerAddress: '0x1234...5678',
    createdAt: '2023-05-15',
    imageUrl: '/images/mock/dopple1.jpg',
    status: 'active',
    category: 'virtual',
    interests: ['음악', '영화', '패션'],
    aiModel: 'GPT-4',
    popularity: 87,
  },
  {
    id: '2',
    name: '알렉스',
    ownerAddress: '0xabcd...ef12',
    createdAt: '2023-04-22',
    imageUrl: '/images/mock/dopple2.jpg',
    status: 'active',
    category: 'celebrity',
    interests: ['스포츠', '여행', '요리'],
    aiModel: 'GPT-4',
    popularity: 92,
  },
  {
    id: '3',
    name: '에밀리',
    ownerAddress: '0x7890...1234',
    createdAt: '2023-06-03',
    imageUrl: '/images/mock/dopple3.jpg',
    status: 'hidden',
    category: 'virtual',
    interests: ['독서', '예술', '과학'],
    aiModel: 'GPT-4',
    popularity: 65,
  },
  {
    id: '4',
    name: '제이슨',
    ownerAddress: '0xdef0...789a',
    createdAt: '2023-05-29',
    imageUrl: '/images/mock/dopple4.jpg',
    status: 'featured',
    category: 'historical',
    interests: ['역사', '철학', '정치'],
    aiModel: 'GPT-4',
    popularity: 78,
  },
  {
    id: '5',
    name: '마리아',
    ownerAddress: '0x2468...0246',
    createdAt: '2023-06-10',
    imageUrl: '/images/mock/dopple5.jpg',
    status: 'active',
    category: 'virtual',
    interests: ['음악', '게임', '테크놀로지'],
    aiModel: 'GPT-4',
    popularity: 81,
  },
];

export default function DopplesManagementPage() {
  const [isClient, setIsClient] = useState(false);
  const [dopples, setDopples] = useState(mockDopples);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingDopple, setEditingDopple] = useState<string | null>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Filter dopples based on search term, category, and status
  const filteredDopples = dopples.filter(dopple => {
    const matchesSearch = 
      dopple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dopple.id.toString().includes(searchTerm) ||
      dopple.ownerAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      dopple.category === selectedCategory;
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      dopple.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Update dopple status
  const handleStatusUpdate = (doppleId: string, newStatus: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setDopples(dopples.map(dopple => 
        dopple.id === doppleId 
          ? { ...dopple, status: newStatus as any } 
          : dopple
      ));
      setEditingDopple(null);
      setIsLoading(false);
    }, 800);
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

  // Calculate status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'hidden':
        return 'bg-gray-500/20 text-gray-400';
      case 'featured':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: 'active', label: '활성' },
    { value: 'hidden', label: '숨김' },
    { value: 'featured', label: '추천' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">도플 관리</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid' 
                ? 'bg-[#0abab5]/20 text-[#0abab5]' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            } transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg ${
              viewMode === 'table' 
                ? 'bg-[#0abab5]/20 text-[#0abab5]' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            } transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-400">카테고리:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0abab5] focus:border-[#0abab5]"
              >
                <option value="all">전체</option>
                <option value="virtual">가상 캐릭터</option>
                <option value="celebrity">셀러브리티</option>
                <option value="historical">역사적 인물</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-400">상태:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0abab5] focus:border-[#0abab5]"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="hidden">숨김</option>
                <option value="featured">추천</option>
              </select>
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
              placeholder="이름 또는 ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0abab5] focus:border-[#0abab5]"
            />
          </div>
        </div>
      </div>

      {/* Dopples Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDopples.length > 0 ? (
            filteredDopples.map((dopple) => (
              <div key={dopple.id} className="glassmorphism-card border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm overflow-hidden flex flex-col">
                <div className="relative h-60 w-full bg-gray-900">
                  {/* Placeholder for where the actual image would be */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <svg className="h-16 w-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(dopple.status)}`}>
                      {dopple.status === 'active' ? '활성' : dopple.status === 'hidden' ? '숨김' : '추천'}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/50 text-xs font-semibold rounded-full text-white">
                      인기도: {dopple.popularity}%
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-white">{dopple.name}</h3>
                      <p className="text-sm text-gray-400">#{dopple.id}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(dopple.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 truncate">{dopple.ownerAddress}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">카테고리</p>
                    <p className="text-sm text-white">
                      {dopple.category === 'virtual' ? '가상 캐릭터' : 
                       dopple.category === 'celebrity' ? '셀러브리티' : '역사적 인물'}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">관심사</p>
                    <div className="flex flex-wrap gap-1">
                      {dopple.interests.map((interest, index) => (
                        <span key={index} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-white">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-700">
                    {editingDopple === dopple.id ? (
                      <div className="flex justify-between items-center">
                        <select
                          className="bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0abab5] focus:border-[#0abab5]"
                          value={dopple.status}
                          onChange={(e) => handleStatusUpdate(dopple.id, e.target.value)}
                          disabled={isLoading}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setEditingDopple(null)}
                          className="text-gray-400 hover:text-gray-300 text-sm"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDopple(dopple.id)}
                        className="w-full py-1.5 bg-[#0abab5]/10 hover:bg-[#0abab5]/20 text-[#0abab5] rounded-lg transition-colors text-sm"
                      >
                        관리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
              <svg className="h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      ) : (
        // Table View
        <div className="glassmorphism-card border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    도플
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    소유자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    생성일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    인기도
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
                {filteredDopples.length > 0 ? (
                  filteredDopples.map((dopple) => (
                    <tr key={dopple.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{dopple.name}</div>
                            <div className="text-sm text-gray-400">#{dopple.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{dopple.ownerAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {dopple.category === 'virtual' ? '가상 캐릭터' : 
                           dopple.category === 'celebrity' ? '셀러브리티' : '역사적 인물'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(dopple.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className="bg-[#0abab5] h-2 rounded-full" 
                              style={{ width: `${dopple.popularity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-white">{dopple.popularity}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(dopple.status)}`}>
                          {dopple.status === 'active' ? '활성' : dopple.status === 'hidden' ? '숨김' : '추천'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingDopple === dopple.id ? (
                          <div className="flex justify-end items-center space-x-2">
                            <select
                              className="bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0abab5] focus:border-[#0abab5]"
                              value={dopple.status}
                              onChange={(e) => handleStatusUpdate(dopple.id, e.target.value)}
                              disabled={isLoading}
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditingDopple(null)}
                              className="text-gray-400 hover:text-gray-300"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingDopple(dopple.id)}
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
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>검색 결과가 없습니다</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dopple Management Information */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">도플 관리 정보</h3>
            <p className="text-sm text-gray-400 mb-2">
              도플의 상태를 변경하여 사용자에게 표시되는 방식을 관리할 수 있습니다.
            </p>
            <div className="space-y-1 mt-3">
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">활성</span>
                <span className="text-xs text-gray-400">일반적으로 사용자에게 표시되는 상태입니다.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">숨김</span>
                <span className="text-xs text-gray-400">사용자에게 표시되지 않습니다. 문제가 있는 도플을 숨기는 데 사용합니다.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">추천</span>
                <span className="text-xs text-gray-400">메인 페이지와 추천 섹션에 우선적으로 표시됩니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 