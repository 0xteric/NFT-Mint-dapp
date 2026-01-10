import type { Metadata } from "next"
import { Address } from "viem"

export const NFT_CONTRACT_ADDRESS = "0x1C7607fa0a271605bdc2293B2b9E589e71D9c9e8"

export const MARKETPLACE_CONTRACT_ADDRESS = "0x83f3c59C3D44f11C7ba262D01d24Cf1E32117246"
export const BIDS_CONTRACT_ADDRESS = "0x14f3F097C85F1cB1bB3EE72Cf55731f81b8A42Fd"
export const CORE_CONTRACT_ADDRESS = "0x3613128fAA9f1bb8DF769D60ad5CfbBc85C59d54"
export const PAYMENTS_CONTRACT_ADDRESS = "0xF26E73d620251752782B351424D5EC749c5007e9"

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
  tokenBids: any[]
}

export type SortBy = "id" | "price"
export type SortDir = "asc" | "desc"

export const listingCreatedEventAbi = "event ListingCreated(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingCancelledEventAbi = "event ListingCancelled(uint indexed id, address indexed collection, uint indexed tokenId, address seller, uint price)"
export const listingSoldEventAbi =
  "event ListingSold(uint indexed id, address indexed collection, uint256 indexed tokenId, address seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
export const bidSoldEventAbi = "event BidSold(address indexed collection, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price, uint256 marketplaceFee, uint256 royaltyFee)"
