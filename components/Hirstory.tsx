import { useEffect, useState } from "react"
import { FaEthereum, FaExternalLinkAlt, FaInbox } from "react-icons/fa"
import { useMarketplace } from "@/app/context/MarketplaceContext"
import { useAccount, useReadContracts } from "wagmi"
import { Address, erc721Abi } from "viem"
import { RiNftFill } from "react-icons/ri"
export default function History() {
  const [actions, setActions] = useState<any[]>([])
  const { address } = useAccount()
  const { listingEvents, collectionBidEvents, tokenBidEvents, collections } = useMarketplace()

  const { data: names }: any = useReadContracts({
    contracts: collections.map((col: any) => ({
      address: col.collection,
      abi: erc721Abi,
      functionName: "name",
    })),
    query: {
      enabled: Boolean(collections.length),
    },
  })

  useEffect(() => {
    if (!listingEvents || !collectionBidEvents || !tokenBidEvents) return
    console.log(listingEvents, collectionBidEvents, tokenBidEvents)
    setActions(
      listingEvents
        .filter((l: any) => String(l.seller).toLowerCase() == String(address).toLowerCase())
        .concat(collectionBidEvents.filter((b: any) => String(b.bidder).toLowerCase() == String(address).toLowerCase()))
        .concat(tokenBidEvents.filter((b: any) => String(b.bidder).toLowerCase() == String(address).toLowerCase()))
        .sort((a: any, b: any) => Number(b.createdAt) - Number(a.createdAt))
    )
  }, [, listingEvents, collectionBidEvents, tokenBidEvents])

  function getNFTName(collection: Address) {
    try {
      if (!names) return "-"
      const name = names[collections.findIndex((col: any) => String(col.collection).toLowerCase() == String(collection).toLowerCase())].result
      return name
    } catch (e) {
      console.log(e)
      return "-"
    }
  }

  const formatDate = (timestamp: number | bigint) => {
    const date = new Date(Number(timestamp) * 1000)

    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  return (
    <div className="w-full  flex flex-col">
      <div className="w-full card border-collapse text-left">
        <div className="border-b border-(--accent)/60 flex justify-between px-4">
          <span className="p-2 flex-3">Asset</span>
          <span className="p-2 flex-2">Action</span>
          <span className="p-2 flex-1">Price</span>
          <span className="p-2 flex-1">Seller</span>
          <span className="p-2 flex-1">Buyer</span>
          <span className="p-2 flex-2">Time</span>
          <span className="p-2 flex-[0.1]">Tx</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto card border-b border-(--accent)/50">
        <div className=" flex flex-col">
          {actions.map((a: any, index: number) => {
            const name = getNFTName(a.collection)
            const time = formatDate(a.createdAt)
            return (
              <div key={index} className="border-b flex justify-between items-center border-(--accent)/60 relative px-2">
                <div className="p-2 flex flex-3 relative z-10">
                  <div className="flex flex-2 items-center gap-3">
                    <RiNftFill className="text-xl" />
                    <div className="flex flex-col items-start">
                      <span>{name}</span>
                      <span className="text-sm opacity-65">{a.tokenId ? `#${a.tokenId}` : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="p-2 flex flex-2  relative z-10">
                  <div>
                    <span
                      className={
                        "p-2 rounded flex border border-(--text-secondary)/30! text-sm bg-(--bg) px-4 " +
                        (a.eventName.includes("Sold") && "  text-[#6a6ac8] ") +
                        (a.eventName.includes("Created") && "  text-[#5eb35e] ") +
                        (a.eventName.includes("Cancelled") && " text-[#c19137] ")
                      }
                    >
                      {a.eventName}
                    </span>
                  </div>
                </div>

                <div className="p-2 flex-1 relative z-10">
                  <div className="flex gap-2 items-center">
                    <span>{Number(a.price) / 1e18}</span>
                    <FaEthereum />
                  </div>
                </div>
                <div className="p-2 flex-1 relative z-10">
                  <div className="flex gap-2 items-center">
                    <span>{a.seller ? (a.seller == address ? "You" : `${a.seller.slice(-6)}`) : "-"}</span>
                  </div>
                </div>
                <div className="p-2 flex-1 relative z-10">
                  <div className="flex gap-2 items-center">
                    <span>{a.buyer ? (a.buyer == address ? "You" : `${a.buyer.slice(-6)}`) : a.bidder ? (a.bidder == address ? "You" : `${a.bidder.slice(-6)}`) : "-"}</span>
                  </div>
                </div>
                <div className="p-2 flex-2 relative z-10 ">
                  <div className="flex gap-2 items-center  text-start">
                    <span className="">{String(time)}</span>
                  </div>
                </div>
                <div className="p-2 flex-[0.1] relative z-10">
                  <a target="_blank" href={`https://sepolia.etherscan.io/tx/${a.txHash}`} className="flex gap-2 items-center ">
                    <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
            )
          })}
          {!actions.length && (
            <div>
              <div className=" flex flex-col items-center justify-center gap-2 p-4">
                <FaInbox className="text-3xl" />
                <p>No actions found </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
