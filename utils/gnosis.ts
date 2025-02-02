export const GNOSIS_MAINNET_PARAMS = {
  chainId: "0x64",
  chainName: "Gnosis",
  nativeCurrency: {
    name: "XDAI",
    symbol: "XDAI",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.gnosischain.com/"],
  blockExplorerUrls: ["https://gnosisscan.io/"],
};

export function createGnosisBlockscoutAddressNFTLink(address: string) {
  return `https://gnosis.blockscout.com/address/${address}?tab=tokens_nfts`;
}
