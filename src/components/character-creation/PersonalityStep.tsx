'use client';

import { useCharacterCreation } from '@/store/characterCreation';
import { Button } from '@/components/ui/button';
import { MBTI, EmotionalTone, PersonalityTrait } from '@/types/character';
import { useState, useEffect } from 'react';

interface PersonalityStepProps {
  isEditing?: boolean;
}

export default function PersonalityStep({ isEditing = false }: PersonalityStepProps) {
  const { character, updatePersonality, setCurrentStep } = useCharacterCreation();
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    character.personality?.traits?.map(t => t.trait) || []
  );
  
  // Debug log on mount
  useEffect(() => {
    console.log("[PersonalityStep] Component mounted with character state:", character);
  }, []);

  // Debug log on character change
  useEffect(() => {
    console.log("[PersonalityStep] Character state updated:", character);
  }, [character]);
  
  // Initialize emotionalTone if it's not set
  useEffect(() => {
    if (!character.personality?.emotionalTone) {
      console.log("Emotional tone not set, waiting for user selection");
    }
  }, [character.personality?.emotionalTone, updatePersonality]);

  // Update traits in the store whenever selected traits change
  useEffect(() => {
    if (selectedTraits.length > 0) {
      const traits: PersonalityTrait[] = selectedTraits.map(trait => ({
        trait,
        intensity: 3, // Default intensity is middle value
      }));
      
      updatePersonality({ traits });
    }
  }, [selectedTraits, updatePersonality]);

  // Available traits
  const availableTraits = [
    'analytical', 'creative', 'sensitive', 'ambitious', 'reliable',
    'adventurous', 'assertive', 'sociable', 'adaptable', 'curious',
    'honest', 'patient', 'organized', 'enthusiastic', 'independent',
    'gentle', 'resilient', 'practical', 'thoughtful', 'confident'
  ];

  const handleTraitClick = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      if (selectedTraits.length < 5) {
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  const handleNext = () => {
    // Convert selected traits to PersonalityTrait array and save to store
    const traits: PersonalityTrait[] = selectedTraits.map(trait => ({
      trait,
      intensity: 3, // Default intensity is middle value
    }));
    
    updatePersonality({ traits });
    setCurrentStep(4); // Move to next step
  };

  const handleBack = () => {
    setCurrentStep(2); // Move to previous step
  };

  return (
    <div className="max-w-4xl mx-auto p-8 relative">
      {/* Background animation effect */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#0abab5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-60 -right-20 w-60 h-60 bg-[#0abab5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      {/* Step indicator circles at the top */}
      <div className="flex justify-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">1</div>
          <span className="hidden md:inline text-gray-500">Appearance</span>
        </div>
        <div className="w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#0abab5] flex items-center justify-center text-white font-bold">2</div>
          <span className="hidden md:inline text-[#0abab5] font-medium">Personality</span>
        </div>
        <div className="w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">3</div>
          <span className="hidden md:inline text-gray-500">Interests</span>
        </div>
        <div className="w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">4</div>
          <span className="hidden md:inline text-gray-500">Style</span>
        </div>
      </div>
      
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute top-0 left-0 w-2 h-10 bg-[#0abab5]"></div>
        <h1 className="text-3xl font-bold mb-2 pl-4">Personality Settings</h1>
        <p className="text-gray-400 pl-4">Define your Dopple's character traits and emotional qualities</p>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full mb-8 relative">
        <div className="w-full h-1 bg-gray-700 rounded-full">
          <div className="w-2/6 h-1 bg-[#0abab5] rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="glassmorphism-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">1</span>
            MBTI Personality Type
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 
              'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map((type) => (
              <button
                key={type}
                className={`p-2 border rounded-lg transition-colors ${
                  character.personality?.mbti === type 
                    ? 'bg-[#0abab5] text-white border-[#0abab5]' 
                    : 'bg-gray-800 border-gray-700 hover:border-[#0abab5]/50'
                }`}
                onClick={() => updatePersonality({ mbti: type as MBTI })}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-black/20 rounded-md text-sm text-gray-400">
            <p>MBTI types help define how your Dopple approaches the world, processes information, makes decisions, and structures their life.</p>
          </div>
        </div>

        <div className="glassmorphism-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">2</span>
            Character Traits (Select up to 5)
          </h2>
          <div className="flex flex-wrap gap-2">
            {availableTraits.map((trait) => (
              <button
                key={trait}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  selectedTraits.includes(trait)
                    ? 'bg-[#0abab5] text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-[#0abab5]/20 hover:text-white'
                }`}
                onClick={() => handleTraitClick(trait)}
              >
                {trait}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {selectedTraits.length}/5 selected
          </p>
        </div>

        <div className="glassmorphism-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">3</span>
            Emotional Expression
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['cheerful', 'serious', 'playful', 'calm', 'energetic', 'mysterious'].map((tone) => (
              <button
                key={tone}
                className={`p-3 border rounded-lg transition-colors ${
                  character.personality?.emotionalTone === tone
                    ? 'bg-[#0abab5]/20 border-[#0abab5]' 
                    : 'bg-gray-800 border-gray-700 hover:border-[#0abab5]/50'
                }`}
                onClick={() => updatePersonality({ emotionalTone: tone as EmotionalTone })}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="glassmorphism-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">4</span>
            Favorite Color
          </h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', 
              '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
              '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
              '#FF6E40', '#0abab5', '#FFFFFF', '#BDBDBD', '#212121'].map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded-full transition-all ${
                  character.personality?.favoriteColor === color
                    ? 'ring-2 ring-white scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => updatePersonality({ favoriteColor: color })}
                aria-label={`Favorite color: ${color}`}
              />
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-black/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-[#0abab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300 text-sm font-medium">Pro Tip</span>
            </div>
            <p className="text-sm text-gray-400">
              The personality traits you choose will influence how your Dopple responds in conversations and what they're drawn to.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <Button variant="outline" onClick={handleBack}
          className="px-8 py-2.5 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-[#0abab5]/80 hover:border-[#0abab5]/50 transition-colors">
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!character.personality?.mbti || selectedTraits.length === 0 || !character.personality?.emotionalTone}
          className="px-8 py-2.5 bg-gradient-to-r from-[#0abab5] to-[#0abab5]/70 hover:from-[#0abab5]/90 hover:to-[#0abab5]/60 text-white border-none shadow-lg shadow-[#0abab5]/20 hover:shadow-xl hover:shadow-[#0abab5]/30 transition-all">
          Next
        </Button>
      </div>
    </div>
  );
} 