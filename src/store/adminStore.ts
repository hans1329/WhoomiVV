import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AdminSettings, 
  TokenCostSettings, 
  ChatLimitSettings, 
  SystemStats, 
  UserDetails 
} from '@/types/admin';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Default values for admin settings
const defaultTokenCosts: TokenCostSettings = {
  firstDoppleFree: true,
  createCharacterCost: 50,
  regenerateImageCost: 20,
  recreateCharacterCost: 40,
  editPersonalityCost: 15,
  editAppearanceCost: 15,
  editStyleCost: 10,
  dailyTokenRefill: 10, // Default daily token refill amount
};

const defaultChatLimits: ChatLimitSettings = {
  dailyFreeChats: 5,  // Default 5 free chats per day
  resetTime: "00:00", // Reset at midnight GMT
};

// Initial system stats (will be updated from DB)
const initialSystemStats: SystemStats = {
  totalUsers: 0,
  activeUsers: 0,
  totalDopples: 0,
  totalChats: 0,
  tokensConsumed: 0,
};

// Admin store interface
interface AdminStore {
  // Settings
  settings: AdminSettings;
  
  // Users
  users: UserDetails[];
  
  // System stats
  systemStats: SystemStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  updateTokenCosts: (costs: Partial<TokenCostSettings>) => void;
  updateChatLimits: (limits: Partial<ChatLimitSettings>) => void;
  updateContentModeration: (moderation: Partial<AdminSettings['contentModeration']>) => void;
  updateSystemAnnouncement: (announcement: string) => void;
  
  // User management
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  fetchUsers: () => Promise<void>;
  
  // Stats
  refreshStats: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial settings
      settings: {
        tokenCosts: defaultTokenCosts,
        chatLimits: defaultChatLimits,
        contentModeration: {
          enableAutoModeration: true,
          restrictedWords: [],
          restrictedImageContent: [],
        },
        systemAnnouncement: '',
      },
      
      // Users list (will be populated from DB)
      users: [],
      
      // System stats (will be populated from DB)
      systemStats: initialSystemStats,
      isLoading: false,
      error: null,
      
      // Actions for updating settings
      updateTokenCosts: (costs) => set((state) => ({
        settings: {
          ...state.settings,
          tokenCosts: {
            ...state.settings.tokenCosts,
            ...costs,
          },
        },
      })),
      
      updateChatLimits: (limits) => set((state) => ({
        settings: {
          ...state.settings,
          chatLimits: {
            ...state.settings.chatLimits,
            ...limits,
          },
        },
      })),
      
      updateContentModeration: (moderation) => set((state) => ({
        settings: {
          ...state.settings,
          contentModeration: {
            ...state.settings.contentModeration,
            ...moderation,
          },
        },
      })),
      
      updateSystemAnnouncement: (announcement) => set((state) => ({
        settings: {
          ...state.settings,
          systemAnnouncement: announcement,
        },
      })),
      
      // User management actions
      updateUserStatus: async (userId, status) => {
        try {
          // 1. 먼저 로컬 상태 업데이트
          set((state) => ({
            users: state.users.map(user => 
              user.id === userId 
                ? { ...user, status } 
                : user
            ),
          }));
          
          // 2. Supabase에 상태 업데이트
          const { error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', userId);
            
          if (error) {
            console.error('Error updating user status:', error);
            // 에러 발생 시 로컬 상태를 다시 가져온다
            get().fetchUsers();
          }
        } catch (error) {
          console.error('Error in updateUserStatus:', error);
        }
      },
      
      // 사용자 목록 가져오기
      fetchUsers: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // 사용자 테이블에서 데이터 가져오기
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error('Error fetching users:', authError);
            // 에러가 있어도 계속 진행 (빈 배열 사용)
            console.log('Using empty users array due to error');
          }
          
