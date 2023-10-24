import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http, formatEther } from "viem";
import { mainnet } from "viem/chains";
import FENIX_ABI from "@/app/models/abi/fenix.json";
import { calculateEarlyPayout, calculateLatePayout } from "@/app/lib/fenix-helpers";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function POST(request: NextRequest) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const { publicKeys } = await request.json();

  const fenixContract = {
    address: getAddress("0xC3e8abfA04B0EC442c2A4D65699a40F7FcEd8055"),
    abi: FENIX_ABI,
  };

  // Get global variables

  const globalFunctions = ["genesisTs", "shareRate", "equityPoolSupply", "equityPoolTotalShares", "rewardPoolSupply"];

  const globalFunctionContracts = globalFunctions.map((functionName: string) => {
    return {
      ...fenixContract,
      functionName: functionName,
    };
  });

  console.log(globalFunctionContracts);
  const [genesisTs, shareRate, equityPoolSupply, equityPoolTotalShares, rewardPoolSupply] = await client.multicall({
    contracts: globalFunctionContracts,
  });

  console.log(genesisTs, shareRate, equityPoolSupply, equityPoolTotalShares, rewardPoolSupply);
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
      return;
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

  // console.log(fenixStakesContracts);

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
      stakeId: stakeId,
      projectedPayout: projectedPayout,
      stake: {
        status: stake.status,
        startTs: stake.startTs,
        deferralTs: stake.deferralTs,
        endTs: stake.endTs,
        term: stake.term,
        fenix: Number(formatEther(stake.fenix as bigint)),
        shares: Number(formatEther(stake.shares as bigint)),
        payout: Number(formatEther(stake.payout as bigint)),
      },
    };
  });

  return NextResponse.json(results, { status: 200 });
}
