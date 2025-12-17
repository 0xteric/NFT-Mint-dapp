"use client"

import { useReadContract } from "wagmi"
import { nftAbi } from "@/lib/abi"
import { NFT_CONTRACT_ADDRESS } from "@/lib/constants"

export default function NftStats() {
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

  return (
    <div className="text-sm text-gray-400">
      <p>
        Supply: {totalSupply?.toString() ?? "-"} / {maxSupply?.toString() ?? "-"}
      </p>
    </div>
  )
}
