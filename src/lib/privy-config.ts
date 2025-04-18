export const PRIVY_APP_ID = 'cm9h0reln009nl20mnpgqmb26';

export const PRIVY_CONFIG = {
  loginMethods: ['email', 'wallet'],
  appearance: {
    theme: 'dark' as const,
    accentColor: '#FB5F9D',
    logo: '/logo.svg',
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    createOnLogin: true,
    noPromptOnSignature: true,
  },
  supportedChains: [
    {
      id: '10',
      name: 'Optimism',
      rpcUrl: 'https://mainnet.optimism.io',
    },
    {
      id: '1',
      name: 'Ethereum',
      rpcUrl: 'https://eth.llamarpc.com',
    },
    {
      id: '11155111',
      name: 'Sepolia',
      rpcUrl: 'https://rpc.sepolia.org',
    },
  ],
}; 