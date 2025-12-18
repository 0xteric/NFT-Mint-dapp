import { useNftStats } from "@/components/Contract"

export function NftStats() {
  const { totalSupply, maxSupply, mintPrice } = useNftStats()

  return (
    <div className="text-sm text-gray-400">
      <span>Price: {mintPrice ? Number(mintPrice) / 1e18 : "-"} ETH</span>
      <p>
        Supply: {totalSupply?.toString() ?? "-"} / {maxSupply?.toString() ?? "-"}
      </p>
    </div>
  )
}
