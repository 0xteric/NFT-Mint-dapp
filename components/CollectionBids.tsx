import { useEffect, useState } from "react"

export default function CollectionBids({ collectionBids }: any) {
  const [totalSize, setTotalSize] = useState<number>(0)

  let sorted: any = []

  useEffect(() => {
    if (collectionBids) {
      setTotalSize(
        collectionBids.reduce((size: number, bid: any) => {
          return size + Number(bid.quantity)
        }, 0)
      )
      sorted = collectionBids.sort((a: any, b: any) => Number(b.price) - Number(a.price))
    }
  }, [])

  return (
    <div className="w-full flex">
      <table className="w-full border-collapse text-left ">
        <thead>
          <tr className="border-b border-(--accent)/60">
            <th className=" p-2">Price</th>
            <th className=" p-2">Amount</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((c: any, index: number) => {
            const percent = ((Number(c.quantity) / totalSize) * 100).toFixed(0)

            return (
              <tr key={index} className="border-b border-(--accent)/60 relative  ">
                <td className="p-2 relative z-10">{Number(c.price) / 1e18}</td>
                <td className="p-2 relative z-10">{c.quantity}</td>
                <td className="absolute  left-0 top-0 h-full bg-[#0089004f] " style={{ width: `${percent}%` }} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
