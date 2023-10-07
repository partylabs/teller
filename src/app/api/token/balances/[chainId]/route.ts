import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import BALANCES from "@/app/models/balancelist.json";
import ERC20 from "@/app/models/abi/ERC20.json";
import { BalanceOfResult } from "@/app/lib/types";
import { CHAINS } from "@/app/lib/official/chains";
import { RPCS } from "@/app/lib/official/rpcs";

export async function POST(request: NextRequest) {
  const chainId = request.url.split("/").pop();

  let chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
  let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];

  if (chain == null) {
    return NextResponse.json([], { status: 200 });
  } else if (providerUrl == null) {
    return NextResponse.json("Provider not set", { status: 400 });
  }

  const client = createPublicClient({
    chain: chain,
    transport: http(providerUrl),
  });

  const { publicKeys } = await request.json();

  const tokens = BALANCES.tokens.map((token: any) => {
    return token.address;
  });

  let gasTokenBalances = await Promise.all(
    publicKeys.flatMap(async (publicKey: string) => {
      const publicAddress = getAddress(publicKey);
      let balance = await client.getBalance({
        address: publicAddress,
      });

      if (balance === BigInt(0)) {
        return null;
      } else {
        return {
          chainId: chain.id,
          address: null,
          ...chain.nativeCurrency,
          logoURI: `https://chain.partylabs.org/${chain.id}.webp`,
          publicKey: publicKey,
          units: balance.toString(),
        };
      }
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
  const erc20Balances = erc20Contracts.map((contract: any, index: number) => {
    let result = results[index];
    if (result && result.status !== "failure" && result.result !== BigInt(0)) {
      let tokenIndex = index % tokens.length;
      let token = BALANCES.tokens[tokenIndex];
      return {
        ...token,
        chainId: chain.id,
        publicKey: contract.args[0],
        address: contract.address,
        units: result.result?.toString() ?? "0",
      };
    } else {
      return null;
    }
  });

  const allBalances = gasTokenBalances.concat(erc20Balances).filter((item: any) => item !== null);
  return NextResponse.json(allBalances, { status: 200 });
}
