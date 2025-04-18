import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 연결 정보 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnN3dWRiaWt6dnpwcmx6bnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NDg5NDUsImV4cCI6MjA2MDEyNDk0NX0.lI0kNG4WqaZfOqQxhW6AvnganZCYfOkcnSX07CcJO6Q';

// 연결 정보가 있는지 확인하고 콘솔에 로깅
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL 또는 API 키가 없습니다. 환경 변수 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.');
}

// 서비스 롤 키도 환경 변수에서 가져오기
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnN3dWRiaWt6dnpwcmx6bnJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU0ODk0NSwiZXhwIjoyMDYwMTI0OTQ1fQ.xZ5glpCe09Oe1RqwGcUMR-FbjE9Pfnz_VCELJJWvp-g';

// globalThis를 사용하여 전역 인스턴스 저장
declare global {
  var supabaseClient: ReturnType<typeof createClient> | undefined;
  var supabaseAdminClient: ReturnType<typeof createClient> | undefined;
}

// 싱글톤 패턴으로 Supabase 클라이언트 생성
export const getSupabaseClient = () => {
  // 서버 사이드에서는 매번 새 인스턴스 생성
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  
  // 브라우저에서는 싱글톤 인스턴스 사용
  if (!globalThis.supabaseClient) {
    console.log('새로운 Supabase 클라이언트 인스턴스 생성 (브라우저)');
    globalThis.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'whoomi-supabase-auth-v1',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  }
  
  return globalThis.supabaseClient;
};

// 싱글톤 패턴으로 Supabase Admin 클라이언트 생성
export const getSupabaseAdminClient = () => {
  // 서버 사이드에서는 매번 새 인스턴스 생성
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  
  // 브라우저에서는 싱글톤 인스턴스 사용 (필요한 경우)
  if (!globalThis.supabaseAdminClient) {
    console.log('새로운 Supabase Admin 클라이언트 인스턴스 생성 (브라우저)');
    globalThis.supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        storageKey: 'whoomi-supabase-admin-auth-v1',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
  
  return globalThis.supabaseAdminClient;
};

// 관용적인 사용을 위해 기본 내보내기 (이미 생성된 인스턴스 또는 새 인스턴스)
// 주의: 클라이언트 사이드에서 import 시 항상 동일한 인스턴스를 반환하도록 함
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = typeof window !== 'undefined' ? getSupabaseAdminClient() : createClient(supabaseUrl, supabaseServiceKey);

// 실제 사용 시 항상 함수를 통해 가져오도록 권장
export const getSupabase = () => getSupabaseClient();
export const getSupabaseAdmin = () => getSupabaseAdminClient();

/**
 * Supabase 초기 설정 - 권한 문제 우회
 */
export async function setupSupabase(): Promise<void> {
  try {
    console.log("Checking Supabase resources...");
    console.log("Using Supabase URL:", supabaseUrl);
    
    // 기본 연결 테스트
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        console.error("Basic connection test failed:", error.message, error.details, error.hint);
      } else {
        console.log("Supabase connection successful", data);
      }
    } catch (connError) {
      console.error("Supabase connection error:", connError);
    }
    
    // Check if 'images' storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error checking storage buckets:", bucketsError.message);
    } else {
      const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
      if (imagesBucket) {
        console.log("'images' bucket exists");
        
        // 버킷 접근 권한 테스트
        try {
          const { data: files, error: filesError } = await supabase.storage.from('images').list();
          if (filesError) {
            console.error("Cannot access files in 'images' bucket:", filesError);
          } else {
            console.log("Successfully accessed 'images' bucket. Files count:", files?.length);
          }
        } catch (bucketAccessError) {
          console.error("Error accessing 'images' bucket:", bucketAccessError);
        }
        
      } else {
        console.warn("'images' bucket does not exist. Please create it in the Supabase dashboard.");
      }
    }
    
    // Check if 'profiles' table exists by fetching some records
    // count(*) 쿼리 대신 직접 레코드를 가져와서 개수 확인
    const { data: profileRecords, error: recordsError } = await supabase
      .from('profiles')
      .select('id')
      .limit(100);
    
    if (recordsError && !recordsError.message.includes('No rows found')) {
      console.error("Error checking 'profiles' table:", recordsError.message, recordsError.details);
      console.warn("'profiles' table might not exist or might have permission issues.");
      console.warn("Please ensure 'profiles' table exists with appropriate RLS policies.");
    } else {
      const recordCount = profileRecords?.length || 0;
      console.log(`'profiles' table exists with at least ${recordCount} records`);
      
      // 현재 인증된 사용자가 있으면 해당 사용자의 프로필도 확인
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        console.log("Checking profiles for authenticated user:", authData.user.id);
        const { data: userProfiles, error: userProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id);
          
        if (userProfilesError) {
          console.error("Error fetching user profiles:", userProfilesError);
        } else {
          console.log(`Found ${userProfiles?.length || 0} profiles for user:`, authData.user.id);
        }
      } else {
        console.warn("No authenticated user found. Authentication may not be completed yet.");
      }
    }
  } catch (error) {
    console.error("Error checking Supabase resources:", error);
  }
}

