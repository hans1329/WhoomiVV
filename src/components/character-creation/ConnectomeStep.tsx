'use client';

import React, { useState, useEffect } from 'react';
import { Connectome } from '@/types/character';
import ConnectomeEditor from '@/components/ConnectomeEditor';
import ConnectomeVisualization from '@/components/ConnectomeVisualization';
import ConnectomeReport from '@/components/ConnectomeReport';
import { simpleSampleConnectome } from '@/data/sampleConnectome';
import { useCharacterCreation } from '@/store/characterCreation';

interface ConnectomeStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onUpdateConnectome?: (connectome: Connectome) => void;
  initialConnectome?: Connectome;
  isEditing?: boolean;
}

const ConnectomeStep: React.FC<ConnectomeStepProps> = ({
  onNext,
  onPrevious,
  onUpdateConnectome,
  initialConnectome,
  isEditing = false,
}) => {
  // Get store methods if props aren't provided
  const { 
    updateConnectome, 
    setCurrentStep, 
    character
  } = useCharacterCreation();

  const [connectome, setConnectome] = useState<Connectome>(() => {
    // Use initialConnectome if provided, or try to get from character, or use sample
    return initialConnectome || 
           (character.connectome && Object.keys(character.connectome).length > 0 
             ? character.connectome 
             : simpleSampleConnectome);
  });
  
  const [activeView, setActiveView] = useState<'edit' | 'visualize' | 'analyze'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  
  // Update parent component when connectome changes
  useEffect(() => {
    // Use the provided callback or fall back to the store method
    if (onUpdateConnectome) {
      onUpdateConnectome(connectome);
    } else {
      updateConnectome(connectome);
    }
  }, [connectome, onUpdateConnectome, updateConnectome]);
  
  // Handle navigation forward with validation
  const handleNext = () => {
    // Simple validation - make sure we have some nodes and edges
    if (connectome.nodes.length < 1) {
      alert('캐릭터 특성이 최소 하나 이상 필요합니다.');
      return;
    }
    
    // Use the provided callback or move to the next step using the store
    if (onNext) {
      onNext();
    } else {
      setCurrentStep(7); // Move to the next step (Review step)
    }
  };
  
  // Handle navigation backward
  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      setCurrentStep(5); // Go back to Style step
    }
  };
  
  // Generate AI suggestions for connectome
  const handleGenerateAISuggestions = () => {
    setIsLoading(true);
    
    // Here you would call your AI service
    // For now, we'll simulate a delay and then set some sample data
    setTimeout(() => {
      setConnectome(simpleSampleConnectome);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">캐릭터 특성 연결망</h1>
        <p className="text-gray-600 mt-2">
          캐릭터의 성격, 관심사, 감정, 가치 등의 특성을 정의하고 이들 간의 관계를 설정하세요.
          이 연결망은 캐릭터의 독특한 개성과 행동 패턴을 형성합니다.
        </p>
      </div>
      
      {/* View controls */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeView === 'edit' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveView('edit')}
        >
          편집
        </button>
        <button
          className={`px-4 py-2 ${activeView === 'visualize' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveView('visualize')}
        >
          시각화
        </button>
        <button
          className={`px-4 py-2 ${activeView === 'analyze' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveView('analyze')}
        >
          분석
        </button>
      </div>
      
      {/* Content based on active view */}
      <div>
        {activeView === 'edit' && (
          <ConnectomeEditor 
            initialConnectome={connectome} 
            onChange={setConnectome} 
          />
        )}
        
        {activeView === 'visualize' && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">특성 연결망 시각화</h2>
            <p className="mb-6 text-gray-600">
              이 그래프는 캐릭터의 특성들이 어떻게 연결되어 상호작용하는지 보여줍니다. 
              노드를 드래그하여 이동하거나, 스크롤하여 확대/축소할 수 있습니다.
            </p>
            <div className="h-[500px] flex justify-center">
              <ConnectomeVisualization 
                connectome={connectome} 
                width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 64 : 800)} 
                height={500}
              />
            </div>
          </div>
        )}
        
        {activeView === 'analyze' && (
          <ConnectomeReport connectome={connectome} />
        )}
        
        {/* AI Assistance Button */}
        <div className="flex justify-center mt-6 mb-8">
          <button
            onClick={handleGenerateAISuggestions}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                AI 생성 중...
              </>
            ) : (
              'AI에게 특성 연결망 추천 받기'
            )}
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={handlePrevious}
          className="px-6 py-2 border rounded-md"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default ConnectomeStep; 