"use client"

import { useReadContract, useWriteContract, usePublicClient, useBalance } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { NFT_CONTRACT_ADDRESS } from "@/lib/constants"

export function useNftStats() {
  const { data: totalSupply } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: nftAbi,
    functionName: "totalSupply",
    query: {
      refetchInterval: false,
    },
  })

  const { data: maxSupply } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: nftAbi,
    functionName: "maxSupply",
  })

  const { data: mintPrice } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: nftAbi,
    functionName: "mintPrice",
  })

  return {
    totalSupply,
    maxSupply,
    mintPrice,
  }
}

export function useMint() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const mint = async (amount: number, mintPrice: bigint) => {
    const hash = await writeContractAsync({
      address: NFT_CONTRACT_ADDRESS,
      abi: nftAbi,
      functionName: "mint",
      args: [BigInt(amount)],
      value: mintPrice * BigInt(amount),
    })

    return hash
  }

  return { mint, publicClient }
}

export function useBurn() {
  const { writeContractAsync } = useWriteContract()

  const burn = async (tokenId: number) => {
    const hash = await writeContractAsync({
      address: NFT_CONTRACT_ADDRESS,
      abi: nftAbi,
      functionName: "burn",
      args: [BigInt(tokenId)],
    })
    return hash
  }

  return { burn }
}
