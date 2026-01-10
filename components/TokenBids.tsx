import { useEffect, useState } from "react"
import { FaEthereum } from "react-icons/fa"

export default function TokenBids({ tokenBids }: any) {
  const [sortedBids, setSortedBids] = useState(tokenBids)

  useEffect(() => {
    if (tokenBids) {
      setSortedBids(tokenBids.sort((a: any, b: any) => Number(b.price) - Number(a.price)))
    }
  }, [tokenBids])

  return (
    <div className="w-full flex">
      <table className="w-full border-collapse text-left ">
        <thead>
          <tr className="border-b border-(--accent)/60">
            <th className=" p-2">Price</th>
            <th className=" p-2">Token id</th>
          </tr>
        </thead>

        <tbody>
          {sortedBids.map((c: any, index: number) => {
            return (
              <tr key={index} className="border-b border-(--accent)/60 relative  ">
                <td className="p-2 relative z-10">
                  <div className="flex gap-2 items-center">
                    <span>{Number(c.price) / 1e18}</span>
                    <FaEthereum />
                  </div>
                </td>
                <td className="p-2 relative z-10">#{c.tokenId}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
