import { arbitrum, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";

export const approvedChains = {
  [mainnet.id]: mainnet,
  //   "10": optimism,
  //   "56": bsc,
  //   "137": polygon,
  [pulsechain.id]: pulsechain,
  //   "8_453": base,
  //   "42_161": arbitrum,
};
