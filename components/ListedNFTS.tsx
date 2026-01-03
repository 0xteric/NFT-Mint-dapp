"use client"

import { useEffect, useState } from "react"
import { usePublicClient, useAccount } from "wagmi"
import { formatEther } from "viem"
import { useBuy } from "./Contract"
import { indexMarketplace } from "./useMarketplaceIndex"
import { motion, AnimatePresence } from "framer-motion"
import { RxCrossCircled } from "react-icons/rx"
import { FiCheckCircle } from "react-icons/fi"
import { ListedNft, ListedNFTSProps } from "@/lib/constants"
import { FaUser } from "react-icons/fa"

export default function ListedNFTS({ listings }: ListedNFTSProps) {
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { buy } = useBuy()

  const [localListings, setListings] = useState<ListedNft[]>([])
  const [offerId, setOfferId] = useState<number | string>("")
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    setListings(listings)
  }, [listings])

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    try {
      setStatus("waiting")

      const hash = await buy(tokenId, price)
      setTxHash(hash)

      setStatus("loading")

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      if (TxReceipt?.status === "reverted") throw new Error("Reverted")

      setStatus("success")

      setTimeout(() => {
        setListings(localListings.filter((l) => l.tokenId != tokenId))
        setStatus("idle")
        setTxHash(null)
      }, 3500)
    } catch (e: any) {
      if (e?.shortMessage === "User rejected the request.") {
        setStatus("idle")
        setTxHash(null)
      } else {
        setStatus("error")
        setTimeout(() => {
          setStatus("idle")
          setTxHash(null)
        }, 3500)
      }
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id != "buy-btn") {
      setOfferId("")
    }
  }

  if (status == "loading" && localListings.length === 0) {
    return <p>Cargando NFTs listados...</p>
  } else if (localListings.length === 0) {
    return <p>No hay NFTs listados</p>
  }

  return (
    <div onClick={handleBgClick} className="flex flex-col gap-2">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {localListings.map((nft, idx) => (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1 }} transition={{ duration: 0.1, delay: idx * 0.1 }}>
              <div
                key={`${nft.collection}-${nft.tokenId}-${nft.id}`}
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
                  className="absolute w-full h-full bg-transparent! z-100"
                ></button>
                <div
                  className={
                    "absolute transition-all duration-300 " + (Number(offerId) != Number(nft.tokenId) ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:text-2xl" : "top-2 left-3 text-sm")
                  }
                >
                  <p>{formatEther(nft.price)} ETH</p>
                </div>

                {address ? (
                  (status == "idle" && (
                    <div
                      id="buy-btn"
                      className={
                        "absolute flex items-center justify-center gap-2 transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
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
                        "absolute flex items-center justify-center gap-2  transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                        (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                      }
                    >
                      <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeDasharray="28 56" strokeLinecap="round" />
                      </svg>
                      <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200">
                        <span>Tx: </span>
                        <span>
                          {txHash?.slice(0, 6)}...{txHash?.slice(-4)}
                        </span>
                      </a>
                    </div>
                  )) ||
                  (status == "success" && (
                    <div
                      className={
                        "absolute flex items-center justify-center gap-2  transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                        (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                      }
                    >
                      <FiCheckCircle className="text-[#6dfa6d]" />
                      <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200">
                        <span>Tx: </span>
                        <span>
                          {txHash?.slice(0, 6)}...{txHash?.slice(-4)}
                        </span>
                      </a>
                    </div>
                  )) ||
                  (status == "error" && (
                    <div
                      className={
                        "absolute flex items-center justify-center gap-2  transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                        (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                      }
                    >
                      <RxCrossCircled className="text-red-500" />
                      <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200">
                        <span>Tx: </span>
                        <span>
                          {txHash?.slice(0, 6)}...{txHash?.slice(-4)}
                        </span>
                      </a>
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

                <div className="absolute bottom-0 flex flex-row justify-between w-full  items-end text-(--bg-secondary)">
                  <p className="text-xs  flex items-center gap-1 mt-2 p-2">
                    <FaUser className="text-(--bg-secondary)/60" /> {nft.seller.slice(0, 5)}
                  </p>
                  <p className="mt-2 p-2 text-xs flex items-center gap-1 md:ml-0 -ml-2">
                    <strong className="text-(--bg-secondary)/60 font-bold ">id:</strong>
                    <span className=""> {nft.tokenId.toString()}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
    </div>
  )
}
