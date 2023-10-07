import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import TOKENLIST from "@/app/models/tokenlist.json";
import BALANCES from "@/app/models/balancelist.json";
import { UniswapPair, UniswapPairSettings } from "simple-uniswap-sdk";
import { approvedChains } from "@/app/lib/approved-chains";
import { approvedDexes } from "@/app/lib/approved-dexes";
import { RPCS } from "@/app/lib/official/rpcs";

export async function POST(request: NextRequest) {
  const chainId = request.url.split("/").pop();

  let chain = approvedChains[chainId as unknown as keyof typeof approvedChains];
  let dexSettings = approvedDexes[chainId as unknown as keyof typeof approvedDexes];
  let providerUrl = RPCS[chainId as unknown as keyof typeof RPCS];
  let nativeWrappedToken = dexSettings.customNetwork?.nativeWrappedTokenInfo;
  let USDC = dexSettings.customNetwork?.baseTokens?.usdc;

  if (chain == null) {
    return NextResponse.json("Chain not approved", { status: 400 });
  } else if (dexSettings == null) {
    return NextResponse.json("DEX is not approved", { status: 400 });
  } else if (providerUrl == null) {
    return NextResponse.json("Provider not set", { status: 400 });
  } else if (nativeWrappedToken == null) {
    return NextResponse.json("Native Wrapped not set", { status: 400 });
  } else if (USDC == null) {
    return NextResponse.json("Invalid stable", { status: 400 });
  }

  const fromContractAddress = USDC.contractAddress;
  const { tokens } = await request.json();
  const allTokens = [nativeWrappedToken.contractAddress].concat(tokens);
  const SIZE = 10;

  const results = await Promise.all(
    allTokens.map(async (token: string, index: number) => {
      const uniswapPair = new UniswapPair({
        providerUrl: providerUrl,
        fromTokenContractAddress: fromContractAddress,
        toTokenContractAddress: token,
        ethereumAddress: "0x0000000000000000000000000000000000000000",
        chainId: chain.id,
        settings: dexSettings,
      });
      const uniswapPairFactory = await uniswapPair.createFactory();
      try {
        const trade = await uniswapPairFactory.trade(SIZE.toString());
        if (index === allTokens.length) {
          const nativeTokenQuote = SIZE / Number(trade.expectedConvertQuote);
          return nativeTokenQuote;
        }
        return SIZE / Number(trade.expectedConvertQuote);
      } catch (error) {
        return 0;
      }
    })
  );

  var quotes = results
    .flatMap((quote: any, index: number) => {
      if (quote && quote.status !== "failure") {
        const token = allTokens[index];
        const tokenMapKey = `1_${token}`;
        const tokenData = BALANCES.tokenMap[tokenMapKey as keyof typeof BALANCES.tokenMap];

        if (tokenData) {
          return {
            ...tokenData,
            quoteUSDC: quote,
          };
        } else {
          return {
            chainId: chain.id,
            address: null,
            name: chain.nativeCurrency.name,
            symbol: chain.nativeCurrency.symbol,
            decimals: chain.nativeCurrency.decimals,
            logoURI: "https://token.partylabs.org/0x0000000000000000000000000000000000000000.webp",
            quoteUSDC: quote,
          };
        }
      } else {
        return null;
      }
    })
    .filter((item: any) => item !== null);

  return NextResponse.json(quotes, { status: 200 });
}