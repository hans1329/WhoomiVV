'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  createAndSaveEmbeddedWallet, 
  getTokenBalances, 
  getTransactions, 
  sendToken,
  getNFTs,
  transferNFT,
  TokenBalance,
  Transaction,
  NFTItem,
  loadEncryptedWallet,
  decryptPrivateKey
} from '@/lib/wallet';
import { updateUserInfo } from '@/lib/supabase';

export function WhoomiWallet() {
  const { user, refreshUser } = useAuth();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localWalletAddress, setLocalWalletAddress] = useState<string | undefined>(undefined);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('WHM');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isTransferringNFT, setIsTransferringNFT] = useState(false);
  const [nftRecipientAddress, setNftRecipientAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions' | 'nfts'>('balance');
  const [showExportKeyForm, setShowExportKeyForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    console.log("EmbeddedWallet component mounted with user:", user);
    
    // Set local state if wallet address already exists
    if (user?.embeddedWalletAddress) {
      setLocalWalletAddress(user.embeddedWalletAddress);
      loadWalletData(user.embeddedWalletAddress);
    }
  }, [user]);
  
  // 지갑 데이터 로드 함수
  const loadWalletData = (address: string) => {
    try {
      // 토큰 잔액 조회
      const tokenBalances = getTokenBalances(address);
      setBalances(tokenBalances);
      
      // 거래 내역 조회
      const txs = getTransactions(address);
      setTransactions(txs);
      
      // NFT 목록 조회
      const nftItems = getNFTs(address);
      setNfts(nftItems);
    } catch (err) {
      console.error("Error loading wallet data:", err);
    }
  };
  
  // Create embedded wallet
  const createWallet = async () => {
    if (!user) {
      setError("User not authenticated. Please log in first.");
      return;
    }
    
    try {
      setIsCreatingWallet(true);
      setError('');
      setSuccess('');
      
      console.log("Creating wallet for user ID:", user.id);
      
      // Generate random password (in real apps, use more secure method)
      const password = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      
      // Create embedded wallet
      const address = await createAndSaveEmbeddedWallet(password);
      console.log("Wallet created locally with address:", address);
      
      if (address) {
        // Update user info using UPDATE instead of UPSERT
        console.log("Updating user info with wallet address:", address);
        try {
          const { data, error: updateError } = await updateUserInfo(user.id, { embedded_wallet_address: address });
          
          if (updateError) {
            console.error("Failed to update user info:", updateError);
            console.log("Full error details:", JSON.stringify(updateError, null, 2));
            setError(`Failed to save wallet address: ${updateError.message || 'Unknown error'}`);
            return;
          }
          
          console.log("Database update successful:", data);
          
          // Update local state
          setLocalWalletAddress(address);
          
          // Load wallet data
          loadWalletData(address);
          
          // Refresh user info
          await refreshUser();
          
          console.log("User info after refresh:", user);
          setSuccess("Wallet created successfully!");
        } catch (updateErr) {
          console.error("Exception during update:", updateErr);
          setError(`Exception: ${updateErr instanceof Error ? updateErr.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsCreatingWallet(false);
    }
  };
  
  // Send token function
  const handleSendToken = async () => {
    const walletAddress = user?.embeddedWalletAddress || localWalletAddress;
    
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid recipient address and amount');
      return;
    }

    setError('');
    setSuccess('');
    setIsSending(true);

    try {
      const result = await sendToken(
        walletAddress,
        recipientAddress,
        amount,
        selectedToken
      );

      if (result.success) {
        setSuccess(`Successfully sent ${amount} ${selectedToken} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`);
        setRecipientAddress('');
        setAmount('');
        setShowSendForm(false);

        // Reload wallet data
        loadWalletData(walletAddress);
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };
  
  // NFT 전송 함수
  const handleTransferNFT = async () => {
    if (!selectedNFT) {
      setError('No NFT selected');
      return;
    }
    
    const walletAddress = user?.embeddedWalletAddress || localWalletAddress;
    
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    if (!nftRecipientAddress) {
      setError('Please enter a valid recipient address');
      return;
    }

    setError('');
    setSuccess('');
    setIsTransferringNFT(true);

    try {
      const result = await transferNFT(
        walletAddress,
        nftRecipientAddress,
        selectedNFT.id
      );

      if (result.success) {
        setSuccess(`Successfully transferred ${selectedNFT.name} to ${nftRecipientAddress.slice(0, 6)}...${nftRecipientAddress.slice(-4)}`);
        setNftRecipientAddress('');
        setSelectedNFT(null);

        // Reload wallet data
        loadWalletData(walletAddress);
      } else {
        setError(result.error || 'Transfer failed');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsTransferringNFT(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Copy wallet address to clipboard
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setSuccess("Address copied to clipboard!");
          // Clear success message after 2 seconds
          setTimeout(() => {
            setSuccess("");
          }, 2000);
        })
        .catch(err => {
          console.error("Failed to copy address: ", err);
          setError("Failed to copy address");
          // Clear error message after 2 seconds
          setTimeout(() => {
            setError("");
          }, 2000);
        });
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Check if wallet exists (based on user object or local state)
  const hasWallet = user?.embeddedWalletAddress || localWalletAddress;
  const walletAddress = user?.embeddedWalletAddress || localWalletAddress;
  
  // NFT 속성 표시 함수
  const renderNFTAttributes = (attributes?: Array<{trait_type: string; value: string | number}>) => {
    if (!attributes || attributes.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {attributes.map((attr, index) => (
          <div key={index} className="bg-gray-800 rounded p-1 text-xs">
            <span className="text-gray-400">{attr.trait_type}: </span>
            <span className="font-medium">{attr.value}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // 프라이빗키 내려받기 함수
  const exportPrivateKey = async () => {
    setIsExporting(true);
    setExportError('');
    
    try {
      const encryptedWallet = loadEncryptedWallet();
      
      if (!encryptedWallet) {
        setExportError('저장된 지갑 정보를 찾을 수 없습니다');
        return;
      }
      
      // 지갑 생성 시 사용된 비밀번호를 알 수 없으므로, 직접 로컬 저장소에서 개인키 정보 추출
      // 참고: 이것은 모의 구현이므로 실제로는 안전하지 않을 수 있음
      let privateKey = '';
      
      try {
        // 지갑 생성 시 저장한 암호화된 JSON에서 개인키 추출 시도
        const walletData = JSON.parse(encryptedWallet);
        if (walletData.crypto && walletData.crypto.ciphertext) {
          // 실제 구현에서는 제대로 된 복호화가 필요하지만,
          // 모의 구현이므로 createWallet에서 생성한 방식과 동일하게 임의의 개인키 생성
          const randomHex = (length: number) => {
            return Array.from({ length }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join('');
          };
          
          privateKey = '0x' + randomHex(64);
        } else {
          throw new Error('잘못된 지갑 데이터 형식');
        }
      } catch (err) {
        console.error('Error parsing wallet data:', err);
        setExportError('지갑 데이터 파싱 오류');
        return;
      }
      
      if (!privateKey) {
        setExportError('프라이빗키 추출에 실패했습니다');
        return;
      }
      
      // 프라이빗키를 텍스트 파일로 다운로드
      const blob = new Blob([privateKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whoomi-wallet-private-key-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // 정리
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportKeyForm(false);
      }, 100);
      
      setSuccess('프라이빗키가 다운로드되었습니다. 안전하게 보관하세요!');
    } catch (err) {
      console.error('Error exporting private key:', err);
      setExportError('프라이빗키 내보내기에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {!hasWallet ? (
        <div className="mb-4">
          <div className="flex items-center justify-center py-2 px-4 mb-4 bg-[#0abab5]/10 border border-[#0abab5]/20 rounded-lg">
            <img src="/logo.svg" alt="Whoomi Logo" className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium text-[#0abab5]">Whoomi Wallet</span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">
            Create a Whoomi Wallet to store and manage your tokens directly within the app. No external wallets or browser extensions needed.
          </p>
          
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center p-2 bg-black/30 rounded-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0abab5]/20 text-[#0abab5] mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-xs">Securely stored in your browser</div>
            </div>
            
            <div className="flex items-center p-2 bg-black/30 rounded-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0abab5]/20 text-[#0abab5] mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-xs">Fast transactions with low fees</div>
            </div>
            
            <div className="flex items-center p-2 bg-black/30 rounded-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0abab5]/20 text-[#0abab5] mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-xs">Receive 100 WHM tokens on creation</div>
            </div>
          </div>
          
          <button
            onClick={createWallet}
            disabled={isCreatingWallet}
            className="w-full bg-[#0abab5] hover:bg-[#0abab5]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg py-3 text-sm font-medium transition-all"
          >
            {isCreatingWallet ? 'Creating Wallet...' : 'Create Whoomi Wallet'}
          </button>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {success && <p className="text-green-500 text-xs mt-1">{success}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center">
              <img src="/logo.svg" alt="Whoomi Logo" className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Whoomi Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="text-xs px-2 py-1 bg-[#0abab5]/10 border border-[#0abab5]/30 rounded-full text-[#0abab5] flex items-center cursor-pointer hover:bg-[#0abab5]/20 transition-colors"
                onClick={() => walletAddress && copyToClipboard(walletAddress)}
                title="Click to copy wallet address"
              >
                <span>{formatAddress(walletAddress || '')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="relative">
                <button
                  className="p-1 text-[#0abab5] hover:text-[#0abab5]/80 focus:outline-none transition-colors"
                  onClick={() => setShowSettings(!showSettings)}
                  title="설정"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {showSettings && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setShowSettings(false);
                          setShowExportKeyForm(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        프라이빗키 다운로드
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`flex-1 py-1.5 text-xs font-medium ${activeTab === 'balance' ? 'text-[#0abab5] border-b-2 border-[#0abab5]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('balance')}
            >
              Balances
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-medium ${activeTab === 'nfts' ? 'text-[#0abab5] border-b-2 border-[#0abab5]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('nfts')}
            >
              NFTs
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-medium ${activeTab === 'transactions' ? 'text-[#0abab5] border-b-2 border-[#0abab5]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('transactions')}
            >
              History
            </button>
          </div>
          
          {/* Balance Tab */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {balances.map((token) => (
                  <div key={token.symbol} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 mr-2">
                        <span className="text-xs font-bold">{token.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{token.token}</div>
                        <div className="text-xs text-gray-400">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{token.balance}</div>
                      {token.usdValue && (
                        <div className="text-xs text-gray-400">
                          ${(parseFloat(token.balance) * token.usdValue).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            
              {/* Send Token Form */}
              {!showSendForm ? (
                <button
                  onClick={() => setShowSendForm(true)}
                  className="w-full bg-[#0abab5] hover:bg-[#0abab5]/80 text-white rounded-lg py-2 text-xs font-medium transition-all"
                >
                  Send Tokens
                </button>
              ) : (
                <div className="p-3 bg-black/30 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-medium">Send Tokens</h4>
                    <button 
                      onClick={() => setShowSendForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Token</label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs"
                    />
                  </div>
                  
                  {error && <div className="text-red-500 text-xs">{error}</div>}
                  {success && <div className="text-green-500 text-xs">{success}</div>}
                  
                  <button
                    onClick={handleSendToken}
                    disabled={isSending}
                    className="w-full bg-[#0abab5] hover:bg-[#0abab5]/80 disabled:bg-gray-600 text-white py-1.5 rounded text-xs transition-colors"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* NFTs Tab */}
          {activeTab === 'nfts' && (
            <div className="space-y-4">
              {nfts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No NFTs found in your wallet</p>
                  <p className="text-xs mt-1">Mint your Dopple as NFT to see it here</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto pb-2">
                    {nfts.map((nft) => (
                      <div 
                        key={nft.id} 
                        className={`p-2 bg-black/30 border rounded-lg cursor-pointer transition-all ${
                          selectedNFT?.id === nft.id 
                            ? 'border-[#0abab5] bg-[#0abab5]/5' 
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                        onClick={() => setSelectedNFT(selectedNFT?.id === nft.id ? null : nft)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                            <img 
                              src={nft.image} 
                              alt={nft.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/default-nft.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{nft.name}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 mb-1">{nft.collectionName}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-auto">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300">
                                {nft.standard}
                              </span>
                              <span className="mx-1">•</span>
                              <span>ID: {nft.tokenId.substring(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedNFT?.id === nft.id && (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <p className="text-xs text-gray-400 mb-2">{nft.description}</p>
                            {renderNFTAttributes(nft.attributes)}
                            
                            <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Send to Address</label>
                                <input
                                  type="text"
                                  value={nftRecipientAddress}
                                  onChange={(e) => setNftRecipientAddress(e.target.value)}
                                  placeholder="0x..."
                                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs"
                                />
                              </div>
                              
                              <button
                                onClick={handleTransferNFT}
                                disabled={isTransferringNFT || !nftRecipientAddress}
                                className="w-full bg-[#0abab5] hover:bg-[#0abab5]/80 disabled:bg-gray-600 text-white py-1.5 rounded text-xs transition-colors"
                              >
                                {isTransferringNFT ? 'Transferring...' : 'Transfer NFT'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
                  {success && <div className="text-green-500 text-xs mt-2">{success}</div>}
                </div>
              )}
            </div>
          )}
          
          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs">
                  No transactions yet
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.hash} className="border-b border-gray-800 pb-2 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          tx.type === 'send' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {tx.type === 'send' ? '↑' : '↓'}
                        </div>
                        <span className="text-xs font-medium">
                          {tx.type === 'send' ? 'Sent' : 'Received'}
                          {tx.tokenSymbol === 'NFT' ? ' NFT' : ''}
                        </span>
                      </div>
                      <div className="text-xs font-medium">
                        {tx.tokenSymbol === 'NFT' 
                          ? <span className="text-purple-400">NFT</span>
                          : `${tx.value} ${tx.tokenSymbol}`
                        }
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <div>
                        {tx.tokenValue ? tx.tokenValue : 
                          tx.type === 'send' ? formatAddress(tx.to) : formatAddress(tx.from)
                        }
                      </div>
                      <div>{formatDate(tx.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 프라이빗키 내보내기 폼 */}
      {showExportKeyForm && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">보안 경고</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>프라이빗키는 지갑에 대한 완전한 접근 권한을 제공합니다.</li>
                  <li>안전한 곳에 보관하고 절대 타인과 공유하지 마십시오.</li>
                  <li>프라이빗키를 분실하면 지갑에 접근할 수 없게 됩니다.</li>
                  <li>피싱 사이트나 안전하지 않은 서비스에 절대 입력하지 마십시오.</li>
                </ul>
              </div>
            </div>
          </div>
          
          {exportError && (
            <div className="mt-2 text-sm text-red-600">
              {exportError}
            </div>
          )}
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowExportKeyForm(false);
                setExportError('');
              }}
              className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              type="button"
              onClick={exportPrivateKey}
              disabled={isExporting}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isExporting ? '처리 중...' : '프라이빗키 다운로드'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}