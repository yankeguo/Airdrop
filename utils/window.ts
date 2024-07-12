import { isAddress } from "web3-validator";

export function getCachedAddress(): string | null {
  const localAddress = localStorage.getItem("address");
  if (
    localAddress &&
    typeof localAddress === "string" &&
    isAddress(localAddress)
  ) {
    return localAddress;
  }
  return null;
}

export function setCachedAddress(address: string) {
  localStorage.setItem("address", address);
}
