import { UserNft } from "@/lib/constants"
import { useReadContract } from "wagmi"
import { erc721Abi } from "viem"
import { FaEthereum } from "react-icons/fa"
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
          <span className="font-bold text-xs">#{token.tokenId.toString()}</span>
        </div>
        <div className="flex gap-2 px-1 py-0.5 text-xs md:text-[14px] lg:text-[16px] items-center">
          <span className="font-bold  ">{token.price ? Number(token.price.toString()) / 1e18 : "-"}</span>
          <FaEthereum />
        </div>
      </div>
    </div>
  )
}
