import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpID, rpName, origin, getUserByEmail, createUser, storeChallenge } from '@/lib/auth-webauthn';

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
    
    // 사용자 찾기 또는 새로 생성 (Supabase에서)
    let userData = await getUserByEmail(email);
    
    if (!userData) {
      userData = await createUser(email);
      console.log('새 사용자 생성:', userData.id, email);
    }
    
    // 사용자 ID를 Uint8Array로 변환 (SimpleWebAuthn 최신 버전 요구사항)
    const userIDBuffer = new TextEncoder().encode(userData.id);
    
    // 등록 옵션 생성
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userIDBuffer, // 문자열 대신 Uint8Array 사용
      userName: email,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
      },
    });
    
    // challenge를 Supabase에 저장
    await storeChallenge(userData.id, email, options.challenge);
    
    console.log('등록 옵션 생성 성공:', { userID: userData.id, email });
    
    return NextResponse.json(options);
  } catch (error: any) {
    console.error('등록 옵션 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '등록 옵션 생성 오류' },
      { status: 500 }
    );
  }
} 