// 앱 시작 시 자동으로 Supabase 설정 실행
if (typeof window !== 'undefined') {
  // 앱 시작 시 Supabase 연결 확인
  // 개발 모드에서는 로그를 확인할 수 있도록 함
  setupSupabase().then(() => {
    console.info('✅ Supabase 초기화 완료');
    
    // 개발 모드에서는 추가 디버깅 정보 확인
    if (process.env.NODE_ENV === 'development') {
      // 테이블 구조 확인
      checkProfilesTableStructure()
        .then(columns => {
          console.info('📊 Profiles 테이블 구조:', columns);
        })
        .catch(error => {
          console.error('❌ Profiles 테이블 구조 확인 오류:', error);
        });
      
      // 연결 테스트
      testConnection()
        .then(result => {
          if (result.connected) {
            console.info('🔌 Supabase 연결 성공');
            if (result.authenticated) {
              console.info('🔑 사용자 인증됨');
            } else {
              console.info('👤 사용자 인증 필요');
            }
          } else {
            console.warn('⚠️ Supabase 연결 실패:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ 연결 테스트 오류:', error);
        });
    }
  })
  .catch(error => {
    console.error('❌ Supabase 초기화 오류:', error);
  });
}

/**
 * profiles 테이블의 구조(칼럼) 확인
 * 데이터베이스 스키마 문제 해결에 도움이 됨
 */
async function checkProfilesTableStructure(): Promise<string[]> {
  try {
    // 1. 테이블 존재 여부 확인
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Cannot access profiles table:', testError);
      return [];
    }
    
    // 2. 테이블 데이터로 구조 추측
    if (testData && testData.length > 0) {
      const sampleRecord = testData[0];
      console.log('Sample record from profiles table:', sampleRecord);
      return Object.keys(sampleRecord);
    }
    
    // 3. Skip test record creation entirely - it's causing RLS policy violations
    console.log('No existing records found. Skipping test record creation to avoid RLS policy violations.');
    return [];
    
  } catch (error) {
    console.error('Error checking profiles table structure:', error);
    return [];
  }
}

/**
 * 도플 이미지를 Supabase Storage에 업로드
 * @param imageBase64 Base64 형식의 이미지 데이터
 * @param userId 사용자 ID
 * @param doppleId 도플 ID
 * @returns 업로드된 이미지의 URL
 */
export async function uploadDoppleImage(imageBase64: string, userId: string, doppleId: string | number): Promise<string> {
  try {
    // Base64 이미지 데이터를 Blob으로 변환
    const base64Data = imageBase64.split(',')[1];
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // 파일 경로 설정 (사용자ID/도플ID.png)
    const filePath = `profiles/${userId}/${doppleId}.png`;
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true, // 같은 경로에 파일이 있으면 덮어쓰기
      });
    
    if (error) {
      console.error('Error uploading image to Supabase:', error);
      throw error;
    }
    
    // 이미지 공개 URL 가져오기
    const { data: publicUrl } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error in uploadDoppleImage:', error);
    throw error;
  }
}

/**
 * 프로필 데이터를 Supabase에 저장
 * @param profile 프로필 객체
 * @returns 저장된 프로필 객체
 */
