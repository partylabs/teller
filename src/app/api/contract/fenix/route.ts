import { CHAINS } from "@/app/lib/official/chains";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const { publicKeys } = await request.json();

  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  const chainIds = Object.keys(CHAINS);
  const balances = await Promise.all(
    chainIds.flatMap(async (chainId) => {
      try {
        const response = await fetch(`${origin}/api/contract/fenix/${chainId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicKeys }),
          signal,
        });
        const balanceResponse = await response.json();
        if (balanceResponse.hasOwnProperty("error")) {
          return [];
        } else {
          return balanceResponse;
        }
      } catch (err) {
        console.log(err);
      }
    })
  ).then((results) => results.flat());

  return NextResponse.json(balances, { status: 200 });
}
