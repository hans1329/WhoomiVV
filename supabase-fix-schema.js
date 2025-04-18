const { createClient } = require('@supabase/supabase-js');

// Supabase 연결 정보
const supabaseUrl = 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnN3dWRiaWt6dnpwcmx6bnJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU0ODk0NSwiZXhwIjoyMDYwMTI0OTQ1fQ.xZ5glpCe09Oe1RqwGcUMR-FbjE9Pfnz_VCELJJWvp-g';

// 서비스 롤 권한으로 Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Profiles 테이블 구조 확인 및 수정
async function fixProfilesTable() {
  console.log('Checking profiles table structure...');
  
  try {
    // 1. 테이블 구조 확인
    console.log('1. Fetching current table structure...');
    // PostgreSQL 시스템 테이블에서 컬럼 정보 조회
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      // 대체 방법으로 테이블에서 직접 데이터 샘플 확인
      console.log('Trying alternative method to check table structure...');
      const { data: sample, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Failed to get sample data:', sampleError);
      } else if (sample && sample.length > 0) {
        console.log('Sample record structure:', Object.keys(sample[0]));
      } else {
        console.log('No records found in profiles table');
      }
    } else {
      console.log('Current columns in profiles table:', columns);
    }
    
    // 2. 필요한 컬럼이 없으면 추가 (owner_id 또는 user_id)
    console.log('2. Checking for needed columns...');
    
    // SQL 함수 실행을 위한 헬퍼 함수
    async function executeSql(sql) {
      const { data, error } = await supabase.rpc('run_sql', { query: sql });
      if (error) {
        console.error('SQL Error:', error);
        return false;
      }
      console.log('SQL executed successfully:', data);
      return true;
    }
    
    // owner_id 컬럼 추가 (없는 경우)
    const addOwnerIdSql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' AND column_name = 'owner_id'
        ) THEN
          ALTER TABLE profiles ADD COLUMN owner_id UUID;
        END IF;
      END
      $$;
    `;
    
    await executeSql(addOwnerIdSql);
    console.log('Added owner_id column if it didn\'t exist');
    
    // user_id 컬럼 추가 (없는 경우)
    const addUserIdSql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE profiles ADD COLUMN user_id UUID;
        END IF;
      END
      $$;
    `;
    
    await executeSql(addUserIdSql);
    console.log('Added user_id column if it didn\'t exist');
    
    // 3. 테이블에 명시적 기본 키 확인 및 추가
    const addPrimaryKeySql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'profiles'::regclass AND contype = 'p'
        ) THEN
          ALTER TABLE profiles ADD PRIMARY KEY (id);
        END IF;
      END
      $$;
    `;
    
    await executeSql(addPrimaryKeySql);
    console.log('Ensured primary key exists on id column');
    
    // 4. RLS 정책 확인 및 필요한 경우 변경
    console.log('3. Checking RLS policies...');
    
    // RLS 활성화
    const enableRlsSql = `
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    `;
    
    await executeSql(enableRlsSql);
    console.log('Enabled Row Level Security on profiles table');
    
    // 모든 유저에게 자신의 프로필 데이터 접근 권한 부여
    const addReadPolicySql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = 'profiles' AND policyname = 'profiles_read_policy'
        ) THEN
          CREATE POLICY profiles_read_policy ON profiles 
            FOR SELECT USING (auth.uid() = id OR auth.uid() = owner_id OR auth.uid() = user_id OR auth.uid() IN (SELECT role FROM auth.users WHERE role = 'admin'));
        END IF;
      END
      $$;
    `;
    
    await executeSql(addReadPolicySql);
    console.log('Added read policy if it didn\'t exist');
    
    // INSERT 정책 추가
    const addInsertPolicySql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy'
        ) THEN
          CREATE POLICY profiles_insert_policy ON profiles 
            FOR INSERT WITH CHECK (true);
        END IF;
      END
      $$;
    `;
    
    await executeSql(addInsertPolicySql);
    console.log('Added insert policy if it didn\'t exist');
    
    // UPDATE 정책 추가
    const addUpdatePolicySql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy'
        ) THEN
          CREATE POLICY profiles_update_policy ON profiles 
            FOR UPDATE USING (auth.uid() = id OR auth.uid() = owner_id OR auth.uid() = user_id OR auth.uid() IN (SELECT role FROM auth.users WHERE role = 'admin'));
        END IF;
      END
      $$;
    `;
    
    await executeSql(addUpdatePolicySql);
    console.log('Added update policy if it didn\'t exist');
    
    // 확인을 위해 최종 테이블 구조 다시 가져오기
    console.log('4. Verifying final table structure...');
    const { data: finalSample, error: finalSampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (finalSampleError) {
      console.error('Failed to get final sample data:', finalSampleError);
    } else if (finalSample && finalSample.length > 0) {
      console.log('Final record structure:', Object.keys(finalSample[0]));
    } else {
      console.log('No records found in profiles table for final verification');
      
      // 테스트 레코드 추가
      console.log('5. Adding test record to verify access...');
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: 'test-' + Date.now(),
          name: 'Test Profile',
          owner_id: null,
          user_id: null,
          description: 'Test record to verify table structure',
          metadata: { level: 1, xp: 0 }
        })
        .select();
        
      if (insertError) {
        console.error('Failed to insert test record:', insertError);
      } else {
        console.log('Test record added successfully:', insertData);
      }
    }
    
    console.log('Profiles table structure fix completed!');
    
  } catch (error) {
    console.error('Unexpected error during table fix:', error);
  }
}

// 스크립트 실행
fixProfilesTable()
  .then(() => {
    console.log('Schema fix script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 