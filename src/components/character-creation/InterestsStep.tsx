'use client';

import { useState, useEffect } from 'react';
import { useCharacterCreation } from '@/store/characterCreation';
import { Button } from '@/components/ui/button';
import { Interest } from '@/types/character';

interface InterestsStepProps {
  isEditing?: boolean;
}

export default function InterestsStep({ isEditing = false }: InterestsStepProps) {
  const { character, updateInterests, setCurrentStep } = useCharacterCreation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    character.interests?.map(interest => interest.category) || []
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>(
    character.interests?.reduce((acc, interest) => {
      acc[interest.category] = interest.items;
      return acc;
    }, {} as Record<string, string[]>) || {}
  );

  // Debug log on mount
  useEffect(() => {
    console.log("[InterestsStep] Component mounted with character state:", character);
    console.log("[InterestsStep] Initial selectedCategories:", selectedCategories);
    console.log("[InterestsStep] Initial selectedItems:", selectedItems);
  }, []);

  // Debug log on character change
  useEffect(() => {
    console.log("[InterestsStep] Character state updated:", character);
  }, [character]);
  
  // Update interests in the store whenever selections change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const interests: Interest[] = selectedCategories
        .filter(category => selectedItems[category]?.length > 0)
        .map(category => ({
          category,
          items: selectedItems[category] || []
        }));
      
      if (interests.length > 0) {
        updateInterests(interests);
      }
    }
  }, [selectedCategories, selectedItems, updateInterests]);

  // Interest categories and items
  const interestCategories = [
    {
      category: 'Arts & Creativity',
      items: ['Drawing', 'Music', 'Photography', 'Film', 'Literature', 'Crafts', 'Design', 'Fashion', 'Dance', 'Theater']
    },
    {
      category: 'Lifestyle',
      items: ['Cooking', 'Travel', 'Interior Design', 'Gardening', 'Fashion', 'Fitness', 'Meditation', 'Self-development', 'Shopping']
    },
    {
      category: 'Entertainment',
      items: ['Movies', 'TV Shows', 'Animation', 'Gaming', 'Comics', 'Concerts', 'Festivals', 'Sports Watching']
    },
    {
      category: 'Knowledge & Academia',
      items: ['Science', 'History', 'Philosophy', 'Psychology', 'Languages', 'Politics', 'Economics', 'Literature', 'Technology', 'Education']
    },
    {
      category: 'Sports & Activities',
      items: ['Soccer', 'Basketball', 'Baseball', 'Tennis', 'Yoga', 'Running', 'Swimming', 'Hiking', 'Cycling', 'Camping']
    },
    {
      category: 'Technology & Digital',
      items: ['Programming', 'Artificial Intelligence', 'Social Media', 'Game Development', 'Digital Art', 'Blogging', 'YouTube', 'Photo Editing']
    }
  ];

  const handleCategorySelect = (category: string) => {
    if (selectedCategories.includes(category)) {
      const newCategories = selectedCategories.filter(c => c !== category);
      setSelectedCategories(newCategories);
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[category];
      setSelectedItems(newSelectedItems);
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories([...selectedCategories, category]);
        setSelectedItems({ ...selectedItems, [category]: [] });
      }
    }
  };

  const handleItemSelect = (category: string, item: string) => {
    if (selectedItems[category]?.includes(item)) {
      setSelectedItems({
        ...selectedItems,
        [category]: selectedItems[category].filter(i => i !== item)
      });
    } else {
      if ((selectedItems[category]?.length || 0) < 5) {
        setSelectedItems({
          ...selectedItems,
          [category]: [...(selectedItems[category] || []), item]
        });
      }
    }
  };

  const handleNext = () => {
    // Convert selected interests to Interest array
    const interests: Interest[] = selectedCategories.map(category => ({
      category,
      items: selectedItems[category] || []
    }));
    
    updateInterests(interests);
    setCurrentStep(5); // Move to next step
  };

  const handleBack = () => {
    setCurrentStep(3); // Move to previous step
  };

  const isValid = () => {
    return selectedCategories.length > 0 && 
      selectedCategories.every(category => (selectedItems[category]?.length || 0) > 0);
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
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">2</div>
          <span className="hidden md:inline text-gray-500">Personality</span>
        </div>
        <div className="w-10 h-1 bg-gray-700 self-center"></div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#0abab5] flex items-center justify-center text-white font-bold">3</div>
          <span className="hidden md:inline text-[#0abab5] font-medium">Interests</span>
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
        <h1 className="text-3xl font-bold mb-2 pl-4">Interests Settings</h1>
        <p className="text-gray-400 pl-4">Select your Dopple's interests and hobbies</p>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full mb-8 relative">
        <div className="w-full h-1 bg-gray-700 rounded-full">
          <div className="w-3/6 h-1 bg-[#0abab5] rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="glassmorphism-card w-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">1</span>
            Categories Selection <span className="text-sm text-gray-400 ml-2">(Select 1-3)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestCategories.map(({ category }) => (
              <button
                key={category}
                className={`p-3 border rounded-lg transition-all ${
                  selectedCategories.includes(category)
                    ? 'bg-[#0abab5]/20 border-[#0abab5] scale-[1.02]' 
                    : 'bg-gray-800 border-gray-700 hover:border-[#0abab5]/50'
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-black/20 rounded-md text-sm text-gray-400">
            <p>You must select at least one category. Each category represents a group of interests your Dopple will have.</p>
          </div>
        </div>

        {selectedCategories.length > 0 && (
          <div className="glassmorphism-card w-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <span className="w-6 h-6 rounded-full bg-[#0abab5]/20 flex items-center justify-center mr-2 text-sm text-[#0abab5] font-bold">2</span>
              Specific Interests
            </h2>
            <div className="space-y-6">
              {selectedCategories.map(category => {
                const categoryData = interestCategories.find(c => c.category === category);
                return (
                  <div key={category} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-lg">{category}</h3>
                      <span className="text-xs text-gray-400">
                        {selectedItems[category]?.length || 0}/5 selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categoryData?.items.map(item => (
                        <button
                          key={item}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedItems[category]?.includes(item)
                              ? 'bg-[#0abab5] text-white scale-[1.05]' 
                              : 'bg-gray-800 text-gray-300 hover:bg-[#0abab5]/20 hover:text-white'
                          }`}
                          onClick={() => handleItemSelect(category, item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {(selectedItems[category]?.length || 0) === 0 && (
                      <p className="text-sm text-[#0abab5]/80 mt-2">Select at least one interest from this category</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-10">
        <Button variant="outline" onClick={handleBack}
          className="px-8 py-2.5 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-[#0abab5]/80 hover:border-[#0abab5]/50 transition-colors">
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isValid()}
          className="px-8 py-2.5 bg-gradient-to-r from-[#0abab5] to-[#0abab5]/70 hover:from-[#0abab5]/90 hover:to-[#0abab5]/60 text-white border-none shadow-lg shadow-[#0abab5]/20 hover:shadow-xl hover:shadow-[#0abab5]/30 transition-all">
          Next
        </Button>
      </div>
    </div>
  );
} 