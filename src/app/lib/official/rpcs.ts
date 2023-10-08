import { arbitrum, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";

export const RPCS = {
  [mainnet.id]: "https://eth.llamarpc.com",
  //   "10": optimism,
  //   "56": bsc,
  //   "137": polygon,
  // [zkSync.id]: zkSync,
  [pulsechain.id]: "https://rpc.pulsechain.com",
  //   "8_453": base,
  //   "42_161": arbitrum,
};
