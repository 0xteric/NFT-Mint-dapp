"use client"

import { useEffect, useState } from "react"
import { usePublicClient } from "wagmi"
import { parseAbiItem, formatEther } from "viem"
import { MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/constants"
import ListNftWithApproval from "./ListNFT"

type ListedNft = {
  seller: `0x${string}`
  collection: `0x${string}`
  tokenId: bigint
  price: bigint
}

export default function ListedNFTS() {
  const publicClient = usePublicClient()
  const [listings, setListings] = useState<ListedNft[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!publicClient) return

    const fetchListings = async () => {
      setLoading(true)

      const logs = await publicClient.getLogs({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        event: parseAbiItem("event List(address indexed seller, address indexed collection, uint256 tokenId, uint256 price)"),
        fromBlock: BigInt(9952524),
        toBlock: "latest",
      })

      console.log(logs)

      const parsed: ListedNft[] = logs.map((log) => ({
        seller: log.args.seller!,
        collection: log.args.collection!,
        tokenId: log.args.tokenId!,
        price: log.args.price!,
      }))

      setListings(parsed)
      setLoading(false)
    }

    fetchListings()
  }, [publicClient])

  if (loading) {
    return <p>Cargando NFTs listados...</p>
  }

  if (listings.length === 0) {
    return <p>No hay NFTs listados</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listings.map((nft, idx) => (
          <div key={`${nft.collection}-${nft.tokenId}-${idx}`} className="bg-(--accent) text-white flex flex-col justify-between  rounded-lg gap-2 ">
            <div></div>
            <div>
              <p>{formatEther(nft.price)} ETH</p>
            </div>

            <div className="flex flex-row justify-between w-full items-end text-(--bg-secondary)">
              <p className="text-xs  mt-2 p-2">Seller: {nft.seller.slice(0, 4)}</p>
              <p className="mt-2 p-2 ">
                <strong className="opacity-50 text-sm ">id:</strong>
                <span className=""> {nft.tokenId.toString()}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
