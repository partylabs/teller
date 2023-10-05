import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import { mainnet } from "viem/chains";

export async function POST(request: NextRequest) {
  const XEN_CRYPTO_ABI = await fetch("https://contracts.partylabs.org/xen-crypto.json");

  const xenCryptoContract = {
    address: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8",
    abi: XEN_CRYPTO_ABI,
  };

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const data = await request.json();
  const tokens = data["1"];

  console.log(tokens);

  return NextResponse.json([], { status: 200 });
}
