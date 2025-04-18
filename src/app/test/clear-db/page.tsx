'use client';

import { useState } from 'react';

export default function ClearDbPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const callApi = async () => {
    try {
      setLoading(true);
      setResult('API 호출 중...');
      
      const response = await fetch('/api/test/clear-db');
      const data = await response.json();
      
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류 발생: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase DB 테스트</h1>
      
      <button
        onClick={callApi}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded mb-4"
      >
        {loading ? '처리 중...' : 'DB 데이터 삭제 테스트'}
      </button>
      
      {result && (
        <pre className="bg-gray-100 p-4 rounded text-black overflow-auto max-h-96">
          {result}
        </pre>
      )}
    </div>
  );
} 