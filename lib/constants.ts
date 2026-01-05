export const NFT_CONTRACT_ADDRESS = "0x1C7607fa0a271605bdc2293B2b9E589e71D9c9e8"
export const MARKETPLACE_CONTRACT_ADDRESS = "0x48dDcBC2465e7003D9BFbDD0b0C88e3e0Fde58Ff"

export type IndexedListing = {
  id: bigint
  collection: "0x${string}"
  tokenId: bigint
  seller: "0x${string}"
  price: bigint
  status: "ACTIVE" | "SOLD" | "CANCELLED"
  createdAtBlock: bigint
  updatedAtBlock: bigint
}

export type ListingsState = {
  byKey: Map<string, IndexedListing>
  all: IndexedListing[]
}

export type ListedNft = {
  id: bigint
  seller: `0x${string}`
  collection: `0x${string}`
  tokenId: bigint
  price: bigint
  createdAtBlock: bigint
}

export type UserNft = {
  id: bigint
  price: bigint
  listed: boolean
}

export type TxState = {
  txHash?: string
  txStatus: "idle" | "waiting" | "loading" | "success" | "error"
}

export type ListedNFTSProps = {
  listings: ListedNft[]
  userListings: ListedNft[]
  sortBy: SortBy
  sortDir: SortDir
  refetchTotalVolume: any
  refetchTotalSales: any
}

export type SortBy = "id" | "price"
export type SortDir = "asc" | "desc"

export const listingCreatedEventAbi = "event ListingCreated(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingCancelledEventAbi = "event ListingCancelled(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingSoldEventAbi =
  "event ListingSold(uint indexed id, address indexed collection, uint256 indexed tokenId, address seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
export const bidSoldEventAbi = "event BidSold(address indexed collection, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
