"use client"

import { useState, useEffect } from "react"
import { Address, parseEther, erc721Abi } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "@/lib/constants"
import { useList } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"

export default function ListNftWithApproval() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { list, publicClient } = useList()

  const [collection, setCollection] = useState<Address | "">(NFT_CONTRACT_ADDRESS)
  const [tokenId, setTokenId] = useState<number | "">("")
  const [price, setPrice] = useState<number | string>("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("idle")
  const [tokenIds, setTokenIds] = useState<number[]>([])

  useEffect(() => {
    if (!address) return

    const loadTokens = async () => {
      setLoading(true)
      try {
        const tokens: any = await publicClient?.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: nftAbi,
          functionName: "tokensOfOwner",
          args: [address],
        })
        tokens.sort((a: any, b: any) => Number(a) - Number(b))
        setTokenIds(tokens.map((t: any) => Number(t)))
      } catch (err) {
        console.error("Error cargando tokens:", err)
        setTokenIds([])
      }
      setLoading(false)
    }

    loadTokens()
  }, [address, publicClient])

  const { data: isApproved, refetch } = useReadContract({
    address: collection || undefined,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: collection && address ? [address, MARKETPLACE_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: Boolean(collection && address),
    },
  })

  const approveCollection = async () => {
    if (!collection) return
    setStatus("waiting")
    try {
      const hash = await writeContractAsync({
        address: collection,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_CONTRACT_ADDRESS, true],
      })

      setTxHash(hash)

      setStatus("loading")
      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setStatus("success")

      setTimeout(() => {
        setStatus("idle")
        setTxHash(null)
      }, 3500)
      await refetch()
    } catch (e) {
      setStatus("error")
      setTimeout(() => {
        setStatus("idle")
        setTxHash(null)
      }, 3500)
    }
  }

  const handleList = async (e: any) => {
    if (!collection || tokenId === "" || Number(price) <= 0) return
    if (e.target.id == "input-price") return
    setStatus("waiting")
    try {
      const hash = await list(tokenId as number, parseEther(String(price)))
      setStatus("loading")
      setTxHash(hash)

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setStatus("success")
      setTimeout(() => {
        setStatus("idle")
        setTxHash(null)
      }, 3500)
    } catch (e) {
      setStatus("error")
      setTimeout(() => {
        setStatus("idle")
        setTxHash(null)
      }, 3500)
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id != "list-btn") {
      setTokenId("")
    }
  }

  return (
    <div className=" mx-auto p-4   space-y-4">
      {tokenIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {tokenIds.map((id, index) => (
            <AnimatePresence key={id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="aspect-square min-w-25"
              >
                <button
                  onClick={(e) => {
                    if (!isApproved) {
                      approveCollection()
                    } else {
                      if (tokenId == id) {
                        handleList(e)
                      } else {
                        return setTokenId(id)
                      }
                    }
                  }}
                  className="relative w-full h-full transition-all duration-300  rounded hover:opacity-80 disabled:opacity-50 overflow-hidden"
                >
                  <div className={"absolute transition-all duration-300 " + (tokenId == id && !isApproved ? "top-2 left-3" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")}>
                    <AnimatePresence mode="wait">
                      {tokenId == id &&
                        !isApproved &&
                        ((status == "idle" && (
                          <motion.div
                            key={id}
                            className="  flex justify-center text-center w-full"
                            initial={{ opacity: 0, translateY: 100 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: 100 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex gap-2 items-center justify-center">
                              <span>Approve</span>
                            </div>
                          </motion.div>
                        )) ||
                          (status == "waiting" && (
                            <motion.div
                              key={id}
                              className="  flex justify-center text-center w-full"
                              initial={{ opacity: 0, translateY: 100 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              exit={{ opacity: 0, translateY: 100 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex gap-2 items-center justify-center">
                                <span>Sign...</span>
                              </div>
                            </motion.div>
                          )) ||
                          (status == "loading" && (
                            <motion.div
                              key={id}
                              className="flex justify-center text-center w-full"
                              initial={{ opacity: 0, translateY: 100 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              exit={{ opacity: 0, translateY: 100 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex gap-2 items-center justify-center">
                                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeDasharray="28 56" strokeLinecap="round" />
                                </svg>
                                <span>Approving...</span>
                              </div>
                            </motion.div>
                          )) ||
                          (status == "success" && (
                            <motion.div
                              key={id}
                              className="flex justify-center text-center w-full"
                              initial={{ opacity: 0, translateY: 100 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              exit={{ opacity: 0, translateY: 100 }}
                              transition={{ duration: 0.3 }}
                            >
                              <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9 12l2 2 4-4" />
                              </svg>
                            </motion.div>
                          )) ||
                          (status == "error" && (
                            <motion.div
                              key={id}
                              className="flex justify-center text-center w-full"
                              initial={{ opacity: 0, translateY: 100 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              exit={{ opacity: 0, translateY: 100 }}
                              transition={{ duration: 0.3 }}
                            >
                              <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-75" />

                                <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-75" />
                              </svg>
                            </motion.div>
                          )))}
                    </AnimatePresence>
                  </div>
                  {isApproved && (
                    <AnimatePresence mode="wait">
                      {tokenId == id && (
                        <motion.div
                          className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-2 h-min flex justify-center  w-full  relative">
                            <div className="flex justify-center gap-1 px-2 overflow-visible">
                              <input
                                id="input-price"
                                type="number"
                                className=" bg-transparent! rounded text-center w-8 overflow-visible"
                                placeholder="0.0"
                                autoFocus
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                              />
                              <span>ETH</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  {isApproved && (
                    <div className={"absolute transition-all duration-300 " + (tokenId == id ? "top-2 left-3" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")}>
                      <AnimatePresence>
                        {(status == "idle" || tokenId != id) && (
                          <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                            <span>List</span>
                          </motion.div>
                        )}
                        {tokenId == id &&
                          ((status == "waiting" && (
                            <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                              <span>Sign...</span>
                            </motion.div>
                          )) ||
                            (status == "loading" && (
                              <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                                <span>Listing...</span>
                              </motion.div>
                            )))}
                      </AnimatePresence>
                    </div>
                  )}

                  {tokenId == id && txHash && (
                    <AnimatePresence>
                      <motion.div
                        className="top-35 absolute  flex justify-center text-center w-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`} className=" hover:opacity-80">
                          <span>Tx: </span>
                          <span>
                            {txHash?.slice(0, 6)}...{txHash?.slice(-4)}
                          </span>
                        </a>
                      </motion.div>
                    </AnimatePresence>
                  )}
                  <span className="absolute bottom-1 right-2 text-sm text-(--bg-secondary)!">
                    <strong className=" opacity-50 text-sm ">id: </strong>
                    {id}
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      )}
      {txHash && <p className="text-sm text-green-600 break-all">Tx: {txHash}</p>}
    </div>
  )
}
