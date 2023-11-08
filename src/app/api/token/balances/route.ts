import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CHAINS } from "@/app/lib/official/chains";

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
        const response = await fetch(`${origin}/api/token/balances/${chainId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicKeys }),
          signal,
        });
        return await response.json();
      } catch (err) {
        console.log(err);
      }
    })
  ).then((results) => results.flat());

  return NextResponse.json(balances, { status: 200 });
}
