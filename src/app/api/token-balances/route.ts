import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import { mainnet } from "viem/chains";
import BALANCES from "@/app/models/balancelist.json";
import ERC20 from "@/app/models/abi/ERC20.json";
import { BalanceOfResult } from "@/app/lib/types";

export async function POST(request: NextRequest) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const { publicKeys } = await request.json();

  const tokens = BALANCES.tokens.map((token: any) => {
    return token.address;
  });

  let gasTokenBalances = await Promise.all(
    publicKeys.map(async (publicKey: string) => {
      const publicAddress = getAddress(publicKey);
      let balance = await client.getBalance({
        address: publicAddress,
      });

      return {
        publicKey: publicKey,
        address: null,
        value: balance.toString(),
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        logoURI: "https://token.partylabs.org/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.webp".toLowerCase(),
      };
    })
  );

  // for each publicKey, get all tokens balances
  let erc20Contracts = publicKeys.flatMap((publicKey: string) => {
    return tokens.map((token: String) => {
      return {
        address: token,
        abi: ERC20,
        functionName: "balanceOf",
        args: [publicKey],
      };
    });
  });

  const results = (await client.multicall({
    contracts: erc20Contracts,
  })) as BalanceOfResult[];

  // zip erc20Contracts and results
  const erc20Balances = erc20Contracts
    .map((contract: any, index: number) => {
      let tokenIndex = index % tokens.length;
      let token = BALANCES.tokens[tokenIndex];
      let result = results[index];
      if (result && result.result !== BigInt(0)) {
        return {
          ...token,
          publicKey: contract.args[0],
          address: contract.address,
          value: result.result?.toString() ?? "0",
        };
      } else {
        return null;
      }
    })
    .filter((item: any) => item !== null);

  const allBalances = gasTokenBalances.concat(erc20Balances);
  return NextResponse.json(allBalances, { status: 200 });
}
