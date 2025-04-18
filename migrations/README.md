# Supabase 마이그레이션 가이드

이 폴더에는 Supabase 테이블 생성 및 스키마 마이그레이션에 필요한 SQL 스크립트가 포함되어 있습니다.

## 대화 관련 테이블 생성

`chat_tables.sql` 파일은 대화와 메시지를 저장하기 위한 테이블을 생성합니다:

1. `conversations` - 대화 데이터 저장
2. `chat_messages` - 개별 메시지 저장

## SQL 실행 방법

### Supabase 대시보드에서 실행

1. [Supabase 대시보드](https://app.supabase.io)에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 "SQL Editor"를 클릭합니다.
4. "New Query"를 클릭합니다.
5. SQL 스크립트를 붙여넣고 "Run"을 클릭합니다.

### 로컬 개발 환경에서 실행

Supabase CLI를 사용하여 로컬에서 실행할 수 있습니다:

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 마이그레이션 실행
supabase db push
```

## RLS 정책

모든 테이블에는 Row Level Security (RLS)가 적용되어 있습니다:

- 사용자는 자신의 대화와 메시지만 볼 수 있습니다.
- 사용자는 자신의 대화와 메시지만 생성할 수 있습니다.
- 사용자는 자신의 대화만 업데이트할 수 있습니다.

## 주의사항

- 테이블이 이미 있는 경우 `IF NOT EXISTS` 옵션 덕분에 오류가 발생하지 않습니다.
- 이미 있는 RLS 정책을 다시 생성하려고 하면 오류가 발생할 수 있습니다.
- 필요한 경우 `DROP POLICY IF EXISTS` 구문을 사용하여 기존 정책을 제거할 수 있습니다. 