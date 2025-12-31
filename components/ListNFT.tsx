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

  // 🔍 Check approval
  const { data: isApproved, refetch } = useReadContract({
    address: collection || undefined,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: collection && address ? [address, MARKETPLACE_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: Boolean(collection && address),
    },
  })

  // 🟢 Approve collection
  const approveCollection = async () => {
    if (!collection) return
    setLoading(true)
    try {
      const hash = await writeContractAsync({
        address: collection,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_CONTRACT_ADDRESS, true],
      })
      setTxHash(hash)
      await refetch()
    } finally {
      setLoading(false)
    }
  }

  // 🟣 List NFT
  const handleList = async () => {
    if (!collection || tokenId === "" || Number(price) <= 0) return
    setLoading(true)
    try {
      const hash = await list(tokenId as number, parseEther(String(price)))
      setTxHash(hash)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4   space-y-4">
      <h2 className="text-lg font-bold">Listar NFT</h2>

      {tokenIds.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {tokenIds.map((id, index) => (
            <AnimatePresence key={id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="aspect-square min-w-25"
              >
                <button
                  onClick={() => {
                    if (tokenId == id) {
                      if (!isApproved) {
                        approveCollection()
                      } else {
                        handleList()
                      }
                    } else {
                      return setTokenId(id)
                    }
                  }}
                  className="relative w-full h-full transition-all duration-300  rounded hover:opacity-80 disabled:opacity-50 overflow-hidden"
                >
                  <span className={"absolute transition-all duration-300 " + (tokenId == id ? "-translate-y-20.5 -translate-x-20.5" : "-translate-y-4.5 -translate-x-2.5")}>
                    {isApproved ? "List" : "Approve"}
                  </span>
                  {tokenId == id && (
                    <AnimatePresence>
                      <motion.div
                        className="absolute  top-[37%] w-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="p-2 h-min flex justify-center  w-full  relative">
                          <div className="flex justify-center gap-1">
                            <input id="input-price" type="number" className=" bg-transparent! w-6 rounded" placeholder="0.0" autoFocus value={price} onChange={(e) => setPrice(e.target.value)} />
                            <span>ETH</span>
                          </div>
                        </div>
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
