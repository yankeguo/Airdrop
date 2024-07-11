import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
    walletProvider: ethers.BrowserProvider;
  }
}

export function getCachedAddress(): string | null {
  const localAddress = localStorage.getItem("address");
  if (
    localAddress &&
    typeof localAddress === "string" &&
    ethers.isAddress(localAddress)
  ) {
    return localAddress;
  }
  return null;
}

export function setCachedAddress(address: string) {
  localStorage.setItem("address", address);
}
