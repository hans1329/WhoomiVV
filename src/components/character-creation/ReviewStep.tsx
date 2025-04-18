'use client';

import { useState, useEffect } from 'react';
import { useCharacterCreation, TOKEN_COSTS, ADMIN_SETTINGS } from '@/store/characterCreation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { generateImage } from '@/utils/imageGeneration';
import { useAuth } from '@/lib/auth-context';
import { supabase, uploadDoppleImage, saveDopple, getUserDopples, saveDoppleWithCache } from '@/lib/supabase';

interface ReviewStepProps {
  isEditing?: boolean;
  doppleId?: string | number;
}

export default function ReviewStep({ isEditing = false, doppleId }: ReviewStepProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    character, 
    generatedImageUrl, 
    isGeneratingImage, 
    tokenCost,
    isFirstDopple,
    calculateTotalCost,
    setGeneratedImage, 
    setIsGeneratingImage,
    regenerateImage,
    reset,
    setCurrentStep,
    addToImageHistory
  } = useCharacterCreation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterName, setCharacterName] = useState(character.name || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);

  // Debug log on mount
  useEffect(() => {
    console.log("[ReviewStep] Component mounted with character state:", character);
    console.log("[ReviewStep] isEditing:", isEditing, "doppleId:", doppleId);
    
    // 현재 토큰 잔액 불러오기
    if (user) {
      const userId = typeof user === 'string' ? user : user?.id;
      try {
        const tokenData = localStorage.getItem(`token_balance_${userId}`);
        if (tokenData) {
          setTokenBalance(JSON.parse(tokenData));
        }
      } catch (error) {
        console.error('Error loading token balance:', error);
      }
    }
  }, []);

  // Debug log on character change
  useEffect(() => {
    console.log("[ReviewStep] Character state updated:", character);
  }, [character]);

  // MBTI type descriptions
  const mbtiDescriptions: Record<string, string> = {
    'ISTJ': 'Responsible and practical realist',
    'ISFJ': 'Dedicated and warm protector',
    'INFJ': 'Idealistic and insightful advocate',
    'INTJ': 'Innovative strategist',
    'ISTP': 'Bold and practical problem-solver',
    'ISFP': 'Flexible and charming artist',
    'INFP': 'Idealistic and creative mediator',
    'INTP': 'Creative and logical thinker',
    'ESTP': 'Active and realistic explorer',
    'ESFP': 'Free-spirited and spontaneous entertainer',
    'ENFP': 'Passionate and creative free spirit',
    'ENTP': 'Creative and quick-witted inventor',
    'ESTJ': 'Systematic and practical manager',
    'ESFJ': 'Social and caring facilitator',
    'ENFJ': 'Charismatic and inspiring leader',
    'ENTJ': 'Bold and decisive leader'
  };

  // Image generation simulation
  const handleGenerateImage = async () => {
    if (!characterName.trim()) {
      setErrorMessage('Please enter a character name');
      return;
    }
    
    setIsGeneratingImage(true);
    
    try {
      // 캐릭터 이름 업데이트
      const updatedCharacter = {
        ...character,
        name: characterName
      };
      
      console.log("[ReviewStep] Sending character data for image generation:", JSON.stringify(updatedCharacter, null, 2));
      
      // 실제 이미지 생성 API 호출 (as Partial<Character>로 타입 단언)
      const imageUrl = await generateImage(updatedCharacter as any);
      
      // 이미지 저장 및 히스토리에 추가
      setGeneratedImage(imageUrl);
      addToImageHistory(imageUrl);
      
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMessage('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Dopple creation or update
  const handleCreateDopple = async () => {
    if (!generatedImageUrl) {
      setErrorMessage('Please generate an image first');
      return;
    }
    
    if (!characterName || characterName.trim() === '') {
      setErrorMessage('Please enter a valid character name');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // 사용자 정보 가져오기
      const userAddress = typeof user === 'string' 
        ? user 
        : user?.id ? user.id : 'unknown-user';
      
      // 현재 타임스탬프를 ID로 사용 (임시)
      const tempId = Date.now().toString();
      
      // Supabase Storage에 이미지 업로드
      let imageUrl = generatedImageUrl;
      try {
        console.log("Uploading image to Supabase Storage...");
        // 타입 오류 수정: doppleId가 undefined일 수 있으므로 기본값 설정
        const doppleIdForUpload = (isEditing && doppleId) ? doppleId : tempId;
        imageUrl = await uploadDoppleImage(generatedImageUrl, userAddress, doppleIdForUpload);
        console.log("Image uploaded successfully:", imageUrl);
      } catch (imageError) {
        console.error("Failed to upload image to Supabase, using original image data:", imageError);
        // 업로드 실패 시 원본 이미지 데이터 사용
      }

      // 디버깅: 캐릭터 이름 로깅
      console.log("DEBUG: Character name before saving:", characterName);
      
      // 최소한의 필수 필드만 포함하여 도플 데이터 준비
      const doppleData = {
        id: isEditing && doppleId ? doppleId : tempId,
        name: characterName.trim(), // 이름 저장 시 앞뒤 공백 제거
        description: character.personality?.traits
          ? `${character.personality.mbti} - ${character.personality.traits.map((t: any) => t.trait).join(', ')}`
          : 'AI Character',
        image_url: imageUrl,
        // owner_id와 user_id 필드 제거 - 스키마 문제로 인해
        metadata: {
          gender: character.appearance?.gender || 'neutral',
          ageGroup: character.appearance?.ageGroup || 'adult',
          emotionalExpression: character.personality?.emotionalTone || 'balanced',
          imageStyle: character.style?.style || 'realistic',
          level: 1,
          xp: 0,
          likes: 0,
          mbti: character.personality?.mbti || 'INFJ',
          traits: character.personality?.traits?.map((t: any) => t.trait) || [],
          created_by: userAddress, // 사용자 ID를 메타데이터에 저장
          characterName: characterName.trim() // 중복으로 이름 저장 (안전장치)
        }
      };
      
      console.log("DEBUG: Saving dopple data with name:", doppleData.name);
      
      // saveDopple 대신 saveDoppleWithCache 사용
      let savedDopple = null;
      try {
        // 항상 로컬 스토리지에 저장 (Supabase 오류 핸들링은 내부에서 처리)
        savedDopple = await saveDoppleWithCache(doppleData);
        console.log("Dopple saved successfully:", savedDopple);
      } catch (saveError) {
        // 여기에 오는 것은 치명적인 오류 - 로컬 스토리지 저장도 실패했을 경우
        console.error("Critical error saving dopple:", saveError);
        setErrorMessage('A critical error occurred. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // 대시보드로 이동
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
      reset(); // 상태 초기화
    } catch (error) {
      console.error('Error creating/updating dopple:', error);
      setErrorMessage(isEditing 
        ? 'An error occurred while updating the Dopple. Please try again.' 
        : 'An error occurred while creating the Dopple. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(5); // 이전 단계로 이동
  };

  // Generate personality traits string
  const getPersonalityTraitSummary = () => {
    return character.personality?.traits?.map((t: any) => t.trait).join(', ') || 'None';
  };

  // Generate interests string
  const getInterestsSummary = () => {
    if (!character.interests || character.interests.length === 0) return 'None';
    
    return character.interests.map(interest => {
      return `${interest.category} (${interest.items.join(', ')})`;
    }).join('; ');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 relative">
      {/* Background animation effect */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#0abab5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-60 -right-20 w-60 h-60 bg-[#0abab5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      {/* Step indicator circles at the top */}
      <div className="flex justify-center mb-4 sm:mb-6 gap-2 sm:gap-4 overflow-x-auto py-2">
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm">1</div>
          <span className="hidden md:inline text-gray-500">Appearance</span>
        </div>
        <div className="w-6 sm:w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm">2</div>
          <span className="hidden md:inline text-gray-500">Personality</span>
        </div>
        <div className="w-6 sm:w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm">3</div>
          <span className="hidden md:inline text-gray-500">Interests</span>
        </div>
        <div className="w-6 sm:w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm">4</div>
          <span className="hidden md:inline text-gray-500">Style</span>
        </div>
        <div className="w-6 sm:w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#0abab5] flex items-center justify-center text-white font-bold text-xs sm:text-sm">5</div>
          <span className="hidden md:inline text-[#0abab5] font-medium">Review</span>
        </div>
      </div>
      
      {/* Header */}
      <div className="mb-5 sm:mb-8 relative">
        <div className="absolute top-0 left-0 w-2 h-10 bg-[#0abab5]"></div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 pl-4">
          {isEditing ? 'Review & Update Dopple' : 'Final Review & Creation'}
        </h1>
        <p className="text-gray-400 pl-4 text-sm sm:text-base">
          {isEditing ? 'Review your changes and update your Dopple' : 'Review your Dopple and generate an image'}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full mb-5 sm:mb-7 relative">
        <div className="w-full h-1 bg-gray-700 rounded-full">
          <div className="w-5/6 h-1 bg-[#0abab5] rounded-full"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:gap-8 relative z-10">
        <div className="w-full">
          <div className="glassmorphism-card w-full p-6 sm:p-10 space-y-6 sm:space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#0abab5]/80">Character Name</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => {
                  setCharacterName(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0abab5] focus:border-transparent placeholder-gray-500"
                placeholder="Enter your Dopple's name"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
                <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">1</span>
                Basic Information
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-400">Gender</td>
                    <td className="py-2 text-right">
                      {character.appearance?.gender === 'male' && 'Male'}
                      {character.appearance?.gender === 'female' && 'Female'}
                      {character.appearance?.gender === 'non-binary' && 'Non-binary'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Age Group</td>
                    <td className="py-1">
                      {character.appearance?.ageGroup === 'child' && 'Child'}
                      {character.appearance?.ageGroup === 'teen' && 'Teen'}
                      {character.appearance?.ageGroup === 'young-adult' && 'Young Adult'}
                      {character.appearance?.ageGroup === 'adult' && 'Adult'}
                      {character.appearance?.ageGroup === 'senior' && 'Senior'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">MBTI</td>
                    <td className="py-1">
                      {character.personality?.mbti} - {character.personality?.mbti && mbtiDescriptions[character.personality.mbti]}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Personality Traits</td>
                    <td className="py-1">{getPersonalityTraitSummary()}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Emotional Expression</td>
                    <td className="py-1">
                      {character.personality?.emotionalTone === 'cheerful' && 'Cheerful'}
                      {character.personality?.emotionalTone === 'serious' && 'Serious'}
                      {character.personality?.emotionalTone === 'playful' && 'Playful'}
                      {character.personality?.emotionalTone === 'calm' && 'Calm'}
                      {character.personality?.emotionalTone === 'energetic' && 'Energetic'}
                      {character.personality?.emotionalTone === 'mysterious' && 'Mysterious'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
                <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">2</span>
                Interests
              </h2>
              <p className="text-sm bg-black/30 p-5 rounded-lg border border-gray-800">{getInterestsSummary()}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
                <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">3</span>
                Image Style
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-400">Style</td>
                    <td className="py-1">
                      {character.style?.style || 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Lighting</td>
                    <td className="py-1">
                      {character.style?.lighting || 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Composition</td>
                    <td className="py-1">
                      {character.style?.composition || 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-400">Background</td>
                    <td className="py-1">{character.style?.background || 'Not specified'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="glassmorphism-card w-full p-6 sm:p-10 space-y-6 sm:space-y-8 bg-gray-900/60 border-gray-800">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
              <svg className="w-5 h-5 text-[#0abab5] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Character Image
            </h2>
            
            <div className="relative rounded-md overflow-hidden w-full aspect-square bg-gray-900">
              {generatedImageUrl ? (
                <>
                  <img
                    src={generatedImageUrl}
                    alt="Generated character"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 flex justify-center">
                    <Button
                      onClick={() => regenerateImage()}
                      variant="outline"
                      className="w-auto px-8 border-gray-800 text-gray-400 hover:bg-gray-900 bg-gray-900/50"
                      size="default"
                    >
                      Regenerate Image
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full flex-col p-6 bg-gray-900">
                  <div className="w-20 h-20 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-[#0abab5]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-center text-gray-400 mb-4 max-w-xs">
                    AI will generate a character image based on the information you provided
                  </p>
                  <Button
                    onClick={handleGenerateImage}
                    disabled={
                      isGeneratingImage ||
                      !(characterName && character.appearance && character.personality && character.interests && character.style)
                    }
                    variant="default"
                    className="bg-[#0abab5] hover:bg-[#0abab5]/80"
                    size="lg"
                  >
                    {isGeneratingImage ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      "Generate Image"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-300 text-sm">{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          className="w-auto px-8 border-gray-800 text-gray-400 hover:bg-gray-900 bg-gray-900/50"
          size="default"
        >
          Back
        </Button>
        
        <Button
          onClick={handleCreateDopple}
          disabled={isSubmitting || !generatedImageUrl}
          className="w-auto px-10 bg-[#0abab5] hover:bg-[#0abab5]/80"
          size="default"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            "Create Dopple"
          )}
        </Button>
      </div>
    </div>
  );
} 