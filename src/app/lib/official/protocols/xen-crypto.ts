import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";
import { getAddress } from "viem";

export const XEN_CRYPTO_ADDRESS = {
  [mainnet.id]: getAddress("0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8"),
  [optimism.id]: getAddress("0xeB585163DEbB1E637c6D617de3bEF99347cd75c8"),
  [bsc.id]: getAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e"),
  [polygon.id]: getAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e"),
  [pulsechain.id]: getAddress("0x8a7FDcA264e87b6da72D000f22186B4403081A2a"),
  [base.id]: getAddress("0xffcbF84650cE02DaFE96926B37a0ac5E34932fa5"),
  [avalanche.id]: getAddress("0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389"),
};
