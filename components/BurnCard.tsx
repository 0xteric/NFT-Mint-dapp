"use client"

import { useAccount, usePublicClient, useWalletClient, useBalance } from "wagmi"
import { useBurn } from "./Contract"
import { NFT_CONTRACT_ADDRESS } from "@/lib/constants"
import { nftAbi } from "@/lib/abi"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function BurnCard() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const walletClient = useWalletClient()
  const { burn } = useBurn()

  const [status, setStatus] = useState<"idle" | "waiting" | "loading" | "success" | "error">("idle")
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [burningId, setBurningId] = useState<number | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { refetch: refetchBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  })

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

  const handleBurn = async (tokenId: number) => {
    if (!walletClient) return
    setBurningId(tokenId)
    try {
      const tx = await burn(tokenId)

      setTxHash(tx)

      setStatus("loading")

      const TxReceipt = await publicClient?.waitForTransactionReceipt({
        hash: tx,
      })

      if (TxReceipt?.status === "reverted") throw new Error("Reverted")

      refetchBalance()

      setStatus("success")

      setTimeout(() => {
        setStatus("idle")
        setTxHash(null)
      }, 3500)
      setTokenIds((prev) => prev.filter((id) => id !== tokenId))
    } catch (err) {
      console.error(err)
      setStatus("error")
    }
    setBurningId(null)
  }

  return (
    <div className="card rounded p-4 flex flex-col gap-4 min-w-[250px] min-h-[150px]">
      <h2 className="text-lg font-bold">Your NFTs</h2>

      {(!address && <p>Connect your wallet to burn NFTs</p>) ||
        (loading && <p>Loading your NFTs...</p>) ||
        (tokenIds.length === 0 && (
          <div className=" rounded border border-(--accent) text-center flex items-center p-6 text-(--accent) opacity-70  w-fit aspect-square">
            <span>No NFTs</span>
          </div>
        ))}
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
                <button onClick={() => handleBurn(id)} disabled={burningId === id} className="relative w-full h-full  rounded hover:opacity-80 disabled:opacity-50">
                  {burningId === id ? "Burning..." : "Burn"}
                  <span className="absolute bottom-1 right-2 text-sm text-(--bg-secondary)!">{id}</span>
                </button>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      )}
      <AnimatePresence>
        {txHash && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute justify-center flex w-full left-0 top-[-46px]"
          >
            <div className=" flex flex-row gap-2 items-center w-fit rounded card p-2">
              {(status == "loading" || status === "waiting") && (
                <svg className="w-4 h-4 animate-spin text-(--accent)" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeDasharray="28 56" strokeLinecap="round" />
                </svg>
              )}
              {status == "success" && (
                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              )}
              {status == "error" && (
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-75" />

                  <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}

              <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`} className=" hover:opacity-80">
                <span>Tx: </span>
                <span>
                  {txHash?.slice(0, 6)}...{txHash?.slice(-4)}
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
