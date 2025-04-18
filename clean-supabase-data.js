const { createClient } = require('@supabase/supabase-js');

// Supabase 연결 정보
const supabaseUrl = 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnN3dWRiaWt6dnpwcmx6bnJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU0ODk0NSwiZXhwIjoyMDYwMTI0OTQ1fQ.xZ5glpCe09Oe1RqwGcUMR-FbjE9Pfnz_VCELJJWvp-g';

// 서비스 롤 권한으로 Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Profiles 테이블 데이터 정리
async function cleanProfilesTable() {
  console.log('Starting profiles table cleanup...');
  
  try {
    // 1. 테이블에서 모든 데이터 가져오기 (확인용)
    console.log('1. Checking current profiles data...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log(`Found ${profiles?.length || 0} profiles in the database`);
      if (profiles && profiles.length > 0) {
        console.log('Sample profile structure:', Object.keys(profiles[0]));
      }
    }
    
    // 2. 모든 데이터 삭제
    console.log('2. Deleting all data from profiles table...');
    if (profiles && profiles.length > 0) {
      // 각 프로필을 개별적으로 삭제
      console.log(`Deleting ${profiles.length} profiles...`);
      
      for (const profile of profiles) {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);
        
        if (deleteError) {
          console.error(`Error deleting profile ${profile.id}:`, deleteError);
        }
      }
      
      console.log('All profiles deleted');
    } else {
      console.log('No profiles to delete');
    }
    
    // 3. 테스트 레코드 추가 (검증용)
    console.log('3. Adding test record to verify table structure...');
    const testId = 'test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testId,
        name: 'Test Profile',
        description: 'Test record to verify table structure',
        image_url: 'https://example.com/image.jpg',
        active: true,
        metadata: { level: 1, xp: 0, created_at: new Date().toISOString() }
      })
      .select();
    
    if (insertError) {
      console.error('Failed to insert test record:', insertError);
      
      // 에러 내용 확인
      console.log('Trying to determine missing fields from error...');
      
      if (insertError.message.includes('owner_id')) {
        console.log('Adding owner_id field to test insertion');
        const { data: insertWithOwner, error: insertWithOwnerError } = await supabase
          .from('profiles')
          .insert({
            id: testId + '-with-owner',
            name: 'Test Profile With Owner',
            description: 'Test with owner_id field',
            image_url: 'https://example.com/image.jpg',
            active: true,
            metadata: { level: 1, xp: 0 },
            owner_id: null // null 값으로 추가
          })
          .select();
          
        if (insertWithOwnerError) {
          console.error('Still failed with owner_id:', insertWithOwnerError);
        } else {
          console.log('Test insertion with owner_id successful:', insertWithOwner);
        }
      }
      
      if (insertError.message.includes('user_id')) {
        console.log('Adding user_id field to test insertion');
        const { data: insertWithUser, error: insertWithUserError } = await supabase
          .from('profiles')
          .insert({
            id: testId + '-with-user',
            name: 'Test Profile With User',
            description: 'Test with user_id field',
            image_url: 'https://example.com/image.jpg',
            active: true,
            metadata: { level: 1, xp: 0 },
            user_id: null // null 값으로 추가
          })
          .select();
          
        if (insertWithUserError) {
          console.error('Still failed with user_id:', insertWithUserError);
        } else {
          console.log('Test insertion with user_id successful:', insertWithUser);
        }
      }
      
      // 두 필드 모두 추가
      console.log('Trying with both owner_id and user_id fields');
      const { data: insertWithBoth, error: insertWithBothError } = await supabase
        .from('profiles')
        .insert({
          id: testId + '-with-both',
          name: 'Test Profile With Both IDs',
          description: 'Test with both fields',
          image_url: 'https://example.com/image.jpg',
          active: true,
          metadata: { level: 1, xp: 0 },
          owner_id: null, // null 값으로 추가
          user_id: null // null 값으로 추가
        })
        .select();
        
      if (insertWithBothError) {
        console.error('Still failed with both fields:', insertWithBothError);
      } else {
        console.log('Test insertion with both fields successful:', insertWithBoth);
        
        // 성공적인 테스트 레코드 삭제
        const { error: deleteTestError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', testId + '-with-both');
          
        if (deleteTestError) {
          console.error('Error deleting test record:', deleteTestError);
        } else {
          console.log('Test record successfully deleted');
        }
      }
    } else {
      console.log('Test record inserted successfully:', insertData);
      
      // 성공적인 테스트 레코드 삭제
      const { error: deleteTestError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', testId);
        
      if (deleteTestError) {
        console.error('Error deleting test record:', deleteTestError);
      } else {
        console.log('Test record successfully deleted');
      }
    }
    
    console.log('Profiles table cleanup completed!');
    
  } catch (error) {
    console.error('Unexpected error during table cleanup:', error);
  }
}

// 이미지 스토리지 비우기
async function cleanImageStorage() {
  console.log('Cleaning image storage...');
  
  try {
    // 1. 이미지 버킷 내 모든 파일 가져오기
    console.log('1. Listing image files...');
    const { data: files, error: listError } = await supabase
      .storage
      .from('images')
      .list();
    
    if (listError) {
      console.error('Error listing image files:', listError);
      return;
    }
    
    if (!files || files.length === 0) {
      console.log('No files found in image storage root');
    } else {
      console.log(`Found ${files.length} items in image storage root`);
      
      // 루트에 있는 파일 삭제 (폴더 제외)
      const rootFiles = files.filter(f => !f.metadata);
      if (rootFiles.length > 0) {
        console.log(`Deleting ${rootFiles.length} files from root`);
        
        const { error: deleteRootError } = await supabase
          .storage
          .from('images')
          .remove(rootFiles.map(f => f.name));
          
        if (deleteRootError) {
          console.error('Error deleting root files:', deleteRootError);
        } else {
          console.log('Root files deleted successfully');
        }
      }
      
      // 폴더 내용물 삭제
      const folders = files.filter(f => f.metadata);
      for (const folder of folders) {
        console.log(`Checking folder: ${folder.name}...`);
        
        try {
          const { data: folderContents, error: folderError } = await supabase
            .storage
            .from('images')
            .list(folder.name);
          
          if (folderError) {
            console.error(`Error listing contents of folder ${folder.name}:`, folderError);
            continue;
          }
          
          if (!folderContents || folderContents.length === 0) {
            console.log(`Folder ${folder.name} is empty`);
            continue;
          }
          
          console.log(`Found ${folderContents.length} items in folder ${folder.name}`);
          
          // 전체 경로 생성하여 파일 삭제
          const filePaths = folderContents.map(item => `${folder.name}/${item.name}`);
          
          const { error: deleteError } = await supabase
            .storage
            .from('images')
            .remove(filePaths);
            
          if (deleteError) {
            console.error(`Error deleting files from ${folder.name}:`, deleteError);
          } else {
            console.log(`Successfully deleted ${filePaths.length} files from ${folder.name}`);
          }
        } catch (folderProcessError) {
          console.error(`Error processing folder ${folder.name}:`, folderProcessError);
        }
      }
    }
    
    // 2. profiles 폴더 내용물 확인 (일반적인 구조)
    console.log('2. Checking profiles folder specifically...');
    try {
      const { data: profilesFolder, error: profilesFolderError } = await supabase
        .storage
        .from('images')
        .list('profiles');
      
      if (profilesFolderError) {
        console.error('Error listing profiles folder:', profilesFolderError);
      } else if (profilesFolder && profilesFolder.length > 0) {
        console.log(`Found ${profilesFolder.length} items in profiles folder`);
        
        // 각 사용자 폴더를 순회하며 삭제
        for (const userFolder of profilesFolder) {
          console.log(`Processing user folder: ${userFolder.name}`);
          
          const { data: userFiles, error: userFilesError } = await supabase
            .storage
            .from('images')
            .list(`profiles/${userFolder.name}`);
          
          if (userFilesError) {
            console.error(`Error listing user folder profiles/${userFolder.name}:`, userFilesError);
            continue;
          }
          
          if (!userFiles || userFiles.length === 0) {
            console.log(`User folder profiles/${userFolder.name} is empty`);
            continue;
          }
          
          console.log(`Found ${userFiles.length} files in user folder profiles/${userFolder.name}`);
          
          // 파일 삭제
          const userFilePaths = userFiles.map(file => `profiles/${userFolder.name}/${file.name}`);
          
          const { error: deleteUserFilesError } = await supabase
            .storage
            .from('images')
            .remove(userFilePaths);
            
          if (deleteUserFilesError) {
            console.error(`Error deleting files from profiles/${userFolder.name}:`, deleteUserFilesError);
          } else {
            console.log(`Successfully deleted ${userFilePaths.length} files from profiles/${userFolder.name}`);
          }
        }
      } else {
        console.log('No items found in profiles folder');
      }
    } catch (profilesFolderError) {
      console.error('Error processing profiles folder:', profilesFolderError);
    }
    
    console.log('Image storage cleanup completed!');
    
  } catch (error) {
    console.error('Unexpected error during image storage cleanup:', error);
  }
}

// 스크립트 실행
async function runCleanup() {
  try {
    // 테이블 데이터 정리
    await cleanProfilesTable();
    
    // 이미지 스토리지 정리
    await cleanImageStorage();
    
    console.log('Complete database cleanup finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// 실행
runCleanup(); 