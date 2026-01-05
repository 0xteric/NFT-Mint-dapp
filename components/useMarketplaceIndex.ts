"use client"

import { MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/constants"
import { decodeEventLog } from "viem"
import { marketplaceAbi } from "@/lib/abi"

const CHUNK_SIZE = BigInt(1_000)

async function getLogs(publicClient: any, fromBlock: bigint) {
  const latest = await publicClient.getBlockNumber()
  const allLogs: any[] = []

  let currentFrom = fromBlock

  while (currentFrom <= latest) {
    let currentTo = currentFrom + CHUNK_SIZE
    if (currentTo > latest) currentTo = latest

    const logs = await publicClient.getLogs({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      fromBlock: currentFrom,
      toBlock: currentTo,
    })

    allLogs.push(...logs)
    currentFrom = currentTo + BigInt(1)
  }

  return allLogs
}

export async function indexMarketplace(publicClient: any, fromBlock: bigint) {
  const logs = await getLogs(publicClient, fromBlock)

  const listings = new Map<string, any>()
  const tokenBids = new Map<string, any>()
  const collectionBids = new Map<string, any>()

  for (const log of logs) {
    try {
      const parsed = decodeEventLog({
        abi: marketplaceAbi,
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
          break
        }

        case "ListingCancelled": {
          const id = parsed.args.id.toString()
          const listing = listings.get(id)
          if (listing) {
            listing.status = "CANCELLED"
            listing.updatedAtBlock = log.blockNumber
          }
          break
        }

        case "ListingSold": {
          const id = parsed.args.id.toString()
          const listing = listings.get(id)
          if (listing) {
            listing.status = "SOLD"
            listing.updatedAtBlock = log.blockNumber
          }
          break
        }

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
          break
        }

        case "TokenBidCancelled": {
          const key = `${parsed.args.collection}-${parsed.args.tokenId}-${parsed.args.bidder}`
          const tokenBid = tokenBids.get(key)
          if (tokenBid) {
            tokenBid.status = "SOLD"
            tokenBid.updatedAtBlock = log.blockNumber
          }
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
          break
        }

        case "CollectionBidCancelled": {
          const key = `${parsed.args.collection}-${parsed.args.bidder}`
          const collectionBid = collectionBids.get(key)
          if (collectionBid) {
            collectionBid.status = "SOLD"
            collectionBid.updatedAtBlock = log.blockNumber
          }
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
          }
          if (collectionBid && collectionBid.price == parsed.args.price) {
            tokenBid.status = "SOLD"
            tokenBid.updatedAtBlock = log.blockNumber
          }
          break
        }
      }
    } catch {
      // log no pertenece a nuestros eventos
    }
  }

  return {
    listings: Array.from(listings.values()),
    tokenBids: Array.from(tokenBids.values()),
  }
}
