import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CHAINS } from "@/app/lib/official/chains";

export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const data = await request.json();

  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  const officialChainIds = Object.keys(CHAINS);
  const chainIds = Object.keys(data);

  chainIds.forEach((chainId) => {
    if (!officialChainIds.includes(chainId)) {
      delete data[chainId];
    }
  });

  const prices = await Promise.all(
    chainIds.flatMap(async (chainId) => {
      try {
        const tokens = data[chainId] ?? [];
        const response = await fetch(`${origin}/api/token/prices/${chainId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tokens }),
          signal,
        });
        return await response.json();
      } catch (err) {
        console.log(err);
      }
    })
  ).then((results) => results.flat());

  return NextResponse.json(prices, { status: 200 });
}
