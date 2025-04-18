import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

// 지원 언어 정의
export type Language = 'en' | 'ko';

// 텍스트 ID별 번역 데이터 타입
export interface Translations {
  [key: string]: {
    en: string;
    ko: string;
  };
}

// 다국어 컨텍스트 인터페이스
interface LanguageContextType {
  language: Language;
  changeLanguage: (newLanguage: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

// 기본 번역 데이터
const translations: Translations = {
  // Common texts
  'app.name': {
    en: 'Whoomi',
    ko: '후미',
  },
  'common.connect': {
    en: 'Connect',
    ko: '연결하기',
  },
  'common.connect_with_myself': {
    en: 'Connect with Myself',
    ko: '나와 연결하기',
  },
  'common.create_dopple': {
    en: 'Create Dopple',
    ko: '도플 생성하기',
  },
  'common.chat': {
    en: 'Chat',
    ko: '채팅하기',
  },
  'common.auto_chat': {
    en: 'Auto Chat',
    ko: '자동 대화',
  },
  'common.view_all': {
    en: 'View All',
    ko: '모두 보기',
  },
  'common.no_results': {
    en: 'No search results found',
    ko: '검색 결과가 없습니다',
  },
  'common.search_placeholder': {
    en: 'Search by dopple name, description, or tags...',
    ko: '도플 이름, 설명 또는 태그로 검색...',
  },
  'common.all_categories': {
    en: 'All Categories',
    ko: '모든 카테고리',
  },

  // Landing page
  'landing.title': {
    en: 'Talk to the Doppel that mirrors you',
    ko: '당신을 반영하는 도플과 대화하세요',
  },
  'landing.subtitle': {
    en: 'You can create and network with your AI doppelgänger that reflects you and grows through conversation.',
    ko: '당신을 반영하고 대화를 통해 성장하는 AI 도플겐거를 만들고 네트워킹할 수 있습니다.',
  },
  'landing.feature.growth': {
    en: 'Growth Through Conversation',
    ko: '대화를 통한 성장',
  },
  'landing.feature.growth.description': {
    en: 'Your virtual human levels up and grows as you interact with the AI',
    ko: 'AI와 상호작용하며 가상 인간이 레벨업하고 성장합니다',
  },
  'landing.feature.token': {
    en: 'Token Rewards',
    ko: '토큰 보상',
  },
  'landing.feature.token.description': {
    en: 'Earn Whoomi tokens by completing daily conversations and develop your character.',
    ko: '일일 대화를 완료하고 Whoomi 토큰을 획득하여 캐릭터를 발전시키세요.',
  },
  'landing.feature.nft': {
    en: 'NFT Minting',
    ko: 'NFT 민팅',
  },
  'landing.feature.nft.description': {
    en: 'Mint your virtual human as an NFT whenever you want and prove your ownership.',
    ko: '원하는 시점에 가상 인간을 NFT로 민팅하여 소유권을 증명하세요.',
  },

  // Dopple Zone
  'dopplezone.title': {
    en: 'Dopple Zone',
    ko: '도플 존',
  },
  'dopplezone.subtitle': {
    en: 'Chat with a variety of dopples and get inspired',
    ko: '다양한 도플들과 대화하고 영감을 얻어보세요',
  },
  'dopplezone.view_my_dopple': {
    en: 'View My Dopple',
    ko: '내 도플 보기',
  },
  'dopplezone.best_dopples': {
    en: 'Best Dopples',
    ko: '베스트 도플',
  },
  'dopplezone.recommended_dopples': {
    en: 'Recommended Dopples',
    ko: '추천 도플',
  },
  'dopplezone.all_dopples': {
    en: 'All Dopples',
    ko: '모든 도플',
  },

  // Connectome
  'connectome.title': {
    en: 'Connectome Network',
    ko: '컨넥텀 네트워크',
  },
  'connectome.subtitle': {
    en: 'Whoomi\'s dopples form internal structures by connecting emotions, topics, and values through a semantic memory system called \'connectome\'.',
    ko: 'Whoomi의 도플은 \'커넥텀\'이라는 의미 기억 시스템을 통해 대화 속 감정, 주제, 가치관을 연결하여 내면 구조를 형성합니다.',
  },
  'connectome.create_first': {
    en: 'Please Create a Dopple First',
    ko: '도플을 먼저 생성해주세요',
  },
  'connectome.need_dopple': {
    en: 'You need a dopple to visualize the connectome network.',
    ko: '컨넥텀 네트워크를 시각화하려면 도플이 필요합니다.',
  },
  'connectome.individual': {
    en: 'Individual Dopple Connectome',
    ko: '개별 도플 컨넥텀',
  },
  'connectome.relationships': {
    en: 'Dopple Relationships',
    ko: '도플 간 관계',
  },
  'connectome.my_dopples': {
    en: 'My Dopples',
    ko: '내 도플',
  },
  'connectome.view_detailed': {
    en: 'View Detailed Connectome',
    ko: '상세 컨넥텀 보기',
  },
  'connectome.develop_through_chat': {
    en: 'Develop Connectome Through Conversation',
    ko: '대화로 컨넥텀 발전시키기',
  },
  'connectome.what_is': {
    en: 'What is a Connectome?',
    ko: '커넥텀이란?',
  },
  'connectome.explanation': {
    en: 'A connectome is a psychological network formed by dopples through conversation. Unlike simple memory storage, it analyzes semantic relationships between emotions and topics to help dopples understand users more deeply.',
    ko: '커넥텀은 도플이 대화를 통해 형성하는 심리적 연결망입니다. 단순한 기억 저장이 아닌, 감정과 주제 간의 의미 관계를 분석하여 도플이 사용자를 더 깊이 이해할 수 있게 합니다.',
  },
  'connectome.nodes': {
    en: 'Nodes',
    ko: '노드',
  },
  'connectome.nodes.description': {
    en: 'Elements like emotions, topics, and values',
    ko: '감정, 주제, 가치관 등의 요소',
  },
  'connectome.edges': {
    en: 'Edges',
    ko: '엣지',
  },
  'connectome.edges.description': {
    en: 'Connections and strengths between nodes',
    ko: '노드 간의 연결 관계와 강도',
  },
  'connectome.memory_nodes': {
    en: 'Memory Nodes',
    ko: '메모리 노드',
  },
  'connectome.memory_nodes.description': {
    en: 'Special nodes containing important memories',
    ko: '중요한 기억이 담긴 특별 노드',
  },
};

// 번역 함수
const getTranslation = (key: string, lang: Language, defaultText: string = ''): string => {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return defaultText || key;
};

// 언어 컨텍스트 생성
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 언어 공급자 컴포넌트
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  
  // 브라우저 언어 감지 또는 로컬 스토리지에서 저장된 언어 설정 가져오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ko')) {
        setLanguage(savedLanguage);
      } else {
        // 브라우저 언어 감지
        const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
        setLanguage(browserLang);
        localStorage.setItem('language', browserLang);
      }
    }
  }, []);

  // 언어 변경 함수
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
      // 언어 변경 시 강제 리렌더링을 위한 이벤트 디스패치
      window.dispatchEvent(new Event('language-changed'));
    }
  };

  // 번역 함수
  const t = (key: string, defaultText: string = ''): string => {
    return getTranslation(key, language, defaultText);
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 현재 언어 상태 관리 훅
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 다국어 객체 타입
export type I18n = {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
};
