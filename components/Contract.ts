"use client"

import { useReadContract, useWriteContract, usePublicClient } from "wagmi"
import { nftAbi, marketplaceAbi, marketplaceCoreABI, bidsABI, paymentsABI } from "@/lib/abi"
import { NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS, CORE_CONTRACT_ADDRESS, BIDS_CONTRACT_ADDRESS, PAYMENTS_CONTRACT_ADDRESS } from "@/lib/constants"
import { indexMarketplaceBids, indexMarketplaceListings } from "./useMarketplaceIndex"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"

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

export function useUserTokens(address: `0x${string}`, collections: any[], enabled = false) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["user-tokens", address],
    enabled: Boolean(address && collections?.length && enabled),
    queryFn: async () => {
      const tokens: { tokenId: bigint; collection: Address }[] = []
      for (let i = 0; i < collections.length; i++) {
        try {
          const _tokens: any = await publicClient?.readContract({
            address: collections[i].collection,
            abi: nftAbi,
            functionName: "tokensOfOwner",
            args: [address],
          })
          for (let t of _tokens as bigint[]) {
            tokens.push({ tokenId: t, collection: collections[i].collection })
          }
        } catch (e) {
          console.log("Error useUserTokens: ", e)
        }
      }
      return { tokens: tokens }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
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
    address: PAYMENTS_CONTRACT_ADDRESS,
    abi: paymentsABI,
    functionName: "marketplaceFee",
  })

  const { data: feeReceiver }: any = useReadContract({
    address: PAYMENTS_CONTRACT_ADDRESS,
    abi: paymentsABI,
    functionName: "feeReceiver",
  })

  const { data: totalListings, refetch: refetchTotalListings }: any = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: marketplaceCoreABI,
    functionName: "totalListings",
  })

  const { data: totalSales, refetch: refetchTotalSales }: any = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: marketplaceCoreABI,
    functionName: "totalSales",
  })

  const { data: totalVolume, refetch: refetchTotalVolume }: any = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: marketplaceCoreABI,
    functionName: "totalVolume",
  })

  return { marketplaceFee, feeReceiver, totalListings, totalSales, totalVolume, refetchTotalSales, refetchTotalVolume, refetchTotalListings }
}

export function useMarketplaceListingsIndex(fromBlock: bigint) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["marketplace-core-index"],
    queryFn: async () => {
      const { listings, collections } = await indexMarketplaceListings(publicClient, fromBlock)
      return { listings: listings.filter((l: any) => l.status === "ACTIVE"), collections: collections }
    },
    staleTime: 30_000, // 30s
    refetchOnWindowFocus: false,
  })
}
export function useMarketplaceBidsIndex(fromBlock: bigint) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["marketplace-bids-index"],
    queryFn: async () => {
      const { tokenBids, collectionBids } = await indexMarketplaceBids(publicClient, fromBlock)
      return { tokenBids: tokenBids.filter((b: any) => b.status === "ACTIVE"), collectionBids: collectionBids.filter((b: any) => b.status === "ACTIVE") }
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
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "list",
      args: [collection, BigInt(tokenId), price],
    })
    return txHash
  }

  return { list, publicClient }
}

export function useListBatch() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const listBatch = async (_collections: `0x${string}`[], _tokenIds: bigint[], prices: bigint[]) => {
    const txHash = await writeContractAsync({
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "listBatch",
      args: [_collections, _tokenIds, prices],
    })
    return txHash
  }

  return { listBatch, publicClient }
}

export function useCancelList() {
  const { writeContractAsync } = useWriteContract()

  const cancelList = async (collection: `0x${string}`, tokenId: number) => {
    const txHash = await writeContractAsync({
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "cancelList",
      args: [collection, BigInt(tokenId)],
    })
    return txHash
  }

  return { cancelList }
}

export function useCancelListBatch() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const cancelListBatch = async (_collections: `0x${string}`[], _tokenIds: bigint[]) => {
    const txHash = await writeContractAsync({
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "cancelListBatch",
      args: [_collections, _tokenIds],
    })
    return txHash
  }

  return { cancelListBatch, publicClient }
}

export function useBuy() {
  const { writeContractAsync } = useWriteContract()
  const collection = NFT_CONTRACT_ADDRESS

  const buy = async (tokenId: bigint, value: bigint) => {
    const txHash = await writeContractAsync({
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "buy",
      args: [collection, tokenId],
      value,
    })
    return txHash
  }

  return { buy }
}

export function useBuyBatch() {
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const buyBatch = async (_collection: `0x${string}`, _tokenIds: bigint[]) => {
    const txHash = await writeContractAsync({
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "buyBatch",
      args: [_collection, _tokenIds],
    })
    return txHash
  }

  return { buyBatch, publicClient }
}

export function useBidToken() {
  const { writeContractAsync } = useWriteContract()

  const bidToken = async (tokenId: bigint, price: bigint) => {
    const txHash = await writeContractAsync({
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "bidToken",
      args: [MARKETPLACE_CONTRACT_ADDRESS, tokenId, price],
      value: price,
    })
    return txHash
  }

  return { bidToken }
}

export function useBidTokenBatch() {
  const { writeContractAsync } = useWriteContract()

  const bidTokenBatch = async (collection: `0x${string}`, tokenIds: bigint[], prices: bigint[], totalValue: bigint) => {
    const txHash = await writeContractAsync({
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "bidTokenBatch",
      args: [collection, tokenIds, prices],
      value: totalValue,
    })
    return txHash
  }

  return { bidTokenBatch }
}

export function useCancelTokenBid() {
  const { writeContractAsync } = useWriteContract()

  const cancelTokenBid = async (collection: `0x${string}`, tokenId: number) => {
    const txHash = await writeContractAsync({
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "cancelTokenBid",
      args: [collection, BigInt(tokenId)],
    })
    return txHash
  }

  return { cancelTokenBid }
}

export function useCancelTokenBidBatch() {
  const { writeContractAsync } = useWriteContract()

  const cancelTokenBidBatch = async (collections: `0x${string}`[], tokenIds: bigint[]) => {
    const txHash = await writeContractAsync({
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "cancelTokenBidBatch",
      args: [collections, tokenIds],
    })
    return txHash
  }

  return { cancelTokenBidBatch }
}

export function useAcceptTokenBid() {
  const { writeContractAsync } = useWriteContract()

  const acceptTokenBid = async (collection: `0x${string}`, bidder: `0x${string}`, tokenId: number) => {
    const txHash = await writeContractAsync({
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "acceptTokenBid",
      args: [collection, bidder, BigInt(tokenId)],
    })
    return txHash
  }

  return { acceptTokenBid }
}

export function useBidCollection() {
  const { writeContractAsync } = useWriteContract()

  const bidCollection = async (price: bigint, quantity: number) => {
    const txHash = await writeContractAsync({
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "bidCollection",
      args: [MARKETPLACE_CONTRACT_ADDRESS, price, BigInt(quantity)],
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
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
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
      address: BIDS_CONTRACT_ADDRESS,
      abi: bidsABI,
      functionName: "acceptCollectionBid",
      args: [collection, bidder, tokenIds.map((id) => BigInt(id))],
    })
    return txHash
  }

  return { acceptCollectionBid }
}

export function useRegisterCollection() {
  const { writeContractAsync } = useWriteContract()

  const registerCollection = async (collection: `0x${string}`, royaltyFee: bigint) => {
    const txHash = await writeContractAsync({
      address: CORE_CONTRACT_ADDRESS,
      abi: marketplaceCoreABI,
      functionName: "registerCollection",
      args: [collection, royaltyFee],
    })
    return txHash
  }

  return { registerCollection }
}