          // 사용자 프로필 가져오기 (토큰 잔액, 도플 수 등)
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, token_balance, created_at, last_active, status')
            .is('deleted_at', null);
            
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            // 계속 진행 (사용 가능한 데이터만 사용)
          }
          
          // 각 사용자별 도플 수 가져오기 - 대체 방법
          const { data: allDopples, error: doppleError } = await supabase
            .from('profiles')
            .select('user_id')
            .is('deleted_at', null);
            
          if (doppleError) {
            console.error('Error fetching dopples:', doppleError);
            // 계속 진행 (빈 배열 사용)
          }
          
          // 수동으로 각 사용자별 도플 수 계산
          const doppleCounts: Record<string, number> = {};
          allDopples?.forEach(dopple => {
            if (dopple.user_id) {
              doppleCounts[dopple.user_id] = (doppleCounts[dopple.user_id] || 0) + 1;
            }
          });
          
          // 데이터 통합
          const formattedUsers: UserDetails[] = (authUsers?.users || []).map(user => {
            const profile = profiles?.find(p => p.user_id === user.id);
            const doppleCount = doppleCounts[user.id] || 0;
            
            return {
              id: user.id,
              address: user.email || user.phone || '주소 없음',
              tokenBalance: profile?.token_balance || 0,
              doppleCount: doppleCount,
              createdAt: user.created_at || new Date().toISOString(),
              lastActive: profile?.last_active || user.last_sign_in_at || new Date().toISOString(),
              status: profile?.status || 'active',
            };
          });
          
          set({ users: formattedUsers, isLoading: false });
        } catch (error) {
          console.error('Error in fetchUsers:', error);
          // 에러가 있더라도 부분적인 UI를 보여주기 위해 빈 배열을 설정
          set({ users: [], isLoading: false });
        }
      },
      
      // 통계 가져오기 (실제 데이터베이스에서)
      refreshStats: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // 모든 쿼리를 독립적으로 실행하고 오류가 발생해도 계속 진행
          let totalUsers = 0;
          let activeUsers = 0;
          let totalDopples = 0;
          let totalChats = 0;
          let tokensConsumed = 0;
          
          // 1. 총 사용자 수
          try {
            const { count, error } = await supabase
              .from('users')
              .select('id', { count: 'exact', head: true });
              
            if (!error && count !== null) {
              totalUsers = count;
            } else {
              console.warn('Failed to fetch total users, using default value');
            }
          } catch (err) {
            console.error('Error counting users:', err);
          }
          
          // 2. 활성 사용자 수 (최근 30일)
          try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count, error } = await supabase
              .from('users')
              .select('id', { count: 'exact', head: true })
              .gt('last_sign_in_at', thirtyDaysAgo.toISOString());
              
            if (!error && count !== null) {
              activeUsers = count;
            } else {
              console.warn('Failed to fetch active users, using default value');
            }
          } catch (err) {
            console.error('Error counting active users:', err);
          }
          
          // 3. 총 도플 수
          try {
            const { count, error } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .is('deleted_at', null);
              
            if (!error && count !== null) {
              totalDopples = count;
            } else {
              console.warn('Failed to fetch total dopples, using default value');
            }
          } catch (err) {
            console.error('Error counting dopples:', err);
          }
          
          // 4. 총 대화 수
          try {
            const { count, error } = await supabase
              .from('conversations')
              .select('id', { count: 'exact', head: true });
              
            if (!error && count !== null) {
              totalChats = count;
            } else {
              console.warn('Failed to fetch total chats, using default value');
            }
          } catch (err) {
            console.error('Error counting chats:', err);
          }
          
          // 5. 소비된 토큰 수 (메타데이터에서 집계)
          try {
            const { data, error } = await supabase
              .from('token_transactions')
              .select('amount')
              .eq('type', 'consume');
              
            if (!error && data) {
              tokensConsumed = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            } else {
              console.warn('Failed to fetch token transactions, using default value');
            }
          } catch (err) {
            console.error('Error counting tokens:', err);
          }
          
          // 통계 업데이트
          set({ 
            systemStats: {
              totalUsers,
              activeUsers,
              totalDopples,
              totalChats,
              tokensConsumed,
            },
            isLoading: false
          });
          
          // 사용자 목록도 함께 업데이트
          get().fetchUsers();
          
        } catch (error) {
          console.error('Error refreshing stats:', error);
          // 오류가 있더라도 기본값으로 표시
          set({ 
            systemStats: initialSystemStats,
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'admin-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 앱이 시작될 때 자동으로 통계를 업데이트
if (typeof window !== 'undefined') {
  // 초기 통계 로드 전 약간의 지연을 둠 (Supabase 연결 확인을 위해)
  setTimeout(() => {
    useAdminStore.getState().refreshStats().catch(console.error);
    
    // 앱 시작 시 관리자 설정을 로컬 스토리지에 동기화
    syncAdminSettingsWithApp();
  }, 1000);
}

// Exporting a function to sync admin settings with the CharacterCreation store
export const syncAdminSettingsWithApp = () => {
  const adminSettings = useAdminStore.getState().settings;
  
  // 사용자 측에서 사용할 수 있도록 로컬 스토리지에 설정 저장
  if (typeof window !== 'undefined') {
    try {
      // 일일 토큰 충전량 설정 저장
      localStorage.setItem('admin_token_settings', JSON.stringify({
        dailyTokens: adminSettings.tokenCosts.dailyTokenRefill,
        firstDoppleFree: adminSettings.tokenCosts.firstDoppleFree,
        createCharacterCost: adminSettings.tokenCosts.createCharacterCost,
        regenerateImageCost: adminSettings.tokenCosts.regenerateImageCost,
        // 기타 필요한 설정도 추가
      }));
      
      console.log('Admin settings synchronized with application:', adminSettings);
      return true;
    } catch (error) {
      console.error('Error syncing admin settings:', error);
      return false;
    }
  }
  
  return false;
}; 