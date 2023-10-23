import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import { mainnet } from "viem/chains";
import XENCryptoABI from "@/app/models/abi/xen-crypto.json";

export async function POST(request: NextRequest) {
  // const XEN_CRYPTO_ABI = await fetch("https://contracts.partylabs.org/xen-crypto.json");

  const xenCryptoContract = {
    address: getAddress("E39061434BAbCFC05599a6Fb861434BAbCFC05599a6Fb8"),
    abi: XENCryptoABI,
  };

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  // const data = await request.json();
  // const tokens = data["1"];

  const readMint = {
    ...xenCryptoContract,
    functionName: "getUserMint",
    account: getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F"),
  };

  const readStake = {
    ...xenCryptoContract,
    functionName: "getUserStake",
    account: getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F"),
  };

  const data = await client.readContract(readMint);

  console.log(data);
  return NextResponse.json([], { status: 200 });
}
