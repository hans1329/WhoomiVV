// WebAuthn 인증 관련 데이터베이스 저장 모듈

import { supabase, supabaseAdmin } from './supabase';
import crypto from 'crypto';

// globalThis에 전역 타입 선언 추가
declare global {
  var webauthnChallenges: Map<string, {
    challenge: string;
    email: string;
    created_at: string;
    expires_at: string;
  }>;
  // 인메모리 사용자 저장소 추가
  var webauthnUsers: Map<string, UserAuthData>;
}

// RPName과 RPID 설정
export const rpName = 'Whoomi';

// 환경 변수에서 도메인 정보를 가져오거나 기본값 사용
const getEnvVar = (name: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || defaultValue;
  }
  return defaultValue;
};

// 브라우저 환경에서 실행 중인지 확인
const isBrowser = typeof window !== 'undefined';

// 브라우저 환경일 때는 현재 도메인을, 서버 환경일 때는 환경 변수 또는 기본값을 사용
export const rpID = isBrowser 
  ? window.location.hostname 
  : getEnvVar('NEXT_PUBLIC_WEBAUTHN_RP_ID', 'localhost');

export const origin = isBrowser 
  ? window.location.origin 
  : getEnvVar('NEXT_PUBLIC_WEBAUTHN_ORIGIN', 'http://localhost:3000');

// 도메인 설정 로깅
if (isBrowser) {
  console.log('브라우저 환경에서 실행 중, 실제 도메인 정보 사용:', {
    hostname: window.location.hostname,
    origin: window.location.origin
  });
} else {
  console.log('서버 환경에서 실행 중, 환경 변수에서 도메인 정보 사용:', {
    rpID,
    origin
  });
}

// 웹인증 사용자 데이터 인터페이스
export interface UserAuthData {
  id: string;
  email: string;
  registeredCredentials: Array<{
    id: string;
    publicKey: string;
    counter: number;
  }>;
}

// 모듈 초기화 로그
console.log('WebAuthn 인증 모듈 초기화 완료 (Supabase 저장소 사용)');
console.log(`설정: rpID=${rpID}, origin=${origin}`);

// 초기화
if (typeof globalThis.webauthnChallenges === 'undefined') {
  globalThis.webauthnChallenges = new Map();
}
if (typeof globalThis.webauthnUsers === 'undefined') {
  globalThis.webauthnUsers = new Map();
}

/**
 * 이메일로 사용자 조회 (Supabase 버전)
 */
export async function getUserByEmail(email: string): Promise<UserAuthData | undefined> {
  try {
    // 0. 먼저 인메모리 저장소 확인 (빠른 검색)
    if (typeof globalThis.webauthnUsers !== 'undefined') {
      // 이메일로 사용자 찾기
      const users = Array.from(globalThis.webauthnUsers.values());
      for (const userData of users) {
        if (userData.email === email) {
          console.log('인메모리 저장소에서 사용자 찾음:', userData.id, email);
          return userData;
        }
      }
    }
    
    // 1. 사용자 정보 조회
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (error || !user) {
      console.log(`이메일에 해당하는 사용자 없음: ${email}`);
      return undefined;
    }
    
    // 2. 등록된 패스키 정보 조회
    const { data: credentials, error: credError } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter')
      .eq('user_id', user.id);
      
    if (credError) {
      console.error('패스키 정보 조회 오류:', credError);
      return undefined;
    }
    
    // 3. 사용자 데이터 구성
    const userData: UserAuthData = {
      id: user.id,
      email,
      registeredCredentials: credentials ? credentials.map(cred => ({
        id: cred.credential_id,
        publicKey: cred.public_key,
        counter: cred.counter
      })) : []
    };
    
    // 인메모리 저장소에도 저장
    if (typeof globalThis.webauthnUsers !== 'undefined') {
      globalThis.webauthnUsers.set(userData.id, userData);
    }
    
    return userData;
  } catch (err) {
    console.error('사용자 조회 에러:', err);
    return undefined;
  }
}

/**
 * 새 사용자 생성 (Supabase 버전)
 */
export async function createUser(email: string): Promise<UserAuthData> {
  try {
    // 1. 이미 존재하는 사용자인지 확인
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    let userId = existingUser?.id;
    
    // 2. 사용자가 없으면 새로 생성
    if (!userId) {
      // UUID v4 생성 (Supabase와 호환)
      userId = crypto.randomUUID();
      
      console.log('새 사용자 생성 시도:', { userId, email });
      
      // users 테이블에 레코드 삽입 - 이 스키마가 맞는지 확인 필요
      const { data, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({ 
          id: userId, 
          email,
          created_at: new Date().toISOString(),
          auth_provider: 'webauthn'
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('사용자 생성 오류 상세정보:', insertError);
        
        // 테이블 스키마 확인 오류 - profiles 테이블 시도
        console.log('users 테이블 삽입 실패, profiles 테이블 시도');
        
        // profiles 테이블에 대신 삽입 시도
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            email,
            name: email.split('@')[0],
            created_at: new Date().toISOString(),
            metadata: { auth_provider: 'webauthn' }
          })
          .select('id')
          .single();
          
        if (profileError) {
          console.error('profiles 테이블 삽입 오류:', profileError);
          throw new Error(`사용자 생성 실패: ${insertError.message}`);
        }
        
        console.log('profiles 테이블에 사용자 생성 성공:', profileData);
      }
      
      // 성공적으로 생성된 ID 사용
      if (data) {
        userId = data.id;
        console.log('users 테이블에 사용자 생성 성공:', data);
      }
    }
    
    // 3. 새 사용자 데이터 반환
    const userData: UserAuthData = {
      id: userId,
      email,
      registeredCredentials: []
    };
    
    // 인메모리 저장소에도 저장
    if (typeof globalThis.webauthnUsers !== 'undefined') {
      globalThis.webauthnUsers.set(userId, userData);
    }
    
    return userData;
  } catch (err) {
    console.error('사용자 생성 에러 전체:', err);
    throw err;
  }
}

/**
 * 패스키 정보 저장 (Supabase 버전)
 */
export async function saveCredential(
  userId: string, 
  email: string, 
  credential: {
    id: string;
    publicKey: string;
    counter: number;
  }
): Promise<void> {
  try {
    console.log('패스키 저장 시도:', { userId, credentialId: credential.id });
    
    // 1. 먼저 인메모리 userData 조회 또는 생성
    let userData: UserAuthData | undefined;
    
    if (typeof globalThis.webauthnUsers !== 'undefined') {
      // 사용자 찾기
      userData = globalThis.webauthnUsers.get(userId);
      
      if (!userData) {
        // 사용자가 없으면 생성
        userData = {
          id: userId,
          email,
          registeredCredentials: []
        };
      }
      
      // 기존 인증 정보 배열에 새 인증 정보 추가
      userData.registeredCredentials.push(credential);
      
      // 사용자 데이터 업데이트
      globalThis.webauthnUsers.set(userId, userData);
      console.log('인메모리에 패스키 저장 성공:', credential.id);
    }
    
    // 2. Supabase에 저장 시도
    const { error } = await supabaseAdmin
      .from('webauthn_credentials')
      .insert({
        user_id: userId,
        email,
        credential_id: credential.id,
        public_key: credential.publicKey,
        counter: credential.counter
      });
      
    if (error) {
      console.error('패스키 저장 오류:', error);
      // 인메모리에 저장되었으므로 DB 오류는 무시 가능
      console.log('패스키가 인메모리에 저장됨, DB 오류 무시');
    } else {
      console.log('패스키가 DB에 성공적으로 저장됨:', credential.id);
    }
  } catch (err) {
    console.error('패스키 저장 에러:', err);
    throw err;
  }
}

/**
 * 패스키 카운터 업데이트 (Supabase 버전)
 */
export async function updateCredentialCounter(
  userId: string, 
  credentialId: string, 
  newCounter: number
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('webauthn_credentials')
      .update({ counter: newCounter })
      .eq('user_id', userId)
      .eq('credential_id', credentialId);
      
    if (error) {
      console.error('패스키 카운터 업데이트 오류:', error);
      throw new Error('패스키 카운터 업데이트 실패');
    }
  } catch (err) {
    console.error('패스키 카운터 업데이트 에러:', err);
    throw err;
  }
}

/**
 * Challenge 저장 (Supabase 버전)
 */
export async function storeChallenge(userId: string, email: string, challenge: string): Promise<void> {
  try {
    // 만료 시간 설정 (5분)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // 먼저 사용자가 존재하는지 확인
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    // users 테이블에 사용자가 없으면 profiles 테이블 확인  
    if (!userData || userError) {
      console.log('users 테이블에서 사용자 찾기 실패, profiles 테이블 확인');
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (!profileData || profileError) {
        console.error('사용자를 찾을 수 없음, 챌린지 저장 불가:', userId);
        
        // 테이블에 외래 키 제약 조건이 있으므로 인메모리에 임시 저장
        console.log('인메모리 임시 저장소에 챌린지 저장:', { userId, challenge });
        
        // 인메모리 맵 생성 (임시 데이터 저장)
        if (typeof globalThis.webauthnChallenges === 'undefined') {
          globalThis.webauthnChallenges = new Map();
        }
        
        // 챌린지 정보 저장
        globalThis.webauthnChallenges.set(userId, {
          challenge,
          email,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });
        
        return; // 인메모리 저장으로 처리 완료
      }
    }
    
    // 사용자가 존재하면 challenge 저장 시도
    const { error } = await supabaseAdmin
      .from('webauthn_challenges')
      .upsert({
        user_id: userId,
        email,
        challenge,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });
      
    if (error) {
      console.error('Challenge 저장 오류:', error);
      
      // 데이터베이스 저장 실패 시 인메모리 임시 저장
      console.log('인메모리 임시 저장소에 챌린지 저장 시도:', { userId, challenge });
      
      // 인메모리 맵 생성 (임시 데이터 저장)
      if (typeof globalThis.webauthnChallenges === 'undefined') {
        globalThis.webauthnChallenges = new Map();
      }
      
      // 챌린지 정보 저장
      globalThis.webauthnChallenges.set(userId, {
        challenge,
        email,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });
    }
  } catch (err) {
    console.error('Challenge 저장 에러:', err);
    
    // 인메모리 임시 저장 (백업용)
    if (typeof globalThis.webauthnChallenges === 'undefined') {
      globalThis.webauthnChallenges = new Map();
    }
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // 챌린지 정보 저장
    globalThis.webauthnChallenges.set(userId, {
      challenge,
      email,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    });
  }
}

/**
 * Challenge 조회 (Supabase 버전)
 */
export async function getChallenge(userId: string): Promise<string | undefined> {
  try {
    console.log('Challenge 조회 시도:', userId);
    
    // 1. 먼저 인메모리 저장소 확인
    if (typeof globalThis.webauthnChallenges !== 'undefined') {
      const memoryChallenge = globalThis.webauthnChallenges.get(userId);
      
      if (memoryChallenge) {
        const now = new Date();
        const expires = new Date(memoryChallenge.expires_at);
        
        if (expires > now) {
          console.log('인메모리 저장소에서 챌린지 찾음:', userId);
          return memoryChallenge.challenge;
        } else {
          // 만료된 챌린지 삭제
          globalThis.webauthnChallenges.delete(userId);
        }
      }
    }
    
    // 2. 데이터베이스에서 조회
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', userId)
      .gt('expires_at', now)
      .single();
      
    if (error || !data) {
      console.log('데이터베이스에서 유효한 Challenge 없음');
      return undefined;
    }
    
    return data.challenge;
  } catch (err) {
    console.error('Challenge 조회 에러:', err);
    return undefined;
  }
}

/**
 * Challenge 삭제 (Supabase 버전)
 */
export async function removeChallenge(userId: string): Promise<void> {
  try {
    // 1. 인메모리 저장소에서 제거
    if (typeof globalThis.webauthnChallenges !== 'undefined') {
      if (globalThis.webauthnChallenges.has(userId)) {
        console.log('인메모리 저장소에서 챌린지 삭제:', userId);
        globalThis.webauthnChallenges.delete(userId);
      }
    }
    
    // 2. 데이터베이스에서 제거 시도
    try {
      const { error } = await supabaseAdmin
        .from('webauthn_challenges')
        .delete()
        .eq('user_id', userId);
        
      if (error) {
        console.error('Challenge 데이터베이스 삭제 오류:', error);
      }
    } catch (dbError) {
      // 데이터베이스 오류는 무시 (인메모리에서는 삭제되었기 때문)
      console.error('Challenge 데이터베이스 삭제 중 오류:', dbError);
    }
  } catch (err) {
    console.error('Challenge 삭제 에러:', err);
  }
}

/**
 * Supabase 세션 생성
 */
export async function createSupabaseSession(email: string, userId: string) {
  try {
    // 이메일 OTP 로그인 방식 활용
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });
    
    if (error) {
      throw new Error(`세션 생성 오류: ${error.message}`);
    }
    
    return data;
  } catch (err) {
    console.error('세션 생성 에러:', err);
    throw err;
  }
}

/**
 * 테스트를 위한 모든 사용자의 패스키 정보 조회
 */
export async function debugDumpCredentials() {
  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('user_id, email, credential_id, counter, created_at');
    
  if (error) {
    console.error('패스키 정보 조회 오류:', error);
    return [];
  }
  
  return data;
} 