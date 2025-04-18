import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 환경 변수에서 서비스 역할 키 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: Request) {
  console.log('Clear profiles API called');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service key available:', !!supabaseServiceKey);
  console.log('Service key length:', supabaseServiceKey?.length);
  
  if (!supabaseServiceKey) {
    console.error('Service role key is missing!');
    return NextResponse.json(
      { success: false, message: "서비스 역할 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    // 관리자 권한으로 Supabase 클라이언트 생성
    console.log('Creating Supabase client with service key');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // 인증 확인
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('Auth check result:', authError ? 'Failed' : 'Success');
      if (authError) {
        console.error('Auth error:', authError.message);
      } else {
        console.log('Auth user role:', authData?.user?.role);
      }
    } catch (authCheckError) {
      console.error('Error checking auth:', authCheckError);
    }
    
    // 결과를 저장할 객체
    const results = {
      profiles: { success: false, count: 0, message: '' },
      images: { success: false, count: 0, message: '' },
      auth: { success: false, count: 0, message: '' },
      remaining: 0
    };
    
    // 1. Storage에서 이미지 삭제
    try {
      console.log('Checking images bucket access...');
      // 버킷 존재 확인
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError.message);
        results.images.message = `버킷 목록 조회 중 오류 발생: ${bucketsError.message}`;
      } else {
        console.log('Available buckets:', buckets?.map(b => b.name).join(', '));
        const imagesBucket = buckets?.find(b => b.name === 'images');
        
        if (!imagesBucket) {
          console.error('Images bucket not found');
          results.images.message = '이미지 버킷이 존재하지 않습니다.';
        } else {
          console.log('Images bucket found, listing profiles folder');
          
          // profiles 폴더의 모든 이미지 조회
          const { data: folders, error: folderError } = await supabase
            .storage
            .from('images')
            .list('profiles');
          
          if (folderError) {
            results.images.message = `이미지 폴더 조회 중 오류 발생: ${folderError.message}`;
            console.error(results.images.message);
          } else {
            console.log(`Found ${folders?.length || 0} folders in profiles`);
            let deletedImages = 0;
            
            // 각 사용자 폴더 조회 및 삭제
            for (const folder of folders || []) {
              const { data: files, error: fileError } = await supabase
                .storage
                .from('images')
                .list(`profiles/${folder.name}`);
                
              if (fileError) {
                console.error(`폴더 ${folder.name} 조회 중 오류 발생: ${fileError.message}`);
                continue;
              }
              
              console.log(`Folder ${folder.name} contains ${files?.length || 0} files`);
              
              // 폴더 내 파일 삭제
              for (const file of files || []) {
                const filePath = `profiles/${folder.name}/${file.name}`;
                const { error: deleteError } = await supabase
                  .storage
                  .from('images')
                  .remove([filePath]);
                  
                if (deleteError) {
                  console.error(`파일 ${filePath} 삭제 중 오류 발생: ${deleteError.message}`);
                } else {
                  console.log(`Deleted file: ${filePath}`);
                  deletedImages++;
                }
              }
            }
            
            results.images.success = true;
            results.images.count = deletedImages;
            results.images.message = `${deletedImages}개의 이미지가 삭제되었습니다.`;
          }
        }
      }
    } catch (storageError) {
      results.images.message = `이미지 삭제 중 예상치 못한 오류 발생: ${storageError}`;
      console.error(results.images.message);
    }
    
    // 2. 프로필 테이블의 모든 데이터 삭제
    console.log('Attempting to delete profiles');
    try {
      // 먼저 테이블 존재 확인
      const { data: tableTest, error: tableError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        console.error('Error checking profiles table:', tableError.message);
        results.profiles.message = `프로필 테이블 확인 중 오류 발생: ${tableError.message}`;
      } else {
        console.log('Profiles table exists, proceeding with deletion');
        
        // 프로필 삭제 실행
        const { error: profileError, count } = await supabase
          .from('profiles')
          .delete({ count: 'exact' })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // 시스템 계정 제외
        
        if (profileError) {
          console.error('Error deleting profiles:', profileError.message, profileError.details);
          results.profiles.message = `프로필 삭제 중 오류 발생: ${profileError.message}`;
        } else {
          console.log(`Successfully deleted ${count} profiles`);
          results.profiles.success = true;
          results.profiles.count = count || 0;
          results.profiles.message = `${count || 0}개의 프로필이 삭제되었습니다.`;
        }
      }
    } catch (profileError) {
      console.error('Unexpected error deleting profiles:', profileError);
      results.profiles.message = `프로필 삭제 중 예상치 못한 오류 발생: ${profileError}`;
    }
    
    // 3. 인증 데이터 삭제 (사용자 계정)
    try {
      console.log('Attempting to delete user accounts');
      // 모든 사용자 목록 조회
      const { data: users, error: userListError } = await supabase.auth.admin.listUsers();
      
      if (userListError) {
        results.auth.message = `사용자 목록 조회 중 오류 발생: ${userListError.message}`;
        console.error(results.auth.message);
      } else {
        console.log(`Found ${users?.users?.length || 0} user accounts`);
        let deletedUsers = 0;
        
        // 각 사용자 삭제
        for (const user of users?.users || []) {
          // 테스트 계정이나 특정 관리자 계정은 제외할 수 있음
          // if (user.email === 'admin@example.com') continue;
          console.log(`Attempting to delete user: ${user.id}`);
          
          const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
          
          if (deleteUserError) {
            console.error(`사용자 ${user.id} 삭제 중 오류 발생: ${deleteUserError.message}`);
          } else {
            console.log(`Successfully deleted user: ${user.id}`);
            deletedUsers++;
          }
        }
        
        results.auth.success = true;
        results.auth.count = deletedUsers;
        results.auth.message = `${deletedUsers}개의 사용자 계정이 삭제되었습니다.`;
      }
    } catch (authError) {
      results.auth.message = `사용자 계정 삭제 중 예상치 못한 오류 발생: ${authError}`;
      console.error(results.auth.message);
    }
    
    // 결과 확인 - 테이블이 비었는지 확인
    console.log('Checking remaining profiles');
    const { data: remaining, error: checkError } = await supabase
      .from('profiles')
      .select('id');
    
    if (checkError) {
      console.error('남은 레코드 확인 중 오류 발생:', checkError.message);
    } else {
      console.log(`Remaining profiles: ${remaining?.length || 0}`);
    }
    
    const responseData = {
      success: results.profiles.success || results.images.success || results.auth.success,
      results,
      remaining: remaining?.length || 0
    };
    
    console.log('API response:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('예상치 못한 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
} 