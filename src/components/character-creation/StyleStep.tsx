'use client';

import { useState, useEffect } from 'react';
import { useCharacterCreation } from '@/store/characterCreation';
import { Button } from '@/components/ui/button';
import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';

interface StyleStepProps {
  isEditing?: boolean;
}

export default function StyleStep({ isEditing = false }: StyleStepProps) {
  const { character, updateStyle, setCurrentStep } = useCharacterCreation();
  const [selectedStyle, setSelectedStyle] = useState<string>(character.style?.style || '');
  const [selectedLighting, setSelectedLighting] = useState<string>(character.style?.lighting || '');
  const [selectedComposition, setSelectedComposition] = useState<string>(character.style?.composition || '');
  const [selectedBackground, setSelectedBackground] = useState<string>(character.style?.background || '');

  // Debug log on mount
  useEffect(() => {
    console.log("[StyleStep] Component mounted with character state:", character);
    console.log("[StyleStep] Initial selected values:", {
      style: selectedStyle,
      lighting: selectedLighting,
      composition: selectedComposition,
      background: selectedBackground
    });
    console.log("[StyleStep] isEditing:", isEditing);
  }, []);

  // Debug log on character change
  useEffect(() => {
    console.log("[StyleStep] Character state updated:", character);
  }, [character]);

  // Update global state when selected values change
  useEffect(() => {
    if (selectedStyle || selectedLighting || selectedComposition || selectedBackground) {
      updateStyle({
        style: selectedStyle,
        lighting: selectedLighting,
        composition: selectedComposition,
        background: selectedBackground
      });
    }
  }, [selectedStyle, selectedLighting, selectedComposition, selectedBackground]);

  // Style options
  const styleOptions = [
    'Realistic',
    'Studio Shot',
    'Cinematic',
    'Fantasy',
    'Animation',
    'Japan Anime'
  ];

  // Lighting options
  const lightingOptions = [
    'Natural',
    'Studio Lighting',
    'Dramatic',
    'Soft',
    'Backlit'
  ];

  // Composition options
  const compositionOptions = [
    'Close-up',
    'Half body',
    'Full body',
    'Far shot',
    'Bokeh'
  ];

  // Background options
  const backgroundOptions = [
    'Solid color',
    'Gradient',
    'Nature',
    'Urban',
    'Abstract',
    'Studio background'
  ];

  const handleNext = () => {
    // Save final style values to store
    updateStyle({
      style: selectedStyle,
      lighting: selectedLighting,
      composition: selectedComposition,
      background: selectedBackground
    });
    setCurrentStep(6); // 컨넥텀 단계를 제거했으므로 직접 리뷰 단계(6)로 이동
  };

  const handleBack = () => {
    setCurrentStep(4); // Previous step
  };

  const isValid = () => {
    return !!selectedStyle && !!selectedLighting && !!selectedComposition && !!selectedBackground;
  };

  // Get tooltip content for each style option
  const getStyleTooltip = (style: string) => {
    switch(style) {
      case 'Realistic':
        return 'Creates a lifelike, photorealistic representation with natural details and textures.';
      case 'Studio Shot':
        return 'Professional portrait-style image with clean backgrounds and controlled lighting.';
      case 'Cinematic':
        return 'Dramatic movie-like visuals with artistic framing and atmospheric lighting.';
      case 'Fantasy':
        return 'Magical, otherworldly aesthetic with enhanced colors and artistic elements.';
      case 'Animation':
        return 'Stylized cartoon-like appearance with bold outlines and vibrant colors.';
      case 'Japan Anime':
        return 'Japanese animation style with characteristic large eyes, distinctive facial features, and vibrant colors.';
      default:
        return 'Select an image style for your Dopple.';
    }
  };

  // Get tooltip content for each lighting option
  const getLightingTooltip = (lighting: string) => {
    switch(lighting) {
      case 'Natural':
        return 'Soft, diffused lighting that mimics outdoor daytime conditions.';
      case 'Studio Lighting':
        return 'Professional, controlled lighting setup with even illumination.';
      case 'Dramatic':
        return 'High contrast lighting with deep shadows for an impactful, moody effect.';
      case 'Soft':
        return 'Gentle, flattering illumination that reduces shadows and harsh contrasts.';
      case 'Backlit':
        return 'Light source from behind creating a glowing outline and atmospheric effect.';
      default:
        return 'Select a lighting style for your Dopple\'s image.';
    }
  };

  // Get tooltip content for each composition option
  const getCompositionTooltip = (composition: string) => {
    switch(composition) {
      case 'Close-up':
        return 'Focuses on the face and shoulders, highlighting facial expression and details.';
      case 'Half body':
        return 'Shows from head to waist, balancing facial detail with some body language.';
      case 'Full body':
        return 'Captures the entire figure from head to toe, showing complete appearance.';
      case 'Far shot':
        return 'Wider view that includes surroundings and places the character in context.';
      case 'Bokeh':
        return 'Creates a blurred background effect that emphasizes the subject in focus.';
      default:
        return 'Select a composition style for your Dopple\'s image.';
    }
  };

  // Get tooltip content for each background option
  const getBackgroundTooltip = (background: string) => {
    switch(background) {
      case 'Solid color':
        return 'Simple, uniform background with a single consistent color.';
      case 'Gradient':
        return 'Smooth transition between colors creating depth and dimension.';
      case 'Nature':
        return 'Outdoor settings with natural elements like trees, sky, or landscapes.';
      case 'Urban':
        return 'City or architectural backdrops with buildings or street elements.';
      case 'Abstract':
        return 'Non-representational design elements creating an artistic backdrop.';
      case 'Studio background':
        return 'Professional photo studio backdrop with clean, controlled setting.';
      default:
        return 'Select a background style for your Dopple\'s image.';
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 relative">
        {/* Background animation effect */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#0abab5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-60 -right-20 w-60 h-60 bg-[#0abab5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        {/* Step indicator circles at the top */}
        <div className="flex justify-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">1</div>
            <span className="hidden md:inline text-gray-500">Appearance</span>
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
            <div className="w-10 h-10 rounded-full bg-[#0abab5] flex items-center justify-center text-white font-bold">4</div>
            <span className="hidden md:inline text-[#0abab5] font-medium">Style</span>
          </div>
        </div>
        
        {/* Header */}
        <div className="mb-5 sm:mb-8 relative">
          <div className="absolute top-0 left-0 w-2 h-10 bg-[#0abab5]"></div>
          <h1 className="text-lg sm:text-xl font-normal mb-2 pl-4">Image Style Settings</h1>
          <p className="text-gray-400 pl-4 text-sm sm:text-base">Configure how your Dopple's image will look</p>
        </div>
        
        {/* Progress indicator */}
        <div className="w-full mb-5 sm:mb-6 relative">
          <div className="w-full h-1 bg-gray-700 rounded-full">
            <div className="w-4/6 h-1 bg-[#0abab5] rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 border border-gray-700 bg-gray-800/50 rounded-lg">
              <h2 className="text-sm sm:text-base font-normal mb-3 flex items-center text-white">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">1</span>
                Style
                <Tooltip content="The overall art style determines the visual aesthetic of your Dopple's image.">
                  <span className="ml-1 text-gray-400 hover:text-[#0abab5] cursor-help">
                    <FaQuestionCircle size={14} />
                  </span>
                </Tooltip>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Select the overall art style for your Dopple's image</p>
              
              <div className="space-y-2">
                {styleOptions.map(style => (
                  <Tooltip key={style} content={getStyleTooltip(style)}>
                    <button
                      className={`w-full p-2.5 border rounded-lg text-left transition-all ${
                        selectedStyle === style
                          ? 'bg-[#0abab5]/20 border-[#0abab5] scale-[1.02]'
                          : 'bg-gray-800 border-gray-700 hover:bg-[#0abab5]/10 hover:border-[#0abab5]/50'
                      }`}
                      onClick={() => setSelectedStyle(style)}
                    >
                      {style}
                    </button>
                  </Tooltip>
                ))}
              </div>
              {!selectedStyle && (
                <p className="text-sm text-[#0abab5]/80 mt-2">Please select an image style</p>
              )}
            </div>
            
            <div className="p-4 sm:p-5 border border-gray-700 bg-gray-800/50 rounded-lg">
              <h2 className="text-sm sm:text-base font-normal mb-3 flex items-center text-white">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">2</span>
                Lighting
                <Tooltip content="Lighting affects mood, depth, and focus of your Dopple's image.">
                  <span className="ml-1 text-gray-400 hover:text-[#0abab5] cursor-help">
                    <FaQuestionCircle size={14} />
                  </span>
                </Tooltip>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Select the lighting style for your Dopple's image</p>
              
              <div className="space-y-2">
                {lightingOptions.map(lighting => (
                  <Tooltip key={lighting} content={getLightingTooltip(lighting)}>
                    <button
                      className={`w-full p-2.5 border rounded-lg text-left transition-all ${
                        selectedLighting === lighting
                          ? 'bg-[#0abab5]/20 border-[#0abab5] scale-[1.02]'
                          : 'bg-gray-800 border-gray-700 hover:bg-[#0abab5]/10 hover:border-[#0abab5]/50'
                      }`}
                      onClick={() => setSelectedLighting(lighting)}
                    >
                      {lighting}
                    </button>
                  </Tooltip>
                ))}
              </div>
              {!selectedLighting && (
                <p className="text-sm text-[#0abab5]/80 mt-2">Please select a lighting style</p>
              )}
            </div>
          
            <div className="p-4 sm:p-5 border border-gray-700 bg-gray-800/50 rounded-lg">
              <h2 className="text-sm sm:text-base font-normal mb-3 flex items-center text-white">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">3</span>
                Composition
                <Tooltip content="Composition determines how your Dopple is framed within the image.">
                  <span className="ml-1 text-gray-400 hover:text-[#0abab5] cursor-help">
                    <FaQuestionCircle size={14} />
                  </span>
                </Tooltip>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Select the framing style for your Dopple's image</p>
              
              <div className="space-y-2">
                {compositionOptions.map(composition => (
                  <Tooltip key={composition} content={getCompositionTooltip(composition)}>
                    <button
                      className={`w-full p-2.5 border rounded-lg text-left transition-all ${
                        selectedComposition === composition
                          ? 'bg-[#0abab5]/20 border-[#0abab5] scale-[1.02]'
                          : 'bg-gray-800 border-gray-700 hover:bg-[#0abab5]/10 hover:border-[#0abab5]/50'
                      }`}
                      onClick={() => setSelectedComposition(composition)}
                    >
                      {composition}
                    </button>
                  </Tooltip>
                ))}
              </div>
              {!selectedComposition && (
                <p className="text-sm text-[#0abab5]/80 mt-2">Please select a composition style</p>
              )}
            </div>
            
            <div className="p-4 sm:p-5 border border-gray-700 bg-gray-800/50 rounded-lg">
              <h2 className="text-sm sm:text-base font-normal mb-3 flex items-center text-white">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-xs sm:text-sm text-[#0abab5] font-medium">4</span>
                Background
                <Tooltip content="The background sets the scene and environment context for your Dopple.">
                  <span className="ml-1 text-gray-400 hover:text-[#0abab5] cursor-help">
                    <FaQuestionCircle size={14} />
                  </span>
                </Tooltip>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Select the background style for your Dopple's image</p>
              
              <div className="space-y-2">
                {backgroundOptions.map(background => (
                  <Tooltip key={background} content={getBackgroundTooltip(background)}>
                    <button
                      className={`w-full p-2.5 border rounded-lg text-left transition-all ${
                        selectedBackground === background
                          ? 'bg-[#0abab5]/20 border-[#0abab5] scale-[1.02]'
                          : 'bg-gray-800 border-gray-700 hover:bg-[#0abab5]/10 hover:border-[#0abab5]/50'
                      }`}
                      onClick={() => setSelectedBackground(background)}
                    >
                      {background}
                    </button>
                  </Tooltip>
                ))}
              </div>
              {!selectedBackground && (
                <p className="text-sm text-[#0abab5]/80 mt-2">Please select a background style</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack}
            className="px-8 py-2.5 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-[#0abab5]/80 hover:border-[#0abab5]/50 transition-colors">
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isValid()}
            className="px-8 py-2.5 bg-gradient-to-r from-[#0abab5] to-[#0abab5]/70 hover:from-[#0abab5]/90 hover:to-[#0abab5]/60 text-white border-none shadow-lg shadow-[#0abab5]/20 hover:shadow-xl hover:shadow-[#0abab5]/30 transition-all">
            {isEditing ? 'Save Changes' : 'Next'}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
} 