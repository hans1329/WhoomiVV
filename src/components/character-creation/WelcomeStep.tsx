'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCharacterCreation } from '@/store/characterCreation';

interface WelcomeStepProps {
  isEditing?: boolean;
}

export default function WelcomeStep({ isEditing = false }: WelcomeStepProps) {
  const router = useRouter();
  const { setCurrentStep } = useCharacterCreation();

  const handleStart = () => {
    setCurrentStep(2);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#0abab5] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-60 h-60 bg-[#0abab5]/70 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="w-full mb-10">
        <h1 className="text-2xl md:text-3xl font-medium mb-4 sm:mb-6 bg-gradient-to-r from-[#0abab5] to-white text-transparent bg-clip-text text-center">
          {isEditing ? "Edit Your Dopple" : "Dopple Creation Wizard"}
        </h1>
        <p className="text-base md:text-lg text-center mb-6 sm:mb-8 max-w-2xl mx-auto text-gray-200">
          {isEditing 
            ? "Update your Dopple's appearance, personality, and other attributes. Your changes will be applied to your existing AI character."
            : "Create your own AI doppelganger through a few simple steps. Configure appearance, personality, interests, and more to generate an AI character that resembles you."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 w-full max-w-4xl">
        <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg hover:border-[#0abab5] transition-all hover:scale-105">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
            <span className="text-lg sm:text-xl font-medium text-[#0abab5]">1</span>
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2 text-center">Appearance</h3>
          <p className="text-center text-gray-300 text-xs sm:text-sm">
            {isEditing 
              ? "Update your Dopple's external characteristics." 
              : "Configure your Dopple's external characteristics, from gender and age to hairstyle."}
          </p>
        </div>
        <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg hover:border-[#0abab5] transition-all hover:scale-105">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
            <span className="text-lg sm:text-xl font-medium text-[#0abab5]">2</span>
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2 text-center">Personality & Interests</h3>
          <p className="text-center text-gray-300 text-xs sm:text-sm">
            {isEditing 
              ? "Modify your Dopple's personality traits and interests." 
              : "Select MBTI, personality traits, hobbies, and interests to shape your Dopple's inner world."}
          </p>
        </div>
        <div className="p-4 sm:p-6 border border-gray-700 bg-gray-800/50 rounded-lg hover:border-[#0abab5] transition-all hover:scale-105">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0abab5]/20 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
            <span className="text-lg sm:text-xl font-medium text-[#0abab5]">3</span>
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2 text-center">Image Generation</h3>
          <p className="text-center text-gray-300 text-xs sm:text-sm">
            {isEditing 
              ? "Generate a new image or keep your existing one." 
              : "AI generates your Dopple's image based on the characteristics you've selected."}
          </p>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-800 border border-gray-600 text-gray-300 text-xs sm:text-sm hover:bg-gray-700 hover:text-[#0abab5]/80 hover:border-[#0abab5]/50 transition-colors"
        >
          Back to Dashboard
        </Button>
        <Button 
          onClick={handleStart}
          className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#0abab5] to-[#0abab5]/70 hover:from-[#0abab5]/90 hover:to-[#0abab5]/60 text-white border-none text-xs sm:text-sm shadow-lg shadow-[#0abab5]/20 hover:shadow-xl hover:shadow-[#0abab5]/30 transition-all"
        >
          {isEditing ? "Continue Editing" : "Start Creating"}
        </Button>
      </div>
      
      <div className="mt-6 sm:mt-8 max-w-md text-center text-gray-400 text-xs">
        <p>
          {isEditing 
            ? "Updates to your Dopple may consume tokens, depending on the changes made."
            : "You can modify or regenerate your Dopple anytime using tokens after creation."}
        </p>
      </div>
    </div>
  );
} 