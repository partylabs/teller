import { formatEther, formatUnits } from "viem";

export interface XENCryptoMint {
  user: string;
  term: bigint;
  maturityTs: bigint;
  rank: bigint;
  amplifier: bigint;
  eaaRate: bigint;
}

export interface XENCryptoStake {
  term: bigint;
  maturityTs: bigint;
  amount: bigint;
  apy: bigint;
}

export const mintYield = (globalRank: number, mint: XENCryptoMint) => {
  const rank = Number(formatUnits(mint.rank, 0));
  const term = Number(formatUnits(mint.term, 0));
  const amplifier = Number(formatUnits(mint.amplifier, 0));

  const EAA = 0.1 - 0.001 * (rank / 1e5);
  return Math.log2(globalRank - rank) * term * amplifier * (1 + EAA);
};

export const stakeYield = (stake: XENCryptoStake) => {
  const amount = Number(formatEther(stake.amount));
  const apy = Number(formatUnits(stake.apy, 0));
  const term = Number(formatUnits(stake.term, 0));
  return (amount * apy * term) / (100 * 365);
};
