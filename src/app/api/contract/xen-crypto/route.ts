import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";
import XEN_CRYPTO_ABI from "@/app/models/abi/xen-crypto.json";

export async function POST(request: NextRequest) {
  // const XEN_CRYPTO_ABI = await fetch("https://contracts.partylabs.org/xen-crypto.json");

  // const xenCryptoContract = {
  //   address: getAddress("0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"),
  //   abi: XEN_CRYPTO_ABI,
  // };

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  // const { publicKeys } = await request.json();
  // const xenCryptoContracts = publicKeys.map((publicKey: string) => {
  //   const readMint = {
  //     ...xenCryptoContract,
  //     functionName: "getUserMint",
  //     account: getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F"),
  //   };
  //   return readMint;
  //   // const readStake = {
  //   //   ...xenCryptoContract,
  //   //   functionName: "getUserStake",
  //   //   account: getAddress(publicKey),
  //   // };
  //   // return [readMint, readStake];
  // });
  // console.log(xenCryptoContracts);

  // console.log(XEN_CRYPTO_ABI);

  // const results = await client.multicall({
  //   contracts: [
  //     {
  //       address: getAddress("0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"),
  //       abi: XEN_CRYPTO_ABI,
  //       functionName: "getUserMint",
  //       account: getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F"),
  //     },
  //   ],
  //   account: getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F"),
  // });
  // console.log(results);

  // const readMint = {
  //   ...xenCryptoContract,
  //   functionName: "getUserMint",
  //   account: getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F"),
  // };
  // const data = await client.readContract(readMint);

  // console.log(data);
  return NextResponse.json([], { status: 200 });
}