export async function saveProfile(profile: any): Promise<any> {
  try {
    console.log('Saving profile to Supabase:', profile.name);
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    
    if (!currentUser) {
      console.error('saveProfile: User must be logged in');
      throw new Error('User must be logged in to save profile');
    }
    
    // 알려진 문제를 일으키는 필드들 제거
    const { createdAt, updatedAt, image, created_at, updated_at, ...cleanProfile } = profile;
    
    // 사용자 ID를 항상 현재 로그인된 사용자 ID로 설정 (RLS 정책을 만족시키기 위함)
    const id = profile.id || generateDoppleId(); // 프로필 ID (기존 ID 유지 또는 새로 생성)
    const userId = currentUser.id; // 사용자 ID
    
    // 이름 필드가 비어있는지 확인
    if (!cleanProfile.name || cleanProfile.name.trim() === '') {
      // 메타데이터에서 이름 찾기 시도
      if (cleanProfile.metadata && cleanProfile.metadata.characterName) {
        cleanProfile.name = cleanProfile.metadata.characterName;
      } else {
        cleanProfile.name = 'My Dopple';
      }
    }
    
    // Supabase에 저장할 데이터 구조 준비
    const supabaseProfile: {
      id: string | number;
      name: string;
      description: string;
      image_url: string;
      user_id: string;
      traits: string[];
      interests: string[];
      mbti: string;
      level: number;
      likes: number;
      xp: number;
      active: boolean;
      memory_strength: string;
      last_memory_update: string;
      updated_at: string;
      conversation_count: number;
      connectome: any;
      metadata: any;
      created_at?: string;
    } = {
      id,
      name: cleanProfile.name,
      description: cleanProfile.description || '',
      image_url: cleanProfile.image_url || '',
      user_id: userId,
      traits: cleanProfile.traits || [],
      interests: cleanProfile.interests || [],
      mbti: cleanProfile.mbti || '',
      level: cleanProfile.level || 1,
      likes: cleanProfile.likes || 0,
      xp: cleanProfile.xp || 0,
      active: cleanProfile.active !== undefined ? cleanProfile.active : true,
      memory_strength: cleanProfile.memory_strength || 'medium',
      last_memory_update: cleanProfile.last_memory_update || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      conversation_count: cleanProfile.conversation_count || 0,
      connectome: cleanProfile.connectome || null,
      metadata: {
        ...(cleanProfile.metadata || {}),
        // 메타데이터에 사용자 ID 추가 (나중에 조회 가능하도록)
        created_by: userId,
        // 기타 메타데이터 필드
        badges: cleanProfile.badges || 0,
        popularity: cleanProfile.popularity || 0,
      }
    };
    
    // 생성 날짜 필드는 새 프로필인 경우에만 설정
    if (!profile.id || !profile.created_at) {
      supabaseProfile.created_at = new Date().toISOString();
    }
    
    // 먼저 로컬 스토리지에 백업
    if (typeof window !== 'undefined') {
      try {
        const cachedDopplesJSON = localStorage.getItem('userDopples');
        let cachedDopples = [];
        
        if (cachedDopplesJSON) {
          cachedDopples = JSON.parse(cachedDopplesJSON);
        }
        
        // 기존 도플 업데이트 또는 새 도플 추가
        const existingIndex = cachedDopples.findIndex((d: any) => d.id === id);
        
        if (existingIndex >= 0) {
          cachedDopples[existingIndex] = { ...cachedDopples[existingIndex], ...supabaseProfile };
        } else {
          cachedDopples.push(supabaseProfile);
        }
        
        localStorage.setItem('userDopples', JSON.stringify(cachedDopples));
        console.log('Saved to local storage as backup');
      } catch (storageError) {
        console.error('Error saving to local storage:', storageError);
      }
    }
    
    // Supabase에 저장
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(supabaseProfile)
        .select();
      
      if (error) {
        console.error('Error saving profile to Supabase:', error);
        // 오류가 있더라도 로컬 저장된 데이터 반환
        return supabaseProfile;
      }
      
      console.log('Profile successfully saved to Supabase:', data);
      return data[0] || supabaseProfile;
    } catch (dbError) {
      console.error('Database error while saving profile:', dbError);
      // 데이터베이스 오류 시 로컬 데이터 반환
      return supabaseProfile;
    }
  } catch (error) {
    console.error('Error in saveProfile:', error);
    // 발생한 에러에 관계없이 원본 프로필 반환 (UI 업데이트는 가능하도록)
    return profile;
  }
}

