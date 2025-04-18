'use client';

import { useState } from 'react';
import { getTokenBalances, getTransactions, TokenBalance, Transaction } from '@/lib/wallet';

export function WalletScan() {
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // 주소 형식 검증
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // 지갑 검색 처리
  const handleSearch = () => {
    if (!searchAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidAddress(searchAddress)) {
      setError('Invalid wallet address format. Address must start with 0x followed by 40 hexadecimal characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 잔액 조회
      const tokenBalances = getTokenBalances(searchAddress);
      setBalances(tokenBalances);

      // 거래 내역 조회
      const txs = getTransactions(searchAddress);
      setTransactions(txs);

      setHasSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 주소 포맷팅
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Wallet Scanner</h3>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-[#0abab5] hover:bg-[#0abab5]/80 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              {isLoading ? 'Scanning...' : 'Scan'}
            </button>
          </div>
          
          {error && <div className="text-red-500 text-xs">{error}</div>}
        </div>
      </div>

      {hasSearched && (
        <>
          {/* 지갑 잔액 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Wallet Balance</h3>
              <div className="text-xs text-gray-400">
                {formatAddress(searchAddress)}
              </div>
            </div>
            
            {balances.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                <p>No tokens found in this wallet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((token) => (
                  <div key={token.symbol} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 mr-3">
                        <span className="text-xs font-bold">{token.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{token.token}</div>
                        <div className="text-xs text-gray-400">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{token.balance} {token.symbol}</div>
                      {token.usdValue && (
                        <div className="text-xs text-gray-400">
                          ${(parseFloat(token.balance) * token.usdValue).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 거래 내역 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Transaction History</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                <p>No transactions found for this wallet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.hash} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          tx.type === 'send' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {tx.type === 'send' ? '↑' : '↓'}
                        </div>
                        <span className="text-sm font-medium">
                          {tx.type === 'send' ? 'Sent to' : 'Received from'}
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {tx.value} {tx.tokenSymbol}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <div>
                        {tx.type === 'send' 
                          ? formatAddress(tx.to) 
                          : formatAddress(tx.from)}
                      </div>
                      <div>{formatDate(tx.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 