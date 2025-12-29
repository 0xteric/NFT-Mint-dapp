"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from "wagmi"
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
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  })
  const { switchChain } = useSwitchChain()

  if (!mounted) {
    return null
  }

  if (isConnected && chainId !== sepolia.id) {
    return (
      <button onClick={() => switchChain({ chainId: sepolia.id })} className="px-3 py-1 rounded">
        Switch to sepolia
      </button>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4 border rounded border-(--accent) relative">
        <div className="absolute bg-(--accent) opacity-25 w-full h-full z-0"></div>
        {balance?.value && <span className="pl-2 z-10">{(Number(balance?.value) / 1e18).toFixed(3)} ETH</span>}
        <span className="z-10">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button onClick={() => disconnect()} className="px-3 py-1 rounded-r z-10">
          DISCONNECT
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => connect({ connector: injected() })} className="px-3 py-1 rounded">
      CONNECT WALLET
    </button>
  )
}
