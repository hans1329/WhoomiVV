'use client';

import { useState } from 'react';
import { clearAllUserProfiles, clearAllProfilesWithServiceKey } from '../../../test-supabase';
import { supabase } from '../../../lib/supabase';

export default function TestSupabasePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [serviceKey, setServiceKey] = useState<string>('');

  // 사용자 프로필 개수 확인
  const checkProfiles = async () => {
    try {
      setLoading(true);
      
      // profiles 테이블의 레코드 확인
      const { data, error } = await supabase
        .from('profiles')
        .select('id');
      
      if (error) {
        setResult(`프로필 조회 오류: ${error.message}`);
        return;
      }
      
      setProfileCount(data?.length || 0);
      setResult(`현재 프로필 개수: ${data?.length || 0}`);
    } catch (error) {
      setResult(`오류 발생: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 프로필 삭제 (현재 사용자만)
  const handleClearProfiles = async () => {
    if (!confirm('정말로 현재 사용자의 프로필 정보를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      setResult('프로필 삭제 중...');
      
      const result = await clearAllUserProfiles();
      setResult(`결과: ${result.message}`);
      
      // 삭제 후 프로필 개수 다시 확인
      await checkProfiles();
    } catch (error) {
      setResult(`오류 발생: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 서비스 키를 사용하여 모든 프로필 삭제
  const handleClearAllProfilesWithServiceKey = async () => {
    if (!serviceKey) {
      setResult('서비스 역할 키를 입력해주세요.');
      return;
    }
    
    if (!confirm('⚠️ 주의: 모든 사용자의 프로필 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      setResult('서비스 키를 사용하여 모든 프로필 삭제 중...');
      
      const result = await clearAllProfilesWithServiceKey(serviceKey);
      setResult(`결과: ${result.message}`);
      
      // 삭제 후 프로필 개수 다시 확인
      await checkProfiles();
    } catch (error) {
      setResult(`오류 발생: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Supabase 테스트</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">사용자 프로필 관리</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={checkProfiles}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            프로필 개수 확인
          </button>
          
          <button
            onClick={handleClearProfiles}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            내 프로필만 삭제
          </button>
        </div>
        
        {profileCount !== null && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p>현재 프로필 개수: <span className="font-semibold">{profileCount}</span></p>
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">실행 결과:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">{result}</pre>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">관리자 기능 (모든 프로필 삭제)</h2>
        <p className="mb-4 text-red-600">⚠️ 이 기능은 Supabase 서비스 키를 사용하여 모든 사용자의 프로필 데이터를 삭제합니다.</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Supabase 서비스 역할 키:</label>
          <input
            type="password"
            value={serviceKey}
            onChange={(e) => setServiceKey(e.target.value)}
            className="w-full p-2 border rounded text-black bg-gray-50"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Supabase 대시보드의 Project Settings &gt; API &gt; Project API keys에서 service_role 키를 확인할 수 있습니다.
          </p>
        </div>
        
        <button
          onClick={handleClearAllProfilesWithServiceKey}
          disabled={loading || !serviceKey}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          모든 프로필 삭제 (관리자 권한)
        </button>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h3>
        <p className="text-yellow-700">
          이 페이지는 테스트 목적으로만 사용해야 합니다. 프로필 삭제 작업은 되돌릴 수 없으며, 프로덕션 환경에서는 
          절대 사용하지 마세요.
        </p>
      </div>
    </div>
  );
} 