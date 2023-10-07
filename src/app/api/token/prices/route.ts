import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CHAINS } from "@/app/lib/official/chains";
import absoluteUrl from "next-absolute-url";

export async function POST(request: NextRequest) {
  const { origin } = absoluteUrl(request);
  const data = await request.json();

  const chainIds = Object.keys(CHAINS);

  const prices = await Promise.all(
    chainIds.flatMap(async (chainId) => {
      const tokens = data[chainId] ?? [];
      const response = await fetch(`${origin}/api/token/prices/${chainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokens }),
      });
      return await response.json();
    })
  ).then((results) => results.flat());

  return NextResponse.json(prices, { status: 200 });
}
