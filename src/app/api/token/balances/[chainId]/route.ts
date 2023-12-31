import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import BALANCES from "@/app/models/balancelist.json";
import ERC20 from "@/app/models/abi/ERC20.json";
import { BalanceOfResult } from "@/app/lib/types";
import { CHAINS } from "@/app/lib/official/chains";
import { RPCS } from "@/app/lib/official/rpcs";
import { DEXES } from "@/app/lib/official/dexes";

export async function POST(request: NextRequest) {
  const chainId = request.url.split("/").pop();

  let chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
  let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];
  let dexSettings = DEXES[chainId as unknown as keyof typeof DEXES];
  let nativeWrappedToken = dexSettings.customNetwork?.nativeWrappedTokenInfo;

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

  const tokenAddresses = BALANCES.tokens
    .filter((token: any) => token.chainId === chain.id)
    .map((token: any) => {
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
          logoURI: `https://chain.partylabs.org/${nativeWrappedToken?.chainId ?? chain.id}.webp`,
          publicKey: publicKey,
          units: balance.toString(),
        };
      }
    })
  );

  // for each publicKey, get all tokens balances
  let erc20Contracts = publicKeys.flatMap((publicKey: string) => {
    return tokenAddresses.map((tokenAddress: String) => {
      return {
        address: tokenAddress,
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
      const tokenMapKey = `${chainId}_${contract.address}`;
      const tokenData = BALANCES.tokenMap[tokenMapKey as keyof typeof BALANCES.tokenMap];
      return {
        ...tokenData,
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
