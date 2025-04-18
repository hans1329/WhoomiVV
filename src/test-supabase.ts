import { supabase } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';

/**
 * 테스트 목적으로 사용자 프로필 정보를 모두 삭제하는 함수
 * 주의: 이 함수는 개발/테스트 환경에서만 사용해야 합니다.
 */
export async function clearAllUserProfiles() {
  try {
    console.log("🧹 사용자 프로필 정보 삭제 시작...");
    
    // profiles 테이블의 모든 레코드 삭제 시도
    const { error } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 시스템 계정 등 특수 ID 제외
    
    if (error) {
      console.error("❌ 프로필 삭제 중 오류 발생:", error.message);
      
      if (error.message.includes("permission denied")) {
        console.warn("권한 오류: RLS 정책으로 인해 모든 레코드를 삭제할 수 없습니다.");
        console.warn("대신 현재 로그인한 사용자의 프로필만 삭제합니다.");
        
        // 현재 로그인한 사용자 정보 가져오기
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user;
        
        if (currentUser) {
          // 현재 로그인한 사용자의 프로필만 삭제
          const { error: userDeleteError, count } = await supabase
            .from('profiles')
            .delete({ count: 'exact' })
            .eq('id', currentUser.id);
          
          if (userDeleteError) {
            console.error("❌ 사용자 프로필 삭제 중 오류 발생:", userDeleteError.message);
            return { success: false, message: userDeleteError.message };
          }
          
          console.log(`✅ 사용자 ID ${currentUser.id}의 프로필 ${count}개가 삭제되었습니다.`);
          return { success: true, message: `사용자 프로필 ${count}개가 삭제되었습니다.` };
        } else {
          console.error("❌ 로그인된 사용자가 없습니다.");
          return { success: false, message: "로그인된 사용자가 없습니다." };
        }
      }
      
      return { success: false, message: error.message };
    }
    
    console.log("✅ 모든 사용자 프로필이 성공적으로 삭제되었습니다.");
    return { success: true, message: "모든 사용자 프로필이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 예상치 못한 오류 발생:", error);
    return { success: false, message: String(error) };
  }
}

/**
 * 서비스 역할 키를 사용하여 모든 프로필 데이터를 삭제
 * 주의: 이 함수는 서버 측에서만 사용해야 합니다.
 */
export async function clearAllProfilesWithServiceKey(serviceKey: string) {
  if (!serviceKey) {
    return { success: false, message: "서비스 역할 키가 제공되지 않았습니다." };
  }
  
  try {
    console.log("🧹 서비스 역할 키를 사용하여 모든 프로필 삭제 시작...");
    
    // Supabase URL 가져오기 (기존 클라이언트의 URL 재사용)
    const supabaseUrl = (supabase as any).url || 'https://corswudbikzvzprlznrl.supabase.co';
    
    // 서비스 역할 키를 사용하여 새 클라이언트 생성
    const adminClient = createClient(supabaseUrl, serviceKey);
    
    // 모든 프로필 데이터 삭제
    const { error, count } = await adminClient
      .from('profiles')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 시스템 계정 제외
    
    if (error) {
      console.error("❌ 프로필 삭제 중 오류 발생:", error.message);
      return { success: false, message: error.message };
    }
    
    console.log(`✅ ${count || '알 수 없는 수'}개의 프로필이 삭제되었습니다.`);
    return { 
      success: true, 
      message: `${count || '알 수 없는 수'}개의 프로필이 성공적으로 삭제되었습니다.`,
      count 
    };
  } catch (error) {
    console.error("❌ 예상치 못한 오류 발생:", error);
    return { success: false, message: String(error) };
  }
}

// 브라우저 환경에서 직접 실행할 수 있는 함수
export async function runClearAllUserProfiles() {
  if (typeof window !== 'undefined') {
    const result = await clearAllUserProfiles();
    alert(result.message);
    return result;
  }
  return { success: false, message: "서버 환경에서는 실행할 수 없습니다." };
}

// 파일을 직접 실행하면 자동으로 함수 실행
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('execute') === 'true') {
    runClearAllUserProfiles();
  }
} 