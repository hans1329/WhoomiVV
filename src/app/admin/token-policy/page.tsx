'use client';

import { useState, useEffect } from 'react';
import { useAdminStore, syncAdminSettingsWithApp } from '@/store/adminStore';

function TokenPolicyPage() {
  const { settings, updateTokenCosts } = useAdminStore();
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local states for each input field
  const [createCharacterCost, setCreateCharacterCost] = useState(0);
  const [regenerateImageCost, setRegenerateImageCost] = useState(0);
  const [recreateCharacterCost, setRecreateCharacterCost] = useState(0);
  const [editPersonalityCost, setEditPersonalityCost] = useState(0);
  const [editAppearanceCost, setEditAppearanceCost] = useState(0);
  const [editStyleCost, setEditStyleCost] = useState(0);
  const [firstDoppleFree, setFirstDoppleFree] = useState(false);
  const [dailyTokenRefill, setDailyTokenRefill] = useState(10); // 기본값 10

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Reset form state when settings change
    if (settings.tokenCosts) {
      setCreateCharacterCost(settings.tokenCosts.createCharacterCost);
      setRegenerateImageCost(settings.tokenCosts.regenerateImageCost);
      setRecreateCharacterCost(settings.tokenCosts.recreateCharacterCost);
      setEditPersonalityCost(settings.tokenCosts.editPersonalityCost);
      setEditAppearanceCost(settings.tokenCosts.editAppearanceCost);
      setEditStyleCost(settings.tokenCosts.editStyleCost);
      setFirstDoppleFree(settings.tokenCosts.firstDoppleFree);
      setDailyTokenRefill(settings.tokenCosts.dailyTokenRefill || 10);
    }
  }, [settings.tokenCosts]);

  if (!isClient) {
    return null;
  }

  // Handle toggling editing mode
  const handleEditToggle = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      // If canceling edit, reset values to original
      handleCancel();
    }
  };

  // Handle save
  const handleSave = () => {
    setIsSaving(true);

    // Collect all values from local states
    const updatedCosts = {
      createCharacterCost,
      regenerateImageCost,
      recreateCharacterCost,
      editPersonalityCost,
      editAppearanceCost,
      editStyleCost,
      firstDoppleFree,
      dailyTokenRefill
    };

    // Update token costs in the store
    updateTokenCosts(updatedCosts);

    // Sync admin settings with user application (save to localStorage)
    syncAdminSettingsWithApp();

    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 800);
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset to original values
    if (settings.tokenCosts) {
      setCreateCharacterCost(settings.tokenCosts.createCharacterCost);
      setRegenerateImageCost(settings.tokenCosts.regenerateImageCost);
      setRecreateCharacterCost(settings.tokenCosts.recreateCharacterCost);
      setEditPersonalityCost(settings.tokenCosts.editPersonalityCost);
      setEditAppearanceCost(settings.tokenCosts.editAppearanceCost);
      setEditStyleCost(settings.tokenCosts.editStyleCost);
      setFirstDoppleFree(settings.tokenCosts.firstDoppleFree);
      setDailyTokenRefill(settings.tokenCosts.dailyTokenRefill || 10);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">토큰 정책 관리</h1>
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
              onClick={handleEditToggle}
              className="px-4 py-2 bg-[#0abab5] hover:bg-[#0abab5]/80 rounded-lg transition-colors"
            >
              수정
            </button>
          )}
        </div>
      </div>

      {/* Token Policy Settings Card */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm space-y-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">토큰 정책 설정</h2>
          <p className="text-gray-400 text-sm">
            도플 생성 및 수정에 필요한 토큰 비용을 설정합니다. 비용을 조정하면 즉시 모든 사용자에게 적용됩니다.
          </p>
        </div>

        {/* Daily Token Refill Section */}
        <div className="space-y-6 bg-[#0abab5]/5 p-5 rounded-xl border border-[#0abab5]/20 mb-6">
          <h3 className="font-medium text-white mb-2">일일 토큰 충전 설정</h3>
          <p className="text-sm text-gray-400 mb-4">
            사용자의 토큰이 소진되었을 때 GMT 00:00에 자동으로 충전될 토큰의 양을 설정합니다.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-white">일일 충전량</label>
                <span className="text-sm text-[#0abab5] font-bold">{dailyTokenRefill} 토큰</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={dailyTokenRefill}
                onChange={(e) => setDailyTokenRefill(parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0abab5]"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex items-center space-x-2 mt-4 md:mt-0">
              <input
                type="text"
                inputMode="numeric"
                value={dailyTokenRefill === 0 ? '' : dailyTokenRefill}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setDailyTokenRefill(0);
                  } else {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 1000) {
                      setDailyTokenRefill(val);
                    }
                  }
                }}
                disabled={!isEditing}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
              />
              <span className="text-sm text-white whitespace-nowrap">토큰</span>
            </div>
          </div>
          
          <div className="bg-blue-500/10 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-400 font-medium">충전 정책 안내</p>
                <p className="text-xs text-gray-400 mt-1">
                  사용자의 토큰이 0이 되었을 때, 다음 GMT 00:00에 설정한 양만큼 자동으로 토큰이 충전됩니다.
                  값을 0으로 설정하면 자동 충전 기능이 비활성화됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* First Dopple Free Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">첫 도플 무료</h3>
              <p className="text-sm text-gray-400">사용자의 첫 번째 도플 생성을 무료로 제공합니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={firstDoppleFree}
                onChange={(e) => setFirstDoppleFree(e.target.checked)}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0abab5]"></div>
            </label>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="font-medium text-white mb-4">도플 생성 및 수정 비용</h3>

            {/* Individual Cost Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Character Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">도플 생성 비용</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={createCharacterCost === 0 ? '' : createCharacterCost}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setCreateCharacterCost(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setCreateCharacterCost(val);
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
                  />
                  <span className="text-sm text-white whitespace-nowrap">토큰</span>
                </div>
                <p className="text-xs text-gray-500">권장 범위: 10-100 토큰</p>
              </div>

              {/* Regenerate Image Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">이미지 재생성 비용</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={regenerateImageCost === 0 ? '' : regenerateImageCost}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setRegenerateImageCost(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setRegenerateImageCost(val);
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
                  />
                  <span className="text-sm text-white whitespace-nowrap">토큰</span>
                </div>
                <p className="text-xs text-gray-500">권장 범위: 5-50 토큰</p>
              </div>

              {/* Recreate Character Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">전체 캐릭터 재생성 비용</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={recreateCharacterCost === 0 ? '' : recreateCharacterCost}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setRecreateCharacterCost(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setRecreateCharacterCost(val);
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
                  />
                  <span className="text-sm text-white whitespace-nowrap">토큰</span>
                </div>
                <p className="text-xs text-gray-500">권장 범위: 10-80 토큰</p>
              </div>

              {/* Edit Personality Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">성격 수정 비용</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editPersonalityCost === 0 ? '' : editPersonalityCost}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setEditPersonalityCost(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setEditPersonalityCost(val);
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
                  />
                  <span className="text-sm text-white whitespace-nowrap">토큰</span>
                </div>
                <p className="text-xs text-gray-500">권장 범위: 5-30 토큰</p>
              </div>

              {/* Edit Appearance Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">외모 수정 비용</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editAppearanceCost === 0 ? '' : editAppearanceCost}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setEditAppearanceCost(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setEditAppearanceCost(val);
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
                  />
                  <span className="text-sm text-white whitespace-nowrap">토큰</span>
                </div>
                <p className="text-xs text-gray-500">권장 범위: 5-30 토큰</p>
              </div>

              {/* Edit Style Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">스타일 수정 비용</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editStyleCost === 0 ? '' : editStyleCost}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setEditStyleCost(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setEditStyleCost(val);
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-[#0abab5] focus:border-[#0abab5]"
                  />
                  <span className="text-sm text-white whitespace-nowrap">토큰</span>
                </div>
                <p className="text-xs text-gray-500">권장 범위: 5-20 토큰</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Policy Information */}
      <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">토큰 정책 정보</h3>
            <p className="text-sm text-gray-400 mb-2">
              토큰은 사용자가 도플을 만들고 수정하는 데 필요한 경제 시스템입니다. 적절한 토큰 비용을 설정하여 서비스 가치와 사용자 경험 사이의 균형을 맞추세요.
            </p>
            <p className="text-sm text-gray-400">
              첫 번째 도플 무료 옵션을 활성화하면 신규 사용자의 유입을 증가시킬 수 있지만, 토큰 소비량이 감소할 수 있습니다.
              적절한 일일 토큰 충전량은 사용자 참여도를 유지하는 데 중요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenPolicyPage; 