import type { Metadata } from "next"
import { Address } from "viem"

export const NFT_CONTRACT_ADDRESS = "0x1C7607fa0a271605bdc2293B2b9E589e71D9c9e8"
export const MARKETPLACE_CONTRACT_ADDRESS = "0x74f3666388E7fE7897f885300C4a26e9DD950786"
export const CORE_CONTRACT_ADDRESS = "0x44b4EFFE314f17729A3Db370aa5161A8C2D606aC"
export const PAYMENTS_CONTRACT_ADDRESS = "0x4A3B39683d84373ef9026c0C334D285812280CD9"
export const BIDS_CONTRACT_ADDRESS = "0x37F63267072285820217616D67Bcb63191534782"

export const metadata: Metadata = {
  title: "SUP!",
  description: "Created by Fractalio",
}

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
  tokenId: bigint
  collection: Address
  price?: bigint
  listed: boolean
  priceEth?: string
  name: string
}

export type TxState = {
  txHash?: string
  txStatus: "idle" | "waiting" | "loading" | "success" | "error"
  action: "list" | "delist" | "buy" | "bidToken" | "cancelTokenBid" | "bidCollection" | "cancelCollectionBid" | "approve" | "none"
}

export type ListedNFTSProps = {
  listings: ListedNft[]
  userListings: ListedNft[]
  refetchTotalVolume: any
  refetchTotalSales: any
  collections: any[]
  collectionBids: any[]
}

export type SortBy = "id" | "price"
export type SortDir = "asc" | "desc"

export const listingCreatedEventAbi = "event ListingCreated(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingCancelledEventAbi = "event ListingCancelled(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingSoldEventAbi =
  "event ListingSold(uint indexed id, address indexed collection, uint256 indexed tokenId, address seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
export const bidSoldEventAbi = "event BidSold(address indexed collection, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
