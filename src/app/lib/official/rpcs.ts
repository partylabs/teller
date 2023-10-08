import { arbitrum, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";

export const RPCS = {
  [mainnet.id]: process.env.MAINNET_RPC_URL,
  //   "10": optimism,
  //   "56": bsc,
  //   "137": polygon,
  // [zkSync.id]: zkSync,
  [pulsechain.id]: process.env.PULSECHAIN_RPC_URL,
  //   "8_453": base,
  //   "42_161": arbitrum,
};
