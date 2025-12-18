"use client"

import { useEffect, useState } from "react"
import MintStatus from "@/components/MintStatus"
import { useMint, useNftStats } from "@/components/Contract"

export default function MintForm() {
  const [amount, setAmount] = useState(1)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const { mintPrice } = useNftStats()
  const { mint } = useMint()

  useEffect(() => {
    if (amount < 1 || amount > 5) {
      setError("Mint amount must be > 0 & < 6")
    } else {
      setError(null)
    }
  }, [amount])

  const handleMint = async () => {
    if (!mintPrice || error) return

    try {
      setStatus("loading")
      await mint(amount, mintPrice)
      setStatus("success")
    } catch (e) {
      console.error(e)
      setStatus("error")
    }
  }

  return (
    <div className="flex flex-col items-center w-55 p-2 rounded">
      <div className="flex w-full rounded overflow-hidden">
        <input type="number" min={1} max={5} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="border-none px-2 w-full bg-[#222]" />

        <button onClick={handleMint} disabled={status === "loading" || !!error} className="px-2 py-1 bg-black">
          {status === "loading" ? "Minting..." : "Mint"}
        </button>
      </div>

      <MintStatus status={status} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
