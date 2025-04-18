'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// 임시로 패스키 챌린지 생성 함수 구현 (실제로는 WebAuthn 라이브러리 사용 필요)
function generateRandomChallenge() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST() {
  try {
    // 랜덤 챌린지 생성
    const challenge = generateRandomChallenge();
    
    // 쿠키에 챌린지 저장 (실제 구현에서는 DB에 저장하는 게 더 안전할 수 있음)
    cookies().set('passkey_challenge', challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5분
      path: '/'
    });
    
    // 클라이언트에게 필요한 정보 반환
    // 실제 구현에서는 WebAuthn 라이브러리에서 제공하는 전체 옵션 반환 필요
    return NextResponse.json({
      challenge,
      rpId: process.env.PASSKEY_RP_ID || window.location.hostname,
      timeout: 60000, // 60초
      userVerification: 'preferred'
    });
  } catch (error) {
    console.error('패스키 챌린지 생성 오류:', error);
    return NextResponse.json(
      { error: '패스키 챌린지 생성 실패' },
      { status: 500 }
    );
  }
} 