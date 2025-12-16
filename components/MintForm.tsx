"use client"

import { useEffect, useState } from "react"
import MintStatus from "@/components/MintStatus"

export default function MintForm() {
  const [amount, setAmount] = useState<number>(1)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (amount < 1 || amount > 5) {
      setError("Mint amount must be > 0 & < 6")
    } else {
      setError(null)
    }
  })

  const handleMint = () => {
    if (error) return

    setStatus("loading")

    setTimeout(() => {
      setStatus("success")
      setTimeout(() => {
        setStatus("idle")
      }, 1500)
    }, 1500)
  }

  return (
    <div className="flex flex-col items-center w-55 p-2 rounded justify-center">
      <div className="flex w-full rounded overflow-hidden">
        <input type="number" min={1} max={5} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="border-none px-2 w-full focus:outline-none bg-[#222222] flex-3" />

        <button className="px-2 py-1 text-center bg-black mint-button flex-2" onClick={handleMint} disabled={status === "loading" || !!error}>
          {status === "loading" ? "Minting..." : "Mint"}
        </button>
      </div>
      <MintStatus status={status} />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {status === "success" && <p className="text-green-400 text-sm">Mint successful!</p>}
    </div>
  )
}
