// Admin system types

// Token cost settings
export interface TokenCostSettings {
  firstDoppleFree: boolean;
  createCharacterCost: number;
  regenerateImageCost: number;
  recreateCharacterCost: number;
  editPersonalityCost: number;
  editAppearanceCost: number;
  editStyleCost: number;
  dailyTokenRefill: number;  // Number of tokens to refill at GMT 00:00
}

// Chat limit settings
export interface ChatLimitSettings {
  dailyFreeChats: number;  // Number of free chats per day before token usage
  resetTime: string;       // Time to reset in format "HH:MM" in GMT
}

// System stats
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;      // Active in last 30 days
  totalDopples: number;
  totalChats: number;
  tokensConsumed: number;
}

// User management
export interface UserDetails {
  id: string;
  address: string;
  tokenBalance: number;
  doppleCount: number;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended';
}

// Admin settings
export interface AdminSettings {
  tokenCosts: TokenCostSettings;
  chatLimits: ChatLimitSettings;
  contentModeration: {
    enableAutoModeration: boolean;
    restrictedWords: string[];
    restrictedImageContent: string[];
  };
  systemAnnouncement: string;
} 