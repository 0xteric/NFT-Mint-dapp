"use client"
import { useNftStats } from "@/components/Contract"

export function NftStats() {
  const { totalSupply, maxSupply, mintPrice } = useNftStats()

  return (
    <div className="text-sm ">
      <p>
        Price: <span className="">{Number(mintPrice) / 1e18} ETH</span>
      </p>
      <p>
        Total minted:{" "}
        <span className="">
          {totalSupply?.toString() ?? "-"} / {maxSupply?.toString() ?? "-"}
        </span>
      </p>
    </div>
  )
}
