import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";
import {
  uniswapEthereum,
  pulsex,
  pancakeSwap,
  quickswap,
  uniswapArbitrum,
  traderJoe,
  uniswapOptimism,
  baseSwap,
} from "./settings";

export const DEXES = {
  [mainnet.id]: uniswapEthereum,
  [optimism.id]: uniswapOptimism,
  [bsc.id]: pancakeSwap,
  [polygon.id]: quickswap,
  // [zkSync.id]: zkSync,
  [pulsechain.id]: pulsex,
  [base.id]: baseSwap,
  [arbitrum.id]: uniswapArbitrum,
  [avalanche.id]: traderJoe,
};
