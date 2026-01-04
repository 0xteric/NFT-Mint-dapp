"use client"

import { useEffect, useState } from "react"
import { usePublicClient, useAccount } from "wagmi"
import { formatEther } from "viem"
import { useBuy } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import { RxCrossCircled } from "react-icons/rx"
import { FiCheckCircle } from "react-icons/fi"
import { ListedNFTSProps, TxState, SortBy, SortDir } from "@/lib/constants"
import { FaUser, FaLink } from "react-icons/fa"
import { useQueryClient } from "@tanstack/react-query"

export default function ListedNFTS({ listings, sortBy, sortDir }: ListedNFTSProps) {
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { buy } = useBuy()

  const [txMap, setTxMap] = useState<Record<string, TxState>>({})
  const [offerId, setOfferId] = useState<number | string>("")
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")

  useEffect(() => {
    setTxMap((prev) => {
      const next: Record<string, TxState> = {}

      for (const l of listings) {
        const key = l.tokenId.toString()
        next[key] = prev[key] ?? { txStatus: "idle" }
      }

      return next
    })

    setStatus("idle")
  }, [listings])

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    try {
      setTx(tokenId, { txStatus: "waiting" })

      const hash = await buy(tokenId, price)

      setTx(tokenId, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      if (TxReceipt?.status === "reverted") throw new Error("Reverted")

      setTx(tokenId, { txStatus: "success" })

      setTimeout(() => {
        setTx(tokenId, { txStatus: "idle" })
        queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] })
      }, 3500)
    } catch (e: any) {
      if (e?.shortMessage === "User rejected the request.") {
        setTx(tokenId, { txStatus: "idle" })
      } else {
        setTx(tokenId, { txStatus: "error" })

        setTimeout(() => {
          setTx(tokenId, { txStatus: "idle" })
        }, 3500)
      }
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id != "buy-btn") {
      setOfferId("")
    }
  }

  function setTx(tokenId: bigint, patch: Partial<TxState>) {
    const key = tokenId.toString()

    setTxMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { txStatus: "idle" }),
        ...patch,
      },
    }))
  }

  function sortByField<T>(items: T[], getId: (item: T) => bigint, getPrice: (item: T) => bigint) {
    return [...items].sort((a, b) => {
      const aVal = sortBy === "id" ? getId(a) : getPrice(a)
      const bVal = sortBy === "id" ? getId(b) : getPrice(b)

      const diff = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortDir === "asc" ? diff : -diff
    })
  }

  const sortedListings = sortByField(
    listings,
    (l) => l.tokenId,
    (l) => l.price
  )

  if (listings.length === 0 && status == "idle") {
    return <p>No hay NFTs listados</p>
  }

  return (
    <div onClick={handleBgClick} className="flex flex-col gap-2">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {status == "loading" && (
          <div className="w-full relative flex justify-center  aspect-square  px-4  animate-pulse">
            <div className="absolute w-full h-full bg-(--accent) opacity-50 rounded"></div>
          </div>
        )}

        {sortedListings.map((nft, idx) => {
          const key = nft.tokenId.toString()
          const tx = txMap[key] ?? { txStatus: "idle" }

          return (
            <AnimatePresence key={nft.id}>
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.1, delay: idx * 0.1 }}>
                <div className="relative hover:scale-103 hover:cursor-pointer transition-all duration-300 aspect-square bg-(--accent)  w-full h-full text-white flex flex-col justify-end  rounded gap-2 ">
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
                      "absolute transition-all duration-300 " +
                      (Number(offerId) != Number(nft.tokenId) && !tx.txHash ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-xl" : "top-2 left-3 text-sm")
                    }
                  >
                    <p>{formatEther(nft.price)} ETH</p>
                  </div>

                  {address ? (
                    (tx.txStatus == "idle" && (
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
                    (tx.txStatus == "waiting" && (
                      <div
                        className={
                          "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                          (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                        }
                      >
                        Sign...
                      </div>
                    )) ||
                    (tx.txHash && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        className={
                          "absolute flex flex-col gap-2 items-center justify-center  transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-200 " +
                          (Number(offerId) != Number(nft.tokenId) && !tx.txHash ? " scale-0 opacity-15" : " scale-100 opacity-100")
                        }
                      >
                        {tx.txStatus === "loading" && (
                          <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                            <svg className=" w-4 h-4 lg:w-8 lg:h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="20" strokeLinecap="round" />
                            </svg>
                          </motion.div>
                        )}
                        {tx.txStatus === "success" && (
                          <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                            <FiCheckCircle className="text-[#6dfa6d] w-4 h-4 lg:w-8 lg:h-8" />
                          </motion.div>
                        )}
                        {tx.txStatus === "error" && (
                          <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                            <RxCrossCircled className="text-red-500 w-4 h-4 lg:w-8 lg:h-8" />
                          </motion.div>
                        )}

                        <a target="_blank" href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200 text-xs lg:text-xl">
                          <FaLink />
                          <span>
                            {tx.txHash?.slice(0, 6)}...{tx.txHash?.slice(-4)}
                          </span>
                        </a>
                      </motion.div>
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
                      <FaUser className="text-(--bg-secondary)/60" /> {nft.seller.toLowerCase() != address?.toLowerCase() ? nft.seller.slice(0, 5) : "You"}
                    </p>
                    <p className="mt-2 p-2 text-xs flex items-center gap-1 md:ml-0 -ml-2">
                      <strong className="text-(--bg-secondary)/60 font-bold ">id:</strong>
                      <span className=""> {nft.tokenId.toString()}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )
        })}
      </div>
    </div>
  )
}
