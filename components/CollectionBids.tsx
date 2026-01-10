import { useEffect, useState } from "react"
import { FaEthereum, FaInbox } from "react-icons/fa"
import { useAccount } from "wagmi"

export default function CollectionBids({ collectionBids }: any) {
  const [totalSize, setTotalSize] = useState<number>(0)
  const [sorted, setSorted] = useState<any[]>([])
  const { address } = useAccount()
  useEffect(() => {
    if (collectionBids) {
      let userBids = collectionBids.filter((bid: any) => String(bid.bidder).toLowerCase() == String(address).toLowerCase())
      setTotalSize(
        userBids.reduce((size: number, bid: any) => {
          return size + Number(bid.quantity)
        }, 0)
      )
      setSorted(userBids.sort((a: any, b: any) => Number(b.price) - Number(a.price)))
    }
  }, [collectionBids.length])

  return (
    <div className="w-full flex pb-4 ">
      <div className="w-full border-collapse text-left card p-2 rounded ">
        <div>
          <div className="border-b border-(--accent)/60 items-center py-2 flex ">
            <div className="flex-1 p-2 flex gap-3 items-center">
              <span>Price</span>
              <div className="flex gap-2">
                <span>(</span>
                <FaEthereum />
                <span>)</span>
              </div>
            </div>
            <span className="flex-1 border-l border-(--text-secondary)/30 pl-6 p-2">Amount</span>
            <span className="flex-1 border-l border-(--text-secondary)/30 px-6 p-2">Bidder</span>
          </div>
        </div>

        <div>
          {sorted.map((c: any, index: number) => {
            const percent = ((Number(c.quantity) / totalSize) * 100).toFixed(0)

            return (
              <div key={index} className="border-b border-(--accent)/60 relative flex  ">
                <span className="p-2 flex-1  relative z-10 text-[#87e187fe]">{Number(c.price) / 1e18}</span>
                <span className="p-2 flex-1 relative z-10">{c.quantity}</span>
                <span className="p-2 flex-1 relative z-10">{c.bidder.slice(-6)}</span>
                <div className="absolute  left-0 top-0 h-full bg-[#38b7384f] z-5 " style={{ width: `${percent}%` }} />
              </div>
            )
          })}
          {!sorted.length && (
            <div className=" flex flex-col items-center justify-center gap-2 p-4">
              <FaInbox className="text-3xl" />
              <p>No collection bids found </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
