import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { 
  rpID, 
  origin, 
  getUserByEmail, 
  getChallenge, 
  removeChallenge,
  updateCredentialCounter 
} from '@/lib/auth-webauthn';

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
    const { email, assertionResponse } = body;
    
    if (!email || !assertionResponse) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }
    
    // 사용자 찾기 (Supabase에서)
    const userData = await getUserByEmail(email);
    
    if (!userData) {
      console.error('로그인: 사용자를 찾을 수 없음:', email);
      return NextResponse.json({ error: '등록되지 않은 사용자입니다.' }, { status: 404 });
    }
    
    console.log('패스키 로그인 검증 - 사용자 찾음:', userData.id);
    
    // 저장된 challenge 확인 (Supabase 또는 인메모리에서)
    const challenge = await getChallenge(userData.id);
    
    if (!challenge) {
      console.error('로그인: challenge를 찾을 수 없음:', userData.id);
      return NextResponse.json({ error: '로그인 요청이 만료되었습니다.' }, { status: 400 });
    }
    
    console.log('패스키 로그인 검증 - challenge 찾음');
    
    // 사용자의 자격 증명 ID 찾기
    const credentialID = assertionResponse.id;
    const credential = userData.registeredCredentials.find(cred => cred.id === credentialID);
    
    if (!credential) {
      console.error('로그인: 인증정보를 찾을 수 없음:', credentialID);
      return NextResponse.json({ error: '알 수 없는 자격 증명입니다.' }, { status: 400 });
    }
    
    console.log('패스키 로그인 검증 - 인증정보 찾음:', credential.id);
    
    // 인증 응답 검증
    let verification;
    try {
      // @ts-ignore - SimpleWebAuthn 버전 호환성 문제로 타입 에러 무시
      verification = await verifyAuthenticationResponse({
        response: assertionResponse,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        // 이전 버전과 호환되는 방식
        authenticator: {
          credentialID: Buffer.from(credential.id, 'base64url'),
          credentialPublicKey: Buffer.from(credential.publicKey, 'base64url'),
          counter: credential.counter,
        },
      });
      
      console.log('패스키 로그인 검증 - 응답 검증 완료');
    } catch (error: any) {
      console.error('로그인 검증 오류:', error);
      return NextResponse.json(
        { error: error.message || '로그인 검증 중 오류가 발생했습니다.' },
        { status: 400 }
      );
    }
    
    const { verified, authenticationInfo } = verification;
    
    if (!verified) {
      console.error('로그인: 검증 실패');
      return NextResponse.json({ error: '로그인 검증에 실패했습니다.' }, { status: 400 });
    }
    
    console.log('패스키 로그인 검증 - 검증 성공');
    
    // 카운터 업데이트 (Supabase에)
    await updateCredentialCounter(userData.id, credentialID, authenticationInfo.newCounter);
    
    // challenge 정보 삭제
    await removeChallenge(userData.id);
    
    console.log('패스키 로그인 성공:', {
      userId: userData.id,
      email,
    });
    
    // 세션 생성 - Supabase 계정 로그인
    try {
      // OTP 로그인 방식
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) {
        // Supabase 로그인 실패 시 임시 토큰 생성
        console.warn('Supabase 세션 생성 실패, 임시 토큰 사용:', error);
        
        // 임시 방식으로 로컬 스토리지에 사용자 정보 저장 - 클라이언트에서 처리
        return NextResponse.json({
          verified: true,
          userId: userData.id,
          email,
          message: '패스키 인증에 성공했습니다. (임시 세션)',
        });
      }
      
      // 성공 응답 - 실제 Supabase 세션
      return NextResponse.json({
        verified: true,
        userId: userData.id,
        email,
        message: '패스키 인증에 성공했습니다.',
        session: data.session,
      });
    } catch (dbError: any) {
      console.error('세션 생성 오류:', dbError);
      
      // 세션 생성 실패해도 인증은 성공으로 처리
      return NextResponse.json({
        verified: true,
        userId: userData.id,
        email,
        message: '패스키 인증 성공, 세션 생성 실패',
        error: dbError.message,
      });
    }
  } catch (error: any) {
    console.error('로그인 처리 오류:', error);
    return NextResponse.json(
      { error: error.message || '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 