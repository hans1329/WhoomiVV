import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 환경 변수에서 서비스 역할 키 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  console.log('Clear DB API 호출됨');
  console.log('URL:', supabaseUrl);
  console.log('Service key available:', !!supabaseServiceKey);
  
  if (!supabaseServiceKey) {
    return NextResponse.json({
      success: false,
      message: "서비스 역할 키가 설정되지 않았습니다."
    }, { status: 500 });
  }

  try {
    // 관리자 권한으로 Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 결과 저장용 객체
    const results = {
      profiles: { count: 0, error: null as string | null },
      auth: { count: 0, error: null as string | null }
    };
    
    // 1. profiles 테이블 데이터 삭제
    try {
      const { error, count } = await supabase
        .from('profiles')
        .delete({ count: 'exact' })
        .not('id', 'is', null);
      
      results.profiles.count = count || 0;
      results.profiles.error = error ? error.message : null;
    } catch (e) {
      results.profiles.error = e instanceof Error ? e.message : String(e);
    }
    
    // 2. 인증 데이터 접근 테스트 (사용자 목록 확인)
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      results.auth.count = data?.users?.length || 0;
      results.auth.error = error ? error.message : null;
    } catch (e) {
      results.auth.error = e instanceof Error ? e.message : String(e);
    }
    
    // 현재 데이터베이스 상태 확인
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .limit(5);
    
    return NextResponse.json({
      success: true,
      message: "테스트 완료",
      results,
      remaining: {
        profiles: profileData?.length || 0,
        profileSample: profileData
      }
    });
  } catch (error) {
    console.error('예상치 못한 오류 발생:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 