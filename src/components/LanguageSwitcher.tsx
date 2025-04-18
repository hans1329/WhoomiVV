'use client';

import { useState, useEffect } from 'react';
import { useLanguage, Language } from '@/internationalization';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(language);

  // 언어 변경 이벤트나 props 언어 변경 감지
  useEffect(() => {
    setCurrentLang(language);
    
    // 언어 변경 이벤트 리스너 추가
    const handleLanguageChange = () => {
      setCurrentLang(language);
    };
    
    window.addEventListener('language-changed', handleLanguageChange);
    
    return () => {
      window.removeEventListener('language-changed', handleLanguageChange);
    };
  }, [language]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectLanguage = (lang: Language) => {
    changeLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    
    // 언어 변경 시 페이지 리로드 없이도 모든 컴포넌트 업데이트를 위한 강제 리렌더링
    window.dispatchEvent(new Event('language-changed'));
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center px-2 py-1 rounded-md bg-gray-800/70 hover:bg-gray-700 text-xs text-gray-300 transition-colors"
      >
        <span className="mr-1">{currentLang.toUpperCase()}</span>
        <svg 
          className="w-3 h-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-20 rounded-md shadow-lg bg-gray-800 border border-gray-700 z-50">
          <div className="py-1">
            <button
              className={`block w-full text-left px-4 py-2 text-xs ${currentLang === 'en' ? 'text-[#0abab5]' : 'text-gray-300 hover:text-white'}`}
              onClick={() => selectLanguage('en')}
            >
              English
            </button>
            <button
              className={`block w-full text-left px-4 py-2 text-xs ${currentLang === 'ko' ? 'text-[#0abab5]' : 'text-gray-300 hover:text-white'}`}
              onClick={() => selectLanguage('ko')}
            >
              한국어
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 