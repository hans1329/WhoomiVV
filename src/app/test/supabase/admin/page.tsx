'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export default function AdminPage() {
  const [result, setResult] = useState<string>('');
  const [detailedResults, setDetailedResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  // 페이지 로드 시 API 서버 상태 확인
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/health-check', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' } 
        });
        
        if (response.ok) {
          console.log('API server is running');
        } else {
          console.warn('API server returned non-200 status:', response.status);
        }
      } catch (error) {
        console.error('Could not connect to API server:', error);
      }
    };
    
    checkApiStatus();
  }, []);

  // 사용자 프로필 개수 확인
  const checkProfiles = async () => {
    try {
      setLoading(true);
      setApiStatus('checking');
      console.log('Checking profile count...');
      
      // profiles 테이블의 레코드 확인
      const { data, error } = await supabase
        .from('profiles')
        .select('id');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        setResult(`프로필 조회 오류: ${error.message}`);
        setApiStatus('error');
        return;
      }
      
      console.log(`Found ${data?.length || 0} profiles`);
      setProfileCount(data?.length || 0);
      setResult(`현재 프로필 개수: ${data?.length || 0}`);
      setApiStatus('success');
    } catch (error) {
      console.error('Unexpected error checking profiles:', error);
      setResult(`오류 발생: ${error}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // 서버 API를 통해 모든 프로필 삭제
  const clearAllData = async () => {
    if (!confirm('⚠️ 주의: 모든 사용자 데이터(프로필, 이미지, 계정 정보)가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      setApiStatus('checking');
      setResult('모든 사용자 데이터 삭제 중...');
      setDetailedResults(null);
      
      console.log('Making API request to clear profiles...');
      
      // 서버 API 호출
      const response = await fetch('/api/admin/clear-profiles', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API returned error status:', response.status, errorText);
        throw new Error(`API 오류: ${response.status} ${errorText || response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API response is not JSON:', text);
        throw new Error('API가 JSON 응답을 반환하지 않았습니다.');
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        setDetailedResults(data.results);
        setResult(`성공적으로 데이터가 삭제되었습니다.\n남은 프로필 수: ${data.remaining}`);
        setProfileCount(data.remaining);
        setApiStatus('success');
      } else {
        console.error('API reported failure:', data.message);
        setResult(`오류: ${data.message}`);
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Error calling API:', error);
      setResult(`API 호출 중 오류 발생: ${error}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Supabase 관리자 페이지</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">모든 사용자 데이터 관리</h2>
        <p className="mb-4 text-red-600">
          ⚠️ 이 페이지는 서버 측에서 Supabase 서비스 역할 키를 사용하여 모든 사용자 데이터를 삭제합니다.
          <br />삭제되는 데이터: 프로필 정보, 저장된 이미지, 사용자 인증 정보 (계정)
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={checkProfiles}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            프로필 개수 확인
          </button>
          
          <button
            onClick={clearAllData}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            모든 사용자 데이터 삭제
          </button>
        </div>
        
        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>처리 중입니다...</span>
          </div>
        )}
        
        {profileCount !== null && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p>현재 프로필 개수: <span className="font-semibold">{profileCount}</span></p>
          </div>
        )}
        
        {apiStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
            <p>API 호출 중 오류가 발생했습니다. 개발자 콘솔을 확인하세요.</p>
          </div>
        )}
        
        {detailedResults && (
          <div className="mt-4 mb-6 p-4 bg-gray-100 rounded-md text-black">
            <h3 className="font-semibold text-lg mb-2">상세 결과:</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="font-medium">프로필 데이터:</h4>
                <p className={detailedResults.profiles.success ? "text-green-600" : "text-red-600"}>
                  {detailedResults.profiles.message}
                </p>
              </div>
              
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="font-medium">이미지 파일:</h4>
                <p className={detailedResults.images.success ? "text-green-600" : "text-red-600"}>
                  {detailedResults.images.message}
                </p>
              </div>
              
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="font-medium">사용자 계정:</h4>
                <p className={detailedResults.auth.success ? "text-green-600" : "text-red-600"}>
                  {detailedResults.auth.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {result && !detailedResults && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">실행 결과:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-black">{result}</pre>
          </div>
        )}
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ 중요 주의사항</h3>
        <p className="text-yellow-700">
          이 페이지는 테스트 목적으로만 사용해야 합니다. 데이터 삭제 작업은 되돌릴 수 없으며, 프로덕션 환경에서는 
          절대 사용하지 마세요. 서버 측에서 서비스 역할 키를 사용하므로 보안에 주의하십시오.
        </p>
      </div>
    </div>
  );
} 