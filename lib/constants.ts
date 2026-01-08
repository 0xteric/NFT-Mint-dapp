import type { Metadata } from "next"
import { Address } from "viem"

export const NFT_CONTRACT_ADDRESS = "0x1C7607fa0a271605bdc2293B2b9E589e71D9c9e8"
export const MARKETPLACE_CONTRACT_ADDRESS = "0xbeAaD8c417f69c8a9e0adf26De34a80d8AEfEfD1"
export const CORE_CONTRACT_ADDRESS = "0x1F82e2C53B688C49B653C80F5EF0316D18d43Be3"
export const PAYMENTS_CONTRACT_ADDRESS = "0xd786e716e33D673B17511f12C743a18cf623f6E2"
export const BIDS_CONTRACT_ADDRESS = "0x6FeE331c6D71CE5eFc653613da9713C6B50c602A"

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
  id: bigint
  collection: Address
  price: bigint
  listed: boolean
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
  sortBy: SortBy
  sortDir: SortDir
  refetchTotalVolume: any
  refetchTotalSales: any
  collections: any[]
}

export type SortBy = "id" | "price"
export type SortDir = "asc" | "desc"

export const listingCreatedEventAbi = "event ListingCreated(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingCancelledEventAbi = "event ListingCancelled(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingSoldEventAbi =
  "event ListingSold(uint indexed id, address indexed collection, uint256 indexed tokenId, address seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
export const bidSoldEventAbi = "event BidSold(address indexed collection, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
