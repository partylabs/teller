import { CHAINS } from "@/app/lib/official/chains";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const { publicKeys } = await request.json();

  const chainIds = Object.keys(CHAINS);
  const balances = await Promise.all(
    chainIds.flatMap(async (chainId) => {
      const response = await fetch(`${origin}/api/contract/xen-crypto/${chainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicKeys }),
      });
      const balanceResponse = await response.json();
      if (balanceResponse.hasOwnProperty("error")) {
        return [];
      } else {
        return balanceResponse;
      }
    })
  ).then((results) => results.flat());

  let mergedMints: any[] = [];
  let mergedStakes: any[] = [];

  balances.forEach((balance) => {
    if (balance.mints) mergedMints = [...mergedMints, ...balance.mints];
    if (balance.stakes) mergedStakes = [...mergedStakes, ...balance.stakes];
  });

  const mergedBalances = {
    mints: mergedMints,
    stakes: mergedStakes,
  };

  return NextResponse.json(mergedBalances, { status: 200 });
}
