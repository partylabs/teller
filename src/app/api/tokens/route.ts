import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import { mainnet } from "viem/chains";
import BALANCES from "@/app/data/balance.json";
import ERC20 from "@/app/data/abi/ERC20.json";
import Token from "@/lib/token";

export async function POST(request: NextRequest) {
  const { publicKeys } = await request.json();

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const tokens = BALANCES.tokens.map((token: Token) => {
    return token.chainAddress[mainnet.id];
  });

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

  const results = await client.multicall({
    contracts: erc20Contracts,
  });

  // zip erc20Contracts and results
  const zipped = erc20Contracts
    .map((contract: any, index: number) => {
      let tokenIndex = index % tokens.length;
      let token = BALANCES.tokens[tokenIndex];
      if (results[index].result !== BigInt(0)) {
        return {
          address: contract.address,
          value: results[index].result.toString(),
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logoURI: token.logoURI,
        };
      } else {
        return null;
      }
    })
    .filter((item: any) => item !== null);

  return NextResponse.json(zipped, { status: 200 });
}
