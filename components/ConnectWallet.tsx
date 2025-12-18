"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { sepolia } from "viem/chains"
import { injected } from "wagmi/connectors"

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { address, isConnected, chainId } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const { switchChain } = useSwitchChain()

  if (!mounted) {
    return null
  }

  if (isConnected && chainId !== sepolia.id) {
    return (
      <button onClick={() => switchChain({ chainId: sepolia.id })} className="px-3 py-1 border rounded">
        Switch to sepolia
      </button>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button onClick={() => disconnect()} className="px-3 py-1 border rounded">
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => connect({ connector: injected() })} className="px-4 py-2 border rounded">
      Connect Wallet
    </button>
  )
}
