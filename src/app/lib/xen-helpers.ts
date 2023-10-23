const WITHDRAWAL_WINDOW_DAYS = 7;
const MAX_PENALTY_PCT = 99;
const DAYS_IN_YEAR = 365;

interface MintRewardData {
  maturityTs: number;
  grossReward: number;
}

interface StakeRewardData {
  maturityTs: number;
  term: number;
  amount: number;
  apy: number;
}

export const UTC_TIME = new Date().getTime() / 1000;

export const calculateMintReward = (data: MintRewardData) => {
  return (data.grossReward * (100 - mintPenalty(data.maturityTs))) / 100;
};

export const calculateStakeReward = (data: StakeRewardData) => {
  if (UTC_TIME > data.maturityTs) {
    const rate = (data.apy * data.term * 1_000_000) / DAYS_IN_YEAR;
    return (data.amount * rate) / 100_000_000 / 1e18;
  }
  return 0;
};

export const mintPenalty = (maturityTs: number) => {
  const daysLate = (UTC_TIME - maturityTs) / 86400;
  if (daysLate > 1) {
    if (daysLate > WITHDRAWAL_WINDOW_DAYS - 1) return MAX_PENALTY_PCT;
    const penalty = (1 << (daysLate + 3)) / WITHDRAWAL_WINDOW_DAYS - 1;
    return Math.min(penalty, MAX_PENALTY_PCT);
  }
  return 0;
};
