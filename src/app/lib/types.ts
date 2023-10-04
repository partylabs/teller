export type Token = {
  chainAddress: [string: string];
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export type BalanceOfResult = {
  result?: bigint;
  status?: string;
};
