import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { debugDumpCredentials } from '@/lib/auth-webauthn';

// WebAuthn 데이터 상태 확인용 디버그 API (Supabase 버전)
export async function GET(req: NextRequest) {
  try {
    // 사용자 데이터 조회
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at');
      
    if (userError) {
      console.error('사용자 조회 오류:', userError);
      return NextResponse.json(
        { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 패스키 데이터 조회
    const credentials = await debugDumpCredentials();
    
    // 챌린지 데이터 조회
    const { data: challenges, error: challengeError } = await supabaseAdmin
      .from('webauthn_challenges')
      .select('user_id, email, created_at, expires_at');
      
    if (challengeError) {
      console.error('챌린지 조회 오류:', challengeError);
    }

    // 저장된 사용자 및 인증 정보 응답
    return NextResponse.json({
      message: 'WebAuthn 데이터 (Supabase)',
      timestamp: new Date().toISOString(),
      usersCount: users.length,
      credentialsCount: credentials.length,
      challengesCount: challenges?.length || 0,
      users,
      credentials,
      challenges: challenges || [],
    });
  } catch (error: any) {
    console.error('디버그 API 오류:', error);
    return NextResponse.json(
      { error: '디버그 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 