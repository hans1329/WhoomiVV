/**
 * runware API 연동을 위한 이미지 생성 유틸리티
 */

import { Character, AgeGroup } from '@/types/character';

// 연령대 매핑 설정 (요청에 따른 매핑)
export const AGE_GROUP_MAPPING: Record<AgeGroup, string> = {
  'child': '10대',    // 어린이 -> 10대
  'teen': '10대',     // 10대 -> 10대
  'young-adult': '20대', // 청년 -> 20대
  'adult': '30대',    // 성인 -> 30대
  'senior': '30대'    // 노인 -> 30대
};

// 연령대 실제 프롬프팅 매핑 (사용자 요청에 따른 설정)
export const AGE_PROMPT_MAPPING: Record<AgeGroup, string> = {
  'child': '10대',      // 10대 -> 10대
  'teen': '10대',       // 10대 -> 10대
  'young-adult': '20대', // 20대 -> 20대
  'adult': '20대',      // 30대 -> 20대
  'senior': '30대'      // 40대이상 -> 30대
};

// 색상 코드에서 색상 이름 추출
function getColorName(hexColor: string): string {
  // 일반적인 색상 매핑
  const colorMap: Record<string, string> = {
    '#FF5252': 'red',
    '#FF4081': 'pink',
    '#E040FB': 'purple',
    '#7C4DFF': 'deep purple',
    '#536DFE': 'indigo',
    '#448AFF': 'blue',
    '#40C4FF': 'light blue',
    '#18FFFF': 'cyan',
    '#64FFDA': 'teal',
    '#69F0AE': 'green',
    '#B2FF59': 'light green',
    '#EEFF41': 'lime',
    '#FFFF00': 'yellow',
    '#FFD740': 'amber',
    '#FFAB40': 'orange',
    '#FF6E40': 'deep orange',
    '#0abab5': 'turquoise',
    '#FFFFFF': 'white',
    '#BDBDBD': 'grey',
    '#212121': 'black'
  };
  
  return colorMap[hexColor] || 'colored';
}

// 색상 코드에서 # 제거
function stripHashFromColor(color: string): string {
  return color.startsWith('#') ? color.substring(1) : color;
}

// 캐릭터 정보를 기반으로 프롬프트 생성
export function generateCharacterPrompt(character: Partial<Character>): { prompt: string; negativePrompt: string } {
  // 기본 프롬프트 시작
  let prompt = 'high-quality, detailed portrait';
  
  // 이미지 생성에 사용된 프롬프트 세부 정보 로깅
  console.log("[ImageGeneration] Character data for prompt:", JSON.stringify(character, null, 2));
  
  // 성별 추가
  if (character.appearance?.gender) {
    if (character.appearance.gender === 'male') {
      prompt += ', male';
    } else if (character.appearance.gender === 'female') {
      prompt += ', female';
    } else if (character.appearance.gender === 'non-binary') {
      prompt += ', androgynous, non-binary person';
    }
  }
  
  // 연령대 추가 (매핑된 값 사용)
  if (character.appearance?.ageGroup) {
    prompt += `, ${AGE_PROMPT_MAPPING[character.appearance.ageGroup]} age`;
  }
  
  // 체형 추가
  if (character.appearance?.bodyType) {
    prompt += `, ${character.appearance.bodyType} body type`;
  }
  
  // 피부톤 추가
  if (character.appearance?.skinTone) {
    prompt += `, ${character.appearance.skinTone} skin`;
  }
  
  // 헤어 스타일 및 색상 추가
  if (character.appearance?.hairStyle) {
    prompt += `, ${character.appearance.hairStyle} hair`;
    if (character.appearance?.hairColor) {
      // 머리색을 더 강조하기 위해 반복 및 강화
      prompt += ` in ${character.appearance.hairColor} color, ${character.appearance.hairColor} hair color, strong ${character.appearance.hairColor} colored hair`;
    }
  } else if (character.appearance?.hairColor) {
    // 헤어 스타일이 없어도 색상 추가 (강조)
    prompt += `, ${character.appearance.hairColor} hair, strong ${character.appearance.hairColor} colored hair`;
  }
  
  // 얼굴형 추가
  if (character.appearance?.faceShape) {
    prompt += `, ${character.appearance.faceShape} face shape`;
  }
  
  // 눈 모양 추가
  if (character.appearance?.eyeShape) {
    prompt += `, ${character.appearance.eyeShape} eyes`;
  }
  
  // 코 모양 추가
  if (character.appearance?.noseShape) {
    prompt += `, ${character.appearance.noseShape} nose`;
  }
  
  // 입술 모양 추가
  if (character.appearance?.lipShape) {
    prompt += `, ${character.appearance.lipShape} lips`;
  }
  
  // 안경 추가
  if (character.appearance?.glasses) {
    prompt += ', wearing glasses';
  }
  
  // 스타일 추가 (style 또는 imageStyle 중 하나 사용)
  if (character.style?.style) {
    prompt += `, ${character.style.style} style`;
  } else if (character.imageStyle?.style) {
    prompt += `, ${character.imageStyle.style} style`;
  }
  
  // 조명 추가
  if (character.style?.lighting) {
    prompt += `, ${character.style.lighting} lighting`;
  } else if (character.imageStyle?.lighting) {
    prompt += `, ${character.imageStyle.lighting} lighting`;
  }
  
  // 구도 추가
  if (character.style?.composition) {
    prompt += `, ${character.style.composition} composition`;
  } else if (character.imageStyle?.composition) {
    prompt += `, ${character.imageStyle.composition} composition`;
  }
  
  // 감정 톤 추가
  if (character.personality?.emotionalTone) {
    prompt += `, ${character.personality.emotionalTone} expression`;
  }
  
  // 좋아하는 색상 추가 (배경색으로 사용)
  if (character.personality?.favoriteColor) {
    const colorName = getColorName(character.personality.favoriteColor);
    prompt += `, with ${colorName} background`;
  }
  
  // 배경 추가 (style 또는 imageStyle의 background)
  if (character.style?.background) {
    prompt += `, ${character.style.background} background`;
  } else if (character.imageStyle?.background) {
    prompt += `, ${character.imageStyle.background} background`;
  }
  
  // 부정적인 프롬프트 (생성하지 말아야 할 것들)
  const negativePrompt = 'deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur';
  
  // 최종 프롬프트 로깅
  console.log("[ImageGeneration] Final prompt:", prompt);
  console.log("[ImageGeneration] Negative prompt:", negativePrompt);
  
  return {
    prompt,
    negativePrompt
  };
}

// 이미지 생성 API 사용
export async function generateImage(character: Partial<Character>): Promise<string> {
  try {
    // 프롬프트 생성
    const { prompt, negativePrompt } = generateCharacterPrompt(character);
    
    console.log("Generating image with prompt:", prompt);
    
    // Stability AI API를 사용한 이미지 생성
    const apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
    
    // API 키가 없는 경우 백업 이미지 사용
    if (!apiKey) {
      console.error('No Stability API key found');
      return generateMockImage(character);
    }
    
    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            {
              text: negativePrompt,
              weight: -1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        // API 호출 실패 시 백업 이미지 사용
        return generateMockImage(character);
      }
      
      const data = await response.json();
      // base64 형식의 이미지 데이터 반환
      const imageBase64 = data.artifacts[0].base64;
      return `data:image/png;base64,${imageBase64}`;
    } catch (error) {
      console.error('Error calling Stability AI API:', error);
      // API 호출 중 오류 발생 시 백업 이미지 사용
      return generateMockImage(character);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    // 에러 발생 시 백업 이미지 사용
    return generateMockImage(character);
  }
}

// 모의 이미지 생성 함수
function generateMockImage(character: Partial<Character>): string {
  // 캐릭터 특성에 기반한 이미지 URL 생성
  let gender = character.appearance?.gender || 'female';
  let style = character.style?.style || 'realistic';
  
  const randomId = Math.floor(Math.random() * 1000);
  // 테스트용 이미지 URL
  const mockImages = {
    'male': {
      'realistic': `https://thispersondoesnotexist.com/?${randomId}`,
      'anime': `https://api.dicebear.com/6.x/identicon/png?seed=male-anime-${randomId}`,
      'cartoon': `https://api.dicebear.com/6.x/identicon/png?seed=male-cartoon-${randomId}`,
      '3d': `https://api.dicebear.com/6.x/identicon/png?seed=male-3d-${randomId}`,
      'watercolor': `https://api.dicebear.com/6.x/identicon/png?seed=male-watercolor-${randomId}`
    },
    'female': {
      'realistic': `https://thispersondoesnotexist.com/?${randomId}`,
      'anime': `https://api.dicebear.com/6.x/identicon/png?seed=female-anime-${randomId}`,
      'cartoon': `https://api.dicebear.com/6.x/identicon/png?seed=female-cartoon-${randomId}`,
      '3d': `https://api.dicebear.com/6.x/identicon/png?seed=female-3d-${randomId}`,
      'watercolor': `https://api.dicebear.com/6.x/identicon/png?seed=female-watercolor-${randomId}`
    },
    'non-binary': {
      'realistic': `https://thispersondoesnotexist.com/?${randomId}`,
      'anime': `https://api.dicebear.com/6.x/identicon/png?seed=nonbinary-anime-${randomId}`,
      'cartoon': `https://api.dicebear.com/6.x/identicon/png?seed=nonbinary-cartoon-${randomId}`,
      '3d': `https://api.dicebear.com/6.x/identicon/png?seed=nonbinary-3d-${randomId}`,
      'watercolor': `https://api.dicebear.com/6.x/identicon/png?seed=nonbinary-watercolor-${randomId}`
    }
  };
  
  return mockImages[gender as keyof typeof mockImages][style as keyof (typeof mockImages)['female']];
}

// 테스트용 더미 이미지 생성 (실제 API 호출 대신 사용)
export function generateDummyImage(character: Partial<Character>): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 캐릭터 이름 또는 기본값
      const name = character.name || 'Character';
      
      // 배경색 설정 (우선순위: 사용자 선택 색상 > 스타일 기본색)
      let backgroundColor;
      
      if (character.personality?.favoriteColor) {
        // 사용자가 선택한 색상 사용
        backgroundColor = stripHashFromColor(character.personality.favoriteColor);
      } else {
        // 스타일에 따른 기본 배경색
        const style = character.style?.style || 'realistic';
        const styleColors: Record<string, string> = {
          'realistic': '373737',
          'anime': 'ffd2d2',
          '3d': 'c8e6ff',
          'cartoon': 'd2ffd2',
          'watercolor': 'e5d2ff'
        };
        backgroundColor = styleColors[style] || '373737';
      }
      
      // 텍스트 색상 설정 (배경색이 밝은 경우 검은색, 어두운 경우 흰색)
      // 단순화를 위해 고정 값 사용
      const textColor = 'ffffff';
      
      // 더미 이미지 URL 생성 (실제로는 placehold.co 서비스 사용)
      const imageUrl = `https://placehold.co/512x512/${backgroundColor}/${textColor}?text=${name}`;
      resolve(imageUrl);
    }, 2000);
  });
} 