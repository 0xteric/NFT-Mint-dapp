"use client"

import { useReadContract, useWriteContract, usePublicClient } from "wagmi"
import { nftAbi, marketplaceAbi } from "@/lib/abi"
import { NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/constants"
import { indexMarketplace } from "./useMarketplaceIndex"
import { useQuery } from "@tanstack/react-query"

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

export function useUserTokens(address: `0x${string}`) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["user-tokens", address],
    enabled: Boolean(address),
    queryFn: async () => {
      return publicClient?.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: nftAbi,
        functionName: "tokensOfOwner",
        args: [address],
      })
    },
  })
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

///// MARKETPLACE //////

// ----------- READ HOOKS ------------

export function useMarketplaceInfo() {
  const { data: marketplaceFee }: any = useReadContract({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: marketplaceAbi,
    functionName: "marketplaceFee",
  })

  const { data: feeReceiver }: any = useReadContract({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: marketplaceAbi,
    functionName: "feeReceiver",
  })

  const { data: totalListings }: any = useReadContract({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: marketplaceAbi,
    functionName: "totalListings",
  })

  const { data: totalSales, refetch: refetchTotalSales }: any = useReadContract({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: marketplaceAbi,
    functionName: "totalSales",
  })

  const { data: totalVolume, refetch: refetchTotalVolume }: any = useReadContract({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: marketplaceAbi,
    functionName: "totalVolume",
  })

  console.log(marketplaceFee, feeReceiver, totalListings, totalSales, totalVolume, refetchTotalSales, refetchTotalVolume)

  return { marketplaceFee, feeReceiver, totalListings, totalSales, totalVolume, refetchTotalSales, refetchTotalVolume }
}

export function useMarketplaceListings(fromBlock: bigint) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const listings = await indexMarketplace(publicClient, fromBlock)
      return listings.filter((l) => l.status === "ACTIVE")
    },
    staleTime: 30_000, // 30s
    refetchOnWindowFocus: false,
  })
}

// ----------- WRITE HOOKS ------------

export function useList() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const list = async (tokenId: number, price: bigint) => {
    const collection = NFT_CONTRACT_ADDRESS
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "list",
      args: [collection, BigInt(tokenId), price],
    })
    return txHash
  }

  return { list, publicClient }
}

export function useCancelList() {
  const { writeContractAsync } = useWriteContract()

  const cancelList = async (collection: `0x${string}`, tokenId: number) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "cancelList",
      args: [collection, BigInt(tokenId)],
    })
    return txHash
  }

  return { cancelList }
}

export function useBuy() {
  const { writeContractAsync } = useWriteContract()
  const collection = NFT_CONTRACT_ADDRESS

  const buy = async (tokenId: bigint, value: bigint) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "buy",
      args: [collection, tokenId],
      value,
    })
    return txHash
  }

  return { buy }
}

export function useBidToken() {
  const { writeContractAsync } = useWriteContract()

  const bidToken = async (collection: `0x${string}`, tokenId: number, price: bigint) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "bidToken",
      args: [collection, BigInt(tokenId), price],
      value: price,
    })
    return txHash
  }

  return { bidToken }
}

export function useCancelTokenBid() {
  const { writeContractAsync } = useWriteContract()

  const cancelTokenBid = async (collection: `0x${string}`, tokenId: number) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "cancelTokenBid",
      args: [collection, BigInt(tokenId)],
    })
    return txHash
  }

  return { cancelTokenBid }
}

export function useAcceptTokenBid() {
  const { writeContractAsync } = useWriteContract()

  const acceptTokenBid = async (collection: `0x${string}`, bidder: `0x${string}`, tokenId: number) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "acceptTokenBid",
      args: [collection, bidder, BigInt(tokenId)],
    })
    return txHash
  }

  return { acceptTokenBid }
}

export function useBidCollection() {
  const { writeContractAsync } = useWriteContract()

  const bidCollection = async (collection: `0x${string}`, price: bigint, quantity: number) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "bidCollection",
      args: [collection, price, BigInt(quantity)],
      value: price * BigInt(quantity),
    })
    return txHash
  }

  return { bidCollection }
}

export function useCancelCollectionBid() {
  const { writeContractAsync } = useWriteContract()

  const cancelCollectionBid = async (collection: `0x${string}`) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "cancelCollectionBid",
      args: [collection],
    })
    return txHash
  }

  return { cancelCollectionBid }
}

export function useAcceptCollectionBid() {
  const { writeContractAsync } = useWriteContract()

  const acceptCollectionBid = async (collection: `0x${string}`, bidder: `0x${string}`, tokenIds: number[]) => {
    const txHash = await writeContractAsync({
      address: MARKETPLACE_CONTRACT_ADDRESS,
      abi: marketplaceAbi,
      functionName: "acceptCollectionBid",
      args: [collection, bidder, tokenIds.map((id) => BigInt(id))],
    })
    return txHash
  }

  return { acceptCollectionBid }
}
