import { useEffect, useState } from "react"
import { FaEthereum, FaInbox } from "react-icons/fa"

export default function TokenBids({ tokenBids }: any) {
  const [sortedBids, setSortedBids] = useState(tokenBids)

  useEffect(() => {
    if (tokenBids) {
      setSortedBids(tokenBids.sort((a: any, b: any) => Number(b.price) - Number(a.price)))
    }
  }, [tokenBids])

  return (
    <div className="w-full flex">
      <div className="w-full border-collapse text-left card p-2 rounded ">
        <div>
          <div className="border-b flex  border-(--accent)/60 p-2">
            <div className="flex flex-1 gap-3 items-center">
              <span>Price</span>
              <div className="flex gap-2">
                <span>(</span>
                <FaEthereum />
                <span>)</span>
              </div>
            </div>
            <span className="flex-1 border-l px-4 border-(--text-secondary)/30 p-2">Token id</span>
          </div>
        </div>

        <div>
          {sortedBids.map((c: any, index: number) => {
            return (
              <div key={index} className="border-b border-(--accent)/60 relative  ">
                <span className="flex-1 p-2 relative z-10">
                  <div className="flex gap-2 items-center">
                    <span>{Number(c.price) / 1e18}</span>
                    <FaEthereum />
                  </div>
                </span>
                <div className="flex-1 p-2 relative z-10">#{c.tokenId}</div>
              </div>
            )
          })}
          {!tokenBids.length && (
            <div className=" flex flex-col items-center justify-center gap-2 p-4">
              <FaInbox className="text-3xl" />
              <p>No token bids found </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
