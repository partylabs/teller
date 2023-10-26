import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http, formatUnits, Abi } from "viem";
import { mainnet } from "viem/chains";
import XEN_CRYPTO_ABI from "@/app/models/abi/xen-crypto.json";
import { XENCryptoMint, XENCryptoStake, mintYield, stakeYield } from "@/app/lib/xen-crypto-helpers";
import { CHAINS } from "@/app/lib/official/chains";
import { RPCS } from "@/app/lib/official/rpcs";
import { XEN_CRYPTO_ADDRESS } from "@/app/lib/official/protocols/xen-crypto";

export async function POST(request: NextRequest) {
  const chainId = request.url.split("/").pop();

  let chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
  let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];
  let xenCryptoContractAddress = XEN_CRYPTO_ADDRESS[chainId as unknown as keyof typeof XEN_CRYPTO_ADDRESS];

  if (chain == null) {
    return NextResponse.json({ error: "Invalid chain" }, { status: 200 });
  } else if (providerUrl == null) {
    return NextResponse.json({ error: "Provider not set" }, { status: 400 });
  } else if (xenCryptoContractAddress == null) {
    return NextResponse.json({ error: `XEN address not set on ${chain.name}` }, { status: 400 });
  }

  const xenCryptoContract = {
    address: xenCryptoContractAddress,
    abi: XEN_CRYPTO_ABI as Abi,
  };

  const client = createPublicClient({
    chain: chain,
    transport: http(providerUrl),
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
    .flatMap((mint, index) => {
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

      if (xenCryptoMint.term === BigInt(0)) {
        return [];
      }

      const estimatedYield = mintYield(gRank, xenCryptoMint);

      return {
        publicKey: publicKeys[index],
        chainId: chain.id,
        yield: estimatedYield,
        mint: xenCryptoMint,
      };
    });

  const stakeResults = xenMintsStakes
    .filter((_, index) => index % 2 !== 0)
    .flatMap((stake, index) => {
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

      if (xenCryptoStake.term === BigInt(0)) {
        return [];
      }

      const estimatedYield = stakeYield(xenCryptoStake);

      return {
        publicKey: publicKeys[index],
        chainId: chain.id,
        yield: estimatedYield,
        stake: xenCryptoStake,
      };
    });

  let responseResults: any = {};
  if (mintResults.length !== 0) {
    responseResults["mints"] = mintResults;
  }
  if (stakeResults.length !== 0) {
    responseResults["stakes"] = stakeResults;
  }

  if (Object.keys(responseResults).length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(responseResults, { status: 200 });
}
