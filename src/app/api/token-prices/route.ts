import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mainnet } from "viem/chains";
import TOKENLIST from "@/app/models/tokenlist.json";
import { UniswapPair, UniswapPairSettings } from "simple-uniswap-sdk";

export async function POST(request: NextRequest) {
  const USDC = TOKENLIST.tokenMap["1_0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"].address;
  const WETH = TOKENLIST.tokenMap["1_0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"];

  const data = await request.json();
  const tokens = data["1"];

  const results = await Promise.all(
    tokens.concat(WETH.address).map(async (token: string, index: number) => {
      const uniswapPair = new UniswapPair({
        providerUrl: "https://eth.llamarpc.com",
        fromTokenContractAddress: USDC,
        toTokenContractAddress: token,
        ethereumAddress: "0x0000000000000000000000000000000000000000",
        chainId: mainnet.id,
        settings: new UniswapPairSettings({
          slippage: 0.5,
        }),
      });
      const uniswapPairFactory = await uniswapPair.createFactory();
      const trade = await uniswapPairFactory.trade("1");
      if (index === tokens.length) {
        const nativeTokenQuote = 1 / Number(trade.expectedConvertQuote);
        return nativeTokenQuote;
      }
      return 1 / Number(trade.expectedConvertQuote);
    })
  );

  var quotes = results
    .map((quote: any, index: number) => {
      if (quote && quote.status !== "failure") {
        const token = tokens[index];
        const tokenMapKey = `1_${token}` as any;
        const tokenData = TOKENLIST.tokenMap[tokenMapKey as keyof typeof TOKENLIST.tokenMap];

        if (tokenData) {
          return {
            ...tokenData,
            quoteUSDC: quote,
          };
        } else {
          return {
            chainId: mainnet.id,
            address: "0x0000000000000000000000000000000000000000",
            name: WETH.name,
            symbol: WETH.symbol,
            decimals: WETH.decimals,
            logoURI: WETH.logoURI,
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
