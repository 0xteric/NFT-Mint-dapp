"use client"

import { useEffect, useState } from "react"
import { usePublicClient, useAccount } from "wagmi"
import { formatEther } from "viem"
import { useBuy } from "./Contract"
import { indexMarketplace } from "./useMarketplaceIndex"

type ListedNft = {
  seller: `0x${string}`
  collection: `0x${string}`
  tokenId: bigint
  price: bigint
  blockNum: bigint
}

export default function ListedNFTS() {
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { buy } = useBuy()

  const [listings, setListings] = useState<ListedNft[]>([])
  const [offerId, setOfferId] = useState<number | string>("")
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    loadMarketplace()
  }, [])

  const loadMarketplace = async () => {
    const logs = await indexMarketplace(publicClient, BigInt("9967517"))
    console.log(logs)

    setListings(logs)
  }

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    try {
      setStatus("waiting")

      const hash = await buy(tokenId, price)
      setTxHash(hash)

      setStatus("loading")

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      console.log(TxReceipt)
      if (TxReceipt?.status === "reverted") throw new Error("Reverted")

      setStatus("success")

      setTimeout(() => {
        setStatus("idle")
        setTxHash(null)
      }, 3500)
    } catch (e: any) {
      if (e?.shortMessage === "User rejected the request.") {
        setStatus("idle")
      } else {
        setStatus("error")
      }
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id != "buy-btn") {
      setOfferId("")
    }
  }

  if (status == "loading" && listings.length === 0) {
    return <p>Cargando NFTs listados...</p>
  } else if (listings.length === 0) {
    return <p>No hay NFTs listados</p>
  }

  return (
    <div onClick={handleBgClick} className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {listings.map((nft, idx) => (
          <div
            key={`${nft.collection}-${nft.tokenId}-${idx}`}
            className="relative hover:scale-103 hover:cursor-pointer transition-all duration-300 aspect-square bg-(--accent)  w-full h-full text-white flex flex-col justify-end  rounded gap-2 "
          >
            <button
              id="buy-btn"
              onClick={() => {
                if (Number(offerId) != Number(nft.tokenId)) {
                  setOfferId(Number(nft.tokenId))
                } else {
                  handleBuy(nft.tokenId, nft.price)
                }
              }}
              className="absolute w-full h-full bg-transparent! "
            ></button>
            <div
              className={"absolute transition-all duration-300 " + (Number(offerId) != Number(nft.tokenId) ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl" : "top-2 left-3 text-sm")}
            >
              <p>{formatEther(nft.price)} ETH</p>
            </div>

            {address ? (
              (status == "idle" && (
                <div
                  className={
                    "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                    (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                  }
                >
                  BUY
                </div>
              )) ||
              (status == "waiting" && (
                <div
                  className={
                    "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                    (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                  }
                >
                  Sign...
                </div>
              )) ||
              (status == "loading" && (
                <div
                  className={
                    "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                    (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                  }
                >
                  <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeDasharray="28 56" strokeLinecap="round" />
                  </svg>
                  Buying...
                </div>
              )) ||
              (status == "success" && (
                <div
                  className={
                    "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                    (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                  }
                >
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              )) ||
              (status == "error" && (
                <div
                  className={
                    "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                    (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                  }
                >
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-75" />

                    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-75" />
                  </svg>
                </div>
              ))
            ) : (
              <div
                className={
                  "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                  (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : "  scale-100 opacity-100")
                }
              >
                CONNECT WALLET
              </div>
            )}

            <div className="absolute bottom-0 flex flex-row justify-between w-full items-end text-(--bg-secondary)">
              <p className="text-xs  mt-2 p-2">Seller: {nft.seller.slice(0, 6)}</p>
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
