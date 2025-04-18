import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAdminStore } from './adminStore';
import { ChatLimitSettings } from '@/types/admin';

// User chat state interface
interface ChatState {
  // Daily chat limits
  dailyChatsRemaining: number;
  lastChatReset: string; // ISO date string
  
  // Methods
  decrementChatsRemaining: () => void;
  resetChatsIfNeeded: () => void;
  getRemainingChats: () => number;
}

// Helper to get today's date at GMT midnight
const getTodayGMTMidnight = (): string => {
  const now = new Date();
  const todayGMT = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return todayGMT.toISOString();
};

// Check if reset is needed based on last reset date
const needsReset = (lastResetDate: string): boolean => {
  const today = getTodayGMTMidnight();
  return new Date(lastResetDate).toDateString() !== new Date(today).toDateString();
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      dailyChatsRemaining: useAdminStore.getState().settings.chatLimits.dailyFreeChats,
      lastChatReset: getTodayGMTMidnight(),
      
      // Decrease remaining chats
      decrementChatsRemaining: () => {
        // Check if reset is needed first
        get().resetChatsIfNeeded();
        
        // Only decrement if user has chats remaining
        set((state) => ({
          dailyChatsRemaining: Math.max(0, state.dailyChatsRemaining - 1)
        }));
      },
      
      // Reset chats if needed
      resetChatsIfNeeded: () => {
        const lastReset = get().lastChatReset;
        
        if (needsReset(lastReset)) {
          // Get the latest limit from admin settings
          const dailyFreeChats = useAdminStore.getState().settings.chatLimits.dailyFreeChats;
          
          set({
            dailyChatsRemaining: dailyFreeChats,
            lastChatReset: getTodayGMTMidnight()
          });
          
          console.log(`Chat limit reset to ${dailyFreeChats}`);
        }
      },
      
      // Get remaining chats (and check if reset is needed)
      getRemainingChats: () => {
        get().resetChatsIfNeeded();
        return get().dailyChatsRemaining;
      }
    }),
    {
      name: 'chat-limits',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Manual subscription setup to avoid linter errors
const unsubscribe = useAdminStore.subscribe((state) => {
  const chatLimits = state.settings.chatLimits;
  const chatStore = useChatStore.getState();
  
  // If the user has more remaining chats than the new limit, adjust down
  if (chatStore.dailyChatsRemaining > chatLimits.dailyFreeChats) {
    useChatStore.setState({
      dailyChatsRemaining: chatLimits.dailyFreeChats
    });
  }
  
  console.log(`Chat limits updated from admin settings: ${chatLimits.dailyFreeChats} free chats per day`);
}); 