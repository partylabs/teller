import { RPCS } from "@/app/lib/official/rpcs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.pathname.split("/").pop() as string;

  let providerUrl = RPCS[mainnet.id as unknown as keyof typeof RPCS];

  const client = createPublicClient({
    chain: mainnet,
    transport: http(providerUrl),
  });

  try {
    const ensAddress = await client.getEnsAddress({
      name: normalize(name),
    });

    if (ensAddress == null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    } else {
      return NextResponse.json({ ensAddress: ensAddress }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
