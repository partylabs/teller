import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http, formatUnits, Abi } from "viem";
import { mainnet } from "viem/chains";
import XEN_CRYPTO_ABI from "@/app/models/abi/xen-crypto.json";
import { XENCryptoMint, XENCryptoStake, mintYield, stakeYield } from "@/app/lib/xen-crypto-helpers";

export async function POST(request: NextRequest) {
  const xenCryptoContract = {
    address: getAddress("0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"),
    abi: XEN_CRYPTO_ABI as Abi,
  };

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const { publicKeys } = await request.json();

  const [gRankReturn] = await client.multicall({
    contracts: [
      {
        ...xenCryptoContract,
        functionName: "globalRank",
      },
    ],
  });

  const gRank = Number(formatUnits(gRankReturn.result as bigint, 0));

  const xenCryptoContracts = publicKeys.flatMap((publicKey: string) => {
    const readMint = {
      ...xenCryptoContract,
      functionName: "userMints",
      args: [getAddress("0xBFBE733d560bc0a4E5502587853f92b3aE83344F")],
    };
    const readStake = {
      ...xenCryptoContract,
      functionName: "userStakes",
      args: [getAddress(publicKey)],
    };
    return [readMint, readStake];
  });

  const xenMintsStakes = await client.multicall({
    contracts: xenCryptoContracts,
  });

  const mintResults = xenMintsStakes
    .filter((_, index) => index % 2 === 0)
    .map((mint, index) => {
      const mintResult = mint.result as [string, bigint, bigint, bigint, bigint, bigint] | null;
      if (mintResult === null) {
        return [];
      }

      const xenCryptoMint: XENCryptoMint = {
        user: mintResult[0],
        term: mintResult[1],
        maturityTs: mintResult[2],
        rank: mintResult[3],
        amplifier: mintResult[4],
        eaaRate: mintResult[5],
      };

      const estimatedYield = mintYield(gRank, xenCryptoMint);

      return {
        publicKey: publicKeys[index],
        mintYield: estimatedYield,
        mint: xenCryptoMint,
      };
    });

  const stakeResults = xenMintsStakes
    .filter((_, index) => index % 2 !== 0)
    .map((stake, index) => {
      const stakeResult = stake.result as [bigint, bigint, bigint, bigint] | null;
      if (stakeResult === null) {
        return [];
      }
      const xenCryptoStake: XENCryptoStake = {
        term: stakeResult[0],
        maturityTs: stakeResult[1],
        amount: stakeResult[2],
        apy: stakeResult[3],
      };

      const estimatedYield = stakeYield(xenCryptoStake);

      return {
        publicKey: publicKeys[index],
        stakeYield: estimatedYield,
        stake: xenCryptoStake,
      };
    });

  return NextResponse.json({ mints: mintResults, stakes: stakeResults }, { status: 200 });
}
