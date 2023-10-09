import { arbitrum, base, bsc, mainnet, optimism, polygon, pulsechain, zkSync, avalanche, fantom } from "viem/chains";

export const RPCS = {
  [mainnet.id]: process.env.MAINNET_RPC_URL,
  [optimism.id]: process.env.OPTIMISM_RPC_URL,
  [bsc.id]: process.env.BSC_RPC_URL,
  [polygon.id]: process.env.POLYGON_RPC_URL,
  [fantom.id]: process.env.FANTOM_RPC_URL,
  [zkSync.id]: process.env.ZKSYNC_RPC_URL,
  [pulsechain.id]: process.env.PULSECHAIN_RPC_URL,
  [base.id]: process.env.BASE_RPC_URL,
  [arbitrum.id]: process.env.ARBITRUM_RPC_URL,
  [avalanche.id]: process.env.AVALANCHE_RPC_URL,
};
