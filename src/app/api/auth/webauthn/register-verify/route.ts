import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { 
  rpID, 
  origin, 
  getUserByEmail, 
  getChallenge, 
  removeChallenge,
  saveCredential,
  createSupabaseSession 
} from '@/lib/auth-webauthn';

export async function POST(req: NextRequest) {
  console.log('register-verify API 요청 시작');
  
  try {
    const body = await req.json();
    const { email, attestationResponse } = body;
    
    console.log('register-verify 요청 데이터:', { email, hasAttestationResponse: !!attestationResponse });
    
    if (!email || !attestationResponse) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // 사용자 찾기 (Supabase에서)
    const userData = await getUserByEmail(email);
    
    if (!userData) {
      console.error('사용자를 찾을 수 없음:', email);
      return NextResponse.json({ error: '등록되지 않은 사용자입니다.' }, { status: 404 });
    }
    
    console.log('패스키 등록 검증 - 사용자 찾음:', userData.id);
    
    // 저장된 challenge 확인 (Supabase 또는 인메모리에서)
    const challenge = await getChallenge(userData.id);
    
    if (!challenge) {
      console.error('challenge를 찾을 수 없음:', userData.id);
      return NextResponse.json({ error: '등록 요청이 만료되었습니다.' }, { status: 400 });
    }
    
    console.log('패스키 등록 검증 - challenge 찾음');

    // 등록 응답 검증
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
      
      console.log('패스키 등록 검증 - 응답 검증 완료');
    } catch (error: any) {
      console.error('등록 검증 오류:', error);
      return NextResponse.json(
        { error: error.message || '등록 검증 중 오류가 발생했습니다.' },
        { status: 400 }
      );
    }

    const { verified, registrationInfo } = verification;
    
    if (!verified || !registrationInfo) {
      return NextResponse.json({ error: '등록 검증에 실패했습니다.' }, { status: 400 });
    }
    
    console.log('패스키 등록 검증 - 검증 성공');

    // 새 인증자 정보 추출
    const { credential } = registrationInfo;
    
    // 새 인증자 정보 저장 (Supabase에)
    const newCredential = {
      id: Buffer.from(credential.id).toString('base64url'),
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter || 0,
    };
    
    try {
      await saveCredential(userData.id, email, newCredential);
      console.log('패스키 인증 정보 저장 성공:', newCredential.id);
    } catch (credError) {
      console.error('패스키 저장 실패, 계속 진행:', credError);
      // 저장 실패해도 계속 진행 (인메모리는 유지됨)
    }
    
    // challenge 정보 삭제
    await removeChallenge(userData.id);
    
    console.log('패스키 등록 성공:', {
      userId: userData.id,
      email,
      credentialId: newCredential.id
    });

    // 사용자 세션 생성 - OTP 방식
    try {
      await createSupabaseSession(email, userData.id);
      
      // 성공 응답
      return NextResponse.json({
        verified: true,
        userId: userData.id,
        email,
        message: '패스키 등록 및 인증에 성공했습니다.'
      });
    } catch (dbError: any) {
      console.error('사용자 세션 생성 오류:', dbError);
      // 패스키 등록은 성공했지만 세션 생성 오류
      return NextResponse.json({
        verified: true,
        partialSuccess: true,
        userId: userData.id,
        error: '패스키 등록은 성공했으나 사용자 세션 생성에 실패했습니다.'
      });
    }
  } catch (error: any) {
    console.error('등록 처리 오류:', error);
    return NextResponse.json(
      { error: error.message || '등록 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 