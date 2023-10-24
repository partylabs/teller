import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, pulsechain } from "viem/chains";
import { getAddress } from "viem";

export const FENIX_ADDRESS = {
  [mainnet.id]: getAddress("0xC3e8abfA04B0EC442c2A4D65699a40F7FcEd8055"),
  //   [optimism.id]: optimism,
  [bsc.id]: getAddress("0xC3e8abfA04B0EC442c2A4D65699a40F7FcEd8055"),
  [polygon.id]: getAddress("0xC3e8abfA04B0EC442c2A4D65699a40F7FcEd8055"),
  // [zkSync.id]: zkSync,
  [pulsechain.id]: getAddress("0xC3e8abfA04B0EC442c2A4D65699a40F7FcEd8055"),
  [base.id]: getAddress("0x07FdE3eD7727c1D84171A6e5815964d50827CF69"),
  //   [arbitrum.id]: ,
  [avalanche.id]: getAddress("0xC3e8abfA04B0EC442c2A4D65699a40F7FcEd8055"),
};