// 새로운 도플 ID 생성 함수
function generateDoppleId(): string {
  return `d_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Dopple 타입 정의
export interface Dopple {
  id: string | number;
  name: string;
  description?: string;
  image_url?: string;
  level?: number;
  traits?: string[];
  interests?: string[];
  mbti?: string;
  likes?: number;
  created_at?: string;
  updated_at?: string;
  node_count?: number;
  memory_strength?: string;
  last_memory_update?: string;
  conversation_count?: number;
  popularity?: number;
  xp?: number;
  badges?: number;
  owner_id?: string;
  metadata?: any;
  connectome?: any;
  personality?: any;
  memory_id?: string;
  active?: boolean;
}

/**
 * 사용자의 모든 프로필 가져오기
 * @param userId 사용자 ID
 * @returns 프로필 배열
 */
export async function getUserProfiles(userId: string): Promise<any[]> {
  try {
    if (!userId) {
      console.error('getUserProfiles: userId is required');
      return [];
    }

    console.log(`Fetching profiles for user ${userId}`);
    
    // 먼저 인증 확인
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      console.error('getUserProfiles: User is not authenticated');
      return [];
    }
    
    // 프로필 테이블에서 사용자의 도플 데이터 조회 시도
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching profiles from Supabase:', error);
      
      // 오류 발생 시 로컬 캐시 사용
      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem('userDopples');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log('Using cached dopples data due to fetch error:', parsedData.length);
          return parsedData;
        }
      }
      
      return [];
    }
    
    // 성공적으로 데이터를 가져온 경우, 로컬 스토리지에도 캐싱
    if (profiles && Array.isArray(profiles) && typeof window !== 'undefined') {
      localStorage.setItem('userDopples', JSON.stringify(profiles));
      localStorage.setItem('userDopples_lastSync', new Date().toISOString());
      console.log(`Cached ${profiles.length} dopples to local storage`);
    }
    
    return profiles || [];
  } catch (error) {
    console.error('Error in getUserProfiles:', error);
    
    // 예외 발생 시 로컬 캐시 반환
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('userDopples');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('Using cached dopples data after exception:', parsedData.length);
        return parsedData;
      }
    }
    
    return [];
  }
}

/**
 * 특정 프로필 정보 가져오기
 * @param profileId 프로필 ID
 * @returns 프로필 객체 또는 null
 */
export async function getProfile(profileId: string | number): Promise<Dopple | null> {
  try {
    if (!profileId) {
      console.error('getProfile: profileId is required');
      return null;
    }
    
    console.log(`Fetching profile with ID ${profileId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    
    if (error) {
      console.error('Error fetching profile from Supabase:', error);
      return null;
    }
    
    return data as Dopple;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

/**
 * 사용자의 모든 도플을 DB에서 가져온 후 캐시에 저장
 * @param userId 사용자 ID
 * @param forceRefresh 강제 새로고침 여부
 */
export async function syncUserDopples(userId: string, forceRefresh: boolean = false): Promise<Dopple[]> {
  try {
    if (!userId) return [];
    
    // Supabase에서 도플 가져오기
    const dopples = await getUserProfiles(userId);
    
    // 서버에서 가져온 데이터가 있을 때만 로컬 스토리지 업데이트
    if (dopples && Array.isArray(dopples) && dopples.length > 0) {
      // 서버에서 가져온 가장 최신 데이터로 간주
      if (typeof window !== 'undefined') {
        localStorage.setItem('userDopples', JSON.stringify(dopples));
        localStorage.setItem('userDopples_lastSync', new Date().toISOString());
      }
      return dopples as Dopple[];
    } else if (!forceRefresh && typeof window !== 'undefined') {
      // 서버에서 데이터를 가져오지 못했고 강제 새로고침이 아닌 경우 로컬 캐시 사용
      const cachedData = localStorage.getItem('userDopples');
      if (cachedData) {
        return JSON.parse(cachedData) as Dopple[];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error syncing user dopples:', error);
    
    // 오류 발생 시 로컬 캐시 반환
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('userDopples');
      if (cachedData) {
        return JSON.parse(cachedData) as Dopple[];
      }
    }
    
    return [];
  }
}

/**
 * 도플 정보를 가져오되, 로컬 캐시를 우선적으로 확인
 * @param doppleId 도플 ID
 */
export async function getDoppleWithCache(doppleId: string | number): Promise<Dopple | null> {
  try {
    if (!doppleId) return null;
    
    // 1. 먼저 로컬 캐시 확인
    if (typeof window !== 'undefined') {
      const cachedDopples = localStorage.getItem('userDopples');
      if (cachedDopples) {
        const dopples = JSON.parse(cachedDopples) as Dopple[];
        const cachedDopple = dopples.find(d => d.id == doppleId); // == 사용 (타입 변환 허용)
        
        if (cachedDopple) {
          console.log('Found dopple in cache:', cachedDopple.name);
          return cachedDopple;
        }
      }
    }
    
    // 2. 캐시에 없으면 서버에서 가져오기
    console.log('Fetching dopple from server:', doppleId);
    return await getProfile(doppleId);
    
  } catch (error) {
    console.error('Error in getDoppleWithCache:', error);
    return null;
  }
}

/**
 * 도플 정보 저장 및 로컬 캐시 업데이트
 * @param dopple 도플 객체
 */
export async function saveDoppleWithCache(dopple: Partial<Dopple>): Promise<Dopple | null> {
  try {
    console.log('Saving dopple with data:', dopple);
    console.log('DEBUG: Dopple name being saved:', dopple.name);
    
    // 이름 필드가 없는 경우 기본값 할당
    if (!dopple.name || dopple.name.trim() === '') {
      console.warn('Dopple name is empty, using default name');
      dopple.name = 'My Dopple';
    }
    
    // 디버깅을 위해 이름 확인
    console.log('DEBUG: Final dopple name before saving:', dopple.name);
    
    // saveProfile 함수를 통해 저장 (이 함수는 항상 로컬 스토리지에 저장함)
    const savedDopple = await saveProfile(dopple);
    
    // 항상 성공으로 간주하고 데이터 반환
    return savedDopple as Dopple;
    
  } catch (error) {
    console.error('Error in saveDoppleWithCache:', error);
    
    // 모든 시도 실패해도 원본 데이터 반환 (최소한 UI 업데이트는 가능하도록)
    return dopple as Dopple;
  }
}

// For backward compatibility
export const saveDopple = saveProfile;
export const getUserDopples = getUserProfiles;
export const getDopple = getProfile;

// 사용자 정보 및 지갑 정보 인터페이스
export interface UserInfo {
  id: string;
  email?: string;
  auth_provider?: string;
  wallet_address?: string;
  embedded_wallet_address?: string;
  created_at?: string;
  updated_at?: string;
}

// 인증 상태 확인
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// 현재 사용자 가져오기
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// 사용자 로그아웃
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// 소셜 로그인 (Google)
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  });
  return { data, error };
};

