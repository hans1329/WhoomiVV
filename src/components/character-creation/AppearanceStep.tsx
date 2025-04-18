'use client';

import { useCharacterCreation } from '@/store/characterCreation';
import { Button } from '@/components/ui/button';
import { Gender, AgeGroup, BodyType, SkinTone, HairStyle, HairColor, FaceShape, EyeShape } from '@/types/character';
import { useState, useEffect } from 'react';

interface AppearanceStepProps {
  isEditing?: boolean;
}

export default function AppearanceStep({ isEditing = false }: AppearanceStepProps) {
  const { character, updateAppearance, setCurrentStep } = useCharacterCreation();
  const [additionalFeatures, setAdditionalFeatures] = useState<string[]>(
    character.appearance?.additionalFeatures || []
  );

  // Debug log on mount
  useEffect(() => {
    console.log("[AppearanceStep] Component mounted with character state:", character);
  }, []);

  // Debug log on character change
  useEffect(() => {
    console.log("[AppearanceStep] Character state updated:", character);
  }, [character]);

  // Update additionalFeatures in the store whenever they change
  useEffect(() => {
    updateAppearance({ additionalFeatures });
  }, [additionalFeatures, updateAppearance]);

  // Effect to handle gender-based features compatibility
  useEffect(() => {
    if (character.appearance?.gender === 'female') {
      // For female characters, remove beard and mustache if present
      const filteredFeatures = additionalFeatures.filter(
        feature => feature !== 'beard' && feature !== 'mustache'
      );
      
      if (filteredFeatures.length !== additionalFeatures.length) {
        setAdditionalFeatures(filteredFeatures);
      }
      
      // If hairStyle is bald, reset it
      if (character.appearance?.hairStyle === 'bald') {
        updateAppearance({ hairStyle: undefined });
      }
    }
  }, [character.appearance?.gender]);

  const handleFeatureToggle = (feature: string) => {
    if (additionalFeatures.includes(feature)) {
      setAdditionalFeatures(additionalFeatures.filter(f => f !== feature));
    } else {
      const newFeatures = [...additionalFeatures, feature];
      setAdditionalFeatures(newFeatures);
    }
  };

  const handleGlassesToggle = () => {
    const currentValue = character.appearance?.glasses || false;
    updateAppearance({ glasses: !currentValue });
  };

  const handleGenderChange = (newGender: Gender) => {
    updateAppearance({ gender: newGender });
  };

  const handleNext = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  // Add validation function to check if required fields are filled
  const isValid = () => {
    const hasGender = !!character.appearance?.gender;
    const hasAgeGroup = !!character.appearance?.ageGroup;
    const hasHairStyle = !!character.appearance?.hairStyle;
    const hasFaceShape = !!character.appearance?.faceShape;
    
    console.log("[AppearanceStep] Validation check:", { 
      hasGender, 
      hasAgeGroup,
      hasHairStyle,
      hasFaceShape,
      gender: character.appearance?.gender, 
      ageGroup: character.appearance?.ageGroup,
      hairStyle: character.appearance?.hairStyle,
      faceShape: character.appearance?.faceShape
    });
    
    return hasGender && hasAgeGroup && hasHairStyle && hasFaceShape;
  };

  return (
    <div className="max-w-4xl mx-auto p-8 relative">
      {/* Background animation effect */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0abab5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      
      {/* Step indicator circles at the top */}
      <div className="flex justify-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#0abab5] flex items-center justify-center text-white font-bold">1</div>
          <span className="hidden md:inline text-[#0abab5] font-medium">Appearance</span>
        </div>
        <div className="w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">2</div>
          <span className="hidden md:inline text-gray-500">Personality</span>
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
      <div className="mb-6 sm:mb-10 relative">
        <div className="absolute top-0 left-0 w-2 h-10 bg-[#0abab5]"></div>
        <h1 className="text-xl sm:text-2xl font-normal mb-2 pl-4">Appearance Settings</h1>
        <p className="text-gray-400 pl-4 text-sm sm:text-base">Define how your Dopple character looks</p>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full mb-5 sm:mb-6 relative">
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-[#0abab5] rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg">
            <h2 className="text-base sm:text-lg font-normal mb-3 sm:mb-4 flex items-center text-white">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">1</span>
              Basic Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Gender</label>
                <select
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                  value={character.appearance?.gender || ''}
                  onChange={(e) => handleGenderChange(e.target.value as Gender)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Age Group</label>
                <select
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                  value={character.appearance?.ageGroup || ''}
                  onChange={(e) => updateAppearance({ ageGroup: e.target.value as AgeGroup })}
                >
                  <option value="">Select age group</option>
                  <option value="child">Child</option>
                  <option value="teen">Teen</option>
                  <option value="young-adult">Young Adult</option>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg">
            <h2 className="text-base sm:text-lg font-normal mb-3 sm:mb-4 flex items-center text-white">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">2</span>
              Physical Features
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Body Type</label>
                <select
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                  value={character.appearance?.bodyType || ''}
                  onChange={(e) => updateAppearance({ bodyType: e.target.value as BodyType })}
                >
                  <option value="">Select body type</option>
                  <option value="slim">Slim</option>
                  <option value="average">Average</option>
                  <option value="athletic">Athletic</option>
                  <option value="curvy">Curvy</option>
                  <option value="plus-size">Plus Size</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Skin Tone</label>
                <select
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                  value={character.appearance?.skinTone || ''}
                  onChange={(e) => updateAppearance({ skinTone: e.target.value as SkinTone })}
                >
                  <option value="">Select skin tone</option>
                  <option value="fair">Fair</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="tan">Tan</option>
                  <option value="dark">Dark</option>
                  <option value="deep">Deep</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg">
          <h2 className="text-base sm:text-lg font-normal mb-3 sm:mb-4 flex items-center text-white">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">3</span>
            Hair Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Hair Length/Style</label>
              <select
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                value={character.appearance?.hairStyle || ''}
                onChange={(e) => updateAppearance({ hairStyle: e.target.value as HairStyle })}
              >
                <option value="">Select hair style</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
                {character.appearance?.gender !== 'female' && (
                  <option value="bald">Bald</option>
                )}
                <option value="afro">Afro</option>
                <option value="braids">Braids</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Hair Color</label>
              <select
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                value={character.appearance?.hairColor || ''}
                onChange={(e) => updateAppearance({ hairColor: e.target.value as HairColor })}
              >
                <option value="">Select hair color</option>
                <option value="black">Black</option>
                <option value="brown">Brown</option>
                <option value="blonde">Blonde</option>
                <option value="red">Red</option>
                <option value="gray">Gray</option>
                <option value="white">White</option>
                <option value="colorful">Colorful</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg">
            <h2 className="text-base sm:text-lg font-normal mb-3 sm:mb-4 flex items-center text-white">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">4</span>
              Face Shape
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Face Shape</label>
                <select
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                  value={character.appearance?.faceShape || ''}
                  onChange={(e) => updateAppearance({ faceShape: e.target.value as FaceShape })}
                >
                  <option value="">Select face shape</option>
                  <option value="round">Round</option>
                  <option value="oval">Oval</option>
                  <option value="square">Square</option>
                  <option value="heart">Heart</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Eye Shape</label>
                <select
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-[#0abab5] focus:ring-1 focus:ring-[#0abab5] focus:outline-none transition-colors text-sm"
                  value={character.appearance?.eyeShape || ''}
                  onChange={(e) => updateAppearance({ eyeShape: e.target.value as EyeShape })}
                >
                  <option value="">Select eye shape</option>
                  <option value="round">Round</option>
                  <option value="almond">Almond</option>
                  <option value="hooded">Hooded</option>
                  <option value="monolid">Monolid</option>
                  <option value="downturned">Downturned</option>
                  <option value="upturned">Upturned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg">
            <h2 className="text-base sm:text-lg font-normal mb-3 sm:mb-4 flex items-center text-white">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">5</span>
              Additional Features
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="mb-2 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Glasses</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleGlassesToggle}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
                      character.appearance?.glasses
                        ? 'bg-[#0abab5]/30 border border-[#0abab5]/50 text-white'
                        : 'bg-gray-800 border border-gray-700 text-gray-400'
                    }`}
                  >
                    {character.appearance?.glasses ? 'Wearing Glasses' : 'No Glasses'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-[#0abab5]/80">Facial Features</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'freckles', 
                    'dimples', 
                    'beauty mark', 
                    ...(character.appearance?.gender !== 'female' ? ['beard', 'mustache'] : []), 
                    'scar', 
                    'tattoo', 
                    'piercing'
                  ].map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        additionalFeatures.includes(feature)
                          ? 'bg-[#0abab5]/30 border border-[#0abab5]/50 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-400'
                      }`}
                    >
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {additionalFeatures.length > 0
                    ? `Selected: ${additionalFeatures.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}`
                    : 'No additional features selected'}
                </p>
              </div>
            </div>
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
          disabled={!isValid()}
          className="px-8 py-2.5 bg-gradient-to-r from-[#0abab5] to-[#0abab5]/70 hover:from-[#0abab5]/90 hover:to-[#0abab5]/60 text-white border-none shadow-lg shadow-[#0abab5]/20 hover:shadow-xl hover:shadow-[#0abab5]/30 transition-all">
          Next
        </Button>
      </div>
    </div>
  );
} 