import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia, rootstockTestnet } from 'wagmi/chains';
import { defineChain } from 'viem'
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  network: 'Polkadot Hub TestNet',
  nativeCurrency: {
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/testnet/'],
    },
    public: {
      http: ['https://services.polkadothub-rpc.com/testnet/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polkadot Hub Explorer',
      url: 'https://blockscout-passet-hub.parity-testnet.parity.io/',
    },
  },
  testnet: true,
})
// const connectors = connectorsForWallets([
//   {
//     groupName: 'Recommended',
//     wallets: [
//       metaMaskWallet({
//         projectId: '8946e322a092d7ac6f43640295413c05',
//         chains,
//       }),
//     ],
//   },
// ]);
export const wagmi = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '8946e322a092d7ac6f43640295413c05',
  chains: [sepolia,polkadotHubTestnet],
  ssr: true,
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/kYDbblb6lAPtodSpZX0SZoPT8XPzqDxF'),
    [polkadotHubTestnet.id]: http('https://services.polkadothub-rpc.com/testnet/'),
  },
});
