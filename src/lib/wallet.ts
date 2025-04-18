// ethers.js 패키지가 설치되지 않은 상태이므로 모의 구현으로 작성합니다.
// 실제 구현 시에는 아래 코드를 ethers.js를 사용하는 코드로 변경해야 합니다.

// 시도해야 할 import 구문:
// import { ethers } from 'ethers';
// import { Wallet } from 'ethers';

// 임시 인터페이스 및 타입 정의
interface EthersWallet {
  address: string;
  privateKey: string;
}

export interface TokenBalance {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
  usdValue?: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  type: 'send' | 'receive' | 'contract';
  tokenSymbol?: string;
  tokenValue?: string;
}

export interface NFTItem {
  id: string;
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  contractAddress: string;
  collectionName: string;
  standard: 'ERC721' | 'ERC1155';
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  lastUpdated: number;
}

// 로컬 스토리지 키
const WALLET_STORAGE_KEY = 'whoomi_wallet_encrypted';
const WALLET_TRANSACTIONS_KEY = 'whoomi_wallet_txs';
const WALLET_BALANCES_KEY = 'whoomi_wallet_balances';
const WALLET_NFTS_KEY = 'whoomi_wallet_nfts';

// 지갑 생성 함수 (모의 구현)
export const createWallet = async (): Promise<EthersWallet> => {
  // 실제 ethers.js 구현:
  // const wallet = ethers.Wallet.createRandom();
  // return { address: wallet.address, privateKey: wallet.privateKey };

  // 모의 구현 (랜덤 주소와 개인키 생성)
  const randomHex = (length: number) => {
    return Array.from({ length }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const privateKey = '0x' + randomHex(64);
  const address = '0x' + randomHex(40);

  return { address, privateKey };
};

// 개인키 암호화 함수 (모의 구현)
export const encryptPrivateKey = async (privateKey: string, password: string): Promise<string> => {
  // 실제 ethers.js 구현:
  // const wallet = new ethers.Wallet(privateKey);
  // return wallet.encrypt(password);

  // 모의 구현
  return JSON.stringify({
    version: 3,
    id: '모의-uuid-' + Date.now(),
    address: privateKey.slice(2, 42),
    crypto: {
      ciphertext: '암호화된-' + privateKey.substring(0, 10) + '...',
      cipherparams: { iv: '모의-iv' },
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      kdfparams: {
        dklen: 32,
        salt: '모의-salt',
        n: 8192,
        r: 8,
        p: 1
      },
      mac: '모의-mac-해시'
    }
  });
};

// 개인키 복호화 함수 (모의 구현)
export const decryptPrivateKey = async (encryptedJson: string, password: string): Promise<string> => {
  // 실제 ethers.js 구현:
  // const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
  // return wallet.privateKey;

  // 모의 구현
  try {
    const parsed = JSON.parse(encryptedJson);
    if (parsed.crypto && parsed.crypto.ciphertext.startsWith('암호화된-')) {
      // 패스워드 체크는 생략 (모의 구현)
      return '0x' + '1'.repeat(64); // 모의 개인키 반환
    }
    throw new Error('Invalid encrypted key');
  } catch (error) {
    throw new Error('Failed to decrypt private key: ' + (error as Error).message);
  }
};

// 지갑 연결 함수 (MetaMask 등 외부 지갑)
export const connectExternalWallet = async (): Promise<string | null> => {
  // 실제 구현에서는 window.ethereum을 사용하여 MetaMask 지갑 연결
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      // MetaMask 연결 요청
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
    } catch (error) {
      console.error('External wallet connection error:', error);
    }
  }
  
  // 모의 환경 또는 연결 실패 시 모의 주소 반환
  const randomAddress = '0x' + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return randomAddress;
};

// 서명 요청 함수 (모의 구현)
export const signMessage = async (message: string, privateKey?: string): Promise<string> => {
  // 실제 ethers.js 구현:
  // if (privateKey) {
  //   const wallet = new ethers.Wallet(privateKey);
  //   return wallet.signMessage(message);
  // } else if (typeof window !== 'undefined' && (window as any).ethereum) {
  //   const ethereum = (window as any).ethereum;
  //   const accounts = await ethereum.request({ method: 'eth_accounts' });
  //   return ethereum.request({
  //     method: 'personal_sign',
  //     params: [message, accounts[0]],
  //   });
  // }

  // 모의 구현
  return `0x${'1'.repeat(130)}`; // 모의 서명 반환
};

// 암호화된 지갑 정보 저장
export const saveEncryptedWallet = (encryptedWallet: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WALLET_STORAGE_KEY, encryptedWallet);
    return true;
  }
  return false;
};

// 암호화된 지갑 정보 로드
export const loadEncryptedWallet = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(WALLET_STORAGE_KEY);
  }
  return null;
};

// 임베디드 지갑 생성 및 저장
export const createAndSaveEmbeddedWallet = async (password: string): Promise<string> => {
  // 1. 새 지갑 생성
  const wallet = await createWallet();
  
  // 2. 개인키 암호화
  const encrypted = await encryptPrivateKey(wallet.privateKey, password);
  
  // 3. 암호화된 지갑 정보 저장
  saveEncryptedWallet(encrypted);

  // 4. 초기 잔액 및 거래 내역 생성
  initializeWalletData(wallet.address);
  
  // 5. 지갑 주소 반환
  return wallet.address;
};

// 지갑 초기 데이터 설정 (모의 구현)
const initializeWalletData = (address: string) => {
  // 초기 잔액 설정
  const initialBalances = [
    { token: 'ETH', symbol: 'ETH', balance: '0.5', decimals: 18, usdValue: 1250 },
    { token: 'Whoomi Token', symbol: 'WHM', balance: '100', decimals: 18, usdValue: 100 }
  ];
  saveTokenBalances(address, initialBalances);
  
  // 초기 거래 내역 생성
  const now = Date.now();
  const initialTransactions = [
    {
      hash: '0x' + Math.random().toString(36).substring(2, 38),
      from: '0x' + '1'.repeat(40),
      to: address,
      value: '0.5',
      timestamp: now - 86400000, // 어제
      status: 'success' as const,
      type: 'receive' as const,
      tokenSymbol: 'ETH'
    },
    {
      hash: '0x' + Math.random().toString(36).substring(2, 38),
      from: '0x' + '2'.repeat(40),
      to: address,
      value: '100',
      timestamp: now - 43200000, // 12시간 전
      status: 'success' as const,
      type: 'receive' as const,
      tokenSymbol: 'WHM'
    }
  ];
  saveTransactions(address, initialTransactions);
  
  // 초기 NFT 데이터 설정 (샘플 데이터)
  const initialNFTs: NFTItem[] = [
    {
      id: '1',
      tokenId: '1',
      name: 'Whoomi Dopple #001',
      description: 'Your first Whoomi Dopple, a unique digital twin crafted with AI.',
      image: '/sample-nft-1.png',
      contractAddress: '0x' + '3'.repeat(40),
      collectionName: 'Whoomi Dopples',
      standard: 'ERC721',
      attributes: [
        { trait_type: 'Background', value: 'Blue Gradient' },
        { trait_type: 'Personality', value: 'Creative' },
        { trait_type: 'Level', value: 5 }
      ],
      lastUpdated: now
    }
  ];
  saveNFTs(address, initialNFTs);
};

// 토큰 잔액 저장
export const saveTokenBalances = (address: string, balances: TokenBalance[]) => {
  if (typeof window !== 'undefined') {
    const key = `${WALLET_BALANCES_KEY}_${address}`;
    localStorage.setItem(key, JSON.stringify(balances));
    return true;
  }
  return false;
};

