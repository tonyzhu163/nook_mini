export let EARNING_POOLS = [
  { name: 'Aave V3', rate: 10.3, protocol: 'Aave', poolId: '' },
  { name: 'Compound', rate: 8.2, protocol: 'Compound', poolId: '' },
  { name: 'Moonwell', rate: 5.0, protocol: 'Moonwell', poolId: '' },
  { name: 'Seamless', rate: 8.2, protocol: 'Seamless', poolId: '' },
  { name: 'Morpho', rate: 8.2, protocol: 'Morpho', poolId: '' },
];

export const USDC_SEPOLIA = {
  address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  chainId: 84532,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
};

export const WBTC_SEPOLIA = {
  address: ('0x55E1E644a52b407305304dB505777a8dAa4f1122' as unknown) as `0x${string}`,
  chainId: 84532,
  decimals: 8,
  name: 'Wrapped BTC',
  symbol: 'WBTC',
};

export const LINK_SEPOLIA = {
  address: ('0x779877A7B0D9E8603169DdbD7836e478b4624789' as unknown) as `0x${string}`,
  chainId: 84532,
  decimals: 18,
  name: 'Chainlink',
  symbol: 'LINK',
};