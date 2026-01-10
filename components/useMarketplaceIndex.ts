"use client"

import { MARKETPLACE_CONTRACT_ADDRESS, CORE_CONTRACT_ADDRESS, BIDS_CONTRACT_ADDRESS } from "@/lib/constants"
import { decodeEventLog } from "viem"
import { BidsABI, MarketplaceABI, MarketplaceCoreABI } from "@/lib/abi"

const CHUNK_SIZE = BigInt(1_000)

async function getLogs(publicClient: any, fromBlock: bigint, contract: string) {
  const latest = await publicClient.getBlockNumber()
  const allLogs: any[] = []

  let currentFrom = fromBlock

  while (currentFrom <= latest) {
    let currentTo = currentFrom + CHUNK_SIZE
    if (currentTo > latest) currentTo = latest

    const logs = await publicClient.getLogs({
      address: contract,
      fromBlock: currentFrom,
      toBlock: currentTo,
    })

    allLogs.push(...logs)
    currentFrom = currentTo + BigInt(1)
  }

  return allLogs
}

export async function indexMarketplaceListings(publicClient: any, fromBlock: bigint) {
  const logs = await getLogs(publicClient, fromBlock, CORE_CONTRACT_ADDRESS)

  const listings = new Map<string, any>()
  const listingEvents = new Map<string, any>()
  const collections = new Map<string, any>()
  for (const log of logs) {
    try {
      const parsed = decodeEventLog({
        abi: MarketplaceCoreABI,
        topics: log.topics,
        data: log.data,
      })

      switch (parsed.eventName) {
        case "ListingCreated": {
          const id = parsed.args.id.toString()
          listings.set(id, {
            id: parsed.args.id,
            collection: parsed.args.collection,
            tokenId: parsed.args.tokenId,
            seller: parsed.args.seller,
            price: parsed.args.price,
            status: "ACTIVE",
            createdAtBlock: log.blockNumber,
            updatedAtBlock: log.blockNumber,
          })
          listingEvents.set(`${id}-${parsed.eventName}`, { ...listings.get(id), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Listing Created" })
          break
        }

        case "ListingCancelled": {
          const id = parsed.args.id.toString()
          const listing = listings.get(id)
          if (listing) {
            listing.status = "CANCELLED"
            listing.updatedAtBlock = log.blockNumber
          }
          listingEvents.set(`${id}-${parsed.eventName}`, { ...listings.get(id), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Listing Cancelled" })
          break
        }

        case "ListingSold": {
          const id = parsed.args.id.toString()
          const listing = listings.get(id)
          if (listing) {
            listing.status = "SOLD"
            listing.updatedAtBlock = log.blockNumber
            listing.buyer = parsed.args.buyer
          }
          listingEvents.set(`${id}-${parsed.eventName}`, { ...listings.get(id), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Listing Sold" })
          break
        }

        case "CollectionRegistered": {
          const id = parsed.args.collection.toString()
          collections.set(id, {
            collection: parsed.args.collection,
            owner: parsed.args.owner,
            royaltyFee: parsed.args.royaltyFee,
            totalVolume: 0,
            totalSales: 0,
            createdAtBlock: log.blockNumber,
            updatedAtBlock: log.blockNumber,
          })
          break
        }
      }
    } catch {}
  }

  return {
    listings: Array.from(listings.values()),
    listingEvents: Array.from(listingEvents.values()),
    collections: Array.from(collections.values()),
  }
}

export async function indexMarketplaceBids(publicClient: any, fromBlock: bigint) {
  const logs = await getLogs(publicClient, fromBlock, BIDS_CONTRACT_ADDRESS)

  const tokenBids = new Map<string, any>()
  const tokenBidEvents = new Map<string, any>()
  const collectionBids = new Map<string, any>()
  const collectionBidEvents = new Map<string, any>()

  for (const log of logs) {
    try {
      const parsed = decodeEventLog({
        abi: BidsABI,
        topics: log.topics,
        data: log.data,
      })
      switch (parsed.eventName) {
        case "TokenBidCreated": {
          const key = `${parsed.args.collection}-${parsed.args.tokenId}-${parsed.args.bidder}`
          tokenBids.set(key, {
            collection: parsed.args.collection,
            tokenId: parsed.args.tokenId,
            bidder: parsed.args.bidder,
            price: parsed.args.price,
            status: "ACTIVE",
            createdAtBlock: log.blockNumber,
            updatedAtBlock: log.blockNumber,
          })
          tokenBidEvents.set(`${key}-${parsed.eventName}`, { ...tokenBids.get(key), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Token Bid Created" })
          break
        }

        case "TokenBidCancelled": {
          const key = `${parsed.args.collection}-${parsed.args.tokenId}-${parsed.args.bidder}`
          const tokenBid = tokenBids.get(key)
          if (tokenBid) {
            tokenBid.status = "SOLD"
            tokenBid.updatedAtBlock = log.blockNumber
          }
          tokenBidEvents.set(`${key}-${parsed.eventName}`, { ...tokenBids.get(key), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Token Bid Cancelled" })
          break
        }

        case "CollectionBidCreated": {
          const key = `${parsed.args.collection}-${parsed.args.bidder}`
          collectionBids.set(key, {
            collection: parsed.args.collection,
            bidder: parsed.args.bidder,
            price: parsed.args.price,
            quantity: parsed.args.quantity,
            status: "ACTIVE",
            createdAtBlock: log.blockNumber,
            updatedAtBlock: log.blockNumber,
          })
          collectionBidEvents.set(`${key}-${parsed.eventName}`, { ...collectionBids.get(key), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Collection Bid Created" })
          break
        }

        case "CollectionBidCancelled": {
          const key = `${parsed.args.collection}-${parsed.args.bidder}`
          const collectionBid = collectionBids.get(key)
          if (collectionBid) {
            collectionBid.status = "SOLD"
            collectionBid.updatedAtBlock = log.blockNumber
          }
          collectionBidEvents.set(`${key}-${parsed.eventName}`, { ...collectionBids.get(key), createdAt: log.blockTimestamp, txHash: log.transactionHash, eventName: "Collection Bid Cancelled" })
          break
        }

        case "BidSold": {
          const key1 = `${parsed.args.collection}-${parsed.args.tokenId}-${parsed.args.buyer}`
          const key2 = `${parsed.args.collection}-${parsed.args.buyer}`
          const tokenBid = tokenBids.get(key1)
          const collectionBid = collectionBids.get(key2)
          if (tokenBid) {
            tokenBid.status = "SOLD"
            tokenBid.updatedAtBlock = log.blockNumber
            tokenBidEvents.set(`${key2}-${parsed.eventName}`, { ...tokenBids.get(key2), createdAtBlock: log.blockNumber, txHash: log.transactionHash, eventName: "Token Bid Sold" })
          }
          if (collectionBid && collectionBid.price == parsed.args.price) {
            collectionBid.status = "SOLD"
            collectionBid.updatedAtBlock = log.blockNumber
            collectionBidEvents.set(`${key2}-${parsed.eventName}`, { ...collectionBids.get(key2), createdAtBlock: log.blockNumber, txHash: log.transactionHash, eventName: "Collection Bid Sold" })
          }
          break
        }
      }
    } catch {}
  }

  return {
    tokenBids: Array.from(tokenBids.values()),
    collectionBids: Array.from(collectionBids.values()),
    collectionBidEvents: Array.from(collectionBidEvents.values()),
    tokenBidEvents: Array.from(tokenBidEvents.values()),
  }
}