// 토큰 잔액 조회
export const getTokenBalances = (address: string): TokenBalance[] => {
  if (typeof window !== 'undefined') {
    const key = `${WALLET_BALANCES_KEY}_${address}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  }
  return [];
};

// 거래내역 저장
export const saveTransactions = (address: string, transactions: Transaction[]) => {
  if (typeof window !== 'undefined') {
    const key = `${WALLET_TRANSACTIONS_KEY}_${address}`;
    localStorage.setItem(key, JSON.stringify(transactions));
    return true;
  }
  return false;
};

// 거래내역 조회
export const getTransactions = (address: string): Transaction[] => {
  if (typeof window !== 'undefined') {
    const key = `${WALLET_TRANSACTIONS_KEY}_${address}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  }
  return [];
};

// 토큰 전송 (모의 구현)
export const sendToken = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  tokenSymbol: string = 'ETH'
): Promise<{ success: boolean; hash?: string; error?: string }> => {
  try {
    // 1. 잔액 확인
    const balances = getTokenBalances(fromAddress);
    const tokenBalance = balances.find(b => b.symbol === tokenSymbol);
    
    if (!tokenBalance) {
      return { success: false, error: `Token ${tokenSymbol} not found` };
    }
    
    const balanceValue = parseFloat(tokenBalance.balance);
    const sendAmount = parseFloat(amount);
    
    if (isNaN(sendAmount) || sendAmount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }
    
    if (balanceValue < sendAmount) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    // 2. 새 거래내역 생성
    const txHash = '0x' + Math.random().toString(36).substring(2, 38);
    const txTimestamp = Date.now();
    
    // 3. 보내는 사람 잔액 감소
    tokenBalance.balance = (balanceValue - sendAmount).toString();
    saveTokenBalances(fromAddress, balances);
    
    // 4. 받는 사람 잔액 증가 (실제로는 블록체인 처리 결과에 따라 달라짐)
    const recipientBalances = getTokenBalances(toAddress) || [];
    const recipientTokenBalance = recipientBalances.find(b => b.symbol === tokenSymbol);
    
    if (recipientTokenBalance) {
      recipientTokenBalance.balance = (parseFloat(recipientTokenBalance.balance) + sendAmount).toString();
    } else {
      recipientBalances.push({
        token: tokenBalance.token,
        symbol: tokenSymbol,
        balance: sendAmount.toString(),
        decimals: tokenBalance.decimals,
        usdValue: tokenBalance.usdValue
      });
    }
    saveTokenBalances(toAddress, recipientBalances);
    
    // 5. 거래내역 저장
    // 보내는 쪽 트랜잭션
    const senderTx: Transaction = {
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      value: amount,
      timestamp: txTimestamp,
      status: 'success',
      type: 'send',
      tokenSymbol
    };
    
    const senderTxs = getTransactions(fromAddress);
    senderTxs.unshift(senderTx); // 최신 거래를 앞에 추가
    saveTransactions(fromAddress, senderTxs);
    
    // 받는 쪽 트랜잭션
    const recipientTx: Transaction = {
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      value: amount,
      timestamp: txTimestamp,
      status: 'success',
      type: 'receive',
      tokenSymbol
    };
    
    const recipientTxs = getTransactions(toAddress);
    recipientTxs.unshift(recipientTx);
    saveTransactions(toAddress, recipientTxs);
    
    return { success: true, hash: txHash };
  } catch (error) {
    console.error('Send token error:', error);
    return { success: false, error: (error as Error).message };
  }
};

// 네트워크 정보 조회 (모의 구현)
export const getNetworkInfo = () => {
  return {
    name: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    currency: 'ETH',
    isTestnet: false
  };
};

// NFT 저장
export const saveNFTs = (address: string, nfts: NFTItem[]) => {
  if (typeof window !== 'undefined') {
    const key = `${WALLET_NFTS_KEY}_${address}`;
    localStorage.setItem(key, JSON.stringify(nfts));
    return true;
  }
  return false;
};

// NFT 조회
export const getNFTs = (address: string): NFTItem[] => {
  if (typeof window !== 'undefined') {
    const key = `${WALLET_NFTS_KEY}_${address}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  }
  return [];
};

// NFT 전송 함수 (모의 구현)
export const transferNFT = async (
  fromAddress: string,
  toAddress: string,
  nftId: string
): Promise<{ success: boolean; hash?: string; error?: string }> => {
  try {
    // 1. 해당 NFT 소유 여부 확인
    const nfts = getNFTs(fromAddress);
    const nftIndex = nfts.findIndex(nft => nft.id === nftId);
    
    if (nftIndex === -1) {
      return { success: false, error: 'NFT not found in your wallet' };
    }
    
    const nft = nfts[nftIndex];
    
    // 2. 새 거래내역 생성
    const txHash = '0x' + Math.random().toString(36).substring(2, 38);
    const txTimestamp = Date.now();
    
    // 3. 보내는 사람 NFT 목록에서 제거
    nfts.splice(nftIndex, 1);
    saveNFTs(fromAddress, nfts);
    
    // 4. 받는 사람 NFT 목록에 추가
    const recipientNFTs = getNFTs(toAddress) || [];
    recipientNFTs.push({
      ...nft,
      lastUpdated: txTimestamp
    });
    saveNFTs(toAddress, recipientNFTs);
    
    // 5. 거래내역 저장
    // NFT 전송 내역을 트랜잭션 목록에 추가
    const senderTx: Transaction = {
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      value: '1',
      timestamp: txTimestamp,
      status: 'success',
      type: 'send',
      tokenSymbol: 'NFT',
      tokenValue: nft.name
    };
    
    const senderTxs = getTransactions(fromAddress);
    senderTxs.unshift(senderTx);
    saveTransactions(fromAddress, senderTxs);
    
    // 받는 쪽 트랜잭션
    const recipientTx: Transaction = {
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      value: '1',
      timestamp: txTimestamp,
      status: 'success',
      type: 'receive',
      tokenSymbol: 'NFT',
      tokenValue: nft.name
    };
    
    const recipientTxs = getTransactions(toAddress);
    recipientTxs.unshift(recipientTx);
    saveTransactions(toAddress, recipientTxs);
    
    return { success: true, hash: txHash };
  } catch (error) {
    console.error('Transfer NFT error:', error);
    return { success: false, error: (error as Error).message };
  }
};

// 도플 NFT 민팅 함수 (모의 구현)
export const mintDoppleNFT = async (
  address: string,
  name: string,
  image: string,
  attributes: Array<{trait_type: string; value: string | number}>
): Promise<{ success: boolean; nft?: NFTItem; error?: string }> => {
  try {
    // 현재 NFT 목록 가져오기
    const nfts = getNFTs(address);
    
    // NFT ID 생성 (간단하게 현재 타임스탬프와 랜덤값 조합)
    const tokenId = Date.now().toString() + Math.floor(Math.random() * 1000);
    const nftId = `${nfts.length + 1}`;
    
    // 새 NFT 생성
    const newNFT: NFTItem = {
      id: nftId,
      tokenId,
      name: name || `Whoomi Dopple #${nftId.padStart(3, '0')}`,
      description: 'Your unique Whoomi Dopple, a digital twin powered by AI.',
      image: image || '/default-dopple-nft.png',
      contractAddress: '0x' + '3'.repeat(40),
      collectionName: 'Whoomi Dopples',
      standard: 'ERC721',
      attributes,
      lastUpdated: Date.now()
    };
    
    // NFT 목록에 추가
    nfts.push(newNFT);
    saveNFTs(address, nfts);
    
    // 민팅 트랜잭션 생성
    const txHash = '0x' + Math.random().toString(36).substring(2, 38);
    const txTimestamp = Date.now();
    
    const mintTx: Transaction = {
      hash: txHash,
      from: '0x' + '0'.repeat(40), // 컨트랙트 주소 (민팅)
      to: address,
      value: '1',
      timestamp: txTimestamp,
      status: 'success',
      type: 'receive',
      tokenSymbol: 'NFT',
      tokenValue: newNFT.name
    };
    
    // 거래 내역에 민팅 트랜잭션 추가
    const txs = getTransactions(address);
    txs.unshift(mintTx);
    saveTransactions(address, txs);
    
    return { success: true, nft: newNFT };
  } catch (error) {
    console.error('Mint Dopple NFT error:', error);
    return { success: false, error: (error as Error).message };
  }
}; 