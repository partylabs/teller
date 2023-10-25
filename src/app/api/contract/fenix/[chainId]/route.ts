import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createPublicClient, getAddress, http, formatEther, Abi } from "viem";
import { mainnet } from "viem/chains";
import FENIX_ABI from "@/app/models/abi/fenix.json";
import { calculateEarlyPayout, calculateLatePayout } from "@/app/lib/fenix-helpers";
import { CHAINS } from "@/app/lib/official/chains";
import { RPCS } from "@/app/lib/official/rpcs";
import { FENIX_ADDRESS } from "@/app/lib/official/protocols/fenix";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function POST(request: NextRequest) {
  const chainId = request.url.split("/").pop();

  let chain = CHAINS[chainId as unknown as keyof typeof CHAINS];
  let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];
  let fenixContractAddress = FENIX_ADDRESS[chainId as unknown as keyof typeof FENIX_ADDRESS];

  if (chain == null) {
    return NextResponse.json({ error: "Invalid chain" }, { status: 200 });
  } else if (providerUrl == null) {
    return NextResponse.json({ error: "Provider not set" }, { status: 400 });
  } else if (fenixContractAddress == null) {
    return NextResponse.json({ error: `FENIX address not set on ${chain.name}` }, { status: 400 });
  }

  const fenixContract = {
    address: fenixContractAddress,
    abi: FENIX_ABI as Abi,
  };

  const client = createPublicClient({
    chain: chain,
    transport: http(),
  });

  const { publicKeys } = await request.json();

  // Get global variables

  const globalFunctions = ["genesisTs", "shareRate", "equityPoolSupply", "equityPoolTotalShares", "rewardPoolSupply"];
  const globalFunctionContracts = globalFunctions.map((functionName: string) => {
    return {
      ...fenixContract,
      functionName: functionName,
    };
  });

  const [genesisTs, shareRate, equityPoolSupply, equityPoolTotalShares, rewardPoolSupply] = await client.multicall({
    contracts: globalFunctionContracts,
  });

  const fenixCountsContracts = publicKeys.map((publicKey: string) => {
    return {
      ...fenixContract,
      functionName: "stakeCount",
      args: [getAddress(publicKey)],
    };
  });

  const fenixStakeCounts = await client.multicall({
    contracts: fenixCountsContracts,
  });

  const fenixStakesContracts = publicKeys.flatMap((publicKey: string, index: number) => {
    const count = fenixStakeCounts[index].result as bigint;

    if (count === BigInt(0)) {
      return [];
    }

    let fenixStakesContracts = [];
    for (let i = 0; i < count; i++) {
      fenixStakesContracts.push({
        publicKey: publicKey,
        stakeId: i,
        fenixStakesContracts: {
          ...fenixContract,
          functionName: "stakeFor",
          args: [getAddress(publicKey), i],
        },
      });
    }
    return fenixStakesContracts;
  });

  if (fenixStakesContracts.length == 0) {
    return NextResponse.json([], { status: 200 });
  }

  const fenixStakes = await client.multicall({
    contracts: fenixStakesContracts.map((contract: any) => contract.fenixStakesContracts).flat(),
  });

  // Calculate rewards

  let results = fenixStakesContracts.flatMap((contract: any, index: number) => {
    const stake = fenixStakes[index].result as any;
    const currentTs = Date.now() / 1000;

    let penalty = 0;
    const earlyPayout = calculateEarlyPayout(stake, currentTs);
    if (earlyPayout) {
      penalty = 1 - earlyPayout;
    }

    const latePayout = calculateLatePayout(stake, currentTs);
    if (latePayout) {
      penalty = 1 - latePayout;
    }

    const shares = Number(formatEther(stake.shares));
    const poolTotalShares = Number(formatEther(equityPoolTotalShares.result as bigint));
    const poolSupply = Number(formatEther(equityPoolSupply.result as bigint));
    const equityPayout = (shares / poolTotalShares) * poolSupply;
    const projectedPayout = equityPayout * (1 - penalty);

    const publicKey = contract.publicKey;
    const stakeId = contract.stakeId;

    return {
      publicKey: publicKey,
      chainId: chain.id,
      stakeId: stakeId,
      projectedPayout: projectedPayout,
      stake: {
        status: stake.status,
        startTs: stake.startTs,
        deferralTs: stake.deferralTs == 0 ? null : stake.deferralTs,
        endTs: stake.endTs,
        term: stake.term,
        fenix: Number(formatEther(stake.fenix as bigint)),
        shares: Number(formatEther(stake.shares as bigint)),
        payout: Number(formatEther(stake.payout as bigint)),
      },
    };
  });

  return NextResponse.json(results, { status: 200 });

  // return NextResponse.json([], { status: 200 });
}
