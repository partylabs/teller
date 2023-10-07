import { ChainId, UniswapPairSettings, UniswapVersion } from "simple-uniswap-sdk";
import { arbitrum, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";

let ETH_ARB_OP_MATIC = new UniswapPairSettings();

export const approvedDexes = {
  [mainnet.id]: new UniswapPairSettings({
    customNetwork: {
      nativeWrappedTokenInfo: {
        chainId: mainnet.id as ChainId,
        contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
      },
      baseTokens: {
        usdc: {
          chainId: mainnet.id as ChainId,
          contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          decimals: 6,
          symbol: "USDC",
          name: "USD Coin",
        },
      },
    },
  }),
  [optimism.id]: ETH_ARB_OP_MATIC,
  [bsc.id]: new UniswapPairSettings({
    cloneUniswapContractDetails: {
      v2Override: {
        routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        factoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
        pairAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
      },
    },
  }),
  [polygon.id]: ETH_ARB_OP_MATIC,
  [pulsechain.id]: new UniswapPairSettings({
    uniswapVersions: [UniswapVersion.v2],
    cloneUniswapContractDetails: {
      v2Override: {
        routerAddress: "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02",
        factoryAddress: "0x1715a3E4A142d8b698131108995174F37aEBA10D",
        pairAddress: "0x1715a3E4A142d8b698131108995174F37aEBA10D",
      },
    },
    customNetwork: {
      nameNetwork: "Pulsechain",
      multicallContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
      nativeCurrency: {
        name: "Pulse",
        symbol: "PLS",
      },
      nativeWrappedTokenInfo: {
        chainId: pulsechain.id as ChainId,
        contractAddress: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
        decimals: 18,
        symbol: "WPLS",
        name: "Wrapped Pulse",
      },
      baseTokens: {
        dai: {
          chainId: pulsechain.id as ChainId,
          contractAddress: "0xefD766cCb38EaF1dfd701853BFCe31359239F305",
          decimals: 18,
          symbol: "DAI",
          name: "Dai Stablecoin from Ethereum",
        },
        usdt: {
          chainId: pulsechain.id as ChainId,
          contractAddress: "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f",
          decimals: 6,
          symbol: "USDT",
          name: "Tether USD from Ethereum",
        },
        usdc: {
          chainId: pulsechain.id as ChainId,
          contractAddress: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07",
          decimals: 6,
          symbol: "USDC",
          name: "USD Coin from Ethereum",
        },
      },
    },
  }),
  // [base.id]: something,
  [arbitrum.id]: ETH_ARB_OP_MATIC,
};
