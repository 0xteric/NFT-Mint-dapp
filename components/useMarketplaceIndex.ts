import { MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/constants"
import { decodeEventLog, parseAbiItem } from "viem"
import { listingCreatedEventAbi, listingCancelledEventAbi, listingSoldEventAbi, bidSoldEventAbi } from "@/lib/constants"

const marketplaceAbi = [parseAbiItem(listingCreatedEventAbi), parseAbiItem(listingCancelledEventAbi), parseAbiItem(listingSoldEventAbi), parseAbiItem(bidSoldEventAbi)]

export async function indexMarketplace(publicClient: any, fromBlock: bigint) {
  const latest = await publicClient.getBlockNumber()
  const logs = await publicClient.getLogs({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    fromBlock,
    toBlock: latest,
  })
  console.log(logs)
  const listings = new Map<string, any>()

  for (const log of logs) {
    for (const eventAbi of marketplaceAbi) {
      try {
        const parsed: any = decodeEventLog({
          abi: [eventAbi],
          topics: log.topics,
          data: log.data,
        })

        const key = `${parsed.args.collection + parsed.args.tokenId}`
        listings.set(key, {
          id: parsed.args.id,
          collection: parsed.args.collection,
          tokenId: parsed.args.tokenId,
          seller: parsed.args.seller,
          price: parsed.args.price,
          status: "ACTIVE",
          createdAtBlock: log.blockNumber,
          updatedAtBlock: log.blockNumber,
        })
      } catch (e) {}
    }
  }

  return Array.from(listings.values())
}
