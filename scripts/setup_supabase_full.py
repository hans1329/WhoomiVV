#!/usr/bin/env python3
import os
import sys
import json
import psycopg2
import requests
from dotenv import load_dotenv
from urllib.parse import urlparse

# .env 파일 로드
load_dotenv()

# Supabase 서비스 롤 키와 URL 가져오기
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_URL 또는 SUPABASE_SERVICE_KEY가 .env 파일에 없습니다.")
    sys.exit(1)

# Supabase 프로젝트 레퍼런스 추출
parsed_url = urlparse(SUPABASE_URL)
supabase_ref = parsed_url.netloc.split('.')[0]

# PostgreSQL 연결 문자열 생성
DB_URL = f"postgresql://postgres:{SUPABASE_SERVICE_KEY}@db.{supabase_ref}.supabase.co:5432/postgres"

# SQL 쿼리 - 테이블 생성 및 RLS 정책 설정
CREATE_TABLES_SQL = """
-- dopples 테이블 생성
CREATE TABLE IF NOT EXISTS public.dopples (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  image TEXT,
  likes INTEGER DEFAULT 0,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100
);

-- RLS 정책 설정
ALTER TABLE public.dopples ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (모든 도플)
DROP POLICY IF EXISTS "Users can read all dopples" ON public.dopples;
CREATE POLICY "Users can read all dopples"
ON public.dopples FOR SELECT
USING (true);

-- 작성 정책 (자신의 도플만)
DROP POLICY IF EXISTS "Users can create their own dopples" ON public.dopples;
CREATE POLICY "Users can create their own dopples"
ON public.dopples FOR INSERT
WITH CHECK (auth.uid()::text = owner);

-- 수정 정책 (자신의 도플만)
DROP POLICY IF EXISTS "Users can update their own dopples" ON public.dopples;
CREATE POLICY "Users can update their own dopples"
ON public.dopples FOR UPDATE
USING (auth.uid()::text = owner)
WITH CHECK (auth.uid()::text = owner);
"""

# Storage 설정 함수
def setup_storage():
    """스토리지 버킷 생성 및 RLS 정책 설정"""
    try:
        # 스토리지 버킷 생성
        create_storage_bucket()
        
        # 스토리지 정책 설정
        set_storage_policies()
        
        return True
    except Exception as e:
        print(f"❌ 스토리지 설정 중 오류 발생: {e}")
        return False

def create_storage_bucket():
    """Supabase API를 사용하여 스토리지 버킷 생성"""
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # 버킷 존재 여부 확인
    try:
        get_response = requests.get(f"{SUPABASE_URL}/storage/v1/bucket/images", headers=headers)
        if get_response.status_code == 200:
            print("🔄 'images' 스토리지 버킷이 이미 존재합니다")
            return True
    except:
        pass  # 존재하지 않으면 계속 진행
    
    # 버킷 생성 요청
    bucket_data = {
        "id": "images",
        "name": "images",
        "public": True,
        "file_size_limit": 5242880  # 5MB
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(bucket_data))
    
    if response.status_code in [200, 201]:
        print("✅ 'images' 스토리지 버킷 생성 성공")
        return True
    else:
        print(f"⚠️ 스토리지 버킷 생성 실패: {response.status_code} - {response.text}")
        return False

def set_storage_policies():
    """스토리지 버킷에 RLS 정책 설정"""
    # PostgreSQL 연결
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # 스토리지 RLS 정책 SQL
    storage_policies_sql = """
    -- 스토리지 RLS 정책 설정
    
    -- 모든 사용자가 읽기 가능
    DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
    CREATE POLICY "Public Read Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');
    
    -- 인증된 사용자만 쓰기/수정 가능
    DROP POLICY IF EXISTS "Auth Users Can Upload Images" ON storage.objects;
    CREATE POLICY "Auth Users Can Upload Images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);
    
    DROP POLICY IF EXISTS "Auth Users Can Update Own Images" ON storage.objects;
    CREATE POLICY "Auth Users Can Update Own Images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'images' AND auth.uid() IS NOT NULL)
    WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);
    """
    
    try:
        cursor.execute(storage_policies_sql)
        print("✅ 스토리지 RLS 정책 설정 완료")
        conn.close()
        return True
    except Exception as e:
        print(f"⚠️ 스토리지 정책 설정 실패: {e}")
        conn.close()
        return False

def setup_database():
    """데이터베이스 테이블 및 RLS 정책 설정"""
    try:
        # PostgreSQL 연결
        print(f"🔌 Supabase ({supabase_ref})에 연결 중...")
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True  # 자동 커밋 활성화
        cursor = conn.cursor()
        
        print("✅ 연결 성공!")
        
        # SQL 실행
        print("🔧 테이블 및 정책 생성 중...")
        cursor.execute(CREATE_TABLES_SQL)
        print("✅ 테이블 및 정책 생성 완료!")
        
        conn.close()
        return True
    except Exception as e:
        print(f"❌ 데이터베이스 설정 중 오류 발생: {e}")
        return False

def main():
    print("🚀 Supabase 설정 시작...")
    
    # 1. 데이터베이스 테이블 및 RLS 정책 설정
    db_success = setup_database()
    
    # 2. 스토리지 버킷 및 정책 설정
    storage_success = setup_storage()
    
    # 결과 요약
    print("\n=== 설정 결과 요약 ===")
    print(f"🗄️ 데이터베이스 설정: {'✅ 성공' if db_success else '❌ 실패'}")
    print(f"📦 스토리지 설정: {'✅ 성공' if storage_success else '❌ 실패'}")
    
    if db_success and storage_success:
        print("\n✅ 모든 설정이 완료되었습니다!")
        print("Supabase가 앱과 연동될 준비가 되었습니다.")
    else:
        print("\n⚠️ 일부 설정이 실패했습니다. 로그를 확인하세요.")
        if not storage_success:
            print("스토리지 버킷 수동 생성 방법:")
            print("1. Supabase 대시보드에서 'Storage' 메뉴로 이동")
            print("2. '+ New Bucket' 버튼 클릭")
            print("3. 'images'라는 이름으로 버킷 생성 및 public 옵션 활성화")
            print("4. RLS 정책 설정 (대시보드 또는 SQL 편집기에서)")

if __name__ == "__main__":
    main() 