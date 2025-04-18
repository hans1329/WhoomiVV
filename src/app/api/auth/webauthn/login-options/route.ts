import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpID, origin, getUserByEmail, storeChallenge } from '@/lib/auth-webauthn';

// 상태 저장용 임시 저장소 (실제 구현에서는 데이터베이스 사용)
interface UserData {
  id: string;
  email: string;
  currentChallenge?: string;
  registeredCredentials: Array<{
    id: string;
    publicKey: string;
    counter: number;
  }>;
}

// 임시 유저 저장소 (개발용, 실제로는 DB 사용)
const users = new Map<string, UserData>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: '이메일이 필요합니다.' }, { status: 400 });
    }
    
    // 사용자 찾기 (Supabase에서)
    const userData = await getUserByEmail(email);
    
    if (!userData) {
      return NextResponse.json({ error: '등록되지 않은 사용자입니다.' }, { status: 404 });
    }
    
    // 등록된 인증자가 없는 경우
    if (userData.registeredCredentials.length === 0) {
      return NextResponse.json(
        { error: '등록된 패스키가 없습니다. 먼저 패스키를 등록해주세요.' },
        { status: 400 }
      );
    }
    
    // 사용자의 인증자 ID 목록 준비 - 문자열 형식으로 변환
    const allowCredentials = userData.registeredCredentials.map(cred => ({
      id: cred.id, // 이미 base64url 형식으로 저장된 문자열
      type: 'public-key' as const,
    }));
    
    // 인증 옵션 생성
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials,
    });
    
    // challenge를 Supabase에 저장
    await storeChallenge(userData.id, email, options.challenge);
    
    console.log('로그인 옵션 생성 성공:', { userID: userData.id, email });
    
    return NextResponse.json(options);
  } catch (error: any) {
    console.error('로그인 옵션 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '로그인 옵션 생성 오류' },
      { status: 500 }
    );
  }
} 