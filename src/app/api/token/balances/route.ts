import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { approvedChains } from "@/app/lib/approved-chains";
import absoluteUrl from "next-absolute-url";

export async function POST(request: NextRequest) {
  const { origin } = absoluteUrl(request);
  const { publicKeys } = await request.json();

  const chainIds = Object.keys(approvedChains);

  const balances = await Promise.all(
    chainIds.flatMap(async (chainId) => {
      const response = await fetch(`${origin}/api/token/balances/${chainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicKeys }),
      });
      return await response.json();
    })
  ).then((results) => results.flat());

  return NextResponse.json(balances, { status: 200 });
}
