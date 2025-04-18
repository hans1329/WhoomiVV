import { create } from 'zustand';
import { Character, Gender, AgeGroup, BodyType, SkinTone, HairStyle, HairColor, FaceShape, EyeShape, NoseShape, LipShape, MBTI, PersonalityTrait, EmotionalTone, Interest, Connectome, ConnectomeNode, ConnectomeEdge } from '@/types/character';
import { persist, createJSONStorage } from 'zustand/middleware';

// Token costs
export const TOKEN_COSTS = {
  CREATE_CHARACTER: 50,  // Default cost, but first creation will be free
  REGENERATE_IMAGE: 20,
  RECREATE_CHARACTER: 40,
  EDIT_PERSONALITY: 15,
  EDIT_APPEARANCE: 15,
  EDIT_STYLE: 10
};

// Admin settable variables (In a real implementation, these would be fetched from a backend)
export const ADMIN_SETTINGS = {
  FIRST_DOPPLE_FREE: true,
  REGENERATE_IMAGE_COST: 20,
  RECREATE_CHARACTER_COST: 40
};

// Define a partial character that makes properties optional
type PartialCharacter = {
  name?: string;
  appearance?: {
    gender?: Gender;
    ageGroup?: AgeGroup;
    bodyType?: BodyType;
    skinTone?: SkinTone;
    hairStyle?: HairStyle;
    hairColor?: HairColor;
    faceShape?: FaceShape;
    eyeShape?: EyeShape;
    noseShape?: NoseShape;
    lipShape?: LipShape;
    additionalFeatures?: string[];
    glasses?: boolean;
  };
  personality?: {
    mbti?: MBTI;
    traits?: PersonalityTrait[];
    emotionalTone?: EmotionalTone;
    favoriteColor?: string;
  };
  interests?: Interest[];
  style?: {
    style: string;
    lighting: string;
    composition: string;
    background: string;
  };
  connectome?: Connectome;
};

interface CharacterCreationState {
  currentStep: number;
  character: PartialCharacter;
  generatedImageUrl: string | null;
  isGeneratingImage: boolean;
  imageHistory: string[];
  tokenCost: number;
  isFirstDopple: boolean; // Track if this is the user's first Dopple

  setCurrentStep: (step: number) => void;
  updateName: (name: string) => void;
  updateAppearance: (data: Partial<NonNullable<PartialCharacter['appearance']>>) => void;
  updatePersonality: (data: Partial<NonNullable<PartialCharacter['personality']>>) => void;
  updateInterests: (interests: Interest[]) => void;
  updateStyle: (style: NonNullable<PartialCharacter['style']>) => void;
  updateConnectome: (connectome: Connectome) => void;
  addConnectomeNode: (node: ConnectomeNode) => void;
  addConnectomeEdge: (edge: ConnectomeEdge) => void;
  removeConnectomeNode: (nodeId: string) => void;
  removeConnectomeEdge: (sourceId: string, targetId: string) => void;
  
  // Add a new method to set all character data at once (for editing mode)
  setCharacterData: (data: {
    name?: string;
    gender?: Gender;
    ageGroup?: AgeGroup;
    mbti?: MBTI;
    traits?: PersonalityTrait[];
    interests?: Interest[];
    emotionalExpression?: EmotionalTone;
    imageStyle?: string;
    description?: string;
    image?: string;
    connectome?: Connectome;
  }) => void;
  
  // Image generation functions
  setGeneratedImage: (url: string) => void;
  setIsGeneratingImage: (isGenerating: boolean) => void;
  regenerateImage: () => void;
  addToImageHistory: (url: string) => void;
  selectFromHistory: (url: string) => void;

  // Token cost functions
  calculateTotalCost: () => number;
  applyDiscount: (percentage: number) => void;
  resetTokenCost: () => void;
  setIsFirstDopple: (isFirst: boolean) => void;
  
  reset: () => void;
}

// Initial state with default values
const initialState: CharacterCreationState = {
  currentStep: 1,
  character: {
    name: '',
    appearance: {
      gender: undefined,
      ageGroup: undefined,
      bodyType: undefined,
      skinTone: undefined,
      hairStyle: undefined,
      hairColor: undefined,
      faceShape: undefined,
      eyeShape: undefined,
      noseShape: undefined,
      lipShape: undefined,
      additionalFeatures: [],
      glasses: false,
    },
    personality: {
      mbti: undefined,
      traits: [],
      emotionalTone: undefined,
      favoriteColor: '',
    },
    interests: [],
    style: {
      style: '',
      lighting: '',
      composition: '',
      background: '',
    },
    connectome: {
      nodes: [],
      edges: []
    },
  },
  generatedImageUrl: null,
  isGeneratingImage: false,
  imageHistory: [],
  tokenCost: ADMIN_SETTINGS.FIRST_DOPPLE_FREE ? 0 : TOKEN_COSTS.CREATE_CHARACTER,
  isFirstDopple: true,
  
  // Add placeholders for new methods
  updateConnectome: () => {},
  addConnectomeNode: () => {},
  addConnectomeEdge: () => {},
  removeConnectomeNode: () => {},
  removeConnectomeEdge: () => {},
  
  // These will be implemented below
  setCurrentStep: () => {},
  updateName: () => {},
  updateAppearance: () => {},
  updatePersonality: () => {},
  updateInterests: () => {},
  updateStyle: () => {},
  setGeneratedImage: () => {},
  setIsGeneratingImage: () => {},
  regenerateImage: () => {},
  addToImageHistory: () => {},
  selectFromHistory: () => {},
  calculateTotalCost: () => 0,
  applyDiscount: () => {},
  resetTokenCost: () => {},
  setIsFirstDopple: () => {},
  reset: () => {},
  
  // Implement the setCharacterData method
  setCharacterData: () => {},
};

// Debug function to log state changes
const logStateChange = (actionName: string, newState: any) => {
  console.log(`[CharacterCreation] ${actionName}:`, newState);
};

export const useCharacterCreation = create<CharacterCreationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentStep: (step) => {
        logStateChange('setCurrentStep', step);
        set({ currentStep: step });
        
        // 스텝이 바뀔 때 페이지 맨 위로 스크롤
        if (typeof window !== 'undefined') {
          window.scrollTo(0, 0);
        }
      },
      
      updateName: (name) => {
        logStateChange('updateName', name);
        set((state) => ({
          character: {
            ...state.character,
            name,
          },
        }));
      },
      
      updateAppearance: (data) => {
        logStateChange('updateAppearance', data);
        set((state) => ({
          character: {
            ...state.character,
            appearance: {
              ...state.character.appearance,
              ...data,
            },
          },
        }));
      },
      
      updatePersonality: (data) => {
        logStateChange('updatePersonality', data);
        set((state) => ({
          character: {
            ...state.character,
            personality: {
              ...state.character.personality,
              ...data,
            },
          },
        }));
      },
      
      updateInterests: (interests) => {
        logStateChange('updateInterests', interests);
        set((state) => ({
          character: {
            ...state.character,
            interests,
          },
        }));
      },
      
      updateStyle: (style) => {
        logStateChange('updateStyle', style);
        set((state) => ({
          character: {
            ...state.character,
            style,
          }
        }));
      },
      
      setGeneratedImage: (url) => {
        logStateChange('setGeneratedImage', url);
        set({ generatedImageUrl: url });
      },
      
      setIsGeneratingImage: (isGenerating) => {
        logStateChange('setIsGeneratingImage', isGenerating);
        set({ isGeneratingImage: isGenerating });
      },
      
      regenerateImage: () => {
        logStateChange('regenerateImage', 'Generating new image');
        set((state) => ({ 
          isGeneratingImage: true,
          tokenCost: state.tokenCost + ADMIN_SETTINGS.REGENERATE_IMAGE_COST
        }));
      },
      
      addToImageHistory: (url) => {
        logStateChange('addToImageHistory', url);
        set((state) => ({ 
          imageHistory: [...state.imageHistory, url] 
        }));
      },
      
      selectFromHistory: (url) => {
        logStateChange('selectFromHistory', url);
        set({ generatedImageUrl: url });
      },
      
      calculateTotalCost: () => {
        const state = get();
        // If this is the first Dopple and admin settings allow free first Dopple
        const baseCost = (state.isFirstDopple && ADMIN_SETTINGS.FIRST_DOPPLE_FREE) ? 0 : TOKEN_COSTS.CREATE_CHARACTER;
        const regenCost = state.tokenCost - (state.isFirstDopple ? 0 : TOKEN_COSTS.CREATE_CHARACTER);
        const totalCost = baseCost + regenCost;
        
        logStateChange('calculateTotalCost', totalCost);
        return totalCost;
      },
      
      applyDiscount: (percentage) => {
        logStateChange('applyDiscount', percentage);
        set((state) => ({
          tokenCost: Math.floor(state.tokenCost * (1 - percentage / 100))
        }));
      },
      
      resetTokenCost: () => {
        const isFirstDopple = get().isFirstDopple;
        const initialCost = (isFirstDopple && ADMIN_SETTINGS.FIRST_DOPPLE_FREE) ? 0 : TOKEN_COSTS.CREATE_CHARACTER;
        logStateChange('resetTokenCost', initialCost);
        set({ tokenCost: initialCost });
      },
      
      setIsFirstDopple: (isFirst) => {
        logStateChange('setIsFirstDopple', isFirst);
        set((state) => {
          const newTokenCost = isFirst && ADMIN_SETTINGS.FIRST_DOPPLE_FREE ? 0 : TOKEN_COSTS.CREATE_CHARACTER;
          return { 
            isFirstDopple: isFirst,
            tokenCost: newTokenCost
          };
        });
      },
      
      reset: () => {
        logStateChange('reset', 'Resetting all state');
        set(initialState);
      },
      
      // Connectome 관련 새 메소들
      updateConnectome: (connectome) => {
        logStateChange('updateConnectome', connectome);
        set((state) => ({
          character: {
            ...state.character,
            connectome,
          }
        }));
      },
      
      addConnectomeNode: (node) => {
        logStateChange('addConnectomeNode', node);
        set((state) => {
          // 기존 connectome이 없으면 생성
          const currentConnectome = state.character.connectome || { nodes: [], edges: [] };
          
          // 중복 체크
          const nodeExists = currentConnectome.nodes.some(n => n.id === node.id);
          if (nodeExists) return state; // 중복이면 변경 없음
          
          return {
            character: {
              ...state.character,
              connectome: {
                ...currentConnectome,
                nodes: [...currentConnectome.nodes, node]
              }
            }
          };
        });
      },
      
      addConnectomeEdge: (edge) => {
        logStateChange('addConnectomeEdge', edge);
        set((state) => {
          // 기존 connectome이 없으면 생성
          const currentConnectome = state.character.connectome || { nodes: [], edges: [] };
          
          // 중복 체크 (소스와 타겟이 동일한 엣지)
          const edgeExists = currentConnectome.edges.some(
            e => e.source === edge.source && e.target === edge.target
          );
          if (edgeExists) return state; // 중복이면 변경 없음
          
          return {
            character: {
              ...state.character,
              connectome: {
                ...currentConnectome,
                edges: [...currentConnectome.edges, edge]
              }
            }
          };
        });
      },
      
      removeConnectomeNode: (nodeId) => {
        logStateChange('removeConnectomeNode', nodeId);
        set((state) => {
          const currentConnectome = state.character.connectome;
          if (!currentConnectome) return state;
          
          // 노드 제거
          const updatedNodes = currentConnectome.nodes.filter(n => n.id !== nodeId);
          
          // 관련 엣지도 함께 제거
          const updatedEdges = currentConnectome.edges.filter(
            e => e.source !== nodeId && e.target !== nodeId
          );
          
          return {
            character: {
              ...state.character,
              connectome: {
                nodes: updatedNodes,
                edges: updatedEdges
              }
            }
          };
        });
      },
      
      removeConnectomeEdge: (sourceId, targetId) => {
        logStateChange('removeConnectomeEdge', { sourceId, targetId });
        set((state) => {
          const currentConnectome = state.character.connectome;
          if (!currentConnectome) return state;
          
          // 해당 엣지 제거
          const updatedEdges = currentConnectome.edges.filter(
            e => !(e.source === sourceId && e.target === targetId)
          );
          
          return {
            character: {
              ...state.character,
              connectome: {
                ...currentConnectome,
                edges: updatedEdges
              }
            }
          };
        });
      },
      
      // Implement the setCharacterData method
      setCharacterData: (data) => {
        logStateChange('setCharacterData', data);
        
        // Update appearance
        const appearance: Partial<NonNullable<PartialCharacter['appearance']>> = {};
        if (data.gender) appearance.gender = data.gender;
        if (data.ageGroup) appearance.ageGroup = data.ageGroup;
        
        // Update personality
        const personality: Partial<NonNullable<PartialCharacter['personality']>> = {};
        if (data.mbti) personality.mbti = data.mbti;
        if (data.traits) personality.traits = data.traits;
        if (data.emotionalExpression) personality.emotionalTone = data.emotionalExpression;
        
        // Update style
        const style = {
          style: data.imageStyle || 'realistic',
          lighting: 'natural',
          composition: 'portrait',
          background: 'neutral'
        };
        
        set((state) => ({
          character: {
            ...state.character,
            name: data.name || state.character.name,
            appearance: {
              ...state.character.appearance,
              ...appearance
            },
            personality: {
              ...state.character.personality,
              ...personality
            },
            interests: data.interests || state.character.interests,
            connectome: data.connectome || state.character.connectome
          },
          generatedImageUrl: data.image || state.generatedImageUrl
        }));
      },
    }),
    {
      name: 'character-creation-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        character: state.character,
        currentStep: state.currentStep,
        generatedImageUrl: state.generatedImageUrl,
        imageHistory: state.imageHistory,
        tokenCost: state.tokenCost,
        isFirstDopple: state.isFirstDopple
      }),
    }
  )
); 