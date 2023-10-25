import { ONE_DAY_TS, ONE_EIGHTY_DAYS_TS } from "./constants";

export const enum StakeStatus {
  ACTIVE = 0,
  DEFER = 1,
  END = 2,
  ALL = 3,
}

export interface FENIXStake {
  status: StakeStatus;
  startTs: number;
  deferralTs: number;
  endTs: number;
  term: number;
  fenix: number;
  shares: number;
  payout: number;
}

export const calculateEarlyPayout = (stake: FENIXStake, blockTs: number) => {
  if (blockTs < stake.startTs || stake.status != StakeStatus.ACTIVE) return null;
  if (blockTs > stake.endTs) return null;

  const termDelta = blockTs - stake.startTs;
  const scaleTerm = stake.term * ONE_DAY_TS;
  const ratio = termDelta / scaleTerm;
  return Math.pow(ratio, 2);
};

export const calculateLatePayout = (stake: FENIXStake, blockTs: number) => {
  if (blockTs < stake.startTs || stake.status != StakeStatus.ACTIVE) return null;
  if (blockTs < stake.endTs) return null;

  const termDelta = blockTs - stake.endTs;
  if (termDelta > ONE_EIGHTY_DAYS_TS) return 0;
  const ratio = termDelta / ONE_EIGHTY_DAYS_TS;
  return 1 - Math.pow(ratio, 3);
};