// 패스키 검증 결과에 따라 커스텀 JWT 발급
export const signInWithPasskey = async (passkeyCredential: any) => {
  try {
    // 패스키 검증 엔드포인트 호출 (백엔드에서 구현해야 함)
    const response = await fetch('/api/auth/passkey/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passkeyCredential),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '패스키 검증 실패');
    }

    // 성공적으로 검증되면 서버에서 Supabase 세션을 설정함
    // 응답에는 사용자 정보 포함
    const { user } = await response.json();
    return { data: { user }, error: null };
  } catch (error) {
    console.error('패스키 로그인 오류:', error);
    return { data: null, error };
  }
};

// 사용자 정보 저장/업데이트 (지갑 주소 포함)
export const updateUserInfo = async (userId: string, info: Partial<UserInfo>) => {
  console.log(`Updating user ${userId} with info:`, info);
  try {
    const { data, error } = await supabase
      .from('users')
      .update(info)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error("Supabase update error:", error);
    }
    
    return { data, error };
  } catch (e) {
    console.error("Exception in updateUserInfo:", e);
    throw e;
  }
};

// 사용자 정보 조회
export const getUserInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

/**
 * 연결 상태 및 로그인 테스트
 * 현재 연결 상태와 인증 상태를 확인합니다.
 */
export async function testConnection(): Promise<{ connected: boolean; authenticated: boolean; error?: any }> {
  try {
    // 기본 연결 테스트 - profiles 테이블 자체가 존재하는지만 간단히 확인
    const { error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (tableError && !tableError.message.includes('No rows found')) {
      console.error("Supabase connection test failed:", tableError.message);
      return { connected: false, authenticated: false, error: tableError };
    }
    
    // 인증 상태 확인
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Authentication check failed:", authError.message);
      return { connected: true, authenticated: false, error: authError };
    }
    
    const isAuthenticated = !!authData?.user;
    console.log("Authentication status:", isAuthenticated ? "Logged in" : "Not logged in");
    
    return { connected: true, authenticated: isAuthenticated };
  } catch (error) {
    console.error("Error testing connection:", error);
    return { connected: false, authenticated: false, error };
  }
}

// 앱 시작 시 연결 테스트 실행
if (typeof window !== 'undefined') {
  testConnection().then(status => {
    console.log("Supabase connection status:", status);
  }).catch(console.error);
}

/**
 * Passage 인증으로 로그인
 * Passage 자격 증명으로 Supabase 세션 생성
 */
export async function signInWithPassage(passageAuthToken: string) {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google', // 실제로는 passage이지만 외부 제공자로 처리
      token: passageAuthToken,
    });

    if (error) {
      console.error('Passage sign in error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error during Passage sign in:', error);
    return { data: null, error };
  }
}

/**
 * 도플의 connectome 데이터 저장
 * @param doppleId 도플 ID
 * @param connectomeData connectome 데이터
 * @returns 성공 여부
 */
export async function saveConnectome(doppleId: string | number, connectomeData: any): Promise<boolean> {
  try {
    if (!doppleId) {
      console.error('saveConnectome: doppleId is required');
      return false;
    }

    console.log(`Saving connectome for dopple ${doppleId}`);
    
    // 현재 로그인한 사용자 정보 확인
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      console.error('saveConnectome: User must be logged in');
      return false;
    }
    
    // 먼저 해당 도플이 존재하는지 확인
    const { data: dopple, error: fetchError } = await supabase
      .from('profiles')
      .select('id, connectome')
      .eq('id', doppleId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching dopple for connectome update:', fetchError);
      return false;
    }
    
    // 도플 데이터 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        connectome: connectomeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', doppleId);
    
    if (updateError) {
      console.error('Error updating connectome in Supabase:', updateError);
      
      // 로컬 저장소에서라도 업데이트
      if (typeof window !== 'undefined') {
        const cachedDopplesJSON = localStorage.getItem('userDopples');
        if (cachedDopplesJSON) {
          try {
            const cachedDopples = JSON.parse(cachedDopplesJSON);
            const updatedDopples = cachedDopples.map((d: any) => {
              if (d.id == doppleId) { // == 사용 (타입 변환 허용)
                return { ...d, connectome: connectomeData, updated_at: new Date().toISOString() };
              }
              return d;
            });
            
            localStorage.setItem('userDopples', JSON.stringify(updatedDopples));
            console.log('Updated connectome in local storage');
          } catch (e) {
            console.error('Error updating connectome in local storage:', e);
          }
        }
      }
      
      return false;
    }
    
    console.log('Connectome successfully saved to Supabase');
    
    // 로컬 저장소도 업데이트
    if (typeof window !== 'undefined') {
      const cachedDopplesJSON = localStorage.getItem('userDopples');
      if (cachedDopplesJSON) {
        try {
          const cachedDopples = JSON.parse(cachedDopplesJSON);
          const updatedDopples = cachedDopples.map((d: any) => {
            if (d.id == doppleId) { // == 사용 (타입 변환 허용)
              return { ...d, connectome: connectomeData, updated_at: new Date().toISOString() };
            }
            return d;
          });
          
          localStorage.setItem('userDopples', JSON.stringify(updatedDopples));
        } catch (e) {
          console.error('Error updating connectome in local storage:', e);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveConnectome:', error);
    return false;
  }
}

/**
 * 도플의 connectome 데이터 가져오기
 * @param doppleId 도플 ID
 * @returns connectome 데이터
 */
export async function getConnectome(doppleId: string | number): Promise<any | null> {
  try {
    if (!doppleId) {
      console.error('getConnectome: doppleId is required');
      return null;
    }
    
    console.log(`Fetching connectome for dopple ${doppleId}`);
    
    // 먼저 로컬 캐시 확인
    if (typeof window !== 'undefined') {
      const cachedDopplesJSON = localStorage.getItem('userDopples');
      if (cachedDopplesJSON) {
        const cachedDopples = JSON.parse(cachedDopplesJSON);
        const dopple = cachedDopples.find((d: any) => d.id == doppleId); // == 사용 (타입 변환 허용)
        
        if (dopple && dopple.connectome) {
          console.log('Found connectome in cache');
          return dopple.connectome;
        }
      }
    }
    
    // 캐시에 없으면 Supabase에서 가져오기
    const { data, error } = await supabase
      .from('profiles')
      .select('connectome')
      .eq('id', doppleId)
      .single();
    
    if (error) {
      console.error('Error fetching connectome from Supabase:', error);
      return null;
    }
    
    return data?.connectome || null;
  } catch (error) {
    console.error('Error in getConnectome:', error);
    return null;
  }
}

/**
 * 채팅 메시지 인터페이스
 */
export interface ChatMessage {
  id: string;
  user_id: string;
  dopple_id: string | number;
  conversation_id: string;
  role: 'user' | 'dopple' | 'system';
  content: string;
  timestamp: number;
  image_url?: string;
  metadata?: any;
}

/**
 * 대화 인터페이스
 */
export interface Conversation {
  id: string;
  user_id: string;
  dopple_id: string | number;
  title?: string;
  summary?: string;
  start_time: number;
  end_time?: number;
  message_count: number;
  last_message?: string;
  last_message_time?: number;
  metadata?: any;
}

/**
 * 새 대화 시작
 * @param userId 사용자 ID
 * @param doppleId 도플 ID
 * @param title 대화 제목 (옵션)
 * @returns 생성된 대화 객체
 */
export async function startConversation(
  userId: string,
  doppleId: string | number,
  title?: string
): Promise<Conversation | null> {
  try {
    if (!userId || !doppleId) {
      console.error('startConversation: userId and doppleId are required');
      return null;
    }

    console.log(`Starting a new conversation between user ${userId} and dopple ${doppleId}`);
    
    // 대화 ID 생성
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();
    
    // Supabase에 대화 데이터 저장
    const conversation: Conversation = {
      id: conversationId,
      user_id: userId,
      dopple_id: doppleId,
      title: title || `대화 ${new Date(startTime).toLocaleDateString()}`,
      start_time: startTime,
      message_count: 0,
      metadata: {}
    };
    
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select();
      
    if (error) {
      console.error('Error creating conversation in Supabase:', error);
      
      // 로컬 스토리지에 임시 저장 (백업)
      if (typeof window !== 'undefined') {
        try {
          const localConversations = localStorage.getItem(`conversations_${userId}`) || '[]';
          const conversations = JSON.parse(localConversations);
          conversations.push(conversation);
          localStorage.setItem(`conversations_${userId}`, JSON.stringify(conversations));
          console.log('Conversation saved to local storage as backup');
        } catch (e) {
          console.error('Error saving conversation to local storage:', e);
        }
      }
      
      return conversation;
    }
    
    console.log('Conversation created in Supabase:', data[0]);
    
    // 도플 데이터의 conversation_count 증가
    try {
      const { data: doppleData, error: doppleError } = await supabase
        .from('profiles')
        .select('conversation_count')
        .eq('id', doppleId)
        .single();
      
      if (!doppleError && doppleData) {
        const currentCount = doppleData.conversation_count || 0;
        await supabase
          .from('profiles')
          .update({ conversation_count: currentCount + 1 })
          .eq('id', doppleId);
      }
    } catch (countError) {
      console.error('Error updating conversation count:', countError);
    }
    
    return data[0] as Conversation;
  } catch (error) {
    console.error('Error in startConversation:', error);
    return null;
  }
}

/**
 * 대화에 메시지 추가
 * @param userId 사용자 ID
 * @param conversationId 대화 ID
 * @param message 메시지 내용
 * @returns 저장된 메시지 객체
 */
export async function addMessage(
  userId: string,
  conversationId: string,
  message: {
    role: 'user' | 'dopple' | 'system';
    content: string;
    dopple_id: string | number;
    image_url?: string;
    metadata?: any;
  }
): Promise<ChatMessage | null> {
  try {
    if (!userId || !conversationId || !message) {
      console.error('addMessage: userId, conversationId, and message are required');
      return null;
    }

    console.log(`Adding message to conversation ${conversationId}`);
    
    // 메시지 ID 생성
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();
    
    // Supabase에 메시지 저장
    const chatMessage: ChatMessage = {
      id: messageId,
      user_id: userId,
      dopple_id: message.dopple_id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      timestamp: timestamp,
      image_url: message.image_url,
      metadata: message.metadata || {}
    };
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(chatMessage)
      .select();
      
    if (error) {
      console.error('Error adding message to Supabase:', error);
      
      // 로컬 스토리지에 임시 저장 (백업)
      if (typeof window !== 'undefined') {
        try {
          const localMessages = localStorage.getItem(`messages_${conversationId}`) || '[]';
          const messages = JSON.parse(localMessages);
          messages.push(chatMessage);
          localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
          console.log('Message saved to local storage as backup');
        } catch (e) {
          console.error('Error saving message to local storage:', e);
        }
      }
      
      return chatMessage;
    }
    
    // 대화 업데이트 (마지막 메시지 및 메시지 카운트)
    try {
      await supabase
        .from('conversations')
        .update({
          last_message: message.content.substring(0, 100), // 첫 100자만 저장
          last_message_time: timestamp,
          message_count: supabase.rpc('increment', { x: 1, row_id: conversationId, table: 'conversations', column: 'message_count' }),
        })
        .eq('id', conversationId);
    } catch (updateError) {
      console.error('Error updating conversation:', updateError);
    }
    
    console.log('Message added to Supabase:', data[0]);
    return data[0] as ChatMessage;
  } catch (error) {
    console.error('Error in addMessage:', error);
    return null;
  }
}

/**
 * 대화 종료
 * @param conversationId 대화 ID
 * @param summary 대화 요약 (옵션)
 * @returns 성공 여부
 */
export async function endConversation(conversationId: string, summary?: string): Promise<boolean> {
  try {
    if (!conversationId) {
      console.error('endConversation: conversationId is required');
      return false;
    }

    console.log(`Ending conversation ${conversationId}`);
    
    // Supabase에서 대화 업데이트
    const { error } = await supabase
      .from('conversations')
      .update({
        end_time: Date.now(),
        summary: summary
      })
      .eq('id', conversationId);
      
    if (error) {
      console.error('Error ending conversation in Supabase:', error);
      return false;
    }
    
    console.log('Conversation ended in Supabase');
    return true;
  } catch (error) {
    console.error('Error in endConversation:', error);
    return false;
  }
}

/**
 * 사용자의 대화 목록 가져오기
 * @param userId 사용자 ID
 * @param limit 가져올 대화 수 제한 (기본값: 20)
 * @param offset 오프셋 (기본값: 0)
 * @returns 대화 목록
 */
export async function getUserConversations(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Conversation[]> {
  try {
    if (!userId) {
      console.error('getUserConversations: userId is required');
      return [];
    }

    console.log(`Fetching conversations for user ${userId}`);
    
    // Supabase에서 대화 목록 가져오기
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error('Error fetching conversations from Supabase:', error);
      
      // 로컬 스토리지에서 가져오기 (백업)
      if (typeof window !== 'undefined') {
        try {
          const localConversations = localStorage.getItem(`conversations_${userId}`);
          if (localConversations) {
            const conversations = JSON.parse(localConversations);
            console.log('Using conversations from local storage');
            return conversations
              .sort((a: Conversation, b: Conversation) => b.start_time - a.start_time)
              .slice(offset, offset + limit);
          }
        } catch (e) {
          console.error('Error getting conversations from local storage:', e);
        }
      }
      
      return [];
    }
    
    console.log(`Found ${data.length} conversations`);
    return data as Conversation[];
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
}

/**
 * 특정 대화의 메시지 가져오기
 * @param conversationId 대화 ID
 * @param limit 가져올 메시지 수 제한 (기본값: 100)
 * @param offset 오프셋 (기본값: 0)
 * @returns 메시지 목록
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ChatMessage[]> {
  try {
    if (!conversationId) {
      console.error('getConversationMessages: conversationId is required');
      return [];
    }

    console.log(`Fetching messages for conversation ${conversationId}`);
    
    // Supabase에서 메시지 가져오기
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error('Error fetching messages from Supabase:', error);
      
      // 로컬 스토리지에서 가져오기 (백업)
      if (typeof window !== 'undefined') {
        try {
          const localMessages = localStorage.getItem(`messages_${conversationId}`);
          if (localMessages) {
            const messages = JSON.parse(localMessages);
            console.log('Using messages from local storage');
            return messages
              .sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp)
              .slice(offset, offset + limit);
          }
        } catch (e) {
          console.error('Error getting messages from local storage:', e);
        }
      }
      
      return [];
    }
    
    console.log(`Found ${data.length} messages`);
    return data as ChatMessage[];
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
} 