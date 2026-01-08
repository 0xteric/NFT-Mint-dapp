import { UserNft } from "@/lib/constants"
import { useReadContract } from "wagmi"
import { erc721Abi } from "viem"

export function NFTCard({ token }: { token: UserNft }) {
  const { data: name } = useReadContract({
    address: token.collection,
    abi: erc721Abi,
    functionName: "name",
  })

  return (
    <div className="flex flex-col justify-end w-full h-full">
      <div className="flex flex-col card h-[33%] p-2 gap-1 w-full">
        <div className="flex gap-2">
          <span className="font-bold text-xs">{name}</span>
          <span className="font-bold text-xs">#{token.id.toString()}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold text-xs">{token.price ? token.price.toString() : "-"}</span>
        </div>
      </div>
    </div>
  )
}
