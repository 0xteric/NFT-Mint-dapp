"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from "wagmi"
import { sepolia } from "viem/chains"
import { injected } from "wagmi/connectors"
import { LuWallet } from "react-icons/lu"
import { FaEthereum } from "react-icons/fa"

export default function ConnectWallet({ textMsg }: any) {
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
      <div className="flex  lg:flex-row flex-col items-center gap-4  lg:border rounded border-(--accent) relative">
        <div className="absolute left-0 bg-(--accent) opacity-25 w-full h-full -z-10"></div>
        <span className="px-2 h-full flex items-center  lg:border-r border-(--accent)/30 gap-2">
          <span className=" opacity-100!">{balance?.value && (Number(balance?.value) / 1e18).toFixed(3)}</span>
          <span className="opacity-75">
            <FaEthereum />
          </span>
        </span>
        <span>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button onClick={() => disconnect()} className="px-3 py-1 h-full rounded lg:rounded-none">
          DISCONNECT
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => connect({ connector: injected() })} className="px-3 py-1 rounded w-full text-center">
      <span className="flex  w-full items-center gap-2  justify-center">
        {textMsg}
        <LuWallet />
      </span>
    </button>
  )
}
