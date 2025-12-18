"use client"

import { useReadContract, useWriteContract } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { NFT_CONTRACT_ADDRESS } from "@/lib/constants"

export function useNftStats() {
  const { data: totalSupply } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: nftAbi,
    functionName: "totalSupply",
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

  const mint = async (amount: number, mintPrice: bigint) => {
    return writeContractAsync({
      address: NFT_CONTRACT_ADDRESS,
      abi: nftAbi,
      functionName: "mint",
      args: [BigInt(amount)],
      value: mintPrice * BigInt(amount),
    })
  }

  return { mint }
}
