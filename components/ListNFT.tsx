"use client"

import { useState, useEffect, useRef } from "react"
import { Address, parseEther, erc721Abi } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "@/lib/constants"
import { useList, useCancelList, useUserTokens } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import ConnectWallet from "./ConnectWallet"
import { FaLink } from "react-icons/fa"
import { FiCheckCircle } from "react-icons/fi"
import { RxCrossCircled } from "react-icons/rx"
import { ListedNFTSProps, TxState, UserNft } from "@/lib/constants"
import { useQueryClient } from "@tanstack/react-query"

export default function ListNftWithApproval({ userListings }: ListedNFTSProps) {
  const [collection, setCollection] = useState<Address | "">(NFT_CONTRACT_ADDRESS)
  const [txMap, setTxMap] = useState<Record<string, TxState>>({})
  const [tokenId, setTokenId] = useState<bigint | "">("")
  const [price, setPrice] = useState<number | string>("")
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")
  const [items, setUserItems] = useState<UserNft[]>([])

  const loadingQueryRef = useRef(false)

  const queryClient = useQueryClient()
  const { address }: any = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { list, publicClient } = useList()
  const { cancelList } = useCancelList()
  const { data: userIds = [], isLoading } = useUserTokens(address)

  useEffect(() => {
    if (!userIds.length) {
      setUserItems([])
      return
    }

    const sorted: bigint[] = [...userIds].sort((a, b) => Number(a) - Number(b))

    const userItems: UserNft[] = sorted.map((id: bigint) => ({
      id,
      listed: userListings.some((l) => l.tokenId === id),
      price: userListings.find((l) => l.tokenId === id)?.price || BigInt(0),
    }))

    setUserItems(userItems)
    setStatus("idle")
  }, [userIds.join(","), userListings])

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

  const setTokenProp = <K extends keyof UserNft>(id: bigint, prop: K, value: UserNft[K] | null) => {
    setUserItems((prev: any) => prev.map((item: any) => (item.id === id ? { ...item, [prop]: value } : item)))
  }

  const { data: isApproved, refetch } = useReadContract({
    address: collection || undefined,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: collection && address ? [address, MARKETPLACE_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: Boolean(collection && address),
    },
  })

  const approveCollection = async (id: bigint) => {
    if (!collection) return
    setTx(id, { txStatus: "waiting" })

    try {
      const hash = await writeContractAsync({
        address: collection,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_CONTRACT_ADDRESS, true],
      })

      setTx(id, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTx(id, { txStatus: "success" })

      setTimeout(async () => {
        await refetch()
        setTx(id, { txStatus: "idle" })
      }, 3500)
    } catch (e) {
      setTx(id, { txStatus: "error" })
      setTimeout(() => {
        setTx(id, { txStatus: "idle" })
      }, 3500)
    }
  }

  const handleList = async (e: any, id: bigint) => {
    if (!collection || tokenId === "" || Number(price) <= 0) return
    if (e.target.id == "input-price") return
    setTx(id, { txStatus: "waiting" })
    try {
      const _price = parseEther(String(price))
      const hash = await list(Number(id), _price)
      setTx(id, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTx(id, { txStatus: "success" })
      setTimeout(async () => {
        if (!loadingQueryRef.current) {
          loadingQueryRef.current = true

          await queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] })
          await queryClient.invalidateQueries({ queryKey: ["user-tokens", address] })

          setTimeout(() => {
            loadingQueryRef.current = false
          }, 5000)
        }

        setTokenProp(id, "listed", true)
        setTokenProp(id, "price", _price)
        setTx(id, { txStatus: "idle", txHash: undefined })
        setTokenId("")
        setPrice("")
      }, 3500)
    } catch (e) {
      setTx(id, { txStatus: "error" })
      setTimeout(() => {
        setTx(id, { txStatus: "idle", txHash: undefined })
        setTokenId("")
        setPrice("")
      }, 3500)
    }
  }

  const handleDelist = async (id: bigint) => {
    if (!collection || tokenId === "") return
    setTx(id, { txStatus: "waiting" })
    try {
      const hash = await cancelList(collection, Number(tokenId))
      setTx(id, { txStatus: "loading", txHash: hash })

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTx(id, { txStatus: "success", txHash: undefined })
      setTimeout(async () => {
        if (!loadingQueryRef.current) {
          loadingQueryRef.current = true

          await queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] })
          await queryClient.invalidateQueries({ queryKey: ["user-tokens", address] })

          setTimeout(() => {
            loadingQueryRef.current = false
          }, 5000)
        }
        setTx(id, { txStatus: "idle", txHash: undefined })
        setTokenProp(id, "listed", false)
        setTokenId("")
        setPrice("")
      }, 3500)
    } catch (e) {
      setTx(id, { txStatus: "error" })
      setTimeout(() => {
        setTx(id, { txStatus: "idle", txHash: undefined })
        setTokenId("")
        setPrice("")
      }, 3500)
    }
  }

  const handleBgClick = (e: any) => {
    if (e.target.id == "input-price") return
    if (e.target.id != "list-btn") {
      setTokenId("")
      setPrice("")
    }
  }

  return (
    <div onClick={handleBgClick} className=" flex flex-col gap-2">
      {!address && (
        <div className="w-full flex justify-center">
          <div className="w-50">
            <ConnectWallet textMsg="CONNECT WALLET" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
        {status == "loading" && (
          <div className="w-full relative flex justify-center  aspect-square  px-4  animate-pulse">
            <div className="absolute w-full h-full bg-(--accent) opacity-50 rounded"></div>
          </div>
        )}
        {items.length > 0 &&
          items.map((i, index) => {
            const key = i.id.toString()
            const tx = txMap[key] ?? { txStatus: "idle" }

            return (
              <AnimatePresence key={i.id.toString()}>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.1 }}
                  className="aspect-square min-w-25 relative hover:scale-103 transition-all duration-300 overflow-hidden text-white"
                >
                  <button
                    id="list-btn"
                    onClick={(e) => {
                      if (!isApproved) {
                        setTokenId(i.id)
                        approveCollection(i.id)
                      } else {
                        if (tokenId == i.id) {
                          if (i.listed) {
                            handleDelist(i.id)
                          } else {
                            handleList(e, i.id)
                          }
                        } else {
                          setPrice("")
                          return setTokenId(i.id)
                        }
                      }
                    }}
                    className="absolute w-full h-full left-0 bg-transparent!  rounded z-100 hover:none!"
                  ></button>
                  <div className="bg-(--accent) relative w-full h-full transition-all duration-300  rounded  disabled:opacity-50 overflow-hidden">
                    <div className={"absolute transition-all duration-300 text-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}>
                      <AnimatePresence mode="wait">
                        {!isApproved && (tx.txStatus === "idle" || tokenId != i.id) && (
                          <motion.div
                            key="idle"
                            initial={{ opacity: 0, translateY: 33 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: 33 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-center text-center w-full"
                          >
                            <span>Approve</span>
                          </motion.div>
                        )}

                        {!isApproved && tokenId == i.id && tx.txStatus === "waiting" && (
                          <motion.div
                            key="waiting"
                            initial={{ opacity: 0, translateY: 33 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: 33 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-center text-center w-full"
                          >
                            <span>Sign...</span>
                          </motion.div>
                        )}
                        {!isApproved && tokenId == i.id && tx.txHash && (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, translateY: 33 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: 33 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-4 justify-center flex-col items-center  text-center w-full absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-200"
                          >
                            {tx.txStatus === "loading" && (
                              <svg className="w-8 h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="20" strokeLinecap="round" />
                              </svg>
                            )}
                            {tx.txStatus === "success" && <FiCheckCircle className="text-[#6dfa6d]" />}
                            {tx.txStatus === "error" && <RxCrossCircled className="text-red-500" />}
                            <a target="_blank" href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200">
                              <FaLink />
                              <span>Tx: </span>
                              <span>
                                {tx.txHash?.slice(0, 6)}...{tx.txHash?.slice(-4)}
                              </span>
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {isApproved && !tx.txHash && !i.listed && (
                      <AnimatePresence mode="wait">
                        {tokenId == i.id && (tx.txStatus == "idle" || tx.txStatus == "waiting") && (
                          <motion.div
                            className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-250"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-2 h-min flex justify-center  w-full  relative ">
                              <div className="flex justify-center gap-1 px-2 overflow-visible">
                                <input
                                  id="input-price"
                                  type="number"
                                  className=" bg-transparent! rounded text-center w-16 overflow-visible "
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
                      <div
                        className={
                          "absolute transition-all duration-300 " + (tokenId == i.id || tx.txHash ? "top-2 left-3" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm lg:text-xl")
                        }
                      >
                        <AnimatePresence>
                          {(tx.txStatus == "idle" || (tokenId != i.id && !tx.txHash) || i.listed) && (
                            <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                              {i.listed ? <div>{Number(i.price) / 1e18} ETH</div> : "List"}
                            </motion.div>
                          )}
                          {(tokenId == i.id || tx.txHash) &&
                            ((tx.txStatus == "waiting" && !i.listed && (
                              <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                                <span>Sign...</span>
                              </motion.div>
                            )) ||
                              (tx.txStatus == "loading" && !i.listed && (
                                <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                                  <span>Listing...</span>
                                </motion.div>
                              )))}
                        </AnimatePresence>
                      </div>
                    )}
                    {isApproved && i.listed && tokenId == i.id && (
                      <div className={"absolute transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}>
                        <AnimatePresence>
                          {((tx.txStatus == "idle" && i.listed) || tokenId != i.id) && (
                            <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                              Delist
                            </motion.div>
                          )}
                          {tokenId == i.id && tx.txStatus == "waiting" && (
                            <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                              <span>Sign...</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    {tx.txHash && isApproved && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 justify-center flex-col items-center  text-center w-full absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-200"
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
                        <a target="_blank" href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200 text-xs md:text-sm lg:text-xl">
                          <FaLink />
                          <span>Tx: </span>
                          <span>
                            {tx.txHash?.slice(0, 6)}...{tx.txHash?.slice(-4)}
                          </span>
                        </a>
                      </motion.div>
                    )}

                    <span className="absolute bottom-1 right-2  text-xs text-(--bg-secondary)!">
                      <strong className=" opacity-50  ">id: </strong>
                      {i.id}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            )
          })}
      </div>
    </div>
  )
}
