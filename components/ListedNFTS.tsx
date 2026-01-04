"use client"

import { useEffect, useState } from "react"
import { usePublicClient, useAccount } from "wagmi"
import { formatEther } from "viem"
import { useBuy } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import { RxCrossCircled } from "react-icons/rx"
import { FiCheckCircle } from "react-icons/fi"
import { ListedNft, ListedNFTSProps } from "@/lib/constants"
import { FaUser, FaLink } from "react-icons/fa"

export default function ListedNFTS({ listings }: ListedNFTSProps) {
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { buy } = useBuy()

  const [localListings, setListings] = useState<ListedNft[]>([])
  const [offerId, setOfferId] = useState<number | string>("")
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")

  useEffect(() => {
    setListings(listings)
    setStatus("idle")
  }, [listings])

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    try {
      setListingProp(tokenId, "txStatus", "waiting")
      setTimeout(() => {
        console.log(offerId, localListings)
      }, 2000)
      const hash = await buy(tokenId, price)

      setListingProp(tokenId, "txHash", hash)
      setListingProp(tokenId, "txStatus", "loading")

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      if (TxReceipt?.status === "reverted") throw new Error("Reverted")

      setListingProp(tokenId, "txStatus", "success")

      setTimeout(() => {
        setListings(localListings.filter((l) => l.tokenId != tokenId))
      }, 3500)
    } catch (e: any) {
      if (e?.shortMessage === "User rejected the request.") {
        setListingProp(tokenId, "txHash", null)
        setListingProp(tokenId, "txStatus", "idle")
      } else {
        setListingProp(tokenId, "txStatus", "error")
        setTimeout(() => {
          setListingProp(tokenId, "txHash", null)
          setListingProp(tokenId, "txStatus", "idle")
        }, 3500)
      }
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id != "buy-btn") {
      setOfferId("")
    }
  }

  const setListingProp = (id: bigint, prop: string, value: any | null) => {
    setListings((prev: any) => prev.map((l: any) => (l.tokenId === id ? { ...l, [prop]: value } : l)))
  }

  if (localListings.length === 0 && status == "idle") {
    return <p>No hay NFTs listados</p>
  }

  return (
    <div onClick={handleBgClick} className="flex flex-col gap-2">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {status == "loading" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            <div className="w-full flex justify-center rounded py-28 px-4 bg-(--accent) animate-pulse"></div>
          </div>
        )}

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
                    "absolute transition-all duration-300 " +
                    (Number(offerId) != Number(nft.tokenId) && !nft.txHash ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:text-2xl" : "top-2 left-3 text-sm")
                  }
                >
                  <p>{formatEther(nft.price)} ETH</p>
                </div>

                {address ? (
                  (nft.txStatus == "idle" && (
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
                  (nft.txStatus == "waiting" && (
                    <div
                      className={
                        "absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
                        (Number(offerId) != Number(nft.tokenId) ? " scale-0 opacity-15" : " scale-100 opacity-100")
                      }
                    >
                      Sign...
                    </div>
                  )) ||
                  (nft.txHash && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className={
                        "absolute flex flex-col gap-2 items-center justify-center  transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-200 " +
                        (Number(offerId) != Number(nft.tokenId) && !nft.txHash ? " scale-0 opacity-15" : " scale-100 opacity-100")
                      }
                    >
                      {nft.txStatus === "loading" && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                          <svg className=" w-4 h-4 lg:w-8 lg:h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="20" strokeLinecap="round" />
                          </svg>
                        </motion.div>
                      )}
                      {nft.txStatus === "success" && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                          <FiCheckCircle className="text-[#6dfa6d] w-4 h-4 lg:w-8 lg:h-8" />
                        </motion.div>
                      )}
                      {nft.txStatus === "error" && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                          <RxCrossCircled className="text-red-500 w-4 h-4 lg:w-8 lg:h-8" />
                        </motion.div>
                      )}

                      <a target="_blank" href={`https://sepolia.etherscan.io/tx/${nft.txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200 text-xs lg:text-xl">
                        <FaLink />
                        <span>
                          {nft.txHash?.slice(0, 6)}...{nft.txHash?.slice(-4)}
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
        ))}
      </div>
    </div>
  )
}
