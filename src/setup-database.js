/**
 * Supabase 테이블 생성 스크립트
 * 
 * Supabase 대시보드의 SQL 에디터에서 아래 SQL 쿼리를 실행하세요:
 */

/*
-- users 테이블 생성 (지갑 정보 저장용)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT,
    wallet_address TEXT,
    embedded_wallet_address TEXT,
    auth_provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 데이터만 조회/수정할 수 있도록 정책 설정
CREATE POLICY "사용자 본인 데이터 조회 허용" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "사용자 본인 데이터 수정 허용" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- INSERT 권한 추가
CREATE POLICY "사용자 본인 데이터 생성 허용" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 사용자 생성 시 자동으로 users 테이블에 레코드 추가하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, created_at)
  VALUES (
    new.id, 
    new.email,
    new.raw_app_meta_data->>'provider',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 설정
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 지갑 주소 업데이트를 위한 RPC 함수
CREATE OR REPLACE FUNCTION public.update_user_wallet(user_id UUID, wallet_addr TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users
  SET embedded_wallet_address = wallet_addr,
      updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

// JavaScript/TypeScript에서 Supabase 클라이언트로 테이블 생성하는 방법
// 참고용이며, SQL 쿼리 실행을 권장합니다.
/*
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY' // service_role 키 필요

const supabase = createClient(supabaseUrl, supabaseKey)

const createUsersTable = async () => {
  try {
    // users 테이블 생성
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id TEXT PRIMARY KEY,
          email TEXT,
          wallet_address TEXT,
          embedded_wallet_address TEXT,
          auth_provider TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE
        );

        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      `
    })

    if (error) throw error
    console.log('Users table created successfully')
  } catch (error) {
    console.error('Error creating users table:', error)
  }
}

createUsersTable()
*/

