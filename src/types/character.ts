export type Gender = 'male' | 'female' | 'non-binary';
export type AgeGroup = 'child' | 'teen' | 'young-adult' | 'adult' | 'senior';
export type BodyType = 'slim' | 'average' | 'athletic' | 'curvy' | 'plus-size';
export type SkinTone = 'fair' | 'light' | 'medium' | 'tan' | 'dark' | 'deep';
export type HairStyle = 'short' | 'medium' | 'long' | 'bald' | 'afro' | 'braids';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'white' | 'colorful';
export type FaceShape = 'round' | 'oval' | 'square' | 'heart' | 'diamond';
export type EyeShape = 'round' | 'almond' | 'hooded' | 'monolid' | 'downturned' | 'upturned';
export type NoseShape = 'straight' | 'curved' | 'button' | 'wide' | 'narrow';
export type LipShape = 'thin' | 'medium' | 'full' | 'bow-shaped' | 'wide';
export type MBTI = 
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

export type PersonalityTrait = {
  trait: string;
  intensity: number; // 1-5
};

export type EmotionalTone = 'cheerful' | 'serious' | 'playful' | 'calm' | 'energetic' | 'mysterious';

export type Interest = {
  category: string;
  items: string[];
};

export type ImageStyle = 'realistic' | 'anime' | '3d' | 'cartoon' | 'watercolor';
export type LightingStyle = 'natural' | 'dramatic' | 'soft' | 'moody';
export type CompositionStyle = 'portrait' | 'full-body' | 'close-up' | 'environmental';

// Connectome 관련 타입 정의
export interface ConnectomeNode {
  id: string;
  name: string;
  type: 'trait' | 'interest' | 'emotion' | 'value';
  strength: number;
  description?: string;
}

export interface ConnectomeEdge {
  source: string;
  target: string;
  weight: number;
  description?: string;
}

export interface Connectome {
  nodes: ConnectomeNode[];
  edges: ConnectomeEdge[];
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  appearance: {
    gender: Gender;
    ageGroup: AgeGroup;
    bodyType: BodyType;
    skinTone: SkinTone;
    hairStyle: HairStyle;
    hairColor: HairColor;
    faceShape: FaceShape;
    eyeShape: EyeShape;
    noseShape: NoseShape;
    lipShape: LipShape;
    additionalFeatures?: string[];
    glasses?: boolean;
  };
  personality: {
    mbti: MBTI;
    traits: PersonalityTrait[];
    emotionalTone: EmotionalTone;
    favoriteColor: string;
  };
  interests: Interest[];
  imageStyle: {
    style: ImageStyle;
    lighting: LightingStyle;
    composition: CompositionStyle;
    background?: string;
  };
  style?: {
    style: string;
    lighting: string;
    composition: string;
    background: string;
  };
  createdAt: Date;
  updatedAt: Date;
  connectome?: Connectome;
} 