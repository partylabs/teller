import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, getAddress, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";
import FENIX_ABI from "@/app/models/abi/fenix.json";

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

  let results = fenixStakesContracts.flatMap((contract: any, index: number) => {
    const stake = fenixStakes[index].result;

    const publicKey = contract.publicKey;
    const stakeId = contract.stakeId;
    return {
      publicKey: publicKey,
      stakeId: stakeId,
      stake: stake,
    };
  });

  return NextResponse.json(results, { status: 200 });
}
