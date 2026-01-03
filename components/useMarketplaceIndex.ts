"use client"
import { MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/constants"
import { decodeEventLog, parseAbiItem } from "viem"
import { listingCreatedEventAbi, listingCancelledEventAbi, listingSoldEventAbi, bidSoldEventAbi } from "@/lib/constants"

const marketplaceAbi = [parseAbiItem(listingCreatedEventAbi), parseAbiItem(listingCancelledEventAbi), parseAbiItem(listingSoldEventAbi), parseAbiItem(bidSoldEventAbi)]

const CHUNK_SIZE = BigInt(1000)

async function getLogs(publicClient: any, fromBlock: bigint) {
  const latest = await publicClient.getBlockNumber()
  let allLogs: any[] = []

  let currentFrom = fromBlock

  while (currentFrom <= latest) {
    let currentTo = currentFrom + CHUNK_SIZE

    if (currentTo > latest) {
      currentTo = latest
    }

    console.log("Reading blocks:", currentFrom.toString(), currentTo.toString())

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
  const logs: any[] = await getLogs(publicClient, fromBlock)

  const listings = new Map<string, any>()

  for (const log of logs) {
    for (const eventAbi of marketplaceAbi) {
      try {
        const parsed: any = decodeEventLog({
          abi: [eventAbi],
          topics: log.topics,
          data: log.data,
        })

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

        if (parsed.eventName === "ListingCancelled") {
          const listing = listings.get(id)
          if (listing) {
            listing.status = "CANCELLED"
            listing.updatedAtBlock = log.blockNumber
          }
        }

        if (parsed.eventName === "ListingSold") {
          const listing = listings.get(id)
          if (listing) {
            listing.status = "SOLD"
            listing.updatedAtBlock = log.blockNumber
          }
        }
      } catch {}
    }
  }

  return Array.from(listings.values())
}
