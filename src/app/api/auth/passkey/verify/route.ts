'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';
import jwt from 'jsonwebtoken';

// 패스키 검증 로직 (실제 구현에서는 SimpleWebAuthn과 같은 라이브러리 사용)
async function verifyPasskeyAssertion(credential: any, expectedChallenge: string) {
  // 여기서는 간단한 예시로만 구현하지만, 실제로는 복잡한 검증 로직이 필요
  // 실제 WebAuthn 검증은 여러 단계를 거칩니다:
  // 1. 검증할 자격 증명이 등록된 사용자의 것인지 확인
  // 2. 응답의 clientDataJSON이 챌린지를 포함하는지 확인
  // 3. 서명이 유효한지 확인
  
  // 이 예시에서는 단순화하여 credential이 있고 챌린지가 일치한다고 가정
  return {
    verified: true,
    // 여기에 데이터베이스나 메타데이터에서 얻은 사용자 정보 추가
    user: { id: '123e4567-e89b-12d3-a456-426614174000', email: 'user@example.com' }
  };
}

// 커스텀 JWT 생성 함수
function createCustomJWT(user: any) {
  const secret = process.env.SUPABASE_JWT_SECRET || 'your-fallback-jwt-secret';
  
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1시간 후 만료
    sub: user.id,
    email: user.email,
    role: 'authenticated'
  };
  
  return jwt.sign(payload, secret, {
    algorithm: 'HS256'
  });
}

export async function POST(request: Request) {
  try {
    // 쿠키에서 챌린지 가져오기
    const challenge = cookies().get('passkey_challenge')?.value;
    
    if (!challenge) {
      return NextResponse.json(
        { error: '챌린지가 만료되었거나 찾을 수 없습니다.' },
        { status: 400 }
      );
    }
    
    // 요청 본문에서 패스키 응답 가져오기
    const credential = await request.json();
    
    // 패스키 검증
    const { verified, user } = await verifyPasskeyAssertion(credential, challenge);
    
    if (!verified) {
      return NextResponse.json(
        { error: '패스키 검증 실패' },
        { status: 401 }
      );
    }
    
    // 쿠키에서 챌린지 삭제
    cookies().delete('passkey_challenge');
    
    // 사용자 인증 완료 후 JWT 토큰 생성
    const accessToken = createCustomJWT(user);
    
    // Supabase 세션 설정
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken, // 실제로는 다른 리프레시 토큰 사용해야 함
    });
    
    return NextResponse.json({ verified, user });
  } catch (error) {
    console.error('패스키 검증 오류:', error);
    return NextResponse.json(
      { error: '패스키 검증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 