"use client"

import { useState, useEffect } from "react"
import { Address, parseEther, erc721Abi } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { MARKETPLACE_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "@/lib/constants"
import { useList, useCancelList } from "./Contract"
import { motion, AnimatePresence } from "framer-motion"
import ConnectWallet from "./ConnectWallet"
import { FaLink } from "react-icons/fa"
import { FiCheckCircle } from "react-icons/fi"
import { RxCrossCircled } from "react-icons/rx"
import { ListedNFTSProps, ListedNft, UserNft } from "@/lib/constants"

export default function ListNftWithApproval({ userListings }: ListedNFTSProps) {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { list, publicClient } = useList()
  const { cancelList } = useCancelList()

  const [collection, setCollection] = useState<Address | "">(NFT_CONTRACT_ADDRESS)
  const [localUserListings, setLocalUserListings] = useState<ListedNft[]>([])
  const [tokenId, setTokenId] = useState<bigint | "">("")
  const [price, setPrice] = useState<number | string>("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("loading")
  const [items, setUserItems] = useState<UserNft[]>([])

  useEffect(() => {
    setLocalUserListings(userListings)
  }, [userListings])

  useEffect(() => {
    if (!address) return
    loadTokens()
  }, [address, localUserListings])

  const loadTokens = async () => {
    if (!address) return
    try {
      const tokens: any = await publicClient?.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: nftAbi,
        functionName: "tokensOfOwner",
        args: [address],
      })
      tokens.sort((a: any, b: any) => Number(a) - Number(b))

      const _items: UserNft[] = tokens.map((t: bigint) => {
        return { id: t, price: BigInt(0), listed: false, txHash: null, txStatus: "idle" }
      })
      if (localUserListings.length > 0) {
        const userItems = _items.map((item: any) => ({
          ...item,
          listed: localUserListings.some((l) => l.tokenId == item.id),
          price: localUserListings.find((l) => l.tokenId == item.id)?.price,
          txStatus: "idle",
        }))
        setTimeout(() => {
          setUserItems(userItems)
          console.log(userItems, localUserListings)
        }, 100)
      } else {
        setUserItems(_items)
      }
      setStatus("idle")
    } catch (err) {
      console.error("Error cargando tokens:", err)
      setUserItems([])
    }
  }

  const setTokenProp = <K extends keyof UserNft>(id: bigint, prop: K, value: UserNft[K] | null) => {
    setUserItems((prev) => prev.map((item) => (item.id === id ? { ...item, [prop]: value } : item)))
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

  const approveCollection = async () => {
    if (!collection) return
    setTokenProp(BigInt(tokenId), "txStatus", "waiting")

    try {
      const hash = await writeContractAsync({
        address: collection,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_CONTRACT_ADDRESS, true],
      })

      setTokenProp(BigInt(tokenId), "txHash", hash)

      setTokenProp(BigInt(tokenId), "txStatus", "loading")
      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTokenProp(BigInt(tokenId), "txStatus", "success")

      setTimeout(async () => {
        await refetch()
        setTokenProp(BigInt(tokenId), "txStatus", "idle")
        setTokenProp(BigInt(tokenId), "txHash", null)
      }, 3500)
    } catch (e) {
      setTokenProp(BigInt(tokenId), "txStatus", "error")
      setTimeout(() => {
        setTokenProp(BigInt(tokenId), "txStatus", "idle")
        setTokenProp(BigInt(tokenId), "txHash", null)
      }, 3500)
    }
  }

  const handleList = async (e: any) => {
    if (!collection || tokenId === "" || Number(price) <= 0) return
    if (e.target.id == "input-price") return
    setTokenProp(BigInt(tokenId), "txStatus", "waiting")
    try {
      const _price = parseEther(String(price))
      const hash = await list(Number(tokenId), _price)
      setTokenProp(BigInt(tokenId), "txStatus", "loading")
      setTokenProp(BigInt(tokenId), "txHash", hash)

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTokenProp(BigInt(tokenId), "txStatus", "success")
      setTimeout(() => {
        setTokenProp(BigInt(tokenId), "txStatus", "idle")
        setTokenProp(BigInt(tokenId), "listed", true)
        setTokenProp(BigInt(tokenId), "price", _price)
        setTokenProp(BigInt(tokenId), "txHash", null)
      }, 3500)
    } catch (e) {
      setTokenProp(BigInt(tokenId), "txStatus", "error")
      setTimeout(() => {
        setTokenProp(BigInt(tokenId), "txStatus", "idle")
        setTokenProp(BigInt(tokenId), "txHash", null)
      }, 3500)
    }
  }

  const handleDelist = async (e: any) => {
    if (!collection || tokenId === "") return
    if (e.target.id == "input-price") return
    setTokenProp(BigInt(tokenId), "txStatus", "waiting")
    try {
      const hash = await cancelList(collection, Number(tokenId))
      setTokenProp(BigInt(tokenId), "txStatus", "loading")
      setTokenProp(BigInt(tokenId), "txHash", hash)

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash,
      })

      setTokenProp(BigInt(tokenId), "txStatus", "success")
      setTimeout(() => {
        setTokenProp(BigInt(tokenId), "txStatus", "idle")
        setTokenProp(BigInt(tokenId), "listed", false)
        setTokenProp(BigInt(tokenId), "txHash", null)
      }, 3500)
    } catch (e) {
      setTokenProp(BigInt(tokenId), "txStatus", "error")
      setTimeout(() => {
        setTokenProp(BigInt(tokenId), "txStatus", "idle")
        setTokenProp(BigInt(tokenId), "txHash", null)
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
      {status === "idle" && !items.length && <div className="w-full flex justify-center rounded  p-4 ">No NFTs</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {status === "loading" && <div className="w-full flex justify-center rounded py-27 px-4 bg-(--accent) animate-pulse"></div>}
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
          {items.map((i, index) => (
            <AnimatePresence key={i.id.toString()}>
              <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.1, delay: index * 0.1 }}
                className="aspect-square min-w-25 relative hover:scale-103 transition-all duration-300 overflow-hidden text-white"
              >
                <button
                  id="list-btn"
                  onClick={(e) => {
                    if (!isApproved) {
                      setTokenId(i.id)
                      approveCollection()
                    } else {
                      if (tokenId == i.id) {
                        if (i.listed) {
                          handleDelist(e)
                        } else {
                          handleList(e)
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
                      {!isApproved && (i.txStatus === "idle" || tokenId != i.id) && (
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

                      {!isApproved && tokenId == i.id && i.txStatus === "waiting" && (
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
                      {!isApproved && tokenId == i.id && i.txHash && (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, translateY: 33 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          exit={{ opacity: 0, translateY: 33 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-4 justify-center flex-col items-center  text-center w-full absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-200"
                        >
                          {i.txStatus === "loading" && (
                            <svg className="w-8 h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="20" strokeLinecap="round" />
                            </svg>
                          )}
                          {i.txStatus === "success" && <FiCheckCircle className="text-[#6dfa6d]" />}
                          {i.txStatus === "error" && <RxCrossCircled className="text-red-500" />}
                          <a target="_blank" href={`https://sepolia.etherscan.io/tx/${i.txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200">
                            <FaLink />
                            <span>Tx: </span>
                            <span>
                              {i.txHash?.slice(0, 6)}...{i.txHash?.slice(-4)}
                            </span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {isApproved && !txHash && !i.listed && (
                    <AnimatePresence mode="wait">
                      {tokenId == i.id && (i.txStatus == "idle" || i.txStatus == "waiting") && (
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
                    <div className={"absolute transition-all duration-300 " + (tokenId == i.id || i.txHash ? "top-2 left-3" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:text-2xl")}>
                      <AnimatePresence>
                        {(i.txStatus == "idle" || (tokenId != i.id && !i.txHash) || i.listed) && (
                          <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                            {i.listed ? <div>{Number(i.price) / 1e18} ETH</div> : "List"}
                          </motion.div>
                        )}
                        {(tokenId == i.id || i.txHash) &&
                          ((i.txStatus == "waiting" && !i.listed && (
                            <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                              <span>Sign...</span>
                            </motion.div>
                          )) ||
                            (i.txStatus == "loading" && !i.listed && (
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
                        {((i.txStatus == "idle" && i.listed) || tokenId != i.id) && (
                          <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                            Delist
                          </motion.div>
                        )}
                        {tokenId == i.id && i.txStatus == "waiting" && (
                          <motion.div initial={{ opacity: 0, translateY: 3 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -3 }} transition={{ duration: 0.3 }}>
                            <span>Sign...</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {i.txHash && isApproved && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 justify-center flex-col items-center  text-center w-full absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-200"
                    >
                      {i.txStatus === "loading" && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                          <svg className=" w-4 h-4 lg:w-8 lg:h-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="20" strokeLinecap="round" />
                          </svg>
                        </motion.div>
                      )}
                      {i.txStatus === "success" && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                          <FiCheckCircle className="text-[#6dfa6d] w-4 h-4 lg:w-8 lg:h-8" />
                        </motion.div>
                      )}
                      {i.txStatus === "error" && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }}>
                          <RxCrossCircled className="text-red-500 w-4 h-4 lg:w-8 lg:h-8" />
                        </motion.div>
                      )}
                      <a target="_blank" href={`https://sepolia.etherscan.io/tx/${i.txHash}`} className=" flex  items-center gap-2 hover:opacity-80 z-200 text-xs lg:text-xl">
                        <FaLink />
                        <span>Tx: </span>
                        <span>
                          {i.txHash?.slice(0, 6)}...{i.txHash?.slice(-4)}
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
          ))}
        </div>
      )}
    </div>
  )
}
