import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import { mainnet } from "viem/chains";

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

  const quoterContracts = data["1"].map((token: string) => {
    return {
      address: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
      abi: quoter,
      functionName: "quoteExactInputSingle",
      args: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", token, FeeAmount.HIGH, 1e6, 0],
    };
  });

  const results = (
    await client.multicall({
      contracts: quoterContracts,
    })
  ).filter((result) => result.status !== "failure");

  console.log(results);

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
