// 프로필 테이블의 모든 데이터를 삭제하는 스크립트
// 주의: 이 스크립트는 관리자 권한으로 실행되며 모든 데이터를 삭제합니다!
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// .env 파일에서 서비스 역할 키와 URL 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ 서비스 역할 키(SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
  console.error('   .env 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가해주세요.');
  process.exit(1);
}

// 관리자 권한으로 Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAllProfiles() {
  console.log('🔄 Supabase 프로필 데이터 삭제 중...');
  
  try {
    // 프로필 테이블의 모든 데이터 삭제
    const { data, error, count } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 시스템 계정 보호
    
    if (error) {
      console.error('❌ 오류 발생:', error.message);
      return;
    }
    
    console.log(`✅ 성공: ${count}개의 프로필 레코드가 삭제되었습니다.`);
    
    // 테이블이 비었는지 확인
    const { data: remaining, error: checkError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });
    
    if (checkError) {
      console.error('❌ 남은 레코드 확인 중 오류 발생:', checkError.message);
      return;
    }
    
    console.log(`ℹ️ 프로필 테이블에 ${remaining.length}개의 레코드가 남아있습니다.`);
  } catch (err) {
    console.error('❌ 예상치 못한 오류 발생:', err);
  }
}

// 스크립트 실행
clearAllProfiles().catch(console.error); 