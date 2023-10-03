import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export async function GET(request: NextRequest) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const blockNumber = await client.getBlockNumber();
  console.log("Block number:", blockNumber);

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
