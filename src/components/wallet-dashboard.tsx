'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  getTokenBalances, 
  getTransactions, 
  sendToken, 
  getNetworkInfo,
  TokenBalance,
  Transaction
} from '@/lib/wallet';

export function WalletDashboard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('ETH');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [network, setNetwork] = useState<{name: string; chainId: number}>(
    {name: 'Optimism', chainId: 10}
  );

  // 지갑 데이터 로드
  useEffect(() => {
    if (!user?.walletAddress) return;

    // 토큰 잔액 로드
    const tokenBalances = getTokenBalances(user.walletAddress);
    setBalances(tokenBalances);

    // 거래 내역 로드
    const txs = getTransactions(user.walletAddress);
    setTransactions(txs);

    // 네트워크 정보 로드
    const networkInfo = getNetworkInfo();
    setNetwork({
      name: networkInfo.name,
      chainId: networkInfo.chainId
    });
  }, [user?.walletAddress]);

  // 토큰 전송 함수
  const handleSendToken = async () => {
    if (!user?.walletAddress) {
      setError('Wallet not connected');
      return;
    }

    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid recipient address and amount');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await sendToken(
        user.walletAddress,
        recipientAddress,
        amount,
        selectedToken
      );

      if (result.success) {
        setSuccess(`Successfully sent ${amount} ${selectedToken} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`);
        setRecipientAddress('');
        setAmount('');

        // 잔액과 거래 내역 다시 로드
        const tokenBalances = getTokenBalances(user.walletAddress);
        setBalances(tokenBalances);

        const txs = getTransactions(user.walletAddress);
        setTransactions(txs);
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 거래 내역에 사용할 날짜 포맷 함수
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // 지갑 주소 포맷 함수
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* 네트워크 정보 */}
      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium">{network.name}</span>
        </div>
        <div className="text-xs text-gray-400">Chain ID: {network.chainId}</div>
      </div>

      {/* 지갑 잔액 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Your Assets</h3>
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
      </div>

      {/* 토큰 전송 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Send Tokens</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              {balances.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} ({token.balance})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          
          {error && <div className="text-red-500 text-xs">{error}</div>}
          {success && <div className="text-green-500 text-xs">{success}</div>}
          
          <button
            onClick={handleSendToken}
            disabled={isLoading}
            className="w-full bg-[#0abab5] hover:bg-[#0abab5]/80 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            <p>No transactions yet</p>
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
                    {tx.type === 'send' ? formatAddress(tx.to) : formatAddress(tx.from)}
                  </div>
                  <div>{formatDate(tx.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 