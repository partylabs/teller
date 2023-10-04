import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import TOKENLIST from "@/app/models/tokenlist.json";

enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

export async function POST(request: NextRequest) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const quoter = await fetch("https://contracts.partylabs.org/uniswap-quoter-v3.json").then((res) => res.json());
  const data = await request.json();
  const tokens = data["1"];

  const quoterContracts = tokens.map((token: string) => {
    return {
      address: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
      abi: quoter,
      functionName: "quoteExactInputSingle",
      args: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", token, FeeAmount.HIGH, 1e6, 0],
    };
  });

  const results = await client.multicall({
    contracts: quoterContracts,
  });

  const quotes = results
    .map((quote: any, index: number) => {
      if (quote && quote.status !== "failure") {
        const token = tokens[index];
        const tokenMapKey = `1_${token}` as any;
        const tokenData = TOKENLIST.tokenMap[tokenMapKey as keyof typeof TOKENLIST.tokenMap];

        return {
          ...tokenData,
          quote: quote.result.toString() ?? "0",
        };
      } else {
        return null;
      }
    })
    .filter((item: any) => item !== null);

  console.log(quotes);

  return NextResponse.json(
    {
      body: request.body,
      path: request.nextUrl.pathname,
      query: request.nextUrl.search,
      cookies: request.cookies.getAll(),
    },
    {
      status: 200,
    }
  );
}
