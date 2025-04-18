'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';

export default function ChatLimitsPage() {
  const { settings, updateChatLimits } = useAdminStore();
  const [chatLimits, setChatLimits] = useState(settings.chatLimits);
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Time options for reset time dropdown
  const timeOptions = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", 
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Reset form state when settings change
    setChatLimits(settings.chatLimits);
  }, [settings.chatLimits]);

  if (!isClient) {
    return null;
  }

  // Handle input change
  const handleInputChange = (field: string, value: number | string) => {
    setChatLimits({
      ...chatLimits,
      [field]: value
    });
  };

  // Handle save
  const handleSave = () => {
    setIsSaving(true);

    // Update chat limits in the store
    updateChatLimits(chatLimits);

    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 800);
  };

  // Handle cancel
  const handleCancel = () => {
    setChatLimits(settings.chatLimits);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">대화 제한 설정</h1>
        <div className="flex space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 ${
                  isSaving ? 'bg-[#0abab5]/50' : 'bg-[#0abab5] hover:bg-[#0abab5]/80'
                } rounded-lg transition-colors flex items-center`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#0abab5] hover:bg-[#0abab5]/80 rounded-lg transition-colors"
            >
              수정
            </button>
          )}
        </div>
      </div>

      {/* Chat Limits Settings Card */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm space-y-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">일일 대화 제한 설정</h2>
          <p className="text-gray-400 text-sm">
            사용자가 토큰을 사용하기 전에 이용할 수 있는 무료 대화 횟수와 초기화 시간을 설정합니다.
            변경사항은 다음 초기화 시간부터 적용됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Daily Free Chats Setting */}
          <div className="space-y-4">
            <h3 className="font-medium text-white">일일 무료 대화 횟수</h3>
            <p className="text-sm text-gray-400">
              사용자가 매일 토큰을 사용하지 않고 이용할 수 있는 무료 대화의 횟수입니다.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-gray-400">무료 대화 횟수</label>
                <span className="text-sm text-[#0abab5]">{chatLimits.dailyFreeChats}회</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={chatLimits.dailyFreeChats}
                onChange={(e) => handleInputChange('dailyFreeChats', parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0abab5]"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>20</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-400 font-medium">참고사항</p>
                  <p className="text-xs text-gray-400 mt-1">
                    무료 대화 횟수를 0으로 설정하면 모든 대화에 토큰이 소비됩니다.
                    신규 사용자 유치를 위해 적절한 무료 대화 횟수를 설정하는 것이 권장됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Time Setting */}
          <div className="space-y-4">
            <h3 className="font-medium text-white">초기화 시간 (GMT)</h3>
            <p className="text-sm text-gray-400">
              무료 대화 횟수가 매일 초기화되는 시간입니다. GMT 기준으로 설정됩니다.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400 block">초기화 시간</label>
              <select
                value={chatLimits.resetTime}
                onChange={(e) => handleInputChange('resetTime', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2.5 focus:ring-[#0abab5] focus:border-[#0abab5]"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time} GMT
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#0abab5]/20 rounded-lg">
                  <svg className="w-5 h-5 text-[#0abab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-300">현재 설정된 초기화 시간:</p>
                  <p className="text-base font-medium text-white">매일 {chatLimits.resetTime} GMT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Limit Information */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">사용량 관리 정보</h3>
            <p className="text-sm text-gray-400 mb-2">
              대화 제한 설정은 서비스의 사용량과 수익 모델 간의 균형을 맞추기 위한 중요한 요소입니다.
              무료 대화 횟수를 통해 사용자는 서비스를 체험할 수 있지만, 이후에는 토큰을 소비하여 계속 사용해야 합니다.
            </p>
            <p className="text-sm text-gray-400">
              초기화 시간은 사용자의 지역과 활동 패턴을 고려하여 설정하는 것이 좋습니다.
              일반적으로 자정(00:00)은 하루의 시작으로 인식되어 많이 사용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